import Link from "next/link";

export default function Page() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", color: "var(--cream)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, fontFamily: "var(--font-syne)", padding: "0 6%" }}>
      <div style={{ fontFamily: "var(--font-bebas)", fontSize: 14, letterSpacing: "4px", color: "var(--gold)", textTransform: "uppercase" }}>Cheese Wallet</div>
      <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 900, textAlign: "center" }}>
        Support <em style={{ color: "var(--gold)", fontStyle: "italic" }}>coming soon.</em>
      </h1>
      <p style={{ fontSize: 17, color: "rgba(245,238,216,0.55)", fontWeight: 300, maxWidth: 400, textAlign: "center", lineHeight: 1.75 }}>
        We are still building this page. In the meantime, go back to the home page and secure your early access.
      </p>
      <Link href="/" style={{ background: "var(--gold)", color: "var(--black)", padding: "15px 36px", fontSize: 13, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", textDecoration: "none" }}>
        Back to Home
      </Link>
    </div>
  );
}
