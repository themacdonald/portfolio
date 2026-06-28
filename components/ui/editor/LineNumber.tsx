interface LineNumberProps {
  value: number;
}

export default function LineNumber({
  value,
}: LineNumberProps) {
  return (
    <div
      className="w-14 shrink-0 select-none pr-4 text-right text-xs leading-8 tracking-wide text-syntax-comment opacity-50 transition-opacity duration-150 group-hover:opacity-100"
    >
      {value.toString().padStart(3, "0")}
    </div>
  );
}