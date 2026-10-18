"use client";

import {
  BellRingIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LightbulbIcon,
  PlusIcon,
  WalletIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useEffectEvent, useState } from "react";
import { useCurrency, useMoney } from "@/components/layout/preferences";
import { Amount } from "@/components/shared/amount";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;
const spring = { type: "spring", stiffness: 380, damping: 30 } as const;
const rise = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } };

function useBeat(count: number, ms: number, paused = false) {
  const reduced = useReducedMotion();
  const [beat, setBeat] = useState(0);
  useEffect(() => {
    if (paused || reduced) return;
    const id = setInterval(() => setBeat((b) => (b + 1) % count), ms);
    return () => clearInterval(id);
  }, [count, ms, paused, reduced]);
  return reduced && !paused ? count - 1 : beat;
}

const PER_MXN: Record<string, number> = {
  MXN: 1,
  USD: 0.05,
  EUR: 0.05,
  COP: 200,
  CRC: 25,
  ARS: 70,
  CLP: 50,
  PEN: 0.2,
  GTQ: 0.4,
};

function useDemo() {
  const rate = PER_MXN[useCurrency()] ?? 1;
  return (mxn: number) => {
    const n = mxn * rate;
    const step = 10 ** Math.max(0, Math.floor(Math.log10(n)) - 2);
    return Math.round(n / step) * step;
  };
}

function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("tile w-full max-w-72 p-3", className)}>{children}</div>;
}

