import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  try {
    const apiRes = await fetch(
      `https://instagram-scraper-stable-api.p.rapidapi.com/ig_get_fb_profile_v3.php`,
      {
        method: "POST",
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
          "x-rapidapi-host": "instagram-scraper-stable-api.p.rapidapi.com",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ username_or_url: username }),
        signal: AbortSignal.timeout(15000),
      }
    );

    const data = await apiRes.json();
    const imageUrl = data?.hd_profile_pic_url_info?.url || data?.profile_pic_url;

    if (!imageUrl) throw new Error("No image URL");

    const imgRes = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
        "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
        "Referer": "https://www.instagram.com/",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!imgRes.ok) throw new Error("Image fetch failed");

    const buffer = await imgRes.arrayBuffer();
    if (buffer.byteLength === 0) throw new Error("Empty buffer");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": imgRes.headers.get("Content-Type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });

  } catch (err) {
    console.log("FAILED:", err instanceof Error ? err.message : String(err));
  }

  // Fallback placeholder
  const colors = ["dc2743", "bc1888", "e6683c", "f09433", "cc2366", "8a3ab9"];
  const colorIndex =
    username.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

  const placeholder = await fetch(
    `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=${colors[colorIndex]}&color=fff&size=200&bold=true&format=png&length=1`
  );
  const buffer = await placeholder.arrayBuffer();
  return new NextResponse(buffer, {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" },
  });
}