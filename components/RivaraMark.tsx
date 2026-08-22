type RivaraMarkProps = {
  tone?: "pink" | "black";
  className?: string;
};

// Isotipo de RIVARA — reconstrucción aproximada en SVG a partir del isologo
// oficial (cuadrado redondeado, "R", círculo y barra) hasta tener el archivo
// vectorial real.
export default function RivaraMark({ tone = "pink", className = "h-9 w-9" }: RivaraMarkProps) {
  const bg = tone === "black" ? "#131313" : "#E8006F";
  const bar = tone === "black" ? "#E5E5E5" : "#FBD9E7";

  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="RIVARA">
      <rect width="120" height="120" rx="27" fill={bg} />
      <text
        x="18"
        y="88"
        fontFamily="Montserrat, sans-serif"
        fontWeight={800}
        fontSize="76"
        fill="#fff"
      >
        R
      </text>
      <circle cx="90" cy="33" r="12" fill="#fff" />
      <rect x="22" y="97" width="36" height="8" rx="4" fill={bar} />
    </svg>
  );
}
