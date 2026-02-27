import SectionLabel from "./SectionLabel";

const testimonials = [
  {
    text: "I moved ₦2M into Cheese in January. By March I had already made back ₦40,000 in yield alone — while my Naira savings account gave me almost nothing. This thing is not normal.",
    name: "Adebisi K.",
    role: "Tech Entrepreneur · Lagos",
    initial: "A",
    tier: "Gold",
  },
  {
    text: "My friend referred me, I funded fast, and somehow I ended up on Black tier within the month. The card design is different. People ask me about it at dinner. The wallet genuinely pays you to flex — that pitch is completely accurate.",
    name: "Fatimah O.",
    role: "Finance Manager · Abuja",
    initial: "F",
    tier: "Black",
  },
  {
    text: "I was sceptical — another fintech promise. But Cheese actually converted my Naira to USDC in seconds and the QR payment at a restaurant in VI was seamless. Simple, clean, and my money is in dollars. What else do you need?",
    name: "Chukwuemeka N.",
    role: "Software Engineer · Port Harcourt",
    initial: "C",
    tier: "Silver",
  },
];

export default function Testimonials() {
  return (
    <div style={{ background: "linear-gradient(160deg, var(--charcoal-2) 0%, var(--black) 100%)", padding: "120px 6%" }}>
      <SectionLabel>From the Community</SectionLabel>
      <h2
        className="reveal reveal-d1"
        style={{ fontFamily: "var(--font-playfair)", fontSize: "clamp(36px, 4.2vw, 62px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}
      >
        They moved. They&apos;re <em style={{ color: "var(--gold)", fontStyle: "italic" }}>not looking back.</em>
      </h2>
      <p
        className="reveal reveal-d2"
        style={{ fontSize: 17, fontWeight: 300, lineHeight: 1.75, color: "var(--cream-dim)", maxWidth: 580, marginBottom: 64 }}
      >
        These aren&apos;t paid endorsements. These are real Cheese users who stopped watching their savings erode — and started earning instead.
      </p>

      <div
        className="test-responsive"
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}
      >
        {testimonials.map((t, i) => (
          <div key={t.name} className={`test-card reveal reveal-d${i + 1}`}>
            <span style={{ fontFamily: "var(--font-playfair)", fontSize: 72, color: "rgba(201,168,76,0.14)", lineHeight: 0.6, display: "block", marginBottom: 22 }}>&ldquo;</span>
            <p style={{ fontSize: 16, lineHeight: 1.8, fontWeight: 300, color: "rgba(245,238,216,0.78)", fontStyle: "italic", marginBottom: 28 }}>
              {t.text}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, var(--gold), #5A3E10)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-playfair)", fontSize: 16, fontWeight: 700, color: "var(--black)", flexShrink: 0 }}>
                {t.initial}
              </div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: "rgba(245,238,216,0.35)", letterSpacing: "0.8px", marginTop: 2 }}>{t.role}</div>
              </div>
              <div style={{ marginLeft: "auto", fontSize: 9.5, letterSpacing: "2px", textTransform: "uppercase", color: "var(--gold)", fontWeight: 700, border: "1px solid rgba(201,168,76,0.28)", padding: "3px 10px", flexShrink: 0 }}>
                {t.tier}
              </div>
            </div>
          </div>
        ))}
      </div>
      <style>{`@media(max-width:960px){.test-responsive{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
