import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Coaches from "@/components/Coaches";
import Metrics from "@/components/Metrics";
import Pricing from "@/components/Pricing";
import CtaFooter from "@/components/CtaFooter";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Features />
        <Coaches />
        <Metrics />
        <Pricing />
        <CtaFooter />
      </main>
    </>
  );
}
