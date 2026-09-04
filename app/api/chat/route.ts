import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `Jesteś Wirtualnym Dyrektorem Artystycznym (WDA), profesjonalnym agentem fotografii i postprodukcji.
Analizuj zdjęcia jak doświadczony fotograf, colorist, retuszer i supervisor VFX.
Oceniaj: ekspozycję, zakres tonalny, balans bieli, kolor, kontrast lokalny, światło, geometrię, optykę, głębię ostrości, skórę, tło i elementy rozpraszające.
Przygotowuj konkretne, wykonalne zalecenia edycyjne. Zachowuj tożsamość osoby, anatomię, ubranie i pozę, chyba że użytkownik wyraźnie zleci zmianę.
Odpowiadaj po polsku, precyzyjnie i bez marketingowego lania wody.`;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { prompt?: string; image?: string };
    const prompt = body.prompt?.trim();
    const image = body.image?.trim();

    if (!prompt) return NextResponse.json({ error: "Brak instrukcji." }, { status: 400 });
    if (image && !/^data:image\/(png|jpeg|jpg|webp);base64,/.test(image)) {
      return NextResponse.json({ error: "Nieprawidłowy format obrazu." }, { status: 400 });
    }
    if (image && image.length > 22_000_000) {
      return NextResponse.json({ error: "Obraz przekracza limit żądania." }, { status: 413 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Brak OPENAI_API_KEY w środowisku serwera." }, { status: 500 });

    const client = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL || "gpt-5.6-luna";

    const userContent: Array<Record<string, unknown>> = [{ type: "input_text", text: prompt }];
    if (image) userContent.push({ type: "input_image", image_url: image, detail: "high" });

    const response = await client.responses.create({
      model,
      input: [
        { role: "system", content: [{ type: "input_text", text: SYSTEM_PROMPT }] },
        { role: "user", content: userContent as never },
      ],
    });

    return NextResponse.json({ answer: response.output_text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nieznany błąd serwera.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
