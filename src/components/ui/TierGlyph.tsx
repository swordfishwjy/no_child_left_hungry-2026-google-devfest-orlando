import {
  Leaf,
  ShoppingBasket,
  Store,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { TIER_META } from "@/lib/tiers";
import type { Tier } from "@/lib/types";

export const TIER_ICON: Record<Tier, LucideIcon> = {
  full_grocery: ShoppingBasket,
  produce: Leaf,
  limited: Store,
  prepared_meals: Utensils,
};

/** Color + shape + icon symbol for a retailer tier (never color alone). */
export function TierGlyph({ tier, size = 24 }: { tier: Tier; size?: number }) {
  const { color, shape } = TIER_META[tier];
  const Icon = TIER_ICON[tier];
  const iconSize = Math.round(size * (shape === "triangle" ? 0.4 : 0.52));

  return (
    <span
      className="relative inline-grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className="absolute inset-0 drop-shadow-sm"
      >
        {shape === "circle" && (
          <circle
            cx="12"
            cy="12"
            r="11"
            fill={color}
            stroke="#fff"
            strokeWidth="1.5"
          />
        )}
        {shape === "square" && (
          <rect
            x="1.5"
            y="1.5"
            width="21"
            height="21"
            rx="2"
            fill={color}
            stroke="#fff"
            strokeWidth="1.5"
          />
        )}
        {shape === "triangle" && (
          <path
            d="M12 1.5 L23 22 H1 Z"
            fill={color}
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        )}
        {shape === "diamond" && (
          <path
            d="M12 1 L23 12 L12 23 L1 12 Z"
            fill={color}
            stroke="#fff"
            strokeWidth="1.5"
          />
        )}
      </svg>
      <Icon
        className="relative text-white"
        style={{
          width: iconSize,
          height: iconSize,
          marginTop: shape === "triangle" ? size * 0.22 : 0,
        }}
        strokeWidth={2.5}
      />
    </span>
  );
}
