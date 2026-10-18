"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ChevronDownIcon, DownloadIcon, Share2Icon, XIcon } from "lucide-react";
import {
  MotionConfig,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef, type RefObject } from "react";
import { Button } from "@/components/ui/button";
import { money, pct } from "@/lib/money";
import { formatDate, formatPeriod } from "@/lib/period";
import type { MonthStory } from "@/lib/story";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

type Format = "money" | "pct";

export function MonthStoryView({ story, currency }: { story: MonthStory; currency: string }) {
  const root = useRef<HTMLDivElement>(null);
  const fmt = (n: number, f: Format) => (f === "money" ? money(n, currency) : pct(n, 0));
  const month = formatPeriod(story.period);
  const back = `/?m=${story.period}`;
  const card = `/tu-mes/tarjeta?m=${story.period}`;
  const empty = story.income === 0 && story.spent === 0;
  const peak = Math.max(...story.biweeks.map((q) => q.spent), 1);

  useGSAP(
    () => {
      const scroller = root.current!;
      const scenes = gsap.utils.toArray<HTMLElement>("[data-scene]");
      const fills = gsap.utils.toArray<HTMLElement>("[data-segment]");

      scenes.forEach((scene, i) =>
        gsap.fromTo(
          fills[i],
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { trigger: scene, scroller, start: "top bottom", end: "top top", scrub: true },
          },
        ),
      );

      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        scenes.forEach((scene) => {
          const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out", duration: 1 } });
          scene.querySelectorAll<HTMLElement>("[data-anim]").forEach((el) => {
            gsap.set(el, { autoAlpha: 1 });
            const kind = el.dataset.anim;
            if (kind === "split") {
              const split = SplitText.create(el, { type: "words", mask: "words" });
              tl.from(split.words, { yPercent: 115, stagger: 0.07 }, "<0.15");
            } else if (kind === "count") {
              const to = Number(el.dataset.value);
              const format = el.dataset.format as Format;
              const n = { v: 0 };
              el.textContent = fmt(0, format);
              tl.from(el, { yPercent: 40, autoAlpha: 0, duration: 0.8 }, "<0.2").to(
                n,
                {
                  v: to,
                  duration: 1.8,
                  ease: "power3.out",
                  onUpdate: () => {
                    el.textContent = fmt(n.v, format);
                  },
                  onComplete: () => {
                    el.textContent = fmt(to, format);
                  },
                },
                "<",
              );
            } else if (kind === "pop") {
              tl.from(el, { scale: 0, rotate: -25, duration: 1.4, ease: "elastic.out(1, 0.45)" }, "<0.1");
            } else if (kind === "bar") {
              tl.from(el, { scaleX: 0, transformOrigin: "left center", duration: 1.3, ease: "power4.out" }, "<0.12");
            } else if (kind === "grow") {
              tl.from(el, { scaleY: 0, transformOrigin: "bottom center", duration: 1.3, ease: "power4.out" }, "<0.15");
            } else {
              tl.from(el, { y: 24, autoAlpha: 0, duration: 0.8 }, "<0.15");
            }
          });
          ScrollTrigger.create({ trigger: scene, scroller, start: "top 60%", once: true, onEnter: () => tl.play() });

          gsap.to(scene.querySelector("[data-content]"), {
            y: -90,
            autoAlpha: 0.2,
            ease: "none",
            scrollTrigger: { trigger: scene, scroller, start: "top top", end: "bottom top", scrub: true },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-blob]").forEach((blob, i) =>
          gsap.to(blob, {
            xPercent: gsap.utils.random(-35, 35),
            yPercent: gsap.utils.random(-30, 30),
            scale: gsap.utils.random(0.8, 1.3),
            duration: gsap.utils.random(6, 11),
            delay: i * -1.7,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          }),
        );
        gsap.to("[data-hint]", { y: 8, duration: 0.9, repeat: -1, yoyo: true, ease: "sine.inOut" });
      });
    },
    { scope: root },
  );

  const advance = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a, button")) return;
    const el = root.current!;
    const dir = e.clientX < innerWidth / 3 ? -1 : 1;
    el.scrollBy({ top: dir * el.clientHeight, behavior: "smooth" });
  };

  async function share() {
    const blob = await (await fetch(card)).blob();
    const file = new File([blob], `mi-mes-${story.period}.png`, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: `Mi ${month} en Finanzas` }).catch(() => {});
      return;
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const sceneCount = empty
    ? 2
    : 5 + Number(!!story.top) + Number(!!story.biggest) + Number(story.income > 0);

  return (
    <MotionConfig reducedMotion="user">
      <header className="pointer-events-none fixed inset-x-0 top-0 z-20 flex flex-col gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] text-white mix-blend-difference md:px-8">
        <div className="flex gap-1.5">
          {Array.from({ length: sceneCount }, (_, i) => (
            <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
              <span data-segment className="block size-full origin-left bg-white" />
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Finanzas · {month}</span>
          <Button asChild variant="ghost" size="icon" className="pointer-events-auto text-white hover:bg-white/15 hover:text-white">
            <Link href={back} aria-label="Cerrar">
              <XIcon />
            </Link>
          </Button>
        </div>
      </header>

      <div
        ref={root}
        data-story
        tabIndex={0}
        onClick={advance}
        className="relative z-10 h-svh snap-y snap-mandatory overflow-y-auto overscroll-contain outline-none"
      >
        <Scene
          className="bg-story-ink text-white"
          blobs={["var(--story-coral)", "var(--story-indigo)"]}
          footer={
            <span className="absolute inset-x-0 bottom-[max(2rem,env(safe-area-inset-bottom))] flex flex-col items-center gap-1 text-sm text-white/60">
              Desliza o toca para seguir
              <ChevronDownIcon data-hint className="size-5" />
            </span>
          }
        >
          <p data-anim="fade" className="text-sm tracking-[0.2em] text-white/60 uppercase">
            Tu mes en historia
          </p>
          <h1 data-anim="split" className="text-[clamp(3rem,13vw,8rem)] leading-[0.95] tracking-tighter text-balance">
            Así fue {month}
          </h1>
        </Scene>

        {empty ? (
          <Scene className="bg-story-cream text-story-ink" blobs={["var(--story-amber)", "var(--story-green)"]}>
            <h2 data-anim="split" className="text-[clamp(2.5rem,9vw,5.5rem)] leading-none tracking-tighter text-balance">
              Este mes aún no tiene historia
            </h2>
            <p data-anim="fade" className="max-w-md text-lg text-story-ink/70">
              Registra tus ingresos y gastos y vuelve aquí al cierre de la quincena.
            </p>
            <Button asChild size="lg" className="self-start" data-anim="fade">
              <Link href={back}>Volver al resumen</Link>
            </Button>
          </Scene>
        ) : (
          <>
            <Scene className="bg-story-green text-white" blobs={["var(--story-amber)", "white"]}>
              <p data-anim="fade" className="text-xl text-white/80">Este mes entró a tu bolsillo</p>
              <Count value={story.income} format="money" fmt={fmt} className="text-[clamp(3rem,13vw,8rem)]" />
              <p data-anim="fade" className="text-lg text-white/80">
                {story.incomeCount} {story.incomeCount === 1 ? "ingreso" : "ingresos"}
                {story.carryOver > 0 && ` y traías ${fmt(story.carryOver, "money")} de antes`}
              </p>
            </Scene>

            <Scene className="bg-story-coral text-white" blobs={["var(--story-amber)", "var(--story-indigo)"]}>
              <p data-anim="fade" className="text-xl text-white/80">Y salieron</p>
              <Count value={story.spent} format="money" fmt={fmt} className="text-[clamp(3rem,13vw,8rem)]" />
              <p data-anim="fade" className="text-lg text-white/80">en {story.moves} movimientos.</p>
              {story.income > 0 && (
                <p data-anim="fade" className="text-[clamp(1.5rem,5vw,2.5rem)] leading-tight tracking-tight">
                  Eso es el{" "}
                  <Count as="span" value={story.spentRatio} format="pct" fmt={fmt} /> de lo que ganaste.
                </p>
              )}
            </Scene>

            {story.top && (
              <Scene className="bg-story-amber text-story-ink" blobs={["white", "var(--story-coral)"]}>
                <p data-anim="fade" className="text-xl text-story-ink/70">Tu categoría estrella</p>
                <span data-anim="pop" aria-hidden className="w-fit text-[clamp(6rem,28vw,13rem)] leading-none">
                  {story.top.emoji}
                </span>
                <h2 data-anim="split" className="text-[clamp(2.5rem,9vw,5.5rem)] leading-none tracking-tighter">
                  {story.top.name}
                </h2>
                <Count value={story.top.total} format="money" fmt={fmt} className="text-[clamp(2rem,7vw,3.5rem)]" />
                <p data-anim="fade" className="text-lg text-story-ink/70">
                  {pct(story.top.ratio, 0)} de todo lo que gastaste
                </p>
              </Scene>
            )}

            {story.biggest && (
              <Scene className="bg-story-indigo text-white" blobs={["var(--story-coral)", "var(--story-green)"]}>
                <p data-anim="fade" className="text-xl text-white/80">Tu gasto más grande</p>
                <div className="flex items-center gap-5">
                  <span data-anim="pop" aria-hidden className="text-[clamp(4rem,16vw,7rem)] leading-none">
                    {story.biggest.emoji}
                  </span>
                  <h2 data-anim="split" className="min-w-0 text-[clamp(2rem,7vw,4.5rem)] leading-none tracking-tighter break-words">
                    {story.biggest.label}
                  </h2>
                </div>
                <Count value={story.biggest.amount} format="money" fmt={fmt} className="text-[clamp(3rem,12vw,7rem)]" />
                <p data-anim="fade" className="text-lg text-white/80">el {formatDate(story.biggest.date)}</p>
              </Scene>
            )}

            {story.income > 0 && (
              <Scene className="bg-story-cream text-story-ink" blobs={["var(--story-amber)", "var(--story-green)"]}>
                <p data-anim="fade" className="text-xl text-story-ink/70">La regla 50/30/20</p>
                <h2 data-anim="split" className="text-[clamp(2.25rem,8vw,4.5rem)] leading-none tracking-tighter text-balance">
                  ¿Cómo repartiste tu dinero?
                </h2>
                <ul className="mt-4 flex flex-col gap-6">
                  {story.rule.map((r) => (
                    <li key={r.label} data-anim="fade" className="flex flex-col gap-2">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-lg">{r.label}</span>
                        <span className="tnum text-story-ink/70">
                          <span className="text-2xl text-story-ink">{r.actualPct}%</span> · meta {r.targetPct}%
                        </span>
                      </div>
                      <div className="relative h-3 rounded-full bg-story-ink/10">
                        <div
                          data-anim="bar"
                          className={cn("h-full rounded-full", r.bad ? "bg-story-coral" : "bg-story-green")}
                          style={{ width: `${Math.min(100, r.actualPct)}%` }}
                        />
                        <span
                          aria-hidden
                          className="absolute -top-1.5 h-6 w-0.5 rounded-full bg-story-ink"
                          style={{ left: `${r.targetPct}%` }}
                        />
                      </div>
                      <span className={cn("text-sm", r.bad ? "text-story-coral" : "text-story-ink/60")}>
                        {r.message}
                      </span>
                    </li>
                  ))}
                </ul>
              </Scene>
            )}

            <Scene className="bg-story-ink text-white" blobs={["var(--story-green)", "var(--story-amber)"]}>
              <p data-anim="fade" className="text-xl text-white/70">Quincena contra quincena</p>
              <div className="flex h-[38svh] items-end gap-6 md:gap-10">
                {story.biweeks.map((q) => (
                  <div key={q.biweek} className="flex h-full flex-1 flex-col items-center justify-end gap-3 md:max-w-48">
                    <Count value={q.spent} format="money" fmt={fmt} className="text-lg md:text-2xl" />
                    <div
                      data-anim="grow"
                      className={cn(
                        "w-full rounded-2xl",
                        story.calmest === q.biweek ? "bg-story-green" : "bg-white/85",
                      )}
                      style={{ height: `${Math.max(4, (q.spent / peak) * 100)}%` }}
                    />
                    <span className="text-center text-sm text-white/70">
                      Quincena {q.biweek}
                      <span className="block text-xs text-white/50">{q.range}</span>
                    </span>
                  </div>
                ))}
              </div>
              <h2 data-anim="split" className="text-[clamp(1.75rem,6vw,3.5rem)] leading-tight tracking-tighter">
                {story.calmest
                  ? `La quincena ${story.calmest} fue la más tranquila.`
                  : "Gastaste lo mismo en las dos."}
              </h2>
            </Scene>
          </>
        )}

        {!empty && (
        <Scene className="bg-background text-foreground" blobs={["var(--story-coral)", "var(--story-green)"]}>
          <div className="grid items-center gap-8 md:grid-cols-[1fr_auto] md:gap-12">
            <div className="flex flex-col gap-4">
              <p data-anim="fade" className="text-xl text-muted-foreground">Cerraste el mes con</p>
              <Count
                value={story.available}
                format="money"
                fmt={fmt}
                className={cn("text-[clamp(2.75rem,10vw,6rem)]", story.available < 0 && "text-destructive")}
              />
              <p data-anim="fade" className="max-w-md text-lg text-muted-foreground">
                {story.savedRatio > 0
                  ? `Apartaste el ${pct(story.savedRatio, 0)} de tu ingreso para ahorro e inversión.`
                  : "Este mes no apartaste para ahorro. El próximo puede ser distinto."}
              </p>
              <div data-anim="fade" className="mt-2 flex flex-wrap gap-3">
                <Button size="lg" onClick={share}>
                  <Share2Icon data-icon="inline-start" />
                  Compartir
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href={card} download={`mi-mes-${story.period}.png`}>
                    <DownloadIcon data-icon="inline-start" />
                    Descargar
                  </a>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <Link href={back}>Volver al resumen</Link>
                </Button>
              </div>
            </div>
            <TiltCard src={card} alt={`Resumen de ${month}`} root={root} />
          </div>
        </Scene>
        )}
      </div>
    </MotionConfig>
  );
}

function Scene({
  className,
  blobs,
  footer,
  children,
}: {
  className?: string;
  blobs: [string, string];
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      data-scene
      className={cn(
        "relative flex min-h-svh snap-start snap-always flex-col justify-center overflow-hidden px-6 py-24 md:px-16",
        className,
      )}
    >
      <span aria-hidden data-blob className="story-blob -top-1/4 -left-1/4" style={{ "--blob": blobs[0] } as React.CSSProperties} />
      <span aria-hidden data-blob className="story-blob -right-1/4 -bottom-1/4" style={{ "--blob": blobs[1] } as React.CSSProperties} />
      <div data-content className="relative mx-auto flex w-full max-w-4xl flex-col gap-4">
        {children}
      </div>
      {footer}
    </section>
  );
}

function Count({
  value,
  format,
  fmt,
  className,
  as: Tag = "p",
}: {
  value: number;
  format: Format;
  fmt: (n: number, f: Format) => string;
  className?: string;
  as?: "p" | "span";
}) {
  return (
    <Tag
      data-anim="count"
      data-value={value}
      data-format={format}
      className={cn("tnum inline-block leading-none tracking-tighter", Tag === "p" && "w-fit", className)}
    >
      {fmt(value, format)}
    </Tag>
  );
}

function TiltCard({ src, alt, root }: { src: string; alt: string; root: RefObject<HTMLDivElement | null> }) {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const spring = { stiffness: 180, damping: 18 };
  const rotateY = useSpring(useTransform(x, [0, 1], [-14, 14]), spring);
  const rotateX = useSpring(useTransform(y, [0, 1], [12, -12]), spring);
  const glareX = useTransform(x, [0, 1], [0, 100]);
  const glareY = useTransform(y, [0, 1], [0, 100]);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, oklch(1 0 0 / 35%), transparent 55%)`;

  return (
    <motion.div
      className="relative mx-auto w-56 perspective-[1000px] md:w-72"
      initial={{ opacity: 0, y: 80, rotate: -8 }}
      whileInView={{ opacity: 1, y: 0, rotate: -3 }}
      viewport={{ once: true, root, amount: 0.4 }}
      transition={{ type: "spring", stiffness: 90, damping: 14, delay: 0.3 }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width);
        y.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        x.set(0.5);
        y.set(0.5);
      }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative overflow-hidden rounded-3xl shadow-[0_30px_80px_-20px_oklch(0_0_0/45%)]"
      >
        <Image src={src} alt={alt} width={1080} height={1350} unoptimized className="block h-auto w-full" />
        <motion.span aria-hidden style={{ background: glare }} className="absolute inset-0" />
      </motion.div>
    </motion.div>
  );
}
