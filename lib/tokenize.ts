/**
 * Line tokenizers for the notebook surface.
 *
 * The payload stores notebook cells as plain string arrays, so highlighting is
 * derived at render time. Tokenizers are dependency-free, deterministic, and
 * never treat input as HTML.
 */

export type TokenKind =
  | "text"
  | "plain"
  | "comment"
  | "keyword"
  | "builtin"
  | "string"
  | "number"
  | "decorator"
  | "operator"
  | "heading1"
  | "heading2"
  | "heading3"
  | "marker"
  | "bullet"
  | "bold"
  | "code"
  | "identifier";

export interface Token {
  value: string;
  kind: TokenKind;
}

const PYTHON_KEYWORDS = new Set([
  "False", "None", "True", "and", "as", "assert", "async", "await", "break",
  "class", "continue", "def", "del", "elif", "else", "except", "finally",
  "for", "from", "global", "if", "import", "in", "is", "lambda", "nonlocal",
  "not", "or", "pass", "raise", "return", "try", "while", "with", "yield",
  "match", "case",
]);

const PYTHON_BUILTINS = new Set([
  "abs", "all", "any", "bool", "dict", "enumerate", "float", "format", "int",
  "len", "list", "map", "max", "min", "open", "print", "range", "round", "set",
  "sorted", "str", "sum", "tuple", "zip", "self", "pd", "f",
]);

const OPERATOR_CHARS = new Set([
  "=", "+", "-", "*", "/", "%", "<", ">", "!", "&", "|", "^", "~", ":", ",",
  "(", ")", "[", "]", "{", "}",
]);

function scanString(line: string, start: number): number {
  const quote = line[start];
  const isTriple =
    line.slice(start, start + 3) === quote.repeat(3);

  if (isTriple) {
    const closing = line.indexOf(quote.repeat(3), start + 3);
    return closing === -1 ? line.length : closing + 3;
  }

  let index = start + 1;
  while (index < line.length) {
    if (line[index] === "\\") {
      index += 2;
      continue;
    }
    if (line[index] === quote) {
      return index + 1;
    }
    index += 1;
  }
  return line.length;
}

/** Tokenize one line of Python source. */
export function tokenizePython(line: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  const push = (value: string, kind: TokenKind) => {
    if (value.length === 0) return;
    const last = tokens[tokens.length - 1];
    if (last && last.kind === kind) {
      last.value += value;
      return;
    }
    tokens.push({ value, kind });
  };

  while (index < line.length) {
    const char = line[index];

    if (char === "#") {
      push(line.slice(index), "comment");
      break;
    }

    if (char === '"' || char === "'") {
      const end = scanString(line, index);
      push(line.slice(index, end), "string");
      index = end;
      continue;
    }

    if (char === "@" && /[A-Za-z_]/.test(line[index + 1] ?? "")) {
      let end = index + 1;
      while (end < line.length && /[A-Za-z0-9_.]/.test(line[end])) end += 1;
      push(line.slice(index, end), "decorator");
      index = end;
      continue;
    }

    if (/[0-9]/.test(char) || (char === "." && /[0-9]/.test(line[index + 1] ?? ""))) {
      let end = index;
      while (end < line.length && /[0-9_.eExXa-fA-F]/.test(line[end])) end += 1;
      push(line.slice(index, end), "number");
      index = end;
      continue;
    }

    if (/[A-Za-z_]/.test(char)) {
      let end = index;
      while (end < line.length && /[A-Za-z0-9_]/.test(line[end])) end += 1;
      const word = line.slice(index, end);
      const kind: TokenKind = PYTHON_KEYWORDS.has(word)
        ? "keyword"
        : PYTHON_BUILTINS.has(word)
          ? "builtin"
          : "text";
      push(word, kind);
      index = end;
      continue;
    }

    if (OPERATOR_CHARS.has(char)) {
      push(char, "operator");
      index += 1;
      continue;
    }

    push(char, "plain");
    index += 1;
  }

  return tokens;
}

const BOLD_PATTERN = /(\*\*[^*]+\*\*|`[^`]+`)/g;

/** Tokenize one line of markdown, keeping markers visible like a notebook. */
export function tokenizeMarkdown(line: string): Token[] {
  const heading = /^(#{1,6})(\s+)(.*)$/.exec(line);
  if (heading) {
    const level = Math.min(heading[1].length, 3);
    const kind: TokenKind = level === 1 ? "heading1" : level === 2 ? "heading2" : "heading3";
    return [
      { value: heading[1], kind: "marker" },
      { value: heading[2], kind: "plain" },
      { value: heading[3], kind },
    ];
  }

  const bullet = /^(\s*)([-*+])(\s+)(.*)$/.exec(line);
  if (bullet) {
    return [
      { value: bullet[1], kind: "plain" },
      { value: bullet[2], kind: "bullet" },
      { value: bullet[3], kind: "plain" },
      ...splitInline(bullet[4]),
    ];
  }

  return splitInline(line);
}

function splitInline(text: string): Token[] {
  const tokens: Token[] = [];
  let cursor = 0;

  for (const match of text.matchAll(BOLD_PATTERN)) {
    const start = match.index ?? 0;
    if (start > cursor) {
      tokens.push({ value: text.slice(cursor, start), kind: "text" });
    }
    const value = match[0];
    if (value.startsWith("**")) {
      tokens.push({ value: value.slice(2, -2), kind: "bold" });
    } else {
      tokens.push({ value: value.slice(1, -1), kind: "code" });
    }
    cursor = start + value.length;
  }

  if (cursor < text.length) {
    tokens.push({ value: text.slice(cursor), kind: "text" });
  }

  return tokens;
}
