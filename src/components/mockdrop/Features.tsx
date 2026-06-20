import { ZeroSetupCard, CustomStatusCard, ResponseDelayCard, LiveValidationCard, CorsReadyCard, PersistentUrlCard } from "./LivingDemoCards";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const Features = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Note: The expanding clip-path animation for the portal reveal is now handled 
  // centrally in HeroBlobCanvas.jsx, tied to the #portal-wrapper pin.

  return (
    <section ref={sectionRef} id="features" className="relative py-20 md:py-28 bg-gradient-subtle min-h-screen flex items-center" style={{ zIndex: 20 }}>
      <div ref={containerRef} className="container w-full">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-widest text-primary-glow font-semibold">Features</p>
          <h2 className="mt-2 text-3xl md:text-5xl font-bold tracking-tight">
            Everything you need. Nothing you don't.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <ZeroSetupCard delay={0} />
          <CustomStatusCard delay={100} />
          <ResponseDelayCard delay={200} />
          <LiveValidationCard delay={300} />
          <CorsReadyCard delay={400} />
          <PersistentUrlCard delay={500} />
        </div>
      </div>
    </section>
  );
};
