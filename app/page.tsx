"use client";

import { useMemo, useState } from "react";

const DEFAULT_PROMPT =
  "Jesteś Wirtualnym Dyrektorem Artystycznym (WDA) i ekspertem fotografii, optyki, światła, koloru oraz profesjonalnej postprodukcji. Przeanalizuj zdjęcie i zaproponuj technicznie precyzyjny plan edycji. Nie zmieniaj tożsamości, anatomii ani charakteru osoby bez wyraźnego polecenia.";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Nie udało się odczytać pliku."));
    reader.readAsDataURL(file);
  });
}

export default function Home() {
  const [image, setImage] = useState<string>("");
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const hasImage = useMemo(() => Boolean(image), [image]);

  async function selectFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("Wybierz plik graficzny.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setStatus("Plik jest za duży. Maksymalny rozmiar: 15 MB.");
      return;
    }
    setStatus("Wczytywanie zdjęcia…");
    try {
      setImage(await fileToDataUrl(file));
      setAnswer("");
      setStatus("Zdjęcie gotowe do analizy.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Błąd odczytu zdjęcia.");
    }
  }

  async function analyze() {
    if (!image) {
      setStatus("Najpierw wybierz lub wykonaj zdjęcie.");
      return;
    }
    setBusy(true);
    setStatus("WDA analizuje fotografię…");
    setAnswer("");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt, image }),
      });
      const data = (await response.json()) as { answer?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "Nie udało się wykonać analizy.");
      setAnswer(data.answer || "Brak odpowiedzi.");
      setStatus("Analiza zakończona.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Wystąpił nieznany błąd.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="shell">
      <div className="app">
        <header className="header">
          <div className="brand">WDA Photo Agent</div>
          <div className="badge">Mobile • AI Art Direction</div>
        </header>

        <section className="card">
          <h1 className="title">Analiza i plan postprodukcji</h1>
          <p className="muted">
            Wgraj zdjęcie albo wykonaj je aparatem. Agent przygotuje diagnozę obrazu i precyzyjne zalecenia edycyjne.
          </p>

          {hasImage && <img className="preview" src={image} alt="Zdjęcie referencyjne" />}

          <div className="actions">
            <label className="btn primary">
              Wybierz zdjęcie
              <input className="file" type="file" accept="image/*" onChange={(e) => selectFile(e.target.files?.[0])} />
            </label>
            <label className="btn">
              Aparat
              <input className="file" type="file" accept="image/*" capture="environment" onChange={(e) => selectFile(e.target.files?.[0])} />
            </label>
          </div>
          <div className="status">{status}</div>
        </section>

        <section className="card">
          <label className="label" htmlFor="prompt">Instrukcja dla WDA</label>
          <textarea id="prompt" className="textarea" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          <button className="btn primary" style={{ marginTop: 10 }} onClick={analyze} disabled={busy || !image}>
            {busy ? "Analizuję…" : "Analizuj zdjęcie"}
          </button>
        </section>

        {answer && (
          <section className="card">
            <div className="label">Wynik WDA</div>
            <div className="result">{answer}</div>
          </section>
        )}
      </div>
    </main>
  );
}
