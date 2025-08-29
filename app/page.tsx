import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QRCodeGenerator } from "@/components/qr-code-generator"

export default function Page() {
  return (
    <main className="min-h-dvh">
      <section className="mx-auto w-full max-w-5xl px-4 py-10 md:py-14">
        <header className="mb-8 md:mb-10">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-teal-600 md:text-4xl">
            QR Code Generator
          </h1>
          <p className="mt-2 max-w-prose text-pretty text-sm text-muted-foreground md:text-base">
            Create customizable QR codes. Edit content, colors, size, margin, and error correction. Upload a center logo
            and download as PNG or SVG.
          </p>
        </header>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Generator</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <QRCodeGenerator />
          </CardContent>
        </Card>

        <footer className="mt-8 text-center text-xs text-muted-foreground">
          Built with a simple, accessible UI. Tip: Higher error correction helps scannability when adding a logo.
        </footer>
      </section>
    </main>
  )
}
