import { Card } from "@/components/ui/card";
import { Map, Construction } from "lucide-react";

export default function Maps() {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
          <Map size={32} />
          Maps
        </h1>

        <Card className="bg-slate-900/50 border-cyan-500/20 p-12">
          <div className="text-center space-y-6">
            <Construction size={64} className="mx-auto text-orange-400 opacity-50" />
            <div>
              <h2 className="text-2xl font-semibold text-cyan-300 mb-2">Coming Soon</h2>
              <p className="text-slate-400 max-w-md mx-auto">
                Interactive maps with loot locations, extraction points, and tactical information 
                are currently in development. Check back soon!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
