import { MapPin, Recycle } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { getMachineByCode } from "@/lib/data";

/**
 * Deposit entry point. Scanning a bin's QR opens this with ?machine=<code>,
 * pre-selecting that machine. The guided deposit flow (AI classification via
 * the Phase 4 simulator) is still pending — this minimal page confirms the
 * selected bin so the QR round-trip works end to end.
 */
export default async function DepositPage({
  searchParams,
}: {
  searchParams: Promise<{ machine?: string }>;
}) {
  const { machine: code } = await searchParams;
  const machine = code ? await getMachineByCode(code) : null;

  return (
    <>
      <Topbar title="Deposit" />
      <div className="p-5 lg:p-8">
        <Card className="animate-rise mx-auto max-w-md p-8 text-center">
          {machine ? (
            <div className="space-y-3">
              <div className="mx-auto grid size-12 place-items-center rounded-xl bg-brand-dim/50 text-brand-bright">
                <Recycle className="size-6" />
              </div>
              <span className="pill bg-brand-dim/50 text-brand-bright">Bin selected</span>
              <h2 className="text-xl font-semibold tracking-tight">{machine.name}</h2>
              <p className="font-mono text-xs text-ink-faint">{machine.code}</p>
              {machine.address && (
                <p className="flex items-center justify-center gap-1.5 text-sm text-ink-muted">
                  <MapPin className="size-3.5" /> {machine.address}
                </p>
              )}
              <p className="pt-2 text-sm leading-relaxed text-ink-muted">
                You scanned <span className="font-medium text-ink">{machine.code}</span> — it&rsquo;s
                pre-selected and ready. The guided deposit flow with live AI plastic classification
                arrives with the Phase 4 device simulator.
              </p>
            </div>
          ) : code ? (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight">Bin not found</h2>
              <p className="text-sm leading-relaxed text-ink-muted">
                We couldn&rsquo;t find a machine with code{" "}
                <span className="font-mono text-ink">{code}</span>. Please re-scan the QR code or
                choose a bin from the map.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <span className="pill bg-accent-dim/50 text-accent">Phase 4 · IoT Simulator</span>
              <h2 className="text-xl font-semibold tracking-tight">Deposit</h2>
              <p className="text-sm leading-relaxed text-ink-muted">
                Scan a bin&rsquo;s QR code to start a deposit with that machine pre-selected. The
                guided flow with live AI plastic classification arrives with the device simulator.
              </p>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
