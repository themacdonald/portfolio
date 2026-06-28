import Sidebar from "@/components/layout/Sidebar";
import Editor from "@/components/layout/Editor";

export default function Notebook() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-syntax-background text-syntax-text">
      <Sidebar />
      <Editor />
    </div>
  );
}