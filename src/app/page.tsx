import { HeroSection } from "~/app/_dashboard/HeroSection";
import { ActiveMissions } from "~/app/_dashboard/ActiveMissions";
import { MaterialShortages } from "~/app/_dashboard/MaterialShortages";

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <ActiveMissions />
          </div>
          
          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            <MaterialShortages />
          </div>
        </div>
      </div>
    </div>
  );
}
