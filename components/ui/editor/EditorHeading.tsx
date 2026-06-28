import { ReactNode } from "react";
import EditorBlock from "./EditorBlock";

interface EditorHeadingProps {
  line: number;
  level?: 1 | 2 | 3;
  children: ReactNode;
}

export default function EditorHeading({
  line,
  level = 1,
  children,
}: EditorHeadingProps) {
  const hashes = "#".repeat(level);

  const sizes = {
    1: "text-2xl",
    2: "text-xl",
    3: "text-lg",
  };

  return (
    <EditorBlock line={line} className="mb-8">
      <div className="flex items-start gap-3">
        <span className="mt-1 select-none text-syntax-comment">
          {hashes}
        </span>

        <h2 className={`${sizes[level]} font-semibold tracking-tight text-syntax-heading`}>
          {children}
        </h2>
      </div>
    </EditorBlock>
  );
}