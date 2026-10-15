import Notebook from "@/components/layout/Notebook";
import { agenticPortfolioPayload } from "@/lib/payload";

export default function Home() {
  return <Notebook payload={agenticPortfolioPayload} />;
}
