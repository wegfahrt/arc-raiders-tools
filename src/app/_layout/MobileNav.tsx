"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ScrollText, 
  Package, 
  Hammer, 
  Calculator 
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { path: "/", icon: LayoutDashboard, label: "Home" },
  { path: "/quests", icon: ScrollText, label: "Quests" },
  { path: "/items", icon: Package, label: "Items" },
  { path: "/workstations", icon: Hammer, label: "Craft" },
  { path: "/calculator", icon: Calculator, label: "Calc" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-cyan-500/20">
      <div className="flex items-center justify-around px-2 py-3">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px]",
                isActive && "bg-cyan-500/20"
              )}
            >
              <Icon 
                className={cn(
                  isActive ? "text-cyan-400" : "text-slate-400"
                )} 
                size={20} 
              />
              <span className={cn(
                "text-xs",
                isActive ? "text-cyan-300 font-medium" : "text-slate-400"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
