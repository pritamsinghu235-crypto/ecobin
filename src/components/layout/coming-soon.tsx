import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";

export function ComingSoon({
  title,
  phase,
  description,
}: {
  title: string;
  phase: string;
  description: string;
}) {
  return (
    <>
      <Topbar title={title} />
      <div className="p-5 lg:p-8">
        <Card className="animate-rise grid place-items-center p-16 text-center">
          <div className="max-w-sm space-y-3">
            <span className="pill bg-accent-dim/50 text-accent">{phase}</span>
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            <p className="text-sm leading-relaxed text-ink-muted">{description}</p>
          </div>
        </Card>
      </div>
    </>
  );
}
