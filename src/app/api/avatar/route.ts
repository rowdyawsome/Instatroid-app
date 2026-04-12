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

    // Return the URL as JSON — let the frontend load it via wsrv.nl
    return NextResponse.json({ imageUrl });

  } catch (err) {
    console.log("API failed:", err instanceof Error ? err.message : String(err));
    return NextResponse.json({ imageUrl: null });
  }
}