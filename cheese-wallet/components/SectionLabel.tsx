export default function SectionLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`label-line reveal ${className}`}
      style={{ fontSize: 10.5, letterSpacing: "3.5px", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600, display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}
    >
      {children}
    </div>
  );
}
