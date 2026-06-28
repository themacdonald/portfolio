"use client";

import TabBar from "@/components/ui/editor/TabBar";
import MainContent from "@/components/layout/MainContent";

export default function Editor() {
  return (
    <section className="flex flex-1 flex-col overflow-hidden bg-syntax-background">

      <TabBar />

      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto w-full max-w-5xl px-8 py-10 lg:px-12 lg:py-14">
          <MainContent />
        </div>
      </main>

    </section>
  );
}