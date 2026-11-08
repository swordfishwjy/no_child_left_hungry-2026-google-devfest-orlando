const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreRing({ score, max = 7 }: { score: number; max?: number }) {
  const filled = (score / max) * CIRCUMFERENCE;
  return (
    <svg
      viewBox="0 0 64 64"
      className="size-16 shrink-0 -rotate-90"
      role="img"
      aria-label={`${score} of ${max} need flags`}
    >
      <circle
        cx="32"
        cy="32"
        r={RADIUS}
        fill="none"
        stroke="var(--color-line)"
        strokeWidth="6"
      />
      <circle
        cx="32"
        cy="32"
        r={RADIUS}
        fill="none"
        stroke="var(--color-flag-on)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
      />
      <text
        x="32"
        y="32"
        transform="rotate(90 32 32)"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-ink text-[15px] font-bold"
      >
        {score}
        <tspan className="fill-muted text-[10px] font-medium">/{max}</tspan>
      </text>
    </svg>
  );
}
