import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function getToken() {
  const clientId = process.env.ADOBE_CLIENT_ID;
  const clientSecret = process.env.ADOBE_CLIENT_SECRET;
  const scope = process.env.ADOBE_SCOPE || "openid,AdobeID,ee.express_api";
  if (!clientId || !clientSecret) throw new Error("Brak poświadczeń Adobe.");
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope,
  });
  const response = await fetch("https://ims-na1.adobelogin.com/ims/token/v3", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  const data = (await response.json()) as { access_token?: string; error_description?: string };
  if (!response.ok || !data.access_token) throw new Error(data.error_description || "Adobe OAuth failed.");
  return data.access_token;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { prompt?: string; negative_prompt?: string };
    const prompt = body.prompt?.trim();
    if (!prompt) return NextResponse.json({ error: "Brak promptu Firefly." }, { status: 400 });

    const token = await getToken();
    const payload: Record<string, unknown> = { prompt };
    if (body.negative_prompt?.trim()) payload.negativePrompt = body.negative_prompt.trim();

    const response = await fetch("https://firefly-api.adobe.io/v3/images/generate-async", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": process.env.ADOBE_CLIENT_ID || "",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Adobe Firefly generate error", data);
      return NextResponse.json({ error: "Firefly odrzucił żądanie.", details: data }, { status: response.status });
    }
    return NextResponse.json({ job: data });
  } catch (error) {
    console.error("WDA Firefly generate error", error);
    return NextResponse.json({ error: "Nie udało się uruchomić Firefly." }, { status: 500 });
  }
}
