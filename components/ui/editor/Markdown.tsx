import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const base = "transition-colors duration-150";

export function Text({ children }: Props) {
  return (
    <span className={base}>
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

export function Concept({ children }: Props) {
  return (
    <span className={`${base} font-medium text-syntax-concept`}>
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
    <span className={`${base} text-syntax-link`}>
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

export function Warning({ children }: Props) {
  return (
    <span className={`${base} font-semibold text-syntax-heading`}>}>
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

export function Heading({ children }: Props) {
  return (
    <span className={`${base} font-semibold text-syntax-heading`}>
      {children}
    </span>
  );
}