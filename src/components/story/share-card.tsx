import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { money, pct } from "@/lib/money";
import { formatPeriod } from "@/lib/period";
import type { MonthStory } from "@/lib/story";

const font = (file: string) => readFile(join(process.cwd(), "assets/fonts", file));

function cardMoney(currency: string) {
  const symbolInFont = /^[\x20-\x7E\xA0-\xFF]*$/.test(money(0, currency));
  const code = new Intl.NumberFormat("es-MX", { style: "currency", currency, currencyDisplay: "code" });
  return (n: number) => (symbolInFont ? money(n, currency) : code.format(n));
}

export async function shareCard(story: MonthStory, currency: string) {
  const [regular, medium] = await Promise.all([font("Poppins-Regular.ttf"), font("Poppins-Medium.ttf")]);
  const fmt = cardMoney(currency);
  const closing = fmt(story.available);
  const rows = [
    story.top && { label: "Categoría estrella", value: story.top.name },
    { label: "Entró", value: fmt(story.income) },
    { label: "Salió", value: fmt(story.spent) },
    { label: "Ahorro", value: `${pct(story.savedRatio, 0)} del ingreso` },
  ].filter((r) => !!r);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 88,
          color: "white",
          fontFamily: "Poppins",
          backgroundColor: "#16120f",
          backgroundImage:
            "radial-gradient(circle at 0% 0%, #c2452f 0%, transparent 55%), radial-gradient(circle at 100% 100%, #2f6f58 0%, transparent 55%), radial-gradient(circle at 100% 0%, #3a3a9e 0%, transparent 45%)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 28, letterSpacing: 6, opacity: 0.7 }}>FINANZAS · TU MES</div>
          <div style={{ fontSize: 92, fontWeight: 500, lineHeight: 1, letterSpacing: -3 }}>
            {formatPeriod(story.period)}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 40, opacity: 0.75 }}>Cerré el mes con</div>
          <div
            style={{
              fontSize: Math.min(150, Math.floor(1500 / closing.length)),
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: -4,
              color: story.available < 0 ? "#ff9b8a" : "white",
            }}
          >
            {closing}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderRadius: 40,
            padding: "12px 40px",
            backgroundColor: "rgba(255,255,255,0.1)",
          }}
        >
          {rows.map((r, i) => (
            <div
              key={r.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 24,
                padding: "26px 0",
                fontSize: 36,
                borderTop: i ? "1px solid rgba(255,255,255,0.15)" : "none",
              }}
            >
              <span style={{ opacity: 0.7 }}>{r.label}</span>
              <span style={{ fontWeight: 500 }}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
      fonts: [
        { name: "Poppins", data: regular, weight: 400, style: "normal" },
        { name: "Poppins", data: medium, weight: 500, style: "normal" },
      ],
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
