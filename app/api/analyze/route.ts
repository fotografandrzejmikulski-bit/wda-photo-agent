import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `Jesteś Wirtualnym Dyrektorem Artystycznym (WDA) klasy high-end.
Działasz jak połączenie fotografa, operatora światła, coloristy, retuszera, VFX supervisor i technical art directora.
Twoim zadaniem jest diagnozować fotografię i zamieniać intencję użytkownika w wykonalny plan postprodukcji.

ZASADY:
- Zachowuj tożsamość, anatomię, proporcje, ubranie i charakter osoby, chyba że użytkownik jednoznacznie zleca zmianę.
- Oddzielaj korekcję techniczną od kreacji.
- Myśl w kategoriach: ekspozycja, WB, tonalność, lokalny kontrast, kolor skóry, światło, geometria, optyka, GO, separacja planów, tło, elementy rozpraszające, retusz i finalny output.
- Proponuj kolejność operacji tak, aby każda kolejna operacja pracowała na poprawnym fundamencie.
- Każdą sugestię opieraj na tym, co rzeczywiście widać lub wynika z kontekstu. Nie wymyślaj nieistniejących wad.
- Preferuj minimalną ingerencję przy zachowaniu maksimum jakości.
- Odpowiedź MUSI być poprawnym JSON-em zgodnym ze schematem.
- Pisz po polsku.`;

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    diagnosis: { type: "string" },
    artistic_direction: { type: "string" },
    priorities: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          rank: { type: "integer" },
          category: { type: "string" },
          action: { type: "string" },
          rationale: { type: "string" }
        },
        required: ["rank", "category", "action", "rationale"]
      }
    },
    tonal_recipe: {
      type: "object",
      additionalProperties: false,
      properties: {
        exposure_ev: { type: "number" },
        highlights: { type: "number" },
        shadows: { type: "number" },
        whites: { type: "number" },
        blacks: { type: "number" },
        texture: { type: "number" },
        clarity: { type: "number" },
        dehaze: { type: "number" }
      },
      required: ["exposure_ev", "highlights", "shadows", "whites", "blacks", "texture", "clarity", "dehaze"]
    },
    color_recipe: {
      type: "object",
      additionalProperties: false,
      properties: {
        white_balance: { type: "string" },
        palette: { type: "string" },
        skin_priority: { type: "string" },
        shadow_bias: { type: "string" },
        highlight_bias: { type: "string" }
      },
      required: ["white_balance", "palette", "skin_priority", "shadow_bias", "highlight_bias"]
    },
    retouching: {
      type: "array",
      items: { type: "string" }
    },
    generative_edits: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          operation: { type: "string" },
          prompt: { type: "string" },
          mask_required: { type: "boolean" },
          preserve_subject: { type: "boolean" }
        },
        required: ["operation", "prompt", "mask_required", "preserve_subject"]
      }
    },
    export_recipe: {
      type: "object",
      additionalProperties: false,
      properties: {
        master: { type: "string" },
        web: { type: "string" },
        print: { type: "string" }
      },
      required: ["master", "web", "print"]
    }
  },
  required: ["diagnosis", "artistic_direction", "priorities", "tonal_recipe", "color_recipe", "retouching", "generative_edits", "export_recipe"]
} as const;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { instruction?: string; image?: string };
    const instruction = body.instruction?.trim();
    const image = body.image?.trim();

    if (!instruction) return NextResponse.json({ error: "Brak instrukcji." }, { status: 400 });
    if (!image || !/^data:image\/(png|jpeg|jpg|webp);base64,/.test(image)) {
      return NextResponse.json({ error: "Brak prawidłowego obrazu." }, { status: 400 });
    }
    if (image.length > 22_000_000) {
      return NextResponse.json({ error: "Obraz przekracza limit żądania." }, { status: 413 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Brak OPENAI_API_KEY." }, { status: 500 });

    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
      input: [
        { role: "system", content: [{ type: "input_text", text: SYSTEM_PROMPT }] },
        {
          role: "user",
          content: [
            { type: "input_text", text: instruction },
            { type: "input_image", image_url: image, detail: "high" }
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "wda_photo_plan",
          strict: true,
          schema
        }
      }
    });

    let plan: unknown;
    try {
      plan = JSON.parse(response.output_text);
    } catch {
      return NextResponse.json({ error: "Model zwrócił niepoprawny JSON." }, { status: 502 });
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("WDA analyze error", error);
    return NextResponse.json({ error: "Nie udało się wykonać analizy." }, { status: 500 });
  }
}
