import {
  LandingNav,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  TechStackSection,
  LegacyTechSection,
  WhyModernizeSection,
  CtaSection,
  LandingFooter,
} from '@/components/landing';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TechStackSection />
        <LegacyTechSection />
        <WhyModernizeSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
