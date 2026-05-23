# 🎮 GameVault PH v2 — Setup Guide

## Bagong Features sa v2
- ✅ GCash QR code na visible sa payment modal
- ✅ Approve/Reject system — ikaw ang magde-decide kung sino ang bibigyan ng link
- ✅ Direct Google Drive download links (walang redirect)
- ✅ Admin email na may Approve ✅ at Reject ❌ buttons

---

## Paano Mag-add ng Google Drive Links (IMPORTANTE)

### Step 1 — I-get ang File ID ng bawat game
Ang Google Drive share link ay ganito:
```
https://drive.google.com/file/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ/view
```
Ang **File ID** ay yung mahabang text sa gitna: `1aBcDeFgHiJkLmNoPqRsTuVwXyZ`

### Step 2 — I-paste sa games.js
Buksan ang `src/app/data/games.js` at hanapin ang game.
Palitan ang `driveId: ""` ng `driveId: "1aBcDeFgHiJkLmNoPqRsTuVwXyZ"`

Halimbawa:
```javascript
{ id: 1, title: "Assassin's Creed Mirage", ..., driveId: "1aBcDeFgHiJkLmNoPqRsTuVwXyZ" },
```

### Step 3 — I-set ang Google Drive file to "Anyone with link"
Para ma-download ng buyers ang file:
1. Right-click ang file sa Google Drive → Share
2. Change to **"Anyone with the link"** → Viewer
3. Copy link

---

## Initial Setup

### Step 1 — I-install ang Node.js
Pumunta sa https://nodejs.org → i-download ang LTS version → i-install

### Step 2 — I-install ang VS Code
Pumunta sa https://code.visualstudio.com → i-download at i-install

### Step 3 — Gumawa ng Accounts
- **GitHub**: https://github.com
- **Vercel**: https://vercel.com (sign up gamit GitHub)
- **Resend**: https://resend.com

### Step 4 — I-extract ang ZIP
I-extract ang `my-games-store-v2` folder sa Desktop mo

### Step 5 — Buksan sa VS Code
File → Open Folder → piliin ang `my-games-store-v2`

### Step 6 — Buksan ang Terminal (Ctrl + `)
I-type at pindutin Enter:
```
npm install
```

---

## Setup ng Environment Variables

Buksan ang `.env.local` file at palitan ang mga values:

```
RESEND_API_KEY=re_iyong_actual_api_key
APPROVE_SECRET=kahit-anong-random-salita-dito-halimbawa-batman2025
NEXT_PUBLIC_BASE_URL=https://YOUR-APP.vercel.app
```

**Para sa Resend API Key:**
1. Login sa resend.com → API Keys → Create API Key → Copy

**Para sa NEXT_PUBLIC_BASE_URL:**
- Ilagay muna ito pagkatapos mong ma-deploy sa Vercel
- Ang URL ay makikita sa Vercel dashboard after deployment

---

## I-test Locally

```
npm run dev
```
Buksan ang browser → http://localhost:3000

---

## I-deploy sa Vercel

### Step 1 — I-upload sa GitHub
Sa VS Code terminal:
```
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/my-games-store.git
git push -u origin main
```

### Step 2 — I-connect sa Vercel
1. vercel.com → Add New Project → Import GitHub repo
2. Sa **Environment Variables** section, i-add ang tatlo:

| Name | Value |
|------|-------|
| `RESEND_API_KEY` | `re_iyong_key` |
| `APPROVE_SECRET` | `iyong_secret` |
| `NEXT_PUBLIC_BASE_URL` | (blank muna, i-update after) |

3. I-click Deploy → hintayin → may URL ka na!

### Step 3 — I-update ang Base URL
1. Kopyahin ang Vercel URL (e.g. `https://my-games-store-abc123.vercel.app`)
2. Sa Vercel dashboard → Settings → Environment Variables
3. I-edit ang `NEXT_PUBLIC_BASE_URL` → i-paste ang URL
4. Redeploy (Deployments → latest → Redeploy)

---

## Paano Gumagana ang Approve System

1. Customer mag-request ng game
2. **Ikaw** makakatanggap ng email na may dalawang buttons:
   - ✅ **APPROVE & SEND LINK** — i-click ito kapag na-confirm na ang GCash payment
   - ❌ **Reject** — i-click kung hindi nagbayad
3. Kapag i-click mo ang Approve, automatic na mag-send ng download link sa buyer

---

## ₱0 Monthly Cost

| Service | Free Tier |
|---------|-----------|
| Vercel | 100GB bandwidth/month |
| Resend | 3,000 emails/month |
| GitHub | Unlimited |

