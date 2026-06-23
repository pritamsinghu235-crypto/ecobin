"use client";

import { useRef, useState } from "react";
import { Download, Printer, QrCode } from "lucide-react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Modal } from "@/components/ui/modal";
import type { Machine } from "@/lib/types";

/**
 * Per-machine QR code. Encodes an absolute deep link to the public deposit
 * flow with the bin pre-selected (/deposit?machine=<code>). The URL is built
 * from window.location.origin at open time so it works on localhost and prod
 * without any env config. A hidden high-res <canvas> backs PNG download/print;
 * the visible code is crisp SVG.
 */
export function MachineQr({ machine }: { machine: Machine }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const canvasWrap = useRef<HTMLDivElement>(null);

  function openModal() {
    setUrl(`${window.location.origin}/deposit?machine=${encodeURIComponent(machine.code)}`);
    setOpen(true);
  }

  function pngDataUrl() {
    return canvasWrap.current?.querySelector("canvas")?.toDataURL("image/png");
  }

  function download() {
    const data = pngDataUrl();
    if (!data) return;
    const a = document.createElement("a");
    a.href = data;
    a.download = `wastelytix-${machine.code}.png`;
    a.click();
  }

  function print() {
    const data = pngDataUrl();
    const w = window.open("", "_blank", "width=420,height=560");
    if (!w || !data) return;
    w.document.write(
      `<title>${machine.code}</title>` +
        `<body style="margin:0;display:grid;place-items:center;height:100vh;font-family:system-ui,sans-serif;text-align:center">` +
        `<div><img src="${data}" style="width:300px;height:300px"/>` +
        `<h2 style="margin:12px 0 0">${machine.code}</h2>` +
        `<p style="margin:4px 0;color:#555">${machine.name}</p></div></body>`,
    );
    w.document.close();
    w.focus();
    w.print();
  }

  return (
    <>
      <button
        onClick={openModal}
        aria-label={`QR code for ${machine.code}`}
        className="text-ink-faint transition-colors hover:text-brand-bright"
      >
        <QrCode className="size-4" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={`QR · ${machine.code}`}>
        {url && (
          <div className="space-y-4 text-center">
            <div className="mx-auto w-fit rounded-xl bg-white p-4">
              <QRCodeSVG value={url} size={200} level="M" />
            </div>

            {/* Hidden hi-res canvas used only as the PNG source for download/print. */}
            <div ref={canvasWrap} className="hidden" aria-hidden>
              <QRCodeCanvas value={url} size={512} level="M" />
            </div>

            <div>
              <p className="text-sm font-medium">{machine.name}</p>
              <p className="mt-1 break-all text-xs text-ink-faint">{url}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={download}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-line bg-surface/60 px-3 py-2 text-xs font-medium text-ink transition-colors hover:border-brand/50"
              >
                <Download className="size-3.5" /> Download PNG
              </button>
              <button
                onClick={print}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-line bg-surface/60 px-3 py-2 text-xs font-medium text-ink transition-colors hover:border-brand/50"
              >
                <Printer className="size-3.5" /> Print
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
