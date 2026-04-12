import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  console.log("=== AVATAR REQUEST FOR:", username, "===");

  try {
    // STEP 1: Get profile data from RapidAPI
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
    console.log("API status:", apiRes.status);

    const imageUrl = data?.hd_profile_pic_url_info?.url || data?.profile_pic_url;
    console.log("Image URL:", imageUrl ? "FOUND" : "NOT FOUND");

    if (!imageUrl) throw new Error("No image URL");

    // STEP 2: Fetch the image — try multiple approaches for Vercel
    let imgBuffer: ArrayBuffer | null = null;
    let contentType = "image/jpeg";

    // Attempt 1: Direct fetch with Instagram headers
    try {
      const imgRes = await fetch(imageUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
          "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
          "Referer": "https://www.instagram.com/",
        },
        signal: AbortSignal.timeout(8000),
      });

      console.log("Direct fetch status:", imgRes.status);

      if (imgRes.ok) {
        imgBuffer = await imgRes.arrayBuffer();
        contentType = imgRes.headers.get("Content-Type") ?? "image/jpeg";
        console.log("Direct fetch buffer size:", imgBuffer.byteLength);
      }
    } catch (e) {
      console.log("Direct fetch failed:", e instanceof Error ? e.message : String(e));
    }

    // Attempt 2: Use images.weserv.nl as a proxy (works on Vercel)
    if (!imgBuffer || imgBuffer.byteLength === 0) {
      console.log("Trying weserv.nl proxy...");
      try {
        const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}&w=200&h=200&fit=cover&output=jpg`;
        const proxyRes = await fetch(proxyUrl, {
          signal: AbortSignal.timeout(8000),
        });

        console.log("Weserv proxy status:", proxyRes.status);

        if (proxyRes.ok) {
          imgBuffer = await proxyRes.arrayBuffer();
          contentType = "image/jpeg";
          console.log("Weserv buffer size:", imgBuffer.byteLength);
        }
      } catch (e) {
        console.log("Weserv proxy failed:", e instanceof Error ? e.message : String(e));
      }
    }

    if (imgBuffer && imgBuffer.byteLength > 0) {
      console.log("SUCCESS ✓ Returning image");
      return new NextResponse(imgBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    throw new Error("All image fetch attempts failed");

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