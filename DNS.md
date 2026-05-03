# Configuración DNS — `reddit-bahia-blanca.com.ar`

Esta web está hospedada en GitHub Pages con dominio personalizado. La gestión DNS se hace en **Cloudflare** (plan Free), siguiendo el mismo patrón que `peterdg.com.ar`.

## Pasos para configurar

### 1. Agregar el sitio en Cloudflare

1. Ingresar a [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Add a site** → escribir `reddit-bahia-blanca.com.ar`
3. Elegir plan **Free**
4. Cloudflare asigna 2 nameservers únicos a la cuenta para este dominio (ej. `xxx.ns.cloudflare.com` / `yyy.ns.cloudflare.com`). **Anotalos textualmente** — son distintos a los de `peterdg.com.ar`.

### 2. Actualizar la delegación en TAD/NIC

1. Entrar a [tramitesadistancia.gob.ar](https://tramitesadistancia.gob.ar) → **Mis Trámites** → Delegaciones
2. Buscar `reddit-bahia-blanca.com.ar`
3. **Borrar** las entradas actuales (`ns1.cloudflare.com` y `ns2.cloudflare.com` — son los genéricos que no funcionan)
4. **Agregar** los 2 nameservers específicos que dio Cloudflare
5. **Ejecutar Cambios**

> Propagación: 1-4h en general (a veces hasta 24h). Sabrás que está OK cuando este comando devuelva los NS de Cloudflare:
> ```bash
> dig reddit-bahia-blanca.com.ar NS +short
> ```

### 3. Configurar registros DNS en Cloudflare

En el panel de Cloudflare → DNS → Records → **Add record**, cargar exactamente:

| Type  | Name | Content                  | Proxy      |
|-------|------|--------------------------|------------|
| A     | @    | 185.199.108.153          | DNS only   |
| A     | @    | 185.199.109.153          | DNS only   |
| A     | @    | 185.199.110.153          | DNS only   |
| A     | @    | 185.199.111.153          | DNS only   |
| CNAME | www  | peterdamiang.github.io   | DNS only   |

> **Crítico**: la nube debe estar **gris (DNS only)**, NO naranja (Proxied). Si queda naranja, el SSL de GitHub Pages se rompe por doble proxy.

### 4. Activar HTTPS en GitHub

1. Esperar a que la delegación propague (paso 2)
2. GitHub → repo `reddit-bahia-blanca` → **Settings → Pages**
3. Aparecerá el check verde de validación del dominio
4. Marcar **Enforce HTTPS**

## Verificación

```bash
# 1. Nameservers correctos
dig reddit-bahia-blanca.com.ar NS +short
# → debe devolver xxx.ns.cloudflare.com / yyy.ns.cloudflare.com

# 2. Resolución de IPs
dig reddit-bahia-blanca.com.ar A +short
# → debe devolver:
# 185.199.108.153
# 185.199.109.153
# 185.199.110.153
# 185.199.111.153

# 3. CNAME www
dig www.reddit-bahia-blanca.com.ar CNAME +short
# → peterdamiang.github.io.

# 4. HTTPS funcionando
curl -I https://reddit-bahia-blanca.com.ar
# → HTTP/2 200, content-type: text/html
```

## Notas

- El archivo `CNAME` en la raíz del repo le dice a GitHub Pages cuál es el dominio personalizado. **No tocar** salvo que cambie el dominio.
- Si en el futuro se agrega el subdominio `www`, GitHub Pages lo resolverá automáticamente al apex via el CNAME configurado en Cloudflare.
- El plan Free de Cloudflare alcanza para este uso. No hay límites de queries DNS.
