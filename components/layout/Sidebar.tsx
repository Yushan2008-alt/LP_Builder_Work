"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useProjects } from "@/lib/hooks/useProjects";
import { useEffect } from "react";

const navItems = [
  {
    section: "Data Produk",
    items: [
      { label: "Product Knowledge DB", href: "/products", icon: "🗃️" },
    ],
  },
  {
    section: "LP Generator",
    items: [
      { label: "Buat LP Baru", href: "/generator/new", icon: "✨" },
      { label: "Saved Projects", href: "/saved", icon: "📁" },
    ],
  },
  {
    section: "Tools",
    items: [
      { label: "HTML Editor", href: "/editor", icon: "💻" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut, user } = useAuth();
  const router = useRouter();
  const { projects, fetchProjects } = useProjects();

  useEffect(() => { fetchProjects(); }, []);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">LP</div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">LP Builder</p>
            <p className="text-xs text-gray-400">Block Engine</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {navItems.map((group) => (
          <div key={group.section}>
            <p className="px-3 mb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{group.section}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}>
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                    {item.href === "/saved" && projects.length > 0 && (
                      <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                        {projects.length}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User info + Sign out */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600">
            {user?.email?.[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 truncate">{user?.email}</p>
            <p className="text-xs text-gray-400">Free Plan</p>
          </div>
        </div>
        <button onClick={handleSignOut}
          className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
