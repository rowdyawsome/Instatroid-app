import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://unavatar.io/instagram/${username}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok && res.headers.get("Content-Type")?.startsWith("image")) {
      const buffer = await res.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": res.headers.get("Content-Type") ?? "image/jpeg",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }
  } catch {
    // fall through to placeholder
  }

  // Fallback — generate a placeholder avatar from the username initial
  try {
    const placeholder = await fetch(
      `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=dc2743&color=fff&size=200&bold=true&format=png`,
      { signal: AbortSignal.timeout(5000) }
    );
    const buffer = await placeholder.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not fetch avatar" }, { status: 404 });
  }
}