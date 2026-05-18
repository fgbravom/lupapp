"use client";

export default function DonateButton() {
  return (
    <a
      href="https://www.buymeacoffee.com/fgbravom"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        height={36}
        style={{ border: 0, height: 36 }}
        src="https://img.buymeacoffee.com/button-api/?text=Regálame un cafecito&emoji=☕&slug=fgbravom&button_colour=40DCA5&font_colour=ffffff&font_family=Lato&outline_colour=000000&coffee_colour=FFDD00"
        alt="Regálame un cafecito"
      />
    </a>
  );
}
