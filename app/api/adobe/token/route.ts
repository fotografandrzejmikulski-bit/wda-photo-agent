import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  const clientId = process.env.ADOBE_CLIENT_ID;
  const clientSecret = process.env.ADOBE_CLIENT_SECRET;
  const scope = process.env.ADOBE_SCOPE || "openid,AdobeID,ee.express_api";

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Brak danych OAuth Adobe w środowisku serwera." }, { status: 500 });
  }

  const form = new URLSearchParams({ grant_type: "client_credentials", client_id: clientId, client_secret: clientSecret, scope });
  const response = await fetch("https://ims-na1.adobelogin.com/ims/token/v3", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form.toString(),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) return NextResponse.json({ error: "Autoryzacja Adobe nie powiodła się." }, { status: response.status });

  return NextResponse.json({ access_token: payload.access_token, expires_in: payload.expires_in });
}
