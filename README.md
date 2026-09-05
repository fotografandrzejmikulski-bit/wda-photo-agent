# WDA Photo Agent

Mobilny, produkcyjny rdzeń Wirtualnego Dyrektora Artystycznego do fotografii i postprodukcji. Projekt łączy analizę obrazu przez OpenAI z warstwą Adobe Firefly, zachowując rozdział między diagnozą, receptą edycyjną i wykonaniem operacji.

## Pipeline

1. **SOURCE** — zdjęcie z galerii lub aparatu mobilnego.
2. **ANALYZE** — analiza obrazu przez OpenAI Responses API z wejściem obrazowym.
3. **ART DIRECT** — strukturalny plan: diagnoza, kierunek artystyczny, priorytety, tonalność, kolor, retusz, generatywne operacje i eksport.
4. **EXECUTE** — asynchroniczne zadania Adobe Firefly dla generacji oraz dalsze adaptery operacji.
5. **VERIFY** — status jobu i kontrola odpowiedzi; kolejne warstwy mogą zostać spięte z Photoshop API v2.

## Obecny zakres

- mobilny interfejs Next.js
- upload zdjęcia i capture z kamery
- analiza zdjęcia z `input_image`
- Structured Output JSON dla planu postprodukcji
- priorytety operacyjne i recepta tonalno-kolorystyczna
- instrukcje retuszu i generatywnych zmian
- Firefly `generate-async`
- sprawdzanie statusu zadania Firefly
- server-side Adobe OAuth Server-to-Server
- CI przez GitHub Actions
- konfiguracja deploymentu Vercel
- brak kluczy i sekretów w kodzie klienta

## Technologie

- Next.js / React / TypeScript
- OpenAI Responses API
- Adobe Firefly Services
- Adobe Photoshop API v2 jako kierunek dla operacji dokumentowych i produkcyjnych
- Vercel
- GitHub Actions

Adobe opisuje Photoshop API v2 jako obecną generację produkcyjną i wskazuje v1 jako ścieżkę legacy; dlatego nowe adaptery należy projektować pod v2. citeturn456162search0turn456162search1

Firefly Services udostępnia m.in. generowanie obrazów, Generative Fill oraz inne usługi creative automation; przykładowy endpoint generowania asynchronicznego jest obecnie dokumentowany jako `/v3/images/generate-async`. citeturn456162search6turn456162search10

## Zmienne środowiskowe

```text
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6-luna
ADOBE_CLIENT_ID=
ADOBE_CLIENT_SECRET=
ADOBE_SCOPE=openid,AdobeID,ee.express_api
```

Sekretów nie wolno umieszczać w repozytorium ani kodzie klienta.

## Lokalnie

```bash
npm ci
npm run dev
```

## Production build

```bash
npm run build
npm run start
```

## Deployment Vercel

Zaimportuj repozytorium `fotografandrzejmikulski-bit/wda-photo-agent` do Vercel. Vercel automatycznie rozpoznaje Next.js; następnie dodaj zmienne środowiskowe dla Production i wykonaj deployment. Przy połączeniu repozytorium z Vercel kolejne push'e mogą uruchamiać automatyczne deploymenty. citeturn277270search0turn277270search7

## Ważne

Ten projekt jest świadomie zbudowany warstwowo. Nie udaje, że każdy endpoint Adobe ma identyczny kontrakt. Przed włączeniem kolejnych operacji (Fill, maskowanie, Photoshop Actions, dokumenty PSD/Smart Objects, eksport) adapter musi zostać dopasowany do aktualnej wersji i uprawnień Adobe Developer Console. Adobe udostępnia osobne przewodniki dla Fill oraz Photoshop API v2. citeturn456162search5turn456162search7
