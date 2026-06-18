import { Hero } from "./_homePage/Hero";
import { Features } from "./_homePage/Features";
import { HowItWorks } from "./_homePage/HowItWorks";
import { CallToAction } from "./_homePage/CallToAction";
import { Footer } from "./_homePage/Footer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#FAF7F4] dark:bg-[#141210]">
      <Hero />
      <Features />
      <HowItWorks />
      <CallToAction />
      <Footer />
    </main>
  );
}