export function WelcomeScene() {
  const items = NAV.slice(0, 5);
  const beat = useBeat(items.length, 1300);
  const current = items[beat];
  return (
    <div className="flex items-center gap-6">
      <ul className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <li
            key={item.href}
            className="relative flex size-9 items-center justify-center rounded-[0.7rem] bg-white/35 text-sidebar-foreground/70 dark:bg-white/6"
          >
            {i === beat && (
              <motion.span
                layoutId="tour-rail"
                transition={{ type: "spring", stiffness: 420, damping: 26 }}
                className="absolute inset-0 rounded-[0.7rem] bg-sidebar-accent shadow-[0_6px_20px_oklch(0_0_0/8%)]"
              />
            )}
            <item.icon className="relative size-4" strokeWidth={1.5} />
          </li>
        ))}
      </ul>
      <div className="relative h-16 w-40">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={current.href}
            initial={{ opacity: 0, x: -14, filter: "blur(6px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 14, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease }}
            className="absolute inset-0 flex flex-col justify-center"
          >
            <span className="text-xs text-muted-foreground">Sección</span>
            <span className="text-2xl tracking-tight">{current.label}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

const INCOMES = [
  { name: "Salario quincena 1", amount: 15000, recurring: true },
  { name: "Salario quincena 2", amount: 15000, recurring: true },
  { name: "Proyecto extra", amount: 4000, recurring: false },
];

export function IncomeScene() {
  const demo = useDemo();
  const beat = useBeat(INCOMES.length + 1, 1400);
  const shown = INCOMES.slice(0, beat);
  return (
    <Panel>
      <ul className="flex min-h-[7.25rem] flex-col gap-1">
        <AnimatePresence initial={false}>
          {shown.map((r) => (
            <motion.li
              key={r.name}
              layout
              {...rise}
              transition={spring}
              className="flex items-center gap-2 rounded-xl bg-white/50 px-2.5 py-2 text-xs dark:bg-white/6"
            >
              <WalletIcon className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
              <span className="truncate">{r.name}</span>
              {r.recurring && (
                <Badge variant="outline" className="h-4 px-1.5 text-[11px]">
                  Cada mes
                </Badge>
              )}
              <Amount value={demo(r.amount)} className="ml-auto font-medium" />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <div className="mt-2 flex items-baseline justify-between border-t px-1 pt-2">
        <span className="text-xs text-muted-foreground">Ingreso del mes</span>
        <Amount animate value={shown.reduce((n, r) => n + demo(r.amount), 0)} className="text-base font-medium" />
      </div>
    </Panel>
  );
}

const FIXED = [
  { name: "Renta", amount: 9000, due: "vence el 5" },
  { name: "Internet", amount: 900, due: "vence el 12" },
  { name: "Gimnasio", amount: 650, due: "vence el 20" },
];

export function FixedScene() {
  const demo = useDemo();
  const [paid, setPaid] = useState([false, false, false]);
  const [touched, setTouched] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (touched || reduced) return;
    const id = setInterval(
      () => setPaid((p) => (p.every(Boolean) ? [false, false, false] : p.map((v, i) => v || i === p.indexOf(false)))),
      1200,
    );
    return () => clearInterval(id);
  }, [touched, reduced]);

  return (
    <Panel>
      <ul className="flex flex-col gap-1">
        {FIXED.map((r, i) => (
          <li
            key={r.name}
            className={cn(
              "flex items-center gap-2.5 rounded-xl bg-white/50 px-2.5 py-2 text-xs transition-opacity duration-300 dark:bg-white/6",
              paid[i] && "opacity-60",
            )}
          >
            <Switch
              size="sm"
              checked={paid[i]}
              aria-label={`Marcar ${r.name} como pagado`}
              onCheckedChange={(v) => {
                setTouched(true);
                setPaid((p) => p.map((x, j) => (j === i ? v : x)));
              }}
            />
            <span className="flex flex-col">
              <span className={cn("transition-colors", paid[i] && "line-through")}>{r.name}</span>
              <span className="text-[11px] text-muted-foreground">{paid[i] ? "Pagado" : r.due}</span>
            </span>
            <Amount value={demo(r.amount)} className="ml-auto font-medium" />
          </li>
        ))}
      </ul>
      <p className="mt-2 px-1 text-[11px] text-muted-foreground">Pruébalo: toca un interruptor.</p>
    </Panel>
  );
}

const SPENDS = [
  { emoji: "☕", name: "Café", amount: 1800 },
  { emoji: "🛒", name: "Súper", amount: 14500 },
  { emoji: "🚌", name: "Transporte", amount: 900 },
  { emoji: "🍔", name: "Comida", amount: 6200 },
];

export function VariableScene() {
  const money = useMoney();
  const demo = useDemo();
  const reduced = useReducedMotion();
  const [rows, setRows] = useState([{ ...SPENDS[0], id: 0 }]);
  const [draft, setDraft] = useState<(typeof rows)[number] | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!draft) return;
    const id = setTimeout(() => {
      setRows((r) => [draft, ...r].slice(0, 3));
      setDraft(null);
    }, 1100);
    return () => clearTimeout(id);
  }, [draft]);

  const add = () => {
    const id = rows[0].id + 1;
    setDraft((d) => d ?? { ...SPENDS[id % SPENDS.length], id });
  };
  const tick = useEffectEvent(add);

  useEffect(() => {
    if (touched || reduced) return;
    const id = setInterval(tick, 2600);
    return () => clearInterval(id);
  }, [touched, reduced]);

  return (
    <Panel className="relative h-44 overflow-hidden">
      <ul className="flex flex-col gap-1">
        <AnimatePresence initial={false}>
          {rows.map((r) => (
            <motion.li
              key={r.id}
              layout
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={spring}
              className="flex items-center gap-2 rounded-xl bg-white/50 px-2.5 py-2 text-xs dark:bg-white/6"
            >
              <span aria-hidden>{r.emoji}</span>
              {r.name}
              <span className="tnum ml-auto font-medium">{money(demo(r.amount))}</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        animate={draft ? { scale: 0.92 } : { scale: 1 }}
        transition={spring}
        onClick={() => {
          setTouched(true);
          add();
        }}
        className="absolute right-3 bottom-3 flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground shadow-[0_8px_20px_-8px_var(--primary)] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <PlusIcon className="size-3.5" />
        Nuevo gasto
      </motion.button>
      <AnimatePresence>
        {draft && (
          <motion.div
            key={draft.id}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%", opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }}
            transition={{ duration: 0.4, ease }}
            className="absolute inset-x-0 bottom-0 flex flex-col gap-2 rounded-t-2xl bg-popover p-3 shadow-[0_-8px_24px_oklch(0_0_0/8%)]"
          >
            <span className="text-xs font-medium">Registrar gasto</span>
            <div className="flex items-center justify-between rounded-lg border border-input/40 px-2.5 py-1.5 text-sm">
              <motion.span
                initial={{ clipPath: "inset(0 100% 0 0)" }}
                animate={{ clipPath: "inset(0 0% 0 0)" }}
                transition={{ duration: 0.5, delay: 0.25, ease: "linear" }}
                className="tnum"
              >
                {money(demo(draft.amount))}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...spring, delay: 0.6 }}
                className="rounded-md bg-muted px-1.5 py-0.5 text-[11px]"
              >
                {draft.emoji} {draft.name}
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  );
}

function Grow({ value, className, delay = 0 }: { value: number; className: string; delay?: number }) {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.9, delay, ease: [0.65, 0, 0.35, 1] }}
      style={{ width: `${value * 100}%` }}
      className={cn("h-full origin-left", className)}
    />
  );
}

