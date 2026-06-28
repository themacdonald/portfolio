import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const base = "transition-colors duration-150";

export function Text({ children }: Props) {
  return (
    <span className={`text-syntax-text ${base}`}>
      {children}
    </span>
  );
}

export function Heading({ children }: Props) {
  return (
    <span className={`${base} font-semibold text-syntax-heading`}>
      {children}
    </span>
  );
}

export function Command({ children }: Props) {
  return (
    <span className={`${base} font-medium text-syntax-command`}>
      {children}
    </span>
  );
}

export function Keyword({ children }: Props) {
  return (
    <span className={`${base} font-medium text-syntax-command`}>
      {children}
    </span>
  );
}

export function Tech({ children }: Props) {
  return (
    <span className={`${base} font-medium text-syntax-tech`}>
      {children}
    </span>
  );
}

export function Concept({ children }: Props) {
  return (
    <span className={`${base} font-medium text-syntax-concept`}>
      {children}
    </span>
  );
}

export function Branch({ children }: Props) {
  return (
    <span className={`${base} font-medium text-syntax-branch`}>
      {children}
    </span>
  );
}

export function Important({ children }: Props) {
  return (
    <span className={`${base} font-medium text-syntax-warning`}>
      {children}
    </span>
  );
}

export function Warning({ children }: Props) {
  return (
    <span className={`${base} font-semibold text-syntax-warning`}>
      {children}
    </span>
  );
}

export function Success({ children }: Props) {
  return (
    <span className={`${base} font-medium text-syntax-success`}>
      {children}
    </span>
  );
}

export function Error({ children }: Props) {
  return (
    <span className={`${base} font-medium text-syntax-error`}>
      {children}
    </span>
  );
}

export function Number({ children }: Props) {
  return (
    <span className={`${base} font-medium text-syntax-number`}>
      {children}
    </span>
  );
}

export function Comment({ children }: Props) {
  return (
    <span className={`${base} italic text-syntax-comment`}>
      {children}
    </span>
  );
}

export function Link({ children }: Props) {
  return (
    <span className={`${base} underline underline-offset-4 text-syntax-link hover:opacity-90`}>
      {children}
    </span>
  );
}

export function FileName({ children }: Props) {
  return (
    <span className={`${base} font-medium text-syntax-file`}>
      {children}
    </span>
  );
}

export function Folder({ children }: Props) {
  return (
    <span className={`${base} font-medium text-syntax-folder`}>
      {children}
    </span>
  );
}

export function Code({ children }: Props) {
  return (
    <code
      className="
        rounded
        border
        border-syntax-border
        bg-syntax-surface-muted
        px-1.5
        py-0.5
        font-mono
        text-[0.92em]
        text-syntax-tech
      "
    >
      {children}
    </code>
  );
}

export function Terminal({ children }: Props) {
  return (
    <span className="font-mono text-syntax-command">
      $ {children}
    </span>
  );
}

export function GitHash({ children }: Props) {
  return (
    <span className="font-mono tracking-wide text-syntax-number">
      {children}
    </span>
  );
}