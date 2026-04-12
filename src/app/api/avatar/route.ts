import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  console.log("=== AVATAR REQUEST FOR:", username, "===");

  try {
    // STEP 1: Get the Instagram profile pic URL from RapidAPI
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
    console.log("Image URL:", imageUrl ? "FOUND" : "NOT FOUND");

    if (!imageUrl) throw new Error("No image URL from API");

    // STEP 2: Use weserv.nl to proxy the image — this works on Vercel
    // weserv.nl fetches from Instagram's CDN on our behalf from their servers
    const weservUrl = `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}&w=200&h=200&fit=cover&output=jpg&q=85`;
    console.log("Fetching via weserv.nl...");

    const imgRes = await fetch(weservUrl, {
      signal: AbortSignal.timeout(10000),
    });

    console.log("Weserv status:", imgRes.status);
    console.log("Weserv Content-Type:", imgRes.headers.get("Content-Type"));

    if (!imgRes.ok) {
      const err = await imgRes.text();
      console.log("Weserv error:", err.slice(0, 200));
      throw new Error("Weserv failed: " + imgRes.status);
    }

    const buffer = await imgRes.arrayBuffer();
    console.log("Buffer size:", buffer.byteLength, "bytes");

    if (buffer.byteLength === 0) throw new Error("Empty buffer from weserv");

    console.log("SUCCESS ✓");
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400", // cache for 24hrs
      },
    });

  } catch (err) {
    console.log("FAILED:", err instanceof Error ? err.message : String(err));
  }

  // Fallback placeholder
  console.log("=== USING PLACEHOLDER ===");
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