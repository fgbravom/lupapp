interface IconProps {
  size?: number;
  className?: string;
}

const base = (size: number, cls: string, children: React.ReactNode) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cls}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export function IconSearch({ size = 20, className = "" }: IconProps) {
  return base(size, className, <>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </>);
}

export function IconCamera({ size = 20, className = "" }: IconProps) {
  return base(size, className, <>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z" />
    <circle cx="12" cy="13" r="3" />
  </>);
}

export function IconBarcode({ size = 20, className = "" }: IconProps) {
  return base(size, className, <>
    <path d="M3 5v14M6 5v14M10 5v14M13 5v14M16 5v14M20 5v14" />
    <path d="M3 5h2M3 19h2M19 5h2M19 19h2" strokeWidth="1.5" />
  </>);
}

export function IconSun({ size = 20, className = "" }: IconProps) {
  return base(size, className, <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66-1.41 1.41M19.07 4.93l-1.41 1.41" strokeWidth="1.5" />
  </>);
}

export function IconMoon({ size = 20, className = "" }: IconProps) {
  return base(size, className, <>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </>);
}

export function IconX({ size = 20, className = "" }: IconProps) {
  return base(size, className, <>
    <path d="M18 6 6 18M6 6l12 12" />
  </>);
}

export function IconArrowLeft({ size = 20, className = "" }: IconProps) {
  return base(size, className, <>
    <path d="m12 19-7-7 7-7M19 12H5" />
  </>);
}

export function IconUpload({ size = 20, className = "" }: IconProps) {
  return base(size, className, <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
  </>);
}

export function IconImage({ size = 20, className = "" }: IconProps) {
  return base(size, className, <>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21" />
  </>);
}

export function IconFileText({ size = 20, className = "" }: IconProps) {
  return base(size, className, <>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z" />
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
  </>);
}

export function IconTable({ size = 20, className = "" }: IconProps) {
  return base(size, className, <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 3v18" />
  </>);
}

export function IconSparkles({ size = 20, className = "" }: IconProps) {
  return base(size, className, <>
    <path d="m12 3-1.91 5.81a2 2 0 0 1-1.28 1.28L3 12l5.81 1.91a2 2 0 0 1 1.28 1.28L12 21l1.91-5.81a2 2 0 0 1 1.28-1.28L21 12l-5.81-1.91a2 2 0 0 1-1.28-1.28z" />
  </>);
}

export function IconUsers({ size = 20, className = "" }: IconProps) {
  return base(size, className, <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </>);
}

export function IconChevronRight({ size = 20, className = "" }: IconProps) {
  return base(size, className, <>
    <path d="m9 18 6-6-6-6" />
  </>);
}

export function IconAlertTriangle({ size = 20, className = "" }: IconProps) {
  return base(size, className, <>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z" />
    <line x1="12" x2="12" y1="9" y2="13" />
    <line x1="12" x2="12.01" y1="17" y2="17" />
  </>);
}

export function IconCheckCircle({ size = 20, className = "" }: IconProps) {
  return base(size, className, <>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </>);
}

export function IconExternalLink({ size = 20, className = "" }: IconProps) {
  return base(size, className, <>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15,3 21,3 21,9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </>);
}

export function IconCoffee({ size = 20, className = "" }: IconProps) {
  return base(size, className, <>
    <path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" />
    <line x1="6" x2="6" y1="2" y2="4" />
    <line x1="10" x2="10" y1="2" y2="4" />
    <line x1="14" x2="14" y1="2" y2="4" />
  </>);
}

export function IconGithub({ size = 20, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
