import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  console.log("=== AVATAR REQUEST FOR:", username, "===");

  // STEP 1: Call RapidAPI
  console.log("STEP 1: Calling RapidAPI...");
  let apiStatus, apiData, apiRaw;
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
    apiStatus = apiRes.status;
    apiRaw = await apiRes.text();
    console.log("STEP 1 — API status:", apiStatus);
    console.log("STEP 1 — API raw response:", apiRaw.slice(0, 500));
    apiData = JSON.parse(apiRaw);
  } catch (err) {
    console.log("STEP 1 — FAILED:", err instanceof Error ? err.message : String(err));
    console.log("STEP 1 — Raw was:", apiRaw);
  }

  // STEP 2: Extract image URL
  const imageUrl = apiData?.hd_profile_pic_url_info?.url || apiData?.profile_pic_url;
  console.log("STEP 2 — Image URL extracted:", imageUrl ? imageUrl.slice(0, 100) : "NOT FOUND");

  if (!imageUrl) {
    console.log("STEP 2 — GIVING UP: No image URL, full API data keys:", apiData ? Object.keys(apiData) : "no data");
    // skip to placeholder
  } else {
    // STEP 3: Fetch the actual image
    console.log("STEP 3: Fetching image from Instagram CDN...");
    try {
      const imgRes = await fetch(imageUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
          "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
          "Referer": "https://www.instagram.com/",
          "Origin": "https://www.instagram.com",
        },
        signal: AbortSignal.timeout(8000),
      });

      console.log("STEP 3 — Image fetch status:", imgRes.status);
      console.log("STEP 3 — Image Content-Type:", imgRes.headers.get("Content-Type"));
      console.log("STEP 3 — Image Content-Length:", imgRes.headers.get("Content-Length"));

      if (!imgRes.ok) {
        const errText = await imgRes.text();
        console.log("STEP 3 — FAILED. Response body:", errText.slice(0, 300));
      } else {
        const buffer = await imgRes.arrayBuffer();
        console.log("STEP 3 — Buffer size:", buffer.byteLength, "bytes");

        if (buffer.byteLength === 0) {
          console.log("STEP 3 — EMPTY BUFFER! Image returned 0 bytes.");
        } else {
          console.log("STEP 3 — SUCCESS ✓ Returning image");
          return new NextResponse(buffer, {
            headers: {
              "Content-Type": imgRes.headers.get("Content-Type") ?? "image/jpeg",
              "Cache-Control": "public, max-age=3600",
            },
          });
        }
      }
    } catch (err) {
      console.log("STEP 3 — EXCEPTION:", err instanceof Error ? err.message : String(err));
    }
  }

  // Fallback placeholder
  console.log("=== FALLING BACK TO PLACEHOLDER ===");
  const colors = ["dc2743", "bc1888", "e6683c", "f09433", "cc2366", "8a3ab9"];
  const colorIndex =
    username.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

  const placeholder = await fetch(
    `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=${colors[colorIndex]}&color=fff&size=200&bold=true&format=png&length=1`
  );
  const buffer = await placeholder.arrayBuffer();
  console.log("=== PLACEHOLDER RETURNED ===");
  return new NextResponse(buffer, {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" },
  });
}