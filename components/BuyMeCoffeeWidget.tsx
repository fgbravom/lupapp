"use client";

export default function BuyMeCoffeeWidget() {
  return (
    <a
      href="https://www.buymeacoffee.com/fgbravom"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Buy Me a Coffee"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 64,
        height: 64,
        background: "rgb(64, 220, 165)",
        color: "white",
        borderRadius: 32,
        position: "fixed",
        right: 18,
        bottom: 18,
        boxShadow: "rgba(0, 0, 0, 0.15) 0px 4px 8px",
        zIndex: 9999,
        cursor: "pointer",
        fontWeight: 600,
        transition: "transform 0.25s",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://cdn.buymeacoffee.com/widget/assets/coffee%20cup.svg"
        alt="Buy Me a Coffee"
        style={{ height: 36, width: 36, margin: 0, padding: 0 }}
      />
    </a>
  );
}
