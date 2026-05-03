# Web Reddit Bahía Blanca

Tarjeta 3D interactiva — invitación al **Primer Aniversario** del grupo Reddit Bahía Blanca.

🗓 **Sábado 23 de Mayo 2026** — Apertura **19 hs**
📍 Paula Albarracín 628, Bahía Blanca
🌐 [reddit-bahia-blanca.com.ar](https://reddit-bahia-blanca.com.ar)

## Stack

Sitio estático: HTML + CSS + ~80 líneas de JS vanilla. Sin frameworks, sin build step, sin dependencias en runtime. Hospedado en GitHub Pages.

## Estructura

```
.
├── index.html    Markup de la tarjeta + Snoo SVG inline
├── style.css     3D, paleta Reddit, responsive, prefers-reduced-motion
├── script.js     Drag con Pointer Events + flip por botón
├── qr.svg        QR code (encoded: "Andas re manija, todavía no está esto")
├── CNAME         Dominio custom: reddit-bahia-blanca.com.ar
├── DNS.md        Pasos para configurar DNS en Cloudflare
└── .nojekyll     Evita procesamiento Jekyll en GH Pages
```

## Interacción

- **Click + arrastrar** → girá la tarjeta libremente en 3D
- **Soltar** → la tarjeta vuelve a la cara más cercana (frente o reverso)
- **Botón ↻** o **tecla F** → voltea la tarjeta
- **Click en Subreddit / WhatsApp / Maps** → abren los enlaces

## Ver localmente

```bash
open index.html
```

No hay server ni build necesario — funciona desde `file://`.

## Regenerar el QR

```bash
~/.bun/bin/bun x qrcode -t svg -o qr.svg "Andas re manija, todavía no está esto"
```

## Deployment

Push a `main` → GitHub Actions despliega automáticamente a GitHub Pages.

Configuración DNS para el dominio custom: ver [DNS.md](./DNS.md).
