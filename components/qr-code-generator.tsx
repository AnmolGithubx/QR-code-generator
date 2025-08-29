"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import QRCode from "qrcode"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

type ErrorCorrectionLevel = "L" | "M" | "Q" | "H"

type QROptions = {
  text: string
  size: number
  margin: number
  errorCorrectionLevel: ErrorCorrectionLevel
  colorDark: string
  colorLight: string
}

export function QRCodeGenerator() {
  // Main options
  const [text, setText] = useState("https://example.com")
  const [size, setSize] = useState<number>(320)
  const [margin, setMargin] = useState<number>(4)
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<ErrorCorrectionLevel>("M")
  const [colorDark, setColorDark] = useState<string>("#111111")
  const [colorLight, setColorLight] = useState<string>("#FFFFFF")

  // Logo overlay
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null)
  const [logoScale, setLogoScale] = useState<number>(22) // % of QR size
  const [logoPadding, setLogoPadding] = useState<number>(8) // px
  const [logoRounded, setLogoRounded] = useState<number>(10) // px radius

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const opts: QROptions = useMemo(
    () => ({ text, size, margin, errorCorrectionLevel, colorDark, colorLight }),
    [text, size, margin, errorCorrectionLevel, colorDark, colorLight],
  )

  // Draw a rounded rectangle path
  const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    const radius = Math.min(r, w / 2, h / 2)
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.arcTo(x + w, y, x + w, y + h, radius)
    ctx.arcTo(x + w, y + h, x, y + h, radius)
    ctx.arcTo(x, y + h, x, y, radius)
    ctx.arcTo(x, y, x + w, y, radius)
    ctx.closePath()
  }

  // Generate QR whenever options change
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1))
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    QRCode.toCanvas(
      canvas,
      opts.text || " ",
      {
        errorCorrectionLevel: opts.errorCorrectionLevel,
        margin: opts.margin,
        width: size,
        color: {
          dark: opts.colorDark,
          light: opts.colorLight,
        },
      },
      () => {
        if (!logoDataUrl || !ctx) return
        try {
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.onload = () => {
            const boxSize = Math.round((logoScale / 100) * size)
            const boxX = Math.round(size / 2 - boxSize / 2)
            const boxY = Math.round(size / 2 - boxSize / 2)

            // White background box for contrast
            ctx.save()
            drawRoundedRect(ctx, boxX, boxY, boxSize, boxSize, logoRounded)
            ctx.fillStyle = "#FFFFFF"
            ctx.fill()

            // Padded inner rect for the image
            const innerX = boxX + logoPadding
            const innerY = boxY + logoPadding
            const innerW = Math.max(0, boxSize - logoPadding * 2)
            const innerH = Math.max(0, boxSize - logoPadding * 2)

            drawRoundedRect(ctx, innerX, innerY, innerW, innerH, Math.max(logoRounded - 4, 0))
            ctx.clip()
            ctx.drawImage(img, innerX, innerY, innerW, innerH)
            ctx.restore()
          }
          img.src = logoDataUrl
        } catch (e) {
          console.error("[v0] Logo render failed:", e)
        }
      },
    )
  }, [opts, size, logoDataUrl, logoScale, logoPadding, logoRounded])

  const onLogoUpload = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = () => setLogoDataUrl(reader.result as string)
    reader.readAsDataURL(file)
  }, [])

  const clearLogo = useCallback(() => setLogoDataUrl(null), [])

  const downloadPNG = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = "qr-code.png"
    document.body.appendChild(a)
    a.click()
    a.remove()
  }, [])

  const downloadSVG = useCallback(async () => {
    try {
      const svgString = await QRCode.toString(opts.text || " ", {
        type: "svg",
        errorCorrectionLevel: opts.errorCorrectionLevel,
        margin: opts.margin,
        color: {
          dark: opts.colorDark,
          light: opts.colorLight,
        },
        width: size,
      } as any)

      // Note: SVG output does not include the logo overlay (PNG does).
      const blob = new Blob([svgString], { type: "image/svg+xml" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "qr-code.svg"
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error("[v0] SVG download failed:", e)
    }
  }, [opts, size])

  const reset = useCallback(() => {
    setText("https://example.com")
    setSize(320)
    setMargin(4)
    setErrorCorrectionLevel("M")
    setColorDark("#111111")
    setColorLight("#FFFFFF")
    setLogoDataUrl(null)
    setLogoScale(22)
    setLogoPadding(8)
    setLogoRounded(10)
  }, [])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Left: Controls */}
      <Card className="order-2 md:order-1">
        <CardContent className="pt-6">
          <div className="grid gap-5">
            {/* Content */}
            <div className="grid gap-2">
              <Label htmlFor="qr-content">Content (URL or text)</Label>
              <Input
                id="qr-content"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="https://your-link.com or any text"
                aria-label="QR content"
              />
            </div>

            {/* Size */}
            <div className="grid gap-2">
              <Label>Size: {size}px</Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[size]}
                  onValueChange={(v) => setSize(v[0])}
                  min={128}
                  max={1024}
                  step={16}
                  aria-label="QR size"
                  className="w-full"
                />
                <Input
                  type="number"
                  className="w-24"
                  min={64}
                  max={2048}
                  step={16}
                  value={size}
                  onChange={(e) => setSize(Math.min(2048, Math.max(64, Number(e.target.value) || 0)))}
                  aria-label="Size in pixels"
                />
              </div>
            </div>

            {/* Margin */}
            <div className="grid gap-2">
              <Label>Margin: {margin}</Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[margin]}
                  onValueChange={(v) => setMargin(v[0])}
                  min={0}
                  max={16}
                  step={1}
                  aria-label="QR margin"
                  className="w-full"
                />
                <Input
                  type="number"
                  className="w-20"
                  min={0}
                  max={32}
                  step={1}
                  value={margin}
                  onChange={(e) => setMargin(Math.min(32, Math.max(0, Number(e.target.value) || 0)))}
                  aria-label="Margin in modules"
                />
              </div>
            </div>

            {/* Error correction */}
            <div className="grid gap-2">
              <Label htmlFor="qr-ecl">Error correction</Label>
              <Select
                value={errorCorrectionLevel}
                onValueChange={(v) => setErrorCorrectionLevel(v as ErrorCorrectionLevel)}
              >
                <SelectTrigger id="qr-ecl" aria-label="Error correction level">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">L — Low (7%)</SelectItem>
                  <SelectItem value="M">M — Medium (15%)</SelectItem>
                  <SelectItem value="Q">Q — Quartile (25%)</SelectItem>
                  <SelectItem value="H">H — High (30%)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Higher levels tolerate more obstruction. Use Q or H if you add a logo.
              </p>
            </div>

            {/* Colors */}
            <div className="grid gap-2">
              <Label>Colors</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dark-color">Foreground</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="dark-color"
                      type="color"
                      value={colorDark}
                      onChange={(e) => setColorDark(e.target.value)}
                      aria-label="Foreground color"
                      className="h-10 w-14 p-1"
                    />
                    <Input
                      value={colorDark}
                      onChange={(e) => setColorDark(e.target.value)}
                      aria-label="Foreground color hex"
                      placeholder="#111111"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="light-color">Background</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="light-color"
                      type="color"
                      value={colorLight}
                      onChange={(e) => setColorLight(e.target.value)}
                      aria-label="Background color"
                      className="h-10 w-14 p-1"
                    />
                    <Input
                      value={colorLight}
                      onChange={(e) => setColorLight(e.target.value)}
                      aria-label="Background color hex"
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Dark foreground on light background typically scans best.</p>
            </div>

            {/* Logo */}
            <div className="grid gap-2">
              <Label htmlFor="logo">Center logo (optional)</Label>
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) onLogoUpload(file)
                  }}
                  aria-label="Upload logo"
                  className="max-w-xs"
                />
                {logoDataUrl && (
                  <Button variant="secondary" onClick={clearLogo}>
                    Remove logo
                  </Button>
                )}
              </div>

              {logoDataUrl && (
                <div className="grid gap-3 rounded-md border p-3">
                  <div className="grid gap-2">
                    <Label>Logo size: {logoScale}%</Label>
                    <Slider
                      value={[logoScale]}
                      onValueChange={(v) => setLogoScale(v[0])}
                      min={10}
                      max={40}
                      step={1}
                      aria-label="Logo size percentage"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Logo padding: {logoPadding}px</Label>
                    <Slider
                      value={[logoPadding]}
                      onValueChange={(v) => setLogoPadding(v[0])}
                      min={0}
                      max={16}
                      step={1}
                      aria-label="Logo padding"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Logo corner radius: {logoRounded}px</Label>
                    <Slider
                      value={[logoRounded]}
                      onValueChange={(v) => setLogoRounded(v[0])}
                      min={0}
                      max={24}
                      step={1}
                      aria-label="Logo corner radius"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button onClick={downloadPNG} className="bg-teal-600 hover:bg-teal-700">
                Download PNG
              </Button>
              <Button onClick={downloadSVG} variant="outline">
                Download SVG
              </Button>
              <Button onClick={reset} variant="ghost">
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right: Preview */}
      <Card className="order-1 md:order-2">
        <CardContent className="flex items-center justify-center p-4 md:p-6">
          <div className={cn("flex w-full max-w-[min(90vw,650px)] flex-col items-center justify-center gap-3")}>
            <div className="rounded-lg border bg-card p-3 shadow-sm">
              <canvas
                ref={canvasRef}
                role="img"
                aria-label="QR code preview"
                className="block h-auto w-full max-w-[640px]"
                style={{ aspectRatio: "1 / 1" }}
              />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Live preview. Adjust settings and download your QR code.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
