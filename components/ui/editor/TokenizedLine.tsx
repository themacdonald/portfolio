import { cn } from "@/lib/utils";
import { tokenizePython, tokenizeMarkdown, type TokenKind } from "@/lib/tokenize";

const KIND_CLASS: Record<TokenKind, string> = {
  text: "text-syntax-text",
  plain: "text-syntax-text",
  comment: "italic text-syntax-comment",
  keyword: "font-medium text-syntax-command",
  builtin: "text-syntax-tech",
  string: "text-syntax-success",
  number: "text-syntax-number",
  decorator: "text-syntax-concept",
  operator: "text-syntax-muted",
  heading1: "font-semibold text-syntax-heading",
  heading2: "font-semibold text-syntax-heading",
  heading3: "font-medium text-syntax-heading",
  marker: "text-syntax-comment",
  bullet: "text-syntax-branch",
  bold: "font-semibold text-syntax-text",
  code: "text-syntax-tech",
  identifier: "text-syntax-text",
};

interface TokenizedLineProps {
  line: string;
  language: "python" | "markdown";
  className?: string;
}

export default function TokenizedLine({ line, language, className }: TokenizedLineProps) {
  const tokens =
    language === "python" ? tokenizePython(line) : tokenizeMarkdown(line);

  return (
    <code className={cn("whitespace-pre-wrap break-words", className)}>
      {tokens.map((token, index) => (
        <span
          key={index}
          className={cn(
            language === "markdown" ? SIZE_CLASS[token.kind] : undefined,
            KIND_CLASS[token.kind]
          )}
        >
          {token.value}
        </span>
      ))}
    </code>
  );
}

const SIZE_CLASS: Partial<Record<TokenKind, string>> = {
  heading1: "text-[19px] leading-8",
  heading2: "text-[15px] leading-7",
  heading3: "text-[13.5px] leading-6",
};
