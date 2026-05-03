# Web Reddit Bahía Blanca

Invitación 3D al **Primer Cumpleaños** del grupo Reddit Bahía Blanca.

🗓 **Sábado 23 de Mayo 2026** — Apertura **19 hs**

🌐 [reddit-bahia-blanca.com.ar](https://reddit-bahia-blanca.com.ar)

## Stack

Sitio estático, HTML + CSS puro. Sin frameworks, sin JavaScript, sin build step. Hospedado en GitHub Pages.

## Estructura

```
.
├── index.html    Markup de la tarjeta
├── style.css     Animaciones 3D, paleta Reddit, responsive
├── qr.svg        Código QR pre-generado
├── CNAME         Dominio custom (peterdg-style)
└── .nojekyll     Evita procesamiento Jekyll en GH Pages
```

## Ver localmente

```bash
open index.html
```

No hay server ni build necesario — el sitio funciona desde `file://`.

## Regenerar el QR

```bash
~/.bun/bin/bun x qrcode -t svg -o qr.svg "Andas re manija, todavía no está esto"
```
