# Moctale Media

A modern, frontend-only image hosting and sharing platform built with React + Vite + Vercel Blob.

Upload images and get a single shareable link — no backend, no auth, no database.

---

## ✨ Features

- **Drag & drop** or file picker upload
- **Multi-image upload** with previews before upload
- **Drag to reorder** images before upload
- **5MB per file** limit with clear validation
- **Shareable link** — one URL for all uploaded images
- **Gallery view** at `/view?data=...` with masonry grid layout
- **Per-image download** and link copy
- **Dark / light mode toggle**
- **Fully client-side** — no Express, no database, no auth
- **Deployed-ready** for Vercel

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/moctale-media.git
cd moctale-media
npm install
```

### 2. Set up Vercel Blob

1. Go to [vercel.com](https://vercel.com) and create a project
2. Navigate to **Storage** → **Create Database** → **Blob**
3. Copy the **Read/Write Token**
4. Create a `.env.local` file:

```env
VITE_BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxx
```

> ⚠️ Never commit `.env.local` to git. It's already in `.gitignore`.

### 3. Run locally

```bash
npm run dev
```

Visit `http://localhost:5173`

---

## 📦 Build & Deploy

### Deploy to Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Then add your environment variable in the Vercel dashboard:
- **Key:** `VITE_BLOB_READ_WRITE_TOKEN`
- **Value:** your Vercel Blob token

> The `vercel.json` handles SPA rewrites so `/view?data=...` routes work correctly.

### Build manually

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── UploadBox.jsx      # Drag & drop zone
│   ├── ImagePreview.jsx   # Pre-upload previews with drag reorder
│   ├── Loader.jsx         # Spinner, progress bar, skeletons
│   ├── Navbar.jsx         # Top navigation bar
│   └── ShareCard.jsx      # Post-upload share link UI
│
├── pages/
│   ├── Home.jsx           # Upload page
│   └── View.jsx           # Gallery page (/view?data=...)
│
├── utils/
│   ├── encodeData.js      # URL-safe Base64 encoder
│   └── decodeData.js      # URL-safe Base64 decoder
│
├── App.jsx                # Router setup + dark mode state
├── main.jsx               # React entry point
└── index.css              # Tailwind + custom styles
```

---

## 🔗 How Multi-Image Links Work

Since there's no backend, multiple image URLs are encoded into the share link itself:

1. After upload, all Vercel Blob URLs are collected into an array
2. The array is JSON-serialized and URL-safe Base64-encoded
3. This becomes the `data=` query param: `/view?data=<encoded>`
4. On the `/view` page, the param is decoded back into URLs
5. Images are displayed in a masonry grid — works reliably after refresh

---

## ⚙️ Environment Variables

| Variable | Description |
|---|---|
| `VITE_BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write token |

---

## 🛠 Tech Stack

- **React 18** + **Vite**
- **Tailwind CSS** v3
- **@vercel/blob** client SDK
- **react-router-dom** v6
- **uuid** for unique filenames

---

## 📝 Limitations

- Max **5MB per image** (Vercel Blob free tier limit)
- Supported formats: **JPG, PNG, WEBP, GIF**
- Very long image collections (100+) may produce a long URL — most browsers support URLs up to 64KB
- The `VITE_` prefix exposes the token to the client bundle — use Vercel Blob's token-scoping features to restrict access

---

## 📄 License

MIT
