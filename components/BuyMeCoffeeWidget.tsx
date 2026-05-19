"use client";

import { useState, useEffect } from "react";

export default function BuyMeCoffeeWidget() {
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 18,
        right: 18,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 8,
      }}
    >
      {showTooltip && (
        <div
          style={{
            background: "#fff",
            color: "#333",
            padding: "8px 14px",
            borderRadius: 8,
            boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            fontSize: 14,
            fontFamily: "sans-serif",
            whiteSpace: "nowrap",
            animation: "bmc-fade-in 0.3s ease",
          }}
        >
          Regálame un cafecito ☕
        </div>
      )}
      <a
        href="https://www.buymeacoffee.com/fgbravom"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Buy Me a Coffee"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "#40DCA5",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          cursor: "pointer",
          textDecoration: "none",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          flexShrink: 0,
        }}
        onFocus={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onBlur={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://cdn.buymeacoffee.com/widget/assets/coffee%20cup.svg"
          alt=""
          width={30}
          height={30}
        />
      </a>
      <style>{`
        @keyframes bmc-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
