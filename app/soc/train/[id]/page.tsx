// app/soc/train/[id]/page.tsx
"use client";
import Training from "@/components/training";
import { useParams } from "next/navigation";

const VALID_IDS = ["saqr", "oryx", "thalab", "hisan", "hamad"];

export default function TrainPage() {
  const params = useParams();
  const id = params?.id as string;

  if (!VALID_IDS.includes(id)) {
    return (
      <div style={{ minHeight:"100vh", background:"#1a0a0b", display:"flex", alignItems:"center", justifyContent:"center", color:"#f5ede0aa", fontFamily:"'DM Sans', sans-serif" }}>
        Character not found.
      </div>
    );
  }

  return <Training characterId={id} />;
}