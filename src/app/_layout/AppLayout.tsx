import type { ReactNode } from "react";
import { AppSidebar } from "../_layout/AppSidebar";
import { MobileNav } from "../_layout/MobileNav";
import { Footer } from "../_layout/Footer";
import { Menu } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <AppSidebar />
      
      <main className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-cyan-500/20 px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-cyan-400">Arc Raiders</h1>
            <button className="text-slate-400 hover:text-cyan-400 transition-colors">
              <Menu size={24} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto pb-20 lg:pb-0">
          {children}
        </div>

        <Footer />
      </main>

      <MobileNav />
    </div>
  );
}
