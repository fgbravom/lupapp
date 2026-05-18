interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
  className?: string;
}

const heights = { sm: 26, md: 34, lg: 50 };

export default function Logo({ size = "md", className = "" }: LogoProps) {
  const h = heights[size];
  return (
    <span className={`inline-flex items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/lupappfondoclaro.svg" alt="Lupapp" height={h} className="dark:hidden w-auto" style={{ height: h }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/lupappfondooscuro.svg" alt="Lupapp" height={h} className="hidden dark:block w-auto" style={{ height: h }} />
    </span>
  );
}
