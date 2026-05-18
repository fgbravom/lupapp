import { getGradeInfo } from "@/lib/gradeColor";

interface Props {
  nota: number;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  className?: string;
}

const dim = {
  xs: { outer: 40,  inner: 34,  font: "1rem",   label: "0.6rem",  border: 2.5 },
  sm: { outer: 56,  inner: 48,  font: "1.35rem", label: "0.65rem", border: 3   },
  md: { outer: 76,  inner: 66,  font: "1.8rem",  label: "0.7rem",  border: 3   },
  lg: { outer: 104, inner: 90,  font: "2.4rem",  label: "0.75rem", border: 3.5 },
  xl: { outer: 136, inner: 118, font: "3.1rem",  label: "0.85rem", border: 4   },
};

export default function GradeBadge({ nota, size = "md", showLabel = false, className = "" }: Props) {
  const { color, bg, ring, label } = getGradeInfo(nota);
  const d = dim[size];
  const forceInt = size === "xs" || size === "sm";
  const display = (forceInt || nota % 1 === 0) ? Math.round(nota).toString() : nota.toFixed(1);

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`} aria-label={`Nota ${display} — ${label}`}>
      <div
        style={{
          width: d.outer,
          height: d.outer,
          borderRadius: "50%",
          background: bg,
          border: `${d.border}px solid ${ring}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            color,
            fontSize: d.font,
            fontFamily: "Syne, sans-serif",
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          {display}
        </span>
      </div>
      {showLabel && (
        <span
          style={{
            color,
            fontSize: d.label,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
