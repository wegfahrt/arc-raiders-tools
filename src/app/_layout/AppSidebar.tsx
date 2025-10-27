"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ScrollText, 
  Package, 
  Hammer, 
  Calculator, 
  Map, 
  BookOpen,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/quests", icon: ScrollText, label: "Quests" },
  { path: "/items", icon: Package, label: "Items" },
  { path: "/workstations", icon: Hammer, label: "Workstations" },
  { path: "/calculator", icon: Calculator, label: "Calculator" },
  { path: "/maps", icon: Map, label: "Maps", soon: true },
  { path: "/guides", icon: BookOpen, label: "Guides" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "hidden fixed z-999 h-full lg:flex flex-col bg-slate-900/95 backdrop-blur-sm border-r border-cyan-500/20 transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 border-b border-cyan-500/20">
        <h1 className={cn(
          "font-bold text-cyan-400 transition-all duration-300",
          collapsed ? "text-xl text-center" : "text-2xl"
        )}>
          {collapsed ? "AR" : "Arc Raiders"}
        </h1>
        {!collapsed && (
          <p className="text-sm text-slate-400 mt-1">Companion App</p>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                "hover:bg-cyan-500/10 hover:border-cyan-500/30 border border-transparent",
                isActive && "bg-cyan-500/20 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]",
                collapsed && "justify-center"
              )}
            >
              <Icon className={cn(
                "flex-shrink-0",
                isActive ? "text-cyan-400" : "text-slate-400"
              )} size={20} />
              {!collapsed && (
                <>
                  <span className={cn(
                    "flex-1",
                    isActive ? "text-cyan-300 font-medium" : "text-slate-300"
                  )}>
                    {item.label}
                  </span>
                  {item.soon && (
                    <Badge variant="secondary" className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">
                      Soon
                    </Badge>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-4 border-t border-cyan-500/20 hover:bg-cyan-500/10 transition-colors flex items-center justify-center"
      >
        {collapsed ? (
          <ChevronRight className="text-cyan-400" size={20} />
        ) : (
          <ChevronLeft className="text-cyan-400" size={20} />
        )}
      </button>
    </aside>
  );
}
