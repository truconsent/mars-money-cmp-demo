# mars.money — truConsent CMP Demo

A demo banking web app that showcases the truConsent **Consent Management Platform (CMP)** — including the consent banner (`<ConsentModal />`) and the Data Principal Rights Center (`<RightCenter />`).

Built with **React + TypeScript + Vite + Tailwind CSS + shadcn/ui**.

---

## What this demo shows

- **Consent banner** — shown on page load via `<ConsentModal />` for the configured asset/collection point
- **Rights Center** — accessible at `/rights-center`, lets a logged-in user manage their consents, submit data rights requests, file grievances, and manage nominees
- **Legitimate Interest** purposes — displayed with a green "Legitimate Interest" badge and a `Shown: Yes/No` status (no toggle)
- **Necessary** purposes — red "Necessary" badge and `Consented: Yes/No` status (no toggle)
- **Optional** purposes — toggle to grant or withdraw consent, `Consented: Yes/No` status

---

## Setup

```bash
npm install
cp .env.example .env   # fill in your truConsent credentials
npm run dev
```

App runs at `http://localhost:8081`.

---

## Environment variables

Create a `.env` file in the project root:

```env
VITE_TRU_CONSENT_API_KEY=your_api_key
VITE_TRU_CONSENT_ORGANIZATION_ID=your_org_id
VITE_TRU_CONSENT_API_URL=https://trukit-dev.truconsent.io
VITE_TRU_CONSENT_ASSET_ID=your_asset_uuid
VITE_TRU_CONSENT_API_KEY_RIGHT=your_rights_center_api_key   # separate key scoped for Rights Center
```

Get these values from the truConsent platform dashboard under **API Keys** and **Assets**.

---

## Pages

| Route | Description |
|---|---|
| `/` | Home — consent banner fires on first visit |
| `/rights-center` | Data Principal Rights Center |
| `/privacy` | Privacy policy page |
| `/banking`, `/investments`, `/loans` | Demo banking pages |
| `/my-account` | Account page |

---

## truConsent package

This demo uses [`@truconsent/consent-notice`](https://www.npmjs.com/package/@truconsent/consent-notice) via a local symlink to `../truKIT-NPM` for development:

```
node_modules/@truconsent/consent-notice → ../truKIT-NPM
```

To use the published npm package instead:

```bash
npm install @truconsent/consent-notice@0.0.25
```

Then remove the symlink from `node_modules/@truconsent/` and re-run `npm install`.

---

## Tech stack

- **React 18** + **TypeScript**
- **Vite**
- **Tailwind CSS** + **shadcn/ui**
- **react-router-dom** v6
- **@truconsent/consent-notice** v0.0.25
