"use client";

export default function DonateButton() {
  return (
    <a
      href="https://ko-fi.com"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF5E5B] hover:bg-[#e54e4b] text-white text-sm font-medium rounded-lg transition-colors"
    >
      <span>☕</span>
      <span>Apoyar con Ko-fi</span>
    </a>
  );
}
