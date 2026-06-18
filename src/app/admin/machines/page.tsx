import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { MachineForm } from "@/components/admin/machine-form";
import { MachineRow } from "@/components/admin/machine-row";
import { getAllMachines } from "@/lib/data";

export default async function AdminMachinesPage() {
  const machines = await getAllMachines();

  return (
    <>
      <Topbar title="Machines" />
      <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-3 lg:p-8">
        <Card className="animate-rise lg:col-span-2 overflow-hidden">
          <div className="p-5 pb-2">
            <h3 className="text-sm font-medium text-ink-muted">
              Fleet · {machines.length} machines
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line/70 text-left text-xs text-ink-faint">
                  <th className="px-5 py-3 font-medium">Code</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                  <th className="px-5 py-3 font-medium">Fill</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {machines.map((m) => (
                  <MachineRow key={m.id} machine={m} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="animate-rise h-fit p-5" style={{ animationDelay: "120ms" }}>
          <h3 className="text-sm font-medium text-ink-muted">Add a machine</h3>
          <p className="mt-1 mb-4 text-xs text-ink-faint">
            New machines appear on the live map immediately.
          </p>
          <MachineForm />
        </Card>
      </div>
    </>
  );
}
