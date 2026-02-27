import SectionLabel from "./SectionLabel";
import { IconPhone, IconBuildingBank, IconChartBar, IconQrCode } from "./Icons";

const steps = [
  {
    n: "01",
    Icon: IconPhone,
    title: "Download & Sign Up",
    body: "Create your Cheese account in under 2 minutes. BVN-verified, secure, and live immediately. No bank branch. No long forms. Just you and your phone.",
  },
  {
    n: "02",
    Icon: IconBuildingBank,
    title: "Fund Your Wallet",
    body: "Deposit Naira via bank transfer or card. Cheese converts it instantly to USDC at the live rate. Your dollars are in — and they're not going anywhere.",
  },
  {
    n: "03",
    Icon: IconChartBar,
    title: "Watch It Grow",
    body: "Your USDC earns yield automatically, every single week. Better than a savings account. Better than inflation. You don't have to do a thing.",
  },
  {
    n: "04",
    Icon: IconQrCode,
    title: "Spend or Send",
    body: "Pay merchants with a QR code scan, send dollars abroad to family, or withdraw to Naira whenever you need it. Fast, clean, no wahala.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" style={{ padding: "120px 6%" }}>
      <SectionLabel>How It Works</SectionLabel>
      <h2
        className="reveal reveal-d1"
        style={{ fontFamily: "var(--font-playfair)", fontSize: "clamp(36px, 4.2vw, 62px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}
      >
        Four steps to <em style={{ color: "var(--gold)", fontStyle: "italic" }}>dollar power.</em>
      </h2>
      <p
        className="reveal reveal-d2"
        style={{ fontSize: 17, fontWeight: 300, lineHeight: 1.75, color: "var(--cream-dim)", maxWidth: 580, marginBottom: 64 }}
      >
        No complicated forms. No trips to the bank. No waiting for forex allocation. Just a few taps and your money is in a stronger place.
      </p>

      <div className="steps-responsive" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 3 }}>
        {steps.map((s, i) => (
          <div key={s.n} className={`step-card reveal reveal-d${i + 1}`}>
            <div style={{ fontFamily: "var(--font-bebas)", fontSize: 90, color: "rgba(201,168,76,0.08)", lineHeight: 1, marginBottom: 18 }}>{s.n}</div>
            <div style={{ color: "var(--gold)", marginBottom: 14 }}>
              <s.Icon size={24} />
            </div>
            <div style={{ fontFamily: "var(--font-playfair)", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{s.title}</div>
            <div style={{ fontSize: 14, lineHeight: 1.75, color: "rgba(245,238,216,0.5)", fontWeight: 300 }}>{s.body}</div>
          </div>
        ))}
      </div>
      <style>{`@media(max-width:960px){.steps-responsive{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}
