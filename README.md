# WDA Photo Agent

Mobilny agent postprodukcji fotografii działający jako Wirtualny Dyrektor Artystyczny.

## Aktualny zakres

- mobilny interfejs Next.js
- wybór zdjęcia z urządzenia
- przechwytywanie zdjęcia aparatem w przeglądarce mobilnej
- analiza fotografii przez OpenAI Responses API
- model konfigurowany przez `OPENAI_MODEL` (domyślnie `gpt-5.6-luna`)
- server-side OAuth Server-to-Server dla Adobe
- endpoint zdrowia `/api/health`
- brak sekretów w kodzie klienta

## Uruchomienie

```bash
npm install
npm run dev
```

Aplikacja będzie dostępna pod `http://localhost:3000`.

## Zmienne środowiskowe

Skopiuj `.env.example` do `.env.local` i ustaw wartości po stronie serwera:

```text
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6-luna
ADOBE_CLIENT_ID=
ADOBE_CLIENT_SECRET=
ADOBE_SCOPE=openid,AdobeID,ee.express_api
```

Nigdy nie umieszczaj kluczy ani sekretów w repozytorium.

## Architektura integracji Adobe

Endpoint `/api/adobe/token` wykonuje OAuth Server-to-Server i nie ujawnia `ADOBE_CLIENT_SECRET` przeglądarce. Warstwa Adobe Firefly/Photoshop może być następnie podłączona do osobnych adapterów operacji generowania, wypełniania, rozszerzania i edycji.

## Deployment

Projekt jest przygotowany pod Vercel jako aplikacja Next.js. Po imporcie repozytorium do Vercel skonfiguruj powyższe zmienne środowiskowe dla środowiska produkcyjnego i wykonaj deployment.
