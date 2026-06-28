import { ReactNode } from "react";
import EditorBlock from "./EditorBlock";

interface EditorParagraphProps {
  line: number;
  children: ReactNode;
  className?: string;
}

export default function EditorParagraph({
  line,
  children,
  className = "",
}: EditorParagraphProps) {
  return (
    <EditorBlock
      line={line}
      className={`mb-3 ${className}`}
    >
      <p
        className="text-syntax-text text-sm leading-6 tracking-[0.01em]"
      >
        {children}
      </p>
    </EditorBlock>
  );
}