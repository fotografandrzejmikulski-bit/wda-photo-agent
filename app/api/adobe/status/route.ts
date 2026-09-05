import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function getToken() {
  const clientId = process.env.ADOBE_CLIENT_ID;
  const clientSecret = process.env.ADOBE_CLIENT_SECRET;
  const scope = process.env.ADOBE_SCOPE || "openid,AdobeID,ee.express_api";
  if (!clientId || !clientSecret) throw new Error("Brak poświadczeń Adobe.");
  const body = new URLSearchParams({ grant_type: "client_credentials", client_id: clientId, client_secret: clientSecret, scope });
  const response = await fetch("https://ims-na1.adobelogin.com/ims/token/v3", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body, cache: "no-store" });
  const data = (await response.json()) as { access_token?: string };
  if (!response.ok || !data.access_token) throw new Error("Adobe OAuth failed.");
  return data.access_token;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const jobId = url.searchParams.get("jobId");
    if (!jobId) return NextResponse.json({ error: "Brak jobId." }, { status: 400 });
    const token = await getToken();
    const response = await fetch(`https://firefly-api.adobe.io/v3/status/${encodeURIComponent(jobId)}`, {
      headers: { Accept: "application/json", "x-api-key": process.env.ADOBE_CLIENT_ID || "", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("WDA Firefly status error", error);
    return NextResponse.json({ error: "Nie udało się sprawdzić statusu Firefly." }, { status: 500 });
  }
}
