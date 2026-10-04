# Design System — "Planex" warm-glass dashboard

Source: [Modern Project Management Dashboard](https://dribbble.com/shots/27705845-Modern-Project-Management-Dashboard) por `nexuxproduct`.
Shot: `design/shot-01-dashboard.png` (1905×1429). Los hex salen de muestreo real de píxeles; los radios y formas, de crops a 2x (`design/crop-*.png`).

---

## 1. Línea de diseño (las 6 reglas que hacen que se vea así)

1. **La app ES el cristal, a sangre.** El gris `#AFAFAF` de alrededor es el fondo de presentación de Dribbble, **no un token del producto**. No hay marco, ni tarjeta contenedora, ni nada que parezca un diálogo flotando: el gradiente cálido cubre el documento entero y el contenido se apoya directo sobre él.
2. **Cristal cálido con grano.** Gradiente sutil (rosado→beige→gris, `#DFDCDD` → `#EAE5E5` → `#E2DDDC`) **más textura de ruido**. El muestreo devuelve cientos de tonos vecinos: es grano, no compresión. Sin el ruido se ve plano.
3. **Superficies translúcidas, no colores opacos.** Los paneles son blanco translúcido, no un gris más claro pintado encima. Se separan por luz, nunca por borde ni sombra dura. El blur queda reservado a la capa funcional (§10).
4. **Negro puro como único acento.** Cero color de marca. Los CTAs primarios son botones negros con texto blanco. El color solo aparece en badges de estado.
5. **Todo es rectángulo redondeado.** Nada es pastilla. Botones r≈16–20px, paneles r≈24px, rail r≈20px, badges r≈8px. El único elemento realmente circular es el punto de leyenda.
6. **Tipografía geométrica ligera, aire generoso.** Pesos 300–500, nunca bold. Botones altos (≈55px en el shot). Filas de tabla espaciadas.

---

## 2. Tipografía

Geométrica, `a` de un solo piso, `o` circular perfecto, **`1` sin banderita** (asta desnuda).

- **Candidata principal: Poppins** (Google Fonts). Alternativas: **Outfit**, **Jost**, **Questrial**.
- Crops de referencia: `design/crop-type-h1.png`, `design/crop-type-nums.png`.

**Pesos:** 300 (subtítulos), 400 (body/tabla), 500 (títulos, números, botones). **Nunca 600/700.**

| Rol | Tamaño | Peso |
|---|---|---|
| H1 | 34px | 500 |
| Subtítulo H1 | 15px | 300 |
| Número de KPI | 30px | 500 |
| Etiqueta de KPI | 14px | 400 |
| Título de panel | 20px | 500 |
| Encabezado de tabla | 13px | 400 |
| Celda de tabla | 14px | 400/500 |
| Badge | 12px | 500 |
| Botón | 14px | 500 |

---

## 3. Tokens de color

### Cristal (el documento)

| Token | Hex | oklch |
|---|---|---|
| `glass-a` | `#DFDCDD` | `oklch(0.897 0.004 355)` |
| `glass-b` | `#EAE5E5` | `oklch(0.926 0.005 17)` |
| `glass-c` | `#E2DDDC` | `oklch(0.901 0.006 31)` |

Gradiente `145deg` a → b → c, `background-attachment: fixed`, más una capa de grano (`feTurbulence` inline) en `mix-blend-mode: overlay` al 30%.

### Superficies (blanco translúcido + blur)

| Token | Valor | Uso |
|---|---|---|
| `card` | `oklch(1 0 0 / 46%)` sin blur | panel — capa de contenido, ver §10 |
| `muted` | `oklch(1 0 0 / 52%)` | riel de progreso, hover |
| `secondary` | `oklch(1 0 0 / 38%)` | chip inactivo |
| `accent` | `oklch(1 0 0 / 72%)` | hover fuerte |
| `sidebar-accent` | `oklch(1 0 0)` | **blanco puro = activo, y solo ahí** |
| rail inactivo | `white/35` | cuadro del rail sin seleccionar |

### Tinta

| Token | Hex | oklch |
|---|---|---|
| `foreground` | `#000000` | `oklch(0 0 0)` |
| `muted-foreground` | `#585451` | `oklch(0.45 0.007 60)` |
| `primary` (CTA) | `#000000` | `oklch(0 0 0)` |
| `border` | — | `oklch(0 0 0 / 12%)` separador; `--input` va a 43% (ver §11) |

### Badges de estado

Fondo pastel claro, **texto saturado** del mismo tono (esto es lo que les da vida; un fg apagado los mata).

| Estado | bg | fg (oklch) |
|---|---|---|
| Info | `#D0D1E5` | `0.525 0.16 272` |
| Éxito | `#CFDDD9` | `0.48 0.15 165` |
| Peligro | `#E8C8C7` | `0.525 0.19 22` |
| Aviso | `#EAD9C8` | `0.515 0.13 78` |

**Fórmula:** bg = L 0.86–0.90 / C 0.02–0.04; fg = mismo hue, L 0.48–0.53 / C 0.13–0.19. El shot los tiene más claros, pero ahí no pasaban 4.5:1 (§11).

---

## 4. Forma y espaciado

Medidos sobre crops a 2x, normalizados al shot.

| Elemento | Radio | Nota |
|---|---|---|
| Panel / tarjeta | 24px | `--radius-xl` |
| Rail (cuadro de icono) | 20px | cuadrado 56px |
| Botón | 16px | ≈0.38 × alto |
| Buscador | 22px | el más redondeado, pero **no** pastilla |
| Badge | 8px | `--radius-sm` |
| Barra de progreso | pastilla | alto 8px |

- Escala: `--radius: 1rem` → sm 8, md 12, lg 16, xl 24, 2xl 28, 3xl 32, 4xl 40.
- **Altura de botón:** default 40px, lg 48px. El shot usa ~55px; shadcn viene con 36px, demasiado compacto para esta línea.
- **Gap del rail:** 12px. Separado del borde izquierdo ~20px.
- **Padding de panel:** 24px. **Gap entre paneles:** 20–24px.
- **Iconos:** lucide-react, `strokeWidth={1.5}`, 20–22px.
- **Sombras:** prácticamente ninguna. Panel = hairline blanco superior (`inset 0 1px 0 white/70`) + `0 1px 2px black/3%`. Nada de sombras duras ni neumorfismo.

---

## 5. Navegación — rail de iconos

No es una sidebar con etiquetas. Es una columna de cuadrados redondeados de 56px, despegados del borde, gap 12px:

- **Inactivo:** `white/35`, icono en `foreground/70`. Hover sube a `white/60`.
- **Activo:** blanco puro con sombra suave `0 6px 20px black/8%`. Sin texto.
- **Hover:** la etiqueta se despliega como chip de vidrio flotante a la derecha, con un rebote (`cubic-bezier(0.22, 1.4, 0.36, 1)`). Flota en absoluto: no empuja el layout.
- **Agrupación:** primarios arriba, configuración anclada abajo (el shot separa 6 + 2).

---

## 6. Movimiento

- **Cuadro activo:** `<ViewTransition name="rail-active">` sobre el fondo blanco del ítem activo. Al navegar, el cuadro **se desliza** del ítem viejo al nuevo en 300ms con rebote, en vez de parpadear.
- **Contenido (efecto Genie):** `enter="genie" exit="genie"` sobre el contenido de página. El viejo se succiona hacia el rail (blur + escala no uniforme + skew, 170ms, ease-in agresivo); el nuevo brota desde ahí (300ms, `cubic-bezier(0.16, 1, 0.3, 1)`). Duraciones cortas a propósito: `motion.md` pide evitar animación pesada en interacciones frecuentes, con `transform-origin: left center`.
  - `ponytail:` el genie real de macOS es un warp de malla, imposible en CSS puro. Esto es la aproximación (escala no uniforme + skew + blur). Si hiciera falta el warp de verdad: filtro SVG sobre un snapshot, o canvas.
- Todo se apaga bajo `prefers-reduced-motion: reduce`.

---

## 7. Do / Don't

**Do**
- Cristal a sangre; el contenido se apoya directo sobre él.
- Grano encima del gradiente.
- Superficies translúcidas; el blur solo en barras y hojas.
- Negro puro para el CTA primario, uno por sección.
- Blanco puro reservado a "activo".
- Peso 300–500, nunca más.

**Don't**
- Un marco/tarjeta contenedora alrededor de la app (se lee como diálogo).
- El gris de Dribbble como fondo de la app.
- Pastillas. Nada es pastilla.
- Bordes visibles, sombras duras, neumorfismo.
- Color de marca en botones, iconos o barras de progreso.
- Badges con el texto apagado.

---

## 8. Mapeo a la app de finanzas

| Shot | Finanzas |
|---|---|
| 4 KPIs sueltos sobre el cristal | Ingresos · Gasto fijo · Gasto variable · Total gastado |
| Titular + número grande | "Disponible este mes" + barra de reparto |
| Tabla de proyectos con progreso | Categorías con % de gasto e ingreso |
| Badges de estado | `Alto` y estados de pago |
| Kanban de 3 columnas | Necesidades / Deseos / Ahorro (`--color-need/want/save`) |
| Panel de calendario | Calendario de pagos fijos y cortes de tarjeta |

**Colisión resuelta:** negro sigue siendo el único acento de acción; `need/want/save` toman la paleta saturada de los badges (rojo / ámbar / verde), que es la misma familia tonal del shot y sí es distinguible en gráficos.

---

## 9. Modo oscuro

El shot no lo tiene. Al portar: el cristal baja a L≈0.20–0.22 conservando el hue cálido, las superficies pasan a `white/7–16%`, el acento cambia de negro puro a blanco puro, y los badges suben el fg a L≈0.72–0.82. Grano al 18%.

Montado con `next-themes` en modo `system` (`src/components/layout/theme-provider.tsx`). Sin switch en la interfaz, a propósito.

---

## 10. Capas, al modo de Apple

Apple tiene exactamente dos capas (`materials.md › Liquid Glass`) y la regla es dura: *"Don't use Liquid Glass in the content layer."*

```
┌──────────────────────────────────────────┐
│ Capa funcional                            │  blur(28px) saturate(1.4), relleno ~70%,
│ barra superior · tab bar · rail · hojas   │  scroll edge effect (máscara de desvanecido)
│ popovers · dropdowns · selects · diálogos  │
├──────────────────────────────────────────┤
│ Capa de contenido                         │  material estándar: blanco translúcido,
│ tarjetas · listas · KPIs · gráficos       │  SIN blur, hairline superior
└──────────────────────────────────────────┘
```

- El cristal cálido con grano es el **fondo**, no un material de vidrio: no lleva blur.
- Las tarjetas son `white/46%` con un hairline `inset 0 1px white/70`. Nada de `backdrop-filter`: por detrás solo hay un gradiente estático, así que el blur costaba GPU sin cambiar un píxel.
- **Scroll edge effect:** las barras llevan el material en un `::before` con `mask-image` que lo desvanece en el borde por donde entra el contenido. En el elemento mismo la máscara también desvanecería su texto.
- **Presupuesto de color:** un solo CTA tintado por vista, y el tinte va al fondo del botón, no al símbolo (`color.md › Liquid Glass color`).

## 11. Contraste medido (WCAG AA)

Calculado sobre el cristal más claro (`#EAE5E5`), que es el peor caso.

| Par | Ratio | Mínimo |
|---|---|---|
| `muted-foreground` #585451 | 5.98:1 | 4.5 |
| `foreground` sobre tarjeta | 18.69:1 | 4.5 |
| `destructive` #C02334 sobre su propio lavado 10% | 4.54:1 | 4.5 |
| `success` #007647 | 5.07:1 | 4.5 |
| `warning` / `want` #8F5B00 | 5.08:1 | 4.5 |
| blanco sobre `primary` negro | 21:1 | 4.5 |
| icono del rail inactivo | 4.60:1 | 3 (no textual) |

`--input` está a 43% de negro (3.03:1): es el único indicador del límite de un campo, así que necesita contraste no textual real. `--border`, que solo separa, se queda en 12%.

## 12. Estados del sistema

- `prefers-color-scheme` vía `ThemeProvider` de next-themes en modo `system`. **Sin switch en la interfaz** (`dark-mode.md › Best practices`).
- `prefers-reduced-transparency`: se cae el blur y las superficies pasan a opacas.
- `prefers-contrast: more`: sube `--muted-foreground`, `--border` y el relleno de las tarjetas, y la tarjeta gana un contorno de 1px.
- `prefers-reduced-motion`: se apagan genie y el deslizamiento del rail.
- `pointer: coarse`: los botones de icono suben a 44×44 px; en puntero se quedan en 28–32.

---

## 13. Carpeta (contenedor de sección)

Fuente: [Customer Journey CRM Dashboard](https://dribbble.com/shots/24659454-Customer-Journey-CRM-Dashboard), contenedor "New Case Managment".
Shot: `design/shot-02-folder-bento.png`. Crops: `crop-folder-tab.png`, `crop-folder-notch.png`.

La pestaña va arriba a la izquierda y se funde con el cuerpo mediante una **esquina invertida**: el borde de la pestaña baja con un radio convexo y vuelve a subir al borde superior del cuerpo con un radio cóncavo. No es un encabezado flotando encima: es una sola silueta.

```
 ╭──────────────╮
 │  Título      ╰──╮                          ← pestaña + esquina invertida
 ├─────────────────┴──────────────────────╮
 │  cuerpo                                │
 ╰────────────────────────────────────────╯
```

Medidas (normalizadas del shot, ancho 1600):

| Parte | Valor |
|---|---|
| Alto de pestaña | 48px (`--tab-h`) |
| Radio de esquinas | 24px (`--tab-r`, = `--radius-xl`) |
| Radio de la esquina invertida | 20px (`--notch`) |
| Padding horizontal de la pestaña | 24px |

**Implementación:** tres elementos —pestaña, parche de esquina (`::after`) y cuerpo— con el mismo relleno. El parche es un cuadrado de `--notch` al que se le muerde un cuarto de círculo con `mask-image: radial-gradient(circle at 100% 0, transparent R, #000 R+0.5px)`.

**Por eso las superficies de contenido pasaron a ser opacas** (`color-mix(in oklch, white 46%, var(--glass-b))` en vez de `white/46%`): con relleno translúcido los tres solapes se ven como costuras. Efecto secundario bueno: el contraste ya no depende del punto del gradiente en el que caiga el panel, así que los ratios de §11 son exactos en toda la página.

El cuerpo lleva `border-radius: 0 R R R` — la esquina superior izquierda es recta porque ahí se apoya la pestaña.

## 14. Bento

Rejilla de teselas squircle: 2 columnas en móvil, 3 o 4 en escritorio según densidad de texto.

| Elemento | Valor |
|---|---|
| Radio de tesela | 28px (`--radius-2xl`) |
| Gap | 12px |
| Relleno | `color-mix(in oklch, white 62%, var(--card))` |
| Tesela activa | `--primary` (negro) — sigue habiendo un solo acento |

Spans: `wide` (2 columnas) para tarjetas y quincenas, `tall` para lo que lo pida. Las tiras de fecha en gastos variables usan `col-span-full` dentro de la misma rejilla, así el grid sigue siendo uno solo en vez de partirse en varias rejillas raquíticas.

Adoptado en: resumen (KPIs + quincenas), gastos variables, gastos fijos, ingresos, tarjetas, categorías.

## 15. Movimiento del bento

Sin librería de animación. La razón: `motion/react` son ~34KB gz y convierte cada tesela en Client Component, lo que en RSC obliga a mandar los datos de la lista como props serializadas. Para efectos que la plataforma ya hace de forma nativa, no compensa en una app de gestión.

| Gesto | Implementación | Duración |
|---|---|---|
| Entrada escalonada | `@keyframes tile-in`, `animation-delay: calc(var(--i) * 28ms)` | 260ms |
| Hover | `translateY(-2px)` + sombra | 180ms |
| Press | `scale(0.985)` | 90ms |
| Navegación (genie) | `ViewTransition` de React | 300ms / 170ms |
| Cuadro activo del rail | `ViewTransition name="rail-active"` | 300ms |

Todo se apaga bajo `prefers-reduced-motion`. El escalonado está tope a 28ms por ítem: con 20 teselas la última entra a los 820ms, que ya es el límite antes de que se sienta lento.

Si hiciera falta física de resorte de verdad o arrastrar teselas, ahí sí entra `motion`.
