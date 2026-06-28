import { ReactNode } from "react";
import LineNumber from "./LineNumber";

interface EditorBlockProps {
  line: number;
  children: ReactNode;
  className?: string;
}

export default function EditorBlock({
  line,
  children,
  className = "",
}: EditorBlockProps) {
  return (
    <div
      className={`group flex items-start ${className}`}
    >
      <LineNumber value={line} />

      <div className="min-w-0 flex-1">
        {children}
      </div>
    </div>
  );
}