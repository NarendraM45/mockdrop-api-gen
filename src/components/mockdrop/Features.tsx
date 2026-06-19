import { ZeroSetupCard, CustomStatusCard, ResponseDelayCard, StaticCard } from "./LivingDemoCards";
import { ShieldIcon } from "@/components/svg/ShieldIcon";
import { BadgeIcon } from "@/components/svg/BadgeIcon";
import { HourglassIcon } from "@/components/svg/HourglassIcon";
import { GlobeIcon } from "@/components/svg/GlobeIcon";
import { ChainIcon } from "@/components/svg/ChainIcon";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";


const OTHER_FEATURES = [
  { Icon: ShieldIcon, title: "Live Validation", desc: "Invalid JSON is caught before saving — line numbers and all." },
  { Icon: GlobeIcon, title: "CORS Ready", desc: "Allow-any-origin headers built in. Works from any frontend." },
  { Icon: ChainIcon, title: "Persistent URLs", desc: "Endpoints survive page reloads. Share them with your team." },
];

export const Features = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    if (sectionRef.current) {
      // The circle expansion from center
      gsap.fromTo(
        sectionRef.current,
        { clipPath: "circle(0% at 50% 50%)" },
        {
          clipPath: "circle(150% at 50% 50%)",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom", // when the top of features hits bottom of screen
            end: "top top",      // when top of features hits top of screen
            scrub: 1,
          }
        }
      );
    }
  }, []);

  return (
    <section ref={sectionRef} id="features" className="relative py-20 md:py-28 bg-gradient-subtle" style={{ zIndex: 20 }}>
      <div ref={containerRef} className="container">
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
          
          {OTHER_FEATURES.map((f, index) => {
            const Icon = f.Icon;
            return (
              <StaticCard
                key={f.title}
                icon={Icon}
                title={f.title}
                desc={f.desc}
                delay={300 + index * 100}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
