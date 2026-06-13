// Server-side proxy for ElevenLabs TTS — keeps API key off the client
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, LIMITS } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`${ip}:tts`, LIMITS.tts.limit, LIMITS.tts.windowMs);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before requesting more audio." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetIn / 1000)) } }
    );
  }

  const { text, lang = "en" } = await req.json();
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "No text" }, { status: 400 });
  }

  const voiceId =
    lang === "ar"
      ? process.env.ELEVENLABS_VOICE_ID_HAMAD_AR ?? process.env.ELEVENLABS_VOICE_ID
      : process.env.ELEVENLABS_VOICE_ID;

  if (!voiceId || !process.env.ELEVENLABS_API_KEY) {
    return NextResponse.json({ error: "TTS not configured" }, { status: 503 });
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: text.slice(0, 4000),
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.55, similarity_boost: 0.78 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }

  const audioBuffer = await res.arrayBuffer();
  return new NextResponse(audioBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}
