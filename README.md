# Web Reddit Bahía Blanca

Tarjeta 3D interactiva — invitación al **Primer Aniversario** del grupo Reddit Bahía Blanca.

🗓 **Sábado 23 de Mayo 2026** — Apertura **19 hs**
📍 Paula Albarracín 628, Bahía Blanca
🌐 [reddit-bahia-blanca.com.ar](https://reddit-bahia-blanca.com.ar)

## Stack

Sitio estático: HTML + CSS + ~80 líneas de JS vanilla. Sin frameworks, sin dependencias en runtime. **Build empaqueta todo en un único `dist/index.html` (~13 KB, 1 request)**. Hospedado en GitHub Pages, deploy automático vía Actions.

## Estructura

```
.
├── index.html              ← markup fuente
├── style.css               ← estilos
├── script.js               ← drag interactivo + auto-rotación
├── qr.svg                  ← QR pre-generado
├── build.js                ← bundle + minify → dist/index.html
├── CNAME                   ← reddit-bahia-blanca.com.ar
├── DNS.md                  ← config Cloudflare + TAD
├── CLAUDE.md               ← contexto del proyecto
└── .github/workflows/
    └── deploy.yml          ← build automático en push
```

## Comandos

```bash
# Ver localmente (sin build, fuente directa)
open index.html

# Build local
~/.bun/bin/bun build.js              # → dist/index.html (~13 KB minificado)
~/.bun/bin/bun build.js --no-minify  # → dist/index.html legible (debug)

# Regenerar QR
~/.bun/bin/bun x qrcode -t svg -o qr.svg "Andas re manija, todavía no está esto"
```

## Interacción

- **Auto-rotación lenta** continua (22s/vuelta)
- **Click + arrastrar** (>6px) → girá libre en 3D
- **Soltar** → vuelve a auto-rotación
- **Click en Subreddit / WhatsApp / Maps** → abren los enlaces

## Deployment

Cada push a `main` dispara el workflow:
1. Setup Bun
2. `bun build.js` genera `./dist/`
3. Deploy vía `actions/deploy-pages`

Pages source: **GitHub Actions** (no branch). Configuración DNS en [DNS.md](./DNS.md).
