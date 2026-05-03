# CLAUDE.md

Documento de contexto para Claude Code (claude.ai/code) cuando se trabaje en este repositorio.

---

## ¿Qué es esto?

Sitio estático de **una sola página**: una tarjeta 3D de invitación al **Primer Aniversario del grupo Reddit Bahía Blanca**.

- 🗓 **Sábado 23 de Mayo 2026** — Apertura **19 hs**
- 📍 Paula Albarracín 628, B8000 Bahía Blanca
- 🌐 [reddit-bahia-blanca.com.ar](https://reddit-bahia-blanca.com.ar)
- 📦 Repo: [PeterDamianG/reddit-bahia-blanca](https://github.com/PeterDamianG/reddit-bahia-blanca)

## Filosofía técnica

**Deliberadamente minimalista**. No es PersonalWeb (que es Vite + Preact + tests). Acá:

- **HTML + CSS + ~80 líneas de JS vanilla**
- Sin frameworks, sin TypeScript, sin tests
- Fuentes mantenidas por separado para iteración fácil
- Build opcional empaqueta + minifica todo en **un único archivo `dist/index.html`** (auto-contenido, una sola request HTTP)
- GitHub Actions corre el build automáticamente y despliega vía Pages

El objetivo es **rendimiento extremo**: <15 KB total, una sola request, sin dependencias en runtime.

## Estructura

```
.
├── index.html              ← markup fuente (con <link>, <script>, <img src="qr.svg">)
├── style.css               ← estilos fuente
├── script.js               ← drag + auto-rotación
├── qr.svg                  ← QR pre-generado
├── build.js                ← bundle + minify → dist/index.html
├── CNAME                   ← reddit-bahia-blanca.com.ar
├── .nojekyll               ← evita procesamiento Jekyll
├── DNS.md                  ← pasos para configurar Cloudflare + TAD
├── README.md               ← descripción + comandos
├── CLAUDE.md               ← este archivo
├── .gitignore              ← excluye dist/
├── .github/workflows/
│   └── deploy.yml          ← GitHub Action: bun build + Pages deploy
└── dist/                   ← (gitignored) salida del build
    ├── index.html          ← todo inline minificado
    ├── CNAME
    └── .nojekyll
```

## Comandos

```bash
# Desarrollo (abre el archivo fuente directo, sin build)
open index.html

# Build local (genera dist/index.html ~13 KB autocontenido)
~/.bun/bin/bun build.js

# Build legible (sin minificar) para debug
~/.bun/bin/bun build.js --no-minify

# Regenerar QR si cambia el contenido
~/.bun/bin/bun x qrcode -t svg -o qr.svg "Andas re manija, todavía no está esto"
```

> **Nota Bun**: el path correcto en este sistema es `~/.bun/bin/bun`. NO usar `npm`/`node` — el proyecto está pensado con Bun.

## Cómo funciona el build

`build.js`:

1. Lee `index.html`, `style.css`, `script.js`, `qr.svg`
2. Minifica CSS con regex (seguro para CSS hand-written)
3. Minifica JS con `Bun.build({ minify: true })`
4. Strip XML/DOCTYPE del SVG, lo deja inline
5. Reemplaza en el HTML:
   - `<link href="style.css">` → `<style>...</style>`
   - `<script src="script.js">` → `<script>...</script>`
   - `<img src="qr.svg">` → `<svg>...</svg>` directamente embebido
6. Minifica el HTML resultante (colapsa espacios, remueve comentarios)
7. Escribe `dist/index.html` + copia `CNAME` + crea `.nojekyll`

Resultado: ~13 KB, **1 sola request HTTP**.

## Deployment

**Pages source = "GitHub Actions"** (no "Deploy from branch").

El workflow `.github/workflows/deploy.yml`:
1. Se dispara en push a `main`
2. Setup Bun
3. Corre `bun build.js`
4. Sube `./dist/` como artifact
5. Despliega vía `actions/deploy-pages@v4`

URL final: `https://reddit-bahia-blanca.com.ar` (cuando DNS propague — ver `DNS.md`).

## Estado de DNS (al 2026-05-03)

- ❌ Dominio `reddit-bahia-blanca.com.ar` registrado en NIC.ar
- ❌ Aún delegado a `ns1.cloudflare.com` / `ns2.cloudflare.com` (genéricos, NO funcionan — hay que cambiar a los nameservers específicos que asigne Cloudflare a la cuenta)
- ❌ Cloudflare aún no tiene la zona configurada
- ✅ GitHub Pages tiene el `CNAME` correcto

**Para que funcione el dominio**, seguir paso a paso `DNS.md`. Es exactamente el mismo flujo que `peterdg.com.ar`:
1. Add site en Cloudflare → te dan 2 NS específicos
2. Cambiar la delegación en TAD (borrar genéricos, poner los específicos)
3. Cargar registros A + CNAME en Cloudflare con **proxy DESACTIVADO** (gris)
4. Activar Enforce HTTPS en GitHub

## Diseño de la tarjeta

**Aspect**: 460×280 px (1.65:1, tipo tarjeta de presentación)

**Capas 3D anidadas** (cada una con un transform owner único):
```
.scene         → perspective: 1600px (no transform)
└── .floater       → translateY (CSS keyframes floatY)
    └── .auto-spinner → rotateY 0→360° + tilt X (CSS keyframes autoSpin, 22s linear)
        └── .card         → JS-controlled durante drag
            ├── .face.front → backface-hidden
            └── .face.back  → backface-hidden + rotateY(180deg)
```

**Frente** (claro estilo Reddit web):
- Banda naranja superior + sello "★ Invitación Oficial ★" rotado en esquina
- Snoo (mascota Reddit) en cuadrado naranja
- Título "Primer Aniversario" + tagline
- 2 botones: Subreddit (orange) → r/BahiaBlanca, WhatsApp (verde) → grupo

**Reverso** (dark estilo Reddit night):
- Header con badge + título "Información del evento"
- QR code en card blanca
- Fecha / Apertura (19 hs en orange grande) / Lugar (link a Google Maps)

**Interacción**:
- Auto-rotación CSS continua (22s/vuelta, infinite linear)
- Click + arrastrar (>6px) → JS toma control, gira libre en 3D
- Soltar → tarjeta vuelve a transform identity, auto-rotación se reanuda
- **Drag threshold (6px)**: si el usuario solo hace click, NO se inicia drag → los links/botones funcionan normalmente

## Decisiones clave / historial

| Decisión | Razón |
|---|---|
| HTML+CSS+JS puro, sin framework | Tarjeta simple, performance >> arquitectura |
| Bun en vez de npm/node | Consistencia con PersonalWeb, builds rápidos |
| Auto-rotación CSS + drag JS | CSS solo no permite tracking de mouse continuo |
| Drag threshold 6px | Evita que clicks en links/botones inicien drag accidentalmente |
| Snoo SVG inline (no PNG, no imagen externa) | 0 requests adicionales, escala perfecto |
| QR pre-generado offline (no librería runtime) | El contenido es estático, no hay razón de generarlo en cliente |
| Single-file output (todo inline) | 1 request HTTP en lugar de 4, mejor TTI |
| GitHub Actions build | Deploy automático, fuentes legibles en repo |
| CNAME y proxy gris (DNS only) en Cloudflare | Necesario para SSL de GitHub Pages |

## Cosas que NO hacer

- ❌ No agregar dependencias npm/jsr (project is intentionally dependency-free)
- ❌ No agregar TypeScript / build-time tooling más allá de `build.js`
- ❌ No habilitar el proxy naranja en Cloudflare (rompe el SSL de GitHub Pages)
- ❌ No commitear `dist/` (lo genera el workflow)
- ❌ No tocar `CNAME` salvo que cambie el dominio
- ❌ No agregar tests — la complejidad no lo justifica para una tarjeta estática

## Cosas que probablemente vas a querer hacer

- Cambiar texto del frente/reverso → editar `index.html`
- Cambiar colores → variables CSS en `:root` de `style.css`
- Cambiar contenido del QR → regenerar con el comando documentado arriba
- Cambiar interacción del drag → `script.js` (es chiquito, ~80 líneas)
- Verificar tamaño del bundle → `bun build.js` muestra reporte
