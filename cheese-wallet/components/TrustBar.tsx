import {
  IconLockClosed,
  IconShieldCheck,
  IconBuildingOffice,
  IconFingerprint,
  IconArrowPath,
} from "./Icons";

const items = [
  { Icon: IconLockClosed, label: "Bank-grade 256-bit encryption" },
  { Icon: IconShieldCheck, label: "Non-custodial USDC — always your asset" },
  { Icon: IconBuildingOffice, label: "CBN-compliant digital wallet" },
  { Icon: IconFingerprint, label: "BVN-verified every account" },
  { Icon: IconArrowPath, label: "Instant settlement, 24/7" },
];

export default function TrustBar() {
  return (
    <div
      id="trust"
      style={{
        background: "var(--charcoal-3)",
        borderTop: "1px solid rgba(201,168,76,0.1)",
        borderBottom: "1px solid rgba(201,168,76,0.1)",
        padding: "44px 6%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        flexWrap: "wrap",
        gap: 28,
      }}
    >
      {items.map((item, i) => (
        <div
          key={item.label}
          className={`reveal reveal-d${i + 1}`}
          style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, fontWeight: 500, color: "rgba(245,238,216,0.5)" }}
        >
          <item.Icon size={24} color="var(--gold)" />
          {item.label}
        </div>
      ))}
    </div>
  );
}