export function SummaryScene() {
  const demo = useDemo();
  return (
    <div className="flex w-full max-w-80 flex-col gap-3">
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[11px] text-muted-foreground">Disponible este mes</span>
          <Amount animate value={demo(11450)} className="text-3xl tracking-tight" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...spring, delay: 0.5 }}
          className="tile flex flex-col rounded-xl px-3 py-2"
        >
          <span className="text-[11px] text-muted-foreground">Hoy puedes gastar</span>
          <Amount animate value={demo(1270)} className="text-lg font-medium" />
          <span className="text-[11px] text-muted-foreground">al día, por 9 días</span>
        </motion.div>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-foreground/10">
        <Grow value={0.32} className="bg-primary" delay={0.2} />
        <Grow value={0.34} className="bg-want" delay={0.35} />
      </div>
      <div className="grid grid-cols-3 text-[11px] text-muted-foreground">
        {[
          ["bg-primary", "Fijo"],
          ["bg-want", "Variable"],
          ["bg-foreground/20", "Libre"],
        ].map(([color, label]) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={cn("size-2 rounded-full", color)} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

const RULE = [
  { label: "Necesidades", target: 0.5, actual: 0.56, color: "bg-need" },
  { label: "Deseos", target: 0.3, actual: 0.31, color: "bg-want" },
  { label: "Ahorro", target: 0.2, actual: 0.13, color: "bg-save" },
];

export function AdviceScene() {
  return (
    <Panel className="flex flex-col gap-2.5">
      {RULE.map((r, i) => (
        <div key={r.label} className="flex flex-col gap-1">
          <div className="flex justify-between text-[11px]">
            <span>{r.label}</span>
            <span className="tnum text-muted-foreground">
              {Math.round(r.actual * 100)}% de {Math.round(r.target * 100)}%
            </span>
          </div>
          <div className="relative h-1.5 rounded-full bg-foreground/10">
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <Grow value={r.actual} className={r.color} delay={0.15 + i * 0.12} />
            </div>
            <span
              aria-hidden
              className="absolute -top-1 h-3.5 w-0.5 rounded-full bg-foreground"
              style={{ left: `${r.target * 100}%` }}
            />
          </div>
        </div>
      ))}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 1.2, ease }}
        className="mt-1 flex items-start gap-1.5 rounded-lg bg-white/50 p-2 text-[11px] dark:bg-white/6"
      >
        <LightbulbIcon className="mt-px size-3.5 shrink-0 text-warning" strokeWidth={1.5} />
        Recorta un poco en necesidades y súmalo a tu ahorro.
      </motion.p>
    </Panel>
  );
}

export function GoalScene() {
  const money = useMoney();
  const demo = useDemo();
  const target = demo(30000);
  const beat = useBeat(5, 1300);
  const saved = demo(6000) + beat * demo(3000);
  return (
    <Panel className="relative flex flex-col gap-2 overflow-visible">
      <div className="flex items-center justify-between text-xs">
        <span>🛟 Fondo de emergencia</span>
        <span className="tnum text-muted-foreground">{Math.round((saved / target) * 100)}%</span>
      </div>
      <div className="flex items-baseline gap-1 text-xs text-muted-foreground">
        <Amount animate value={saved} className="text-xl font-medium text-foreground" />
        de {money(target)}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-foreground/10">
        <motion.div
          animate={{ scaleX: saved / target }}
          transition={{ duration: 0.7, ease }}
          className="h-full origin-left bg-save"
        />
      </div>
      <span className="text-[11px] text-muted-foreground">Aparta {money(demo(4000))} al mes para llegar en marzo</span>
      <AnimatePresence>
        {beat > 0 && (
          <motion.span
            key={beat}
            initial={{ opacity: 0, y: 24, scale: 0.8 }}
            animate={{ opacity: [0, 1, 1, 0], y: [24, 0, -6, -14], scale: 1 }}
            transition={{ duration: 1.1, ease: "easeOut", times: [0, 0.3, 0.7, 1] }}
            className="tnum pointer-events-none absolute -top-3 right-4 rounded-md bg-save px-1.5 py-0.5 text-[11px] font-medium text-white dark:text-black"
          >
            +{money(demo(3000))}
          </motion.span>
        )}
      </AnimatePresence>
    </Panel>
  );
}

