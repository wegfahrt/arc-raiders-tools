import { HeroSection } from "~/app/_dashboard/HeroSection";
import { ActiveMissions } from "~/app/_dashboard/ActiveMissions";
import { DashboardPanels } from "~/app/_dashboard/DashboardPanels";

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <ActiveMissions />
        <DashboardPanels />
      </div>
    </div>
  );
}
