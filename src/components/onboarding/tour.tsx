"use client";

import { AnimatePresence, MotionConfig, motion, type Variants } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  AdviceScene,
  CardScene,
  FixedScene,
  GoalScene,
  IncomeScene,
  ReadyScene,
  SummaryScene,
  VariableScene,
  WelcomeScene,
} from "./scenes";

const STEPS = [
  {
    title: "Tu dinero, más claro",
    body: "En un minuto te mostramos lo esencial: cuánto tienes, en qué se va y cuánto puedes gastar hoy sin preocuparte.",
    Scene: WelcomeScene,
  },
  {
    title: "Primero, lo que recibes",
    body: "Anota tus ingresos. Si tu salario llega igual cada mes, márcalo como «Se repite cada mes» y no tendrás que volver a escribirlo.",
    Scene: IncomeScene,
  },
  {
    title: "Lo que pagas cada mes",
    body: "Renta, servicios, suscripciones. Anótalos una vez y márcalos como pagados al cubrirlos. Te avisaremos antes de que alguno venza.",
    Scene: FixedScene,
  },
  {
    title: "Los gastos del día a día",
    body: "¿Un café, el súper, el transporte? Toca Nuevo gasto, pon el monto y la categoría. Del resto nos encargamos nosotros.",
    Scene: VariableScene,
  },
  {
    title: "Cuánto puedes gastar hoy",
    body: "Tu resumen te dice cuánto te queda este mes y cuánto puedes gastar cada día para llegar con calma a tu próximo pago.",
    Scene: SummaryScene,
  },
  {
    title: "Consejos con tus números",
    body: "Comparamos tus gastos con la regla 50/30/20: necesidades, deseos y ahorro. Si algo se pasa de su parte, te decimos dónde ajustar.",
    Scene: AdviceScene,
  },
  {
    title: "Ponle nombre a tu ahorro",
    body: "Un viaje, un fondo de emergencia, lo que quieras. Aparta en su categoría y verás tu avance y cuánto guardar al mes.",
    Scene: GoalScene,
  },
  {
    title: "Tus tarjetas, sin sorpresas",
    body: "Agrega cada tarjeta con su día de corte y de pago. Te avisaremos con tiempo para que ninguna fecha se te pase.",
    Scene: CardScene,
  },
  {
    title: "Ya conoces lo esencial",
    body: "Arriba cambias de mes, en Categorías creas las tuyas y en Ajustes eliges tus días de pago. ¿Empezamos con tu primer ingreso?",
    Scene: ReadyScene,
  },
];

const SEEN_KEY = "finanzas:tour-visto";
const OPEN_EVENT = "tour:open";

export const openTour = () => window.dispatchEvent(new Event(OPEN_EVENT));

const slide: Variants = {
  enter: (d: number) => ({ opacity: 0, x: d * 48, filter: "blur(6px)" }),
  center: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: (d: number) => ({ opacity: 0, x: d * -48, filter: "blur(6px)", transition: { duration: 0.18, ease: "easeIn" } }),
};
const ease = [0.16, 1, 0.3, 1] as const;

export function Tour() {
  const [open, setOpen] = useState(false);
  const [[step, dir], setStep] = useState([0, 1]);
  const primary = useRef<HTMLButtonElement>(null);
  const last = step === STEPS.length - 1;
  const { title, body, Scene } = STEPS[step];

  useEffect(() => {
    const show = () => {
      setStep([0, 1]);
      setOpen(true);
    };
    try {
      if (!localStorage.getItem(SEEN_KEY)) show();
    } catch {}
    window.addEventListener(OPEN_EVENT, show);
    return () => window.removeEventListener(OPEN_EVENT, show);
  }, []);

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {}
  };
  const go = (to: number) => {
    if (to < 0 || to >= STEPS.length || to === step) return;
    setStep([to, to > step ? 1 : -1]);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden p-0 sm:max-w-md"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          primary.current?.focus();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(step + 1);
          if (e.key === "ArrowLeft") go(step - 1);
        }}
      >
        <MotionConfig reducedMotion="user">
          <motion.div
            drag="x"
            dragSnapToOrigin
            dragElastic={0.15}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, { offset }) => {
              if (offset.x < -60) go(step + 1);
              if (offset.x > 60) go(step - 1);
            }}
            className="relative m-2 mb-0 flex h-60 touch-pan-y items-center justify-center overflow-hidden rounded-[1rem] bg-[linear-gradient(145deg,var(--glass-a),var(--glass-b)_45%,var(--glass-c))] px-6"
          >
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              <motion.div
                key={step}
                custom={dir}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease }}
                className="flex w-full items-center justify-center"
              >
                <Scene />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <div className="flex flex-col gap-5 p-6 pt-5">
            <div aria-live="polite" className="relative min-h-28 overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                <motion.div
                  key={step}
                  custom={dir}
                  variants={slide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.5, delay: 0.06, ease }}
                  className="flex flex-col gap-2"
                >
                  <DialogTitle className="text-xl tracking-tight">{title}</DialogTitle>
                  <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                    {body}
                  </DialogDescription>
                </motion.div>
              </AnimatePresence>
            </div>

            <ol className="flex gap-1" aria-label={`Paso ${step + 1} de ${STEPS.length}`}>
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex-1">
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Ir a ${s.title}`}
                    aria-current={i === step ? "step" : undefined}
                    className="group flex h-7 w-full items-center outline-none"
                  >
                    <span className="h-1 w-full overflow-hidden rounded-full bg-foreground/12 group-focus-visible:ring-2 group-focus-visible:ring-ring/50">
                      <motion.span
                        initial={false}
                        animate={{ scaleX: i <= step ? 1 : 0 }}
                        transition={{ duration: 0.4, ease }}
                        className="block h-full origin-left bg-primary"
                      />
                    </span>
                  </button>
                </li>
              ))}
            </ol>

            <div className="flex items-center gap-2">
              {!last && (
                <Button variant="ghost" onClick={close} className="-ml-3 text-muted-foreground">
                  Saltar
                </Button>
              )}
              <div className="ml-auto flex gap-2">
                {step > 0 && (
                  <Button variant="outline" onClick={() => go(step - 1)}>
                    Atrás
                  </Button>
                )}
                {last ? (
                  <Button asChild>
                    <Link href="/ingresos" onClick={close}>
                      Registrar mi primer ingreso
                    </Link>
                  </Button>
                ) : (
                  <Button ref={primary} onClick={() => go(step + 1)}>
                    {step === 0 ? "Empezar" : "Siguiente"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </MotionConfig>
      </DialogContent>
    </Dialog>
  );
}