export function CardScene() {
  const beat = useBeat(2, 2200);
  return (
    <div className="relative flex w-full max-w-72 flex-col items-center">
      <AnimatePresence>
        {beat === 1 && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
            transition={spring}
            className="absolute -top-2 z-10 flex items-center gap-2 rounded-xl bg-popover px-3 py-2 text-[11px] shadow-[0_8px_24px_oklch(0_0_0/10%)]"
          >
            <BellRingIcon className="motion-safe:animate-ring size-3.5 text-warning" strokeWidth={1.5} />
            El pago de tu tarjeta vence en 3 días
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, rotate: -6 }}
        animate={{ opacity: 1, y: 0, rotate: -3 }}
        transition={{ duration: 0.6, ease }}
        className="mt-6 flex aspect-[1.6] w-56 flex-col justify-between rounded-2xl bg-primary p-4 text-primary-foreground shadow-[0_18px_40px_-16px_oklch(0_0_0/45%)]"
      >
        <span className="text-sm font-medium">Tarjeta Azul</span>
        <span className="tnum text-xs tracking-[0.2em] opacity-70">•••• 4821</span>
        <div className="flex gap-5 text-[11px]">
          <span className="flex flex-col">
            <span className="opacity-60">Corte</span>día 5
          </span>
          <span className="flex flex-col">
            <span className="opacity-60">Pago</span>día 25
          </span>
        </div>
      </motion.div>
    </div>
  );
}

const MONTHS = Array.from({ length: 12 }, (_, i) =>
  new Date(2026, i, 1).toLocaleDateString("es", { month: "long" }).replace(/^./, (c) => c.toUpperCase()),
);
const CATEGORIES = [
  { label: "🏠 Renta", color: "bg-need" },
  { label: "🍿 Salidas", color: "bg-want" },
  { label: "🛟 Ahorro", color: "bg-save" },
  { label: "🐶 Mascotas", color: "bg-need" },
];

export function ReadyScene() {
  const [manual, setManual] = useState<[number, number] | null>(null);
  const beat = useBeat(2, 1800, manual !== null);
  const [month, dir] = manual ?? [(new Date().getMonth() + beat) % 12, beat ? 1 : -1];
  const shift = (d: number) => setManual([(month + d + 12) % 12, d]);

  return (
    <div className="flex w-full max-w-72 flex-col items-center gap-4">
      <div className="tile flex items-center gap-1 rounded-xl p-1">
        <button
          type="button"
          aria-label="Mes anterior"
          onClick={() => shift(-1)}
          className="flex size-8 items-center justify-center rounded-lg hover:bg-white/60 dark:hover:bg-white/10"
        >
          <ChevronLeftIcon className="size-4" />
        </button>
        <div className="relative h-6 w-28 overflow-hidden text-center text-sm">
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            <motion.span
              key={month}
              custom={dir}
              variants={{
                enter: (d: number) => ({ x: d * 24, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (d: number) => ({ x: d * -24, opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease }}
              className="absolute inset-0"
            >
              {MONTHS[month]}
            </motion.span>
          </AnimatePresence>
        </div>
        <button
          type="button"
          aria-label="Mes siguiente"
          onClick={() => shift(1)}
          className="flex size-8 items-center justify-center rounded-lg hover:bg-white/60 dark:hover:bg-white/10"
        >
          <ChevronRightIcon className="size-4" />
        </button>
      </div>
      <ul className="flex flex-wrap justify-center gap-1.5">
        {CATEGORIES.map((c, i) => (
          <motion.li
            key={c.label}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...spring, delay: 0.2 + i * 0.07 }}
            className="flex items-center gap-1.5 rounded-lg bg-white/50 px-2.5 py-1.5 text-xs dark:bg-white/6"
          >
            <span className={cn("size-1.5 rounded-full", c.color)} />
            {c.label}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
