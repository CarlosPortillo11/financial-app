"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionConfig } from "motion/react";
import { usePathname } from "next/navigation";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function MotionRoot({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const belowFold = gsap.utils
          .toArray<HTMLElement>(".folder")
          .filter((el) => el.getBoundingClientRect().top > innerHeight);
        gsap.set(belowFold, { autoAlpha: 0, y: 40, scale: 0.98 });
        ScrollTrigger.batch(belowFold, {
          start: "top 92%",
          once: true,
          onEnter: (batch) => {
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.9,
              ease: "expo.out",
              stagger: 0.12,
              clearProps: "transform",
            });
            batch.forEach((panel, i) =>
              gsap.from(panel.querySelectorAll("tbody tr, ul > li"), {
                autoAlpha: 0,
                x: -10,
                duration: 0.5,
                ease: "power3.out",
                stagger: 0.04,
                delay: 0.2 + i * 0.12,
                clearProps: "transform",
              }),
            );
          },
        });

        gsap.to("[data-hero]", {
          y: -28,
          autoAlpha: 0.35,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-hero]",
            start: "top top+=80",
            end: "bottom top+=40",
            scrub: true,
          },
        });
      });
    },
    { scope: ref, dependencies: [pathname], revertOnUpdate: true },
  );

  return (
    <MotionConfig reducedMotion="user">
      <div ref={ref} className="mx-auto w-full max-w-6xl">
        {children}
      </div>
    </MotionConfig>
  );
}
