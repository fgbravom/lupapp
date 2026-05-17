# 🔍 Lupapp

**Ponemos los alimentos chilenos bajo la lupa**

Lupapp es una app web open source que analiza la etiqueta nutricional de alimentos vendidos en Chile y les asigna una nota del **1.0 al 7.0**, siguiendo la Ley 20.606 (sellos ALTO EN) y comparando con normas europeas.

---

## ¿Qué hace?

- Fotografía o escanea la etiqueta de cualquier alimento
- Extrae ingredientes y tabla nutricional con Google Gemini Vision
- Detecta automáticamente sellos ALTO EN según la Ley 20.606
- Califica el producto del 1.0 al 7.0
- Identifica aditivos y su nivel de riesgo
- Compara contra normas de la Unión Europea
- Construye una base de datos pública de productos escaneados

---

## Stack

- **Next.js 14** (App Router)
- **TypeScript + Tailwind CSS**
- **InsForge** (PostgreSQL, backend)
- **Google Gemini 2.0 Flash** (OCR / Vision)
- **html5-qrcode** (lector código de barras)

---

## Instalación local

### 1. Clona el repositorio

```bash
git clone https://github.com/TU_USUARIO/lupapp.git
cd lupapp
npm install
```

### 2. Configura las variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

| Variable | Dónde obtenerla |
|---|---|
| `GEMINI_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) — gratis |
| `INSFORGE_URL` | [insforge.dev](https://insforge.dev) — plan trial gratuito |
| `INSFORGE_API_KEY` | En tu panel InsForge |
| `NEXT_PUBLIC_INSFORGE_URL` | Mismo que `INSFORGE_URL` |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | `npx @insforge/cli secrets get ANON_KEY` |

### 3. Crea la base de datos

```bash
npx @insforge/cli db migrations up --all
```

### 4. Ejecuta en desarrollo

```bash
npm run dev
```

---

## ¿Cómo calculamos la nota?

Partimos de **7.0** y descontamos:

| Criterio | Descuento |
|---|---|
| Cada sello ALTO EN (Ley 20.606) | −1.2 |
| Grasas trans presentes | −0.8 |
| Aditivo riesgo alto | −0.5 |
| Aditivo riesgo medio | −0.2 |
| Sin sellos ni aditivos problemáticos | +0.3 |

Mínimo: **1.0** — Máximo: **7.0**

*Fuentes: Ley 20.606, DS 977/96, Reglamento (UE) 1169/2011*

---

## Contribuir

### Agregar aditivos

Edita `data/aditivos-riesgo.json`. Cada entrada:

```json
{
  "nombre": "Nombre del aditivo",
  "codigo_e": "E###",
  "riesgo": "bajo" | "medio" | "alto"
}
```

### Corregir normas

Edita `data/limites-normas.json` con los valores de referencia por 100g.

### Corregir datos de productos

Si un producto tiene datos incorrectos en la base de datos pública, abre un issue en GitHub con el nombre del producto y la corrección.

---

## Roadmap

- **MVP (v0.1)** — Análisis por foto, búsqueda, base de datos p��blica
- **v1.0** — Reportes de la comunidad, corrección colaborativa de datos
- **v2.0** — Ranking de productos por categoría (galletas, bebidas, lácteos…)
- **v3.0** — App móvil nativa, comparador de marcas

---

## Deploy en Vercel

```bash
npx @insforge/cli deployments env set INSFORGE_URL https://TU_APPKEY.us-east.insforge.app
npx @insforge/cli deployments env set INSFORGE_API_KEY ik_...
npx @insforge/cli deployments env set NEXT_PUBLIC_INSFORGE_URL https://TU_APPKEY.us-east.insforge.app
npx @insforge/cli deployments env set NEXT_PUBLIC_INSFORGE_ANON_KEY eyJ...
npx @insforge/cli deployments env set GEMINI_API_KEY ...
npx @insforge/cli deployments deploy .
```

---

## Apoyar el proyecto

Lupapp es gratis, sin publicidad y open source. Si te sirve, un café ayuda:

[![Ko-fi](https://img.shields.io/badge/Ko--fi-Apoyar-FF5E5B?logo=kofi)](https://ko-fi.com)

---

## Disclaimer

Esta aplicación es **informativa**. No reemplaza el consejo de un profesional de la salud o nutricionista. Los datos provienen del análisis automático de etiquetas y pueden contener errores.

---

**MIT License** · Open Source · Hecho en Chile 🇨🇱
