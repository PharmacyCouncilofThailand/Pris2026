import type { SVGProps } from "react";
type Name =
  | "cart"
  | "globe"
  | "menu"
  | "search"
  | "grid"
  | "gift"
  | "tag"
  | "truck"
  | "left"
  | "right"
  | "lock";
const paths: Record<Name, string> = {
  cart: "M3 3h2l3 12h10l3-8H6M9 20h.01M18 20h.01",
  globe:
    "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z",
  menu: "M4 6h16M4 12h16M4 18h16",
  search: "M20 20l-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z",
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  gift: "M3 8h18v4H3zM5 12v9h14v-9M12 8v13M12 8H8a3 3 0 1 1 3-3l1 3ZM12 8h4a3 3 0 1 0-3-3l-1 3Z",
  tag: "M3 3h8l10 10-8 8L3 11V3ZM7 7h.01",
  truck:
    "M3 5h11v12H3zM14 9h4l3 4v4h-7M8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM20 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
  left: "m15 5-7 7 7 7",
  right: "m9 5 7 7-7 7",
  lock: "M6 10h12v11H6zM8 10V6a4 4 0 0 1 8 0v4M12 14v3",
};
export function Icon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: Name }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
