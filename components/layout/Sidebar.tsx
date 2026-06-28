import { navigation } from "@/data/navigation";

export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-[#30363d] px-8 py-10 lg:block">
      <div>
        <h1 className="text-lg font-semibold text-white">
          themacdonald
        </h1>

        <p className="mt-1 text-sm text-[#8b949e]">
          notebook
        </p>
      </div>

      <nav className="mt-14">
        <p className="mb-4 text-xs uppercase tracking-[0.25em] text-[#8b949e]">
          On this page
        </p>

        <ul className="space-y-3">
          {navigation.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="text-sm text-[#8b949e] transition hover:text-white"
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}