import { BentoGrid } from "./_homePage/BentoGrid";
import { HowItWorks } from "./_homePage/HowItWorks";
import { CallToAction } from "./_homePage/CallToAction";
import { Footer } from "./_homePage/Footer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#FAF7F4] dark:bg-[#141210]">
      <BentoGrid />
      <HowItWorks />
      <CallToAction />
      <Footer />
    </main>
  );
}
