# Lupapp — Estado actual (2026-05-17)

## Qué es

App chilena de análisis nutricional. Stack: **Next.js 14 App Router + TypeScript + InsForge (PostgreSQL) + Gemini Vision**.

El flujo principal: el usuario busca un producto por nombre o escanea código de barras → ve la ficha con nota CL, tabla nutricional, sellos y aditivos. También puede subir foto (OCR) para agregar un producto nuevo.

---

## Estado del código HOY (base limpia)

### Páginas
| Ruta | Archivo |
|------|---------|
| `/` | [app/page.tsx](app/page.tsx) — Buscador principal |
| `/producto/[id]` | [app/producto/[id]/page.tsx](app/producto/[id]/page.tsx) — Ficha detallada |
| `/analizar` | [app/analizar/page.tsx](app/analizar/page.tsx) — Flujo OCR |

### API Routes
| Endpoint | Archivo |
|----------|---------|
| `GET /api/productos` | Busca por nombre o lista recientes |
| `GET/PATCH /api/productos/[id]` | Obtiene producto / incrementa escaneos |
| `GET /api/barcode` | Busca por código de barras |
| `POST /api/ocr` | Procesa imágenes con Gemini Vision |
| `POST /api/evaluar` | Evalúa tabla nutricional |

### Componentes
| Componente | Rol |
|------------|-----|
| `BuscadorProducto.tsx` | Búsqueda por texto + dropdown + barcode + 📷 OCR |
| `ResultCard.tsx` | Ficha de producto: nota, tabla, sellos, aditivos |
| `SubidaManualModal.tsx` | Modal OCR: fotos de ingredientes + tabla nutricional |
| `AnalizarModal.tsx` | Modal de análisis detallado |
| `BarcodeScanner.tsx` | Escáner de código de barras (dynamic, no SSR) |
| `UploadZone.tsx` | Zona de drag & drop para subir fotos |
| `AditivoTag.tsx` | Badge de aditivo con nivel de riesgo |
| `NormasComparison.tsx` | Comparativa con normas EU |
| `ThemeToggle.tsx` | Botón dark/light mode |
| `DonateButton.tsx` | Botón de donación |

### Librerías internas
| Archivo | Rol |
|---------|-----|
| `lib/insforge.ts` | Cliente InsForge: CRUD de productos |
| `lib/evaluator.ts` | Evaluador rule-based: nota CL, sellos, aditivos |

---

## Base de datos (InsForge)

**Proyecto:** `ykmp6x4v` — `https://ykmp6x4v.us-east.insforge.app`

### Tabla `productos` — columnas actuales
```
id, nombre, marca, codigo_barras, elaborado_por, registro_sanitario,
ingredientes TEXT[], tabla_nutricional JSONB,
nota_cl NUMERIC, sellos_cl TEXT[], aditivos JSONB, comparativa_eu JSONB,
imagen_url TEXT, veces_escaneado INT,
creado_en TIMESTAMPTZ, actualizado_en TIMESTAMPTZ,

-- columnas extra que EXISTEN en DB pero el código actual no usa:
estado TEXT          (aprobado | pendiente | rechazado)
fuente TEXT          (jumbo | usuario | ocr)
condiciones_alimentarias TEXT[]
descripcion TEXT
caracteristicas JSONB
```

> Las últimas 5 columnas fueron agregadas con migraciones durante la sesión de hoy, pero el código fue revertido al estado anterior. Las columnas siguen en la DB. Cuando retomes el pivot a base de datos curada, ya no necesitas hacer las migraciones de nuevo.

### Función RPC
- `incrementar_escaneos(producto_id uuid)` — incremento atómico de `veces_escaneado`

---

## Variables de entorno (`.env.local`)

```
INSFORGE_URL=https://ykmp6x4v.us-east.insforge.app
INSFORGE_API_KEY=ik_fbc9660e6e9c14bf2657a5d85cc6c91d
NEXT_PUBLIC_INSFORGE_URL=https://ykmp6x4v.us-east.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=eyJhbGci...
GEMINI_API_KEY=AIzaSyBpD5...
MISTRAL_API_KEY=ZfbqisiK...
```

---

## Lo que se exploró/aprendió hoy (aunque se revirtió)

### Pivot a base de datos curada desde Jumbo.cl

Se desarrolló y probó todo pero el usuario decidió revertirlo. Queda como conocimiento para retomarlo:

1. **Jumbo.cl sirve contenido SSR para SEO** usando la clase `seo-accordion__content`. `fetch()` simple funciona, no se necesita Playwright.

2. **Estructura HTML de Jumbo:**
   ```html
   <span class="seo-accordion__title">Descripción</span>
   <div class="seo-accordion__content">...datos...</div>
   ```
   5 secciones en orden: Descripción, Condición alimentaria, Ingredientes, Información nutricional, Características.

3. **Tabla nutricional de Jumbo NO es `<table>`**, usa listas:
   ```html
   <ul class="grid grid-cols-3">
     <li>Energía (kcal)</li>  <!-- nombre nutriente -->
     <li>241</li>              <!-- por 100g -->
     <li>53</li>               <!-- por porción -->
   </ul>
   ```

4. **Condiciones alimentarias:** Jumbo usa "Libre de Lactosa" (no "sin lactosa"). Necesitan mapeo.

5. **Script de carga probado y funcionando:**
   ```
   node scripts/cargar-jumbo.mjs <url-jumbo>
   → POST /api/admin/cargar-jumbo
   → scrape + evaluar + upsert en DB
   ```
   Resultado con nuggets Sadia: 20 ingredientes, 241 kcal/100g, nota 5.8 ✓

6. **Columnas ya en DB:** `estado`, `fuente`, `condiciones_alimentarias`, `descripcion`, `caracteristicas` — no hace falta migrar de nuevo si se retoma.

7. **Pendiente al retomar:** `azucares_g` y `sodio_mg` salían nulos — faltaba depurar los nombres exactos en el HTML de la tabla nutricional de Jumbo.

---

## Para mañana / próxima sesión

Opciones posibles según lo conversado:

**A) Retomar el pivot a base curada Jumbo:**
- Recuperar `lib/jumbo.ts` (disponible en el historial de esta sesión)
- Depurar por qué `azucares_g` y `sodio_mg` salen nulos
- Recuperar `app/api/admin/cargar-jumbo/route.ts` y el panel `/admin`
- Las columnas de DB ya existen (no remigrar)

**B) Continuar mejorando el flujo OCR actual:**
- El flujo de `SubidaManualModal` + Gemini Vision ya funciona
- Posibles mejoras: UI del resultado, manejo de errores, más campos del OCR

**C) Agregar modal de subida manual (sin OCR, datos manuales):**
- Se implementó hoy pero se revirtió con el resto
- Formulario con nombre, marca, ingredientes, tabla nutricional, imagen
- Endpoint `POST /api/admin/subir-manual`
