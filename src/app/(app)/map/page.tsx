import { Topbar } from "@/components/layout/topbar";
import { MapView } from "@/components/map/map-view";
import { getMachinesForMap } from "@/lib/data";

export default async function MapPage() {
  const machines = await getMachinesForMap();

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <Topbar title="Bin Map" />
      <MapView initial={machines} />
    </div>
  );
}
