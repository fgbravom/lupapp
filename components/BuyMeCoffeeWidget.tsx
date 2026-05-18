"use client";

import { useEffect } from "react";

export default function BuyMeCoffeeWidget() {
  useEffect(() => {
    const script = document.createElement("script");
    script.setAttribute("data-name", "BMC-Widget");
    script.setAttribute("data-cfasync", "false");
    script.setAttribute("data-id", "fgbravom");
    script.setAttribute("data-description", "Support me on Buy me a coffee!");
    script.setAttribute("data-message", "Regálame un cafecito");
    script.setAttribute("data-color", "#40DCA5");
    script.setAttribute("data-position", "Right");
    script.setAttribute("data-x_margin", "18");
    script.setAttribute("data-y_margin", "18");
    script.src = "https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js";
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
      document.getElementById("bmc-wbtn")?.remove();
    };
  }, []);

  return null;
}
