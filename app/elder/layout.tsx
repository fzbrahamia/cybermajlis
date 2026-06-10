import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CyberMajlis — Stay Safe Online",
  description: "Simple, clear cybersecurity guidance for everyone.",
};

export default function ElderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      // Larger base text throughout
      fontSize: "18px",
      lineHeight: 1.75,
      fontFamily: "'Crimson Pro', Georgia, 'Times New Roman', serif",
    }}>
      {children}
    </div>
  );
}
