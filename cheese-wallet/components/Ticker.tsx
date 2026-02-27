const items = [
  "Hold Dollars. Earn Yield.",
  "First 5,000 Sign-Ups Get Gold Benefits Free",
  "Your Naira Is Losing Ground. Your Cheese Isn't.",
  "Refer 3 Friends, Skip the Waitlist",
  "QR Payments. Instant Settlements. Zero Wahala.",
  "Fund ₦1M+ in 30 Days → Get Cashback",
];

export default function Ticker() {
  const doubled = [...items, ...items];

  return (
    <div
      style={{
        background: "var(--gold)",
        overflow: "hidden",
        whiteSpace: "nowrap",
        padding: "13px 0",
        borderTop: "1px solid rgba(0,0,0,0.15)",
        borderBottom: "1px solid rgba(0,0,0,0.15)",
      }}
      aria-hidden="true"
    >
      <div className="ticker-anim" style={{ display: "inline-flex", gap: 56 }}>
        {doubled.map((item, i) => (
          <span
            key={i}
            style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--black)", display: "inline-flex", alignItems: "center", gap: 14 }}
          >
            <span style={{ width: 4, height: 4, background: "rgba(0,0,0,0.3)", borderRadius: "50%", flexShrink: 0, display: "inline-block" }} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
