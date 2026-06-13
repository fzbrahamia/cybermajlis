// app/api/tts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, LIMITS } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/sanitize";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`${ip}:tts`, LIMITS.tts.limit, LIMITS.tts.windowMs);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before requesting more audio." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetIn / 1000)) } }
    );
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;

    if (!apiKey || !voiceId) {
      return NextResponse.json(
        { error: "Missing ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID" },
        { status: 500 }
      );
    }

    const elevenRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.85,
            style: 0.25,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!elevenRes.ok) {
      const details = await elevenRes.text();
      return NextResponse.json(
        { error: "ElevenLabs TTS failed", details },
        { status: elevenRes.status }
      );
    }

    const audioBuffer = await elevenRes.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "TTS server error" }, { status: 500 });
  }
}
