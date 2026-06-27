import { Mission } from "./Mission";
import { TeamCredits } from "./TeamCredits";

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-[#FAF7F4] dark:bg-[#141210]">
      <Mission />
      <TeamCredits />
    </main>
  );
}
