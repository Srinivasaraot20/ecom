const icons = {
  mouse: (
    <>
      <rect x="15" y="8" width="18" height="32" rx="9" />
      <path d="M24 9v9" />
      <path d="M20 21h8" />
    </>
  ),
  keyboard: (
    <>
      <rect x="7" y="16" width="34" height="20" rx="4" />
      <path d="M12 22h2M18 22h2M24 22h2M30 22h2M36 22h2M12 28h2M18 28h2M24 28h2M30 28h2M36 28h2M16 32h16" />
    </>
  ),
  hub: (
    <>
      <rect x="8" y="18" width="32" height="17" rx="4" />
      <path d="M15 18v-5M21 18v-5M28 18v-5M33 18v-5" />
      <path d="M14 26h5M25 26h9" />
    </>
  ),
  speaker: (
    <>
      <rect x="12" y="7" width="24" height="34" rx="6" />
      <circle cx="24" cy="28" r="6" />
      <circle cx="24" cy="28" r="2" />
      <path d="M20 14h8" />
    </>
  ),
  stand: (
    <>
      <path d="M10 15h18a5 5 0 0 1 5 5v6H15a5 5 0 0 1-5-5v-6Z" />
      <path d="M15 36h24" />
      <path d="M30 26v10" />
      <path d="M18 20h10" />
    </>
  ),
};

export default function ProductIcon({ productId }) {
  return (
    <svg
      className="product-icon"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {icons[productId] ?? icons.hub}
    </svg>
  );
}
