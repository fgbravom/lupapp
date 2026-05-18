#!/usr/bin/env node
// Uso: node scripts/cargar-jumbo.mjs <url-jumbo>
// Ejemplo: node scripts/cargar-jumbo.mjs "https://www.jumbo.cl/nugget-crocante-sadia-400gr-2017037/p"

const url = process.argv[2];
if (!url) {
  console.error("Uso: node scripts/cargar-jumbo.mjs <url-jumbo>");
  process.exit(1);
}

const API = process.env.API_URL ?? "http://localhost:3000";

console.log(`\nCargando: ${url}`);
console.log(`API:      ${API}\n`);

const res = await fetch(`${API}/api/admin/cargar-jumbo`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url }),
});

const data = await res.json();

if (!res.ok) {
  console.error("❌ Error:", data.error);
  process.exit(1);
}

const { scraped, evaluacion, producto } = data;

console.log("✅ Producto cargado");
console.log("  ID:          ", producto.id);
console.log("  Nombre:      ", scraped.nombre);
console.log("  Marca:       ", scraped.marca ?? "—");
console.log("  Ingredientes:", scraped.ingredientes_count);
console.log("  Nota CL:     ", evaluacion.nota);
console.log("  Sellos:      ", evaluacion.sellos.join(", ") || "ninguno");
console.log("  Aditivos:    ", evaluacion.aditivos);
console.log("\n  Tabla nutricional (por 100g):");
const t = scraped.tabla;
console.log("    Calorías:   ", t.calorias_kcal ?? "—", "kcal");
console.log("    Proteínas:  ", t.proteinas_g ?? "—", "g");
console.log("    Grasas tot: ", t.grasas_totales_g ?? "—", "g");
console.log("    Grasas sat: ", t.grasas_saturadas_g ?? "—", "g");
console.log("    Grasas trans:", t.grasas_trans_g ?? "—", "g");
console.log("    Carbohid:   ", t.carbohidratos_g ?? "—", "g");
console.log("    Azúcares:   ", t.azucares_g ?? "—", "g");
console.log("    Sodio:      ", t.sodio_mg ?? "—", "mg");
