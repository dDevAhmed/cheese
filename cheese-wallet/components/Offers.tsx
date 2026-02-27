import SectionLabel from "./SectionLabel";
import { IconRocket, IconBanknotes, IconTrophy, IconBolt, IconSparkles } from "./Icons";

const offers = [
  {
    num: "01",
    Icon: IconRocket,
    badge: "Referral Power",
    title: "Refer Your Way to the Top",
    desc: "Know the right people? Bring them in. Refer 3 friends who each fund ₦5M+ and you skip the Gold waitlist entirely — landing straight on Black tier, instantly. No waiting. No begging. Just results.",
    pill: "Refer 3 @ ₦5M+ each → Instant Black Access",
    span2: false,
  },
  {
    num: "02",
    Icon: IconBanknotes,
    badge: "First Fund Bonus",
    title: "Big Moves Get Rewarded",
    desc: "New to Cheese? Fund ₦1M or more in your first 30 days and we put up to ₦10,000 cashback back in your pocket — or upgrade you to Gold free for a full month. No gimmicks. Just your money working for you from day one.",
    pill: "Fund ₦1M+ in 30 days → Up to ₦10,000 cashback or 1 month Gold free",
    span2: false,
  },
  {
    num: "03",
    Icon: IconTrophy,
    badge: "Milestone Reward",
    title: "Move ₦50M. Get Crowned.",
    desc: "Send ₦50M+ in any single month and unlock a limited-edition Black badge — a status marker that speaks for itself — plus ₦20,000 in yield boost credit. This isn't for everyone. That's the point.",
    pill: "₦50M+ sent in a month → Limited Black Badge + ₦20,000 yield boost",
    span2: false,
  },
  {
    num: "04",
    Icon: IconBolt,
    badge: "Launch Promo · First 5,000 Only",
    title: "Early Is Everything — And There Are Only 5,000 Spots",
    desc: "The first 5,000 people to sign up get an exclusive virtual Gold card design and 0.5% extra yield for 3 full months — stacked on top of the standard rate. When these spots go, they go. The early movers will always have something the rest are still chasing.",
    pill: "First 5,000 sign-ups → Exclusive Gold card design + 0.5% extra yield for 90 days",
    span2: true,
  },
  {
    num: "05",
    Icon: IconSparkles,
    badge: "Partner Cashback",
    title: "The Wallet That Pays You to Flex",
    desc: "Spend at our curated luxury merchant partners — car dealerships, premium restaurants, high-end stores — and earn 2–5% back in USDC. Treat yourself and let Cheese top it up. The high life should have a return on investment.",
    pill: "Luxury spends at partner merchants → 2–5% cashback paid in USDC",
    span2: false,
  },
];

const delays = ["reveal-d1", "reveal-d2", "reveal-d3", "reveal-d4", "reveal-d5"];

export default function Offers() {
  return (
    <section id="offers" style={{ padding: "120px 6%" }}>
      <SectionLabel>Current Offers</SectionLabel>
      <h2
        className="reveal reveal-d1"
        style={{ fontFamily: "var(--font-playfair)", fontSize: "clamp(36px, 4.2vw, 62px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}
      >
        The perks that make <em style={{ color: "var(--gold)", fontStyle: "italic" }}>people talk.</em>
      </h2>
      <p
        className="reveal reveal-d2"
        style={{ fontSize: 17, fontWeight: 300, lineHeight: 1.75, color: "var(--cream-dim)", maxWidth: 580, marginBottom: 64 }}
      >
        These aren&apos;t mass giveaways. They&apos;re precision rewards — designed so the right people get the best access fastest.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3 }} className="offers-responsive">
        {offers.map((o, i) => (
          <div
            key={o.num}
            className={`offer-card reveal ${delays[i]}`}
            style={o.span2 ? { gridColumn: "span 2" } : {}}
          >
            <div style={{ fontFamily: "var(--font-bebas)", fontSize: 88, color: "rgba(201,168,76,0.07)", lineHeight: 1, position: "absolute", top: 16, right: 20, letterSpacing: -3, pointerEvents: "none" }}>
              {o.num}
            </div>
            <div style={{ marginBottom: 20, color: "var(--gold)" }}>
              <o.Icon size={24} />
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.28)", color: "var(--gold)", fontSize: 9.5, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", padding: "5px 14px", marginBottom: 22 }}>
              {o.badge}
            </div>
            <div style={{ fontFamily: "var(--font-playfair)", fontSize: 22, fontWeight: 700, lineHeight: 1.25, marginBottom: 14 }}>{o.title}</div>
            <div style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(245,238,216,0.55)", fontWeight: 300 }}>{o.desc}</div>
            <div style={{ marginTop: 26, background: "rgba(201,168,76,0.07)", borderLeft: "3px solid var(--gold)", padding: "14px 18px", fontSize: 13, fontWeight: 600, color: "var(--gold-light)", lineHeight: 1.5 }}>
              {o.pill}
            </div>
          </div>
        ))}
      </div>
      <style>{`@media(max-width:960px){.offers-responsive{grid-template-columns:1fr!important}.offer-card{grid-column:span 1!important}}`}</style>
    </section>
  );
}
