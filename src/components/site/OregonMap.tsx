/**
 * Oregon outline with Reedsport pinned on the central coast.
 * Path and pin position (58, 325 in a 740×545 viewBox) come straight from the
 * approved mockups — see design-reference/Home.dc.html and Visit.dc.html.
 */
export default function OregonMap({
  variant = "small",
  className = "",
}: {
  variant?: "small" | "large";
  className?: string;
}) {
  const large = variant === "large";

  return (
    <svg
      viewBox="0 0 740 545"
      role="img"
      aria-label="Map of Oregon with Reedsport marked on the central coast"
      className={className}
    >
      <path
        d="M35.1 537.5 L414.0 537.5 L681.3 537.5 L681.3 308.7 L690.3 275.0 L679.5 258.8 L664.2 250.0 L666.9 232.5 L684.0 193.7 L699.3 171.2 L717.3 130.0 L732.6 91.2 L724.5 68.7 L703.8 56.2 L691.2 37.5 L504.9 37.5 L481.5 46.2 L450.0 47.5 L414.0 71.3 L355.5 71.3 L306.0 85.0 L276.3 72.5 L243.0 80.0 L211.5 93.8 L165.6 81.2 L163.8 53.7 L144.0 25.0 L108.0 12.5 L58.5 8.8 L56.7 62.5 L58.5 125.0 L46.8 187.5 L43.2 250.0 L40.5 300.0 L27.0 362.5 L18.0 412.5 L4.5 437.5 L18.0 487.5 Z"
        fill="#1f3d2c"
        stroke="#f6f0e0"
        strokeWidth={large ? 5 : 12}
        strokeLinejoin="round"
      />
      <circle
        cx="58"
        cy="325"
        r={large ? 22 : 44}
        fill="#dca93e"
        stroke="#10231a"
        strokeWidth={large ? 6 : 10}
      />
      {large && (
        <>
          <text
            x="95"
            y="318"
            fill="#f6f0e0"
            fontFamily="Big Shoulders Display, Impact, sans-serif"
            fontWeight="900"
            fontSize="40"
          >
            REEDSPORT
          </text>
          <text x="95" y="352" fill="#b3bba7" fontFamily="Archivo, sans-serif" fontSize="22">
            Rainbow Plaza
          </text>
          <text
            x="330"
            y="300"
            fill="#b3bba7"
            fontFamily="Big Shoulders Display, Impact, sans-serif"
            fontWeight="700"
            fontSize="44"
            letterSpacing="6"
          >
            OREGON
          </text>
        </>
      )}
    </svg>
  );
}
