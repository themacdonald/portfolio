import Introduction from "@/components/sections/Introduction";
import Philosophy from "@/components/sections/Philosophy";
import CurrentFocus from "@/components/sections/CurrentFocus";
import Repositories from "@/components/sections/Repositories";
import CareerLog from "@/components/sections/CareerLog";
import Research from "@/components/sections/Research";
import LabNotes from "@/components/sections/LabNotes";
import OpenSource from "@/components/sections/OpenSource";
import Contact from "@/components/sections/Contact";

export default function MainContent() {
  return (
    <>
      <Introduction />

      <Philosophy />

      <CurrentFocus />

      <Repositories />

      <CareerLog />

      <Research />

      <LabNotes />

      <OpenSource />

      <Contact />
    </>
  );
}