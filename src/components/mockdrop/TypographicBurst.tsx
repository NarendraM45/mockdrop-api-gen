import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const TypographicBurst = ({ children, type = "pulse" }: { children: React.ReactNode, type?: "pulse" | "burst" }) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!ref.current) return;

    if (type === "pulse") {
      gsap.fromTo(ref.current, 
        { scale: 1 }, 
        {
          scale: 1.5,
          color: "#a855f7", // primary
          duration: 0.4,
          ease: "back.out(2)",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    } else if (type === "burst") {
      // Simulate a burst by a rapid scale up and shadow
      gsap.fromTo(ref.current,
        { scale: 1, textShadow: "0 0 0px transparent" },
        {
          scale: 1.8,
          color: "#fff",
          textShadow: "0 0 20px #a855f7, 0 0 40px #a855f7",
          duration: 0.5,
          ease: "elastic.out(1, 0.3)",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }
  }, [type]);

  return <span ref={ref} className="inline-block">{children}</span>;
};
