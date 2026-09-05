"use client";

import { useMemo, useState } from "react";

const DEFAULT_PROMPT = "Przeanalizuj to zdjęcie jak fotograf, colorist, retuszer i VFX supervisor. Przygotuj bezpieczny, technicznie wykonalny plan postprodukcji z priorytetami i kolejnością operacji. Zachowaj tożsamość i anatomię osoby.";

type Plan = {
  diagnosis: string;
  artistic_direction: string;
  priorities: { rank: number; category: string; action: string; rationale: string }[];
  tonal_recipe: Record<string, number>;
  color_recipe: Record<string, string>;
  retouching: string[];
  generative_edits: { operation: string; prompt: string; mask_required: boolean; preserve_subject: boolean }[];
  export_recipe: Record<string, string>;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Nie udało się odczytać pliku."));
    reader.readAsDataURL(file);
  });
}

export default function Home() {
  const [image, setImage] = useState("");
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Gotowy.");
  const [fireflyPrompt, setFireflyPrompt] = useState("Realistyczna, wysokobudżetowa fotografia editorialowa; naturalne światło, spójna perspektywa i fotorealistyczne detale.");
  const [job, setJob] = useState<unknown>(null);

  const hasImage = useMemo(() => Boolean(image), [image]);

  async function selectFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setStatus("Wybierz plik graficzny.");
    if (file.size > 15 * 1024 * 1024) return setStatus("Maksymalny rozmiar zdjęcia: 15 MB.");
    setStatus("Wczytywanie zdjęcia…");
    try {
      setImage(await fileToDataUrl(file));
      setPlan(null);
      setJob(null);
      setStatus("Zdjęcie gotowe.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Błąd odczytu zdjęcia.");
    }
  }

  async function analyze() {
    if (!image) return setStatus("Najpierw wybierz zdjęcie.");
    setBusy(true);
    setStatus("WDA wykonuje analizę wielowarstwową…");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ instruction: prompt, image }),
      });
      const data = (await response.json()) as { plan?: Plan; error?: string };
      if (!response.ok || !data.plan) throw new Error(data.error || "Analiza nie powiodła się.");
      setPlan(data.plan);
      setStatus("Analiza zakończona. Plan ma strukturę produkcyjną.");
      localStorage.setItem("wda:last-plan", JSON.stringify(data.plan));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Błąd analizy.");
    } finally {
      setBusy(false);
    }
  }

  async function generateWithFirefly() {
    setBusy(true);
    setStatus("Uruchamiam Firefly…");
    try {
      const response = await fetch("/api/adobe/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: fireflyPrompt }),
      });
      const data = (await response.json()) as { job?: unknown; error?: string };
      if (!response.ok) throw new Error(data.error || "Firefly nie uruchomił zadania.");
      setJob(data.job ?? null);
      setStatus("Firefly przyjął zadanie asynchroniczne.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Błąd Firefly.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="shell">
      <div className="app">
        <header className="header">
          <div><div className="brand">WDA Photo Agent</div><div className="subtitle">AI Photo Direction • OpenAI + Adobe Firefly</div></div>
          <div className="badge">PRODUCTION CORE</div>
        </header>
        <section className="hero card"><div><div className="eyebrow">WDA / MASTER PHOTO PIPELINE</div><h1 className="title">Od zdjęcia do decyzji artystycznej.</h1><p className="muted">Agent buduje diagnozę, priorytety, receptę tonalną, kolor, retusz i instrukcje generatywne.</p></div></section>
        <section className="card"><div className="sectionHead"><span>01</span><h2>Źródło</h2></div>{hasImage ? <img className="preview" src={image} alt="Zdjęcie źródłowe" /> : <div className="dropzone">Dodaj zdjęcie lub uruchom aparat.</div>}<div className="actions"><label className="btn primary">Wybierz zdjęcie<input className="file" type="file" accept="image/*" onChange={(e) => selectFile(e.target.files?.[0])} /></label><label className="btn">Aparat<input className="file" type="file" accept="image/*" capture="environment" onChange={(e) => selectFile(e.target.files?.[0])} /></label></div></section>
        <section className="card"><div className="sectionHead"><span>02</span><h2>Intencja</h2></div><textarea className="textarea" value={prompt} onChange={(e) => setPrompt(e.target.value)} /><button className="btn primary full" onClick={analyze} disabled={!hasImage || busy}>{busy ? "WDA pracuje…" : "Uruchom analizę WDA"}</button><div className="status">{status}</div></section>
        {plan && <><section className="card"><div className="sectionHead"><span>03</span><h2>Diagnoza</h2></div><p>{plan.diagnosis}</p><div className="artDirection">{plan.artistic_direction}</div></section><section className="card"><div className="sectionHead"><span>04</span><h2>Priorytety operacyjne</h2></div><div className="grid">{plan.priorities.map((item) => <article className="mini" key={`${item.rank}-${item.category}`}><strong>#{item.rank} · {item.category}</strong><p>{item.action}</p><small>{item.rationale}</small></article>)}</div></section><section className="card"><div className="sectionHead"><span>05</span><h2>Recepta tonalna / kolor</h2></div><div className="grid"><pre className="codebox">{JSON.stringify(plan.tonal_recipe, null, 2)}</pre><pre className="codebox">{JSON.stringify(plan.color_recipe, null, 2)}</pre></div></section><section className="card"><div className="sectionHead"><span>06</span><h2>Retusz i generatywne operacje</h2></div>{plan.retouching.length > 0 && <div className="stack">{plan.retouching.map((r) => <div className="tag" key={r}>{r}</div>)}</div>}<div className="stack">{plan.generative_edits.map((g, i) => <div className="mini" key={`${g.operation}-${i}`}><strong>{g.operation}</strong><p>{g.prompt}</p><small>Maska: {g.mask_required ? "tak" : "nie"} · Ochrona obiektu głównego: {g.preserve_subject ? "tak" : "nie"}</small></div>)}</div></section></>}
        <section className="card"><div className="sectionHead"><span>07</span><h2>Adobe Firefly</h2></div><textarea className="textarea" value={fireflyPrompt} onChange={(e) => setFireflyPrompt(e.target.value)} /><button className="btn primary full" onClick={generateWithFirefly} disabled={busy}>{busy ? "Pracuję…" : "Uruchom Firefly Generate"}</button>{job && <pre className="codebox">{JSON.stringify(job, null, 2)}</pre>}</section>
      </div>
    </main>
  );
}
