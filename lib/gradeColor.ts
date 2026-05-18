export interface GradeInfo {
  color: string;
  bg: string;
  ring: string;
  label: string;
}

export function getGradeInfo(nota: number): GradeInfo {
  if (nota >= 6.0) return { color: "#00B86B", bg: "rgba(0,184,107,0.10)", ring: "rgba(0,184,107,0.28)", label: "Excelente" };
  if (nota >= 5.0) return { color: "#8BC34A", bg: "rgba(139,195,74,0.10)", ring: "rgba(139,195,74,0.28)", label: "Bueno" };
  if (nota >= 4.0) return { color: "#FF9500", bg: "rgba(255,149,0,0.10)", ring: "rgba(255,149,0,0.28)", label: "Suficiente" };
  if (nota >= 3.0) return { color: "#FF5722", bg: "rgba(255,87,34,0.10)", ring: "rgba(255,87,34,0.28)", label: "Deficiente" };
  return { color: "#E63030", bg: "rgba(230,48,48,0.10)", ring: "rgba(230,48,48,0.28)", label: "Reprobado" };
}
