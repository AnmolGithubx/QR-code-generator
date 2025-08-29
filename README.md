# 📦 QR Code Generator

A **fully client-side QR Code Generator** built with **Next.js App Router (v0 runtime)**, **Tailwind CSS**, and **shadcn/ui**.  
Generate customizable QR codes instantly with live preview, color control, error correction levels, and optional logo overlay.

---

## 🚀 Tech Stack

- **Next.js App Router** (v0 runtime)  
- **Tailwind CSS** with **shadcn/ui** components  
- **[qrcode](https://www.npmjs.com/package/qrcode)** npm package for QR generation  
- **No environment variables required**  
- Runs entirely client-side (no external APIs)

---

## 🎯 Core Features

- ✅ **Inputs:** Text/URL, size, margin, error correction (`L`, `M`, `Q`, `H`), foreground & background color  
- ✅ **Center logo overlay (optional):** upload PNG/JPG/SVG, automatically resized for safety  
- ✅ **Live preview:**  
  - PNG rendered on `<canvas>`  
  - SVG generated as a string for vector export  
- ✅ **Download options:** Export PNG or SVG instantly  

---

## 🔒 Security & Validation

- Input length validated (limits depend on error correction level)  
- Logo restrictions: **PNG, JPG, SVG only**, with max file size enforced  
- Uses `crossOrigin="anonymous"` when drawing logo overlays  
- **No raw SVG injected** → downloads via `Blob` instead  
- **No user data sent to any server**  

---

## 🎨 Design System

- **Colors**  
  - Primary: Blue `#2563eb` (CTAs)  
  - Neutral: White `#ffffff`, Slate-900 `#0f172a`, Slate-700 `#334155`  
  - Accent: Emerald `#10b981` (success states)  

- **Typography**  
  - Sans (Geist) for headings & body text  

- **Layout**  
  - Flexbox with `gap` utilities  
  - `Card` components for structured sections  
  - Clean, minimal UI (no gradients)  

---

## ⚡️ API Usage

- **No APIs required** → generator runs entirely **client-side** with the `qrcode` package.  

---


Made with ❤️ and lots of coffee.  

---
