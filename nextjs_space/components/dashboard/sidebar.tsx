'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Bookmark, 
  Settings,
  Menu,
  X,
  Sparkles,
  FileText
} from 'lucide-react';
import { Category } from '@/lib/types';

interface SidebarProps {
  categories?: Category[];
}

export function Sidebar({ categories = [] }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const mainNavigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Articles', href: '/dashboard/articles', icon: FileText },
    { name: 'Saved Items', href: '/dashboard/saved', icon: Bookmark },
  ];

  const categoryNavigation = categories?.map((cat) => {
    let icon = TrendingUp;
    if (cat?.name === 'sales_ai') icon = Users;
    if (cat?.name === 'recruitment_ai') icon = Users;
    if (cat?.name === 'reddit') icon = MessageSquare;
    
    return {
      name: cat?.displayName ?? 'Unknown',
      href: `/dashboard/category/${cat?.id ?? ''}`,
      icon,
      color: cat?.color,
    };
  }) ?? [];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white"
      >
        {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 border-r border-zinc-800/50 z-40 transition-all duration-300 ${
          collapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-64'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-zinc-800/50">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Sparkles className="w-6 h-6 text-blue-400" />
              </div>
              {!collapsed && (
                <div>
                  <h1 className="text-xl font-bold text-white">AI Trend Hub</h1>
                  <p className="text-xs text-zinc-500">Track AI Trends</p>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            {/* Main Navigation */}
            <div className="mb-6">
              {!collapsed && (
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                  Main
                </h3>
              )}
              <ul className="space-y-2">
                {mainNavigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive(item.href)
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            {(categoryNavigation?.length ?? 0) > 0 && (
              <div>
                {!collapsed && (
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                    Categories
                  </h3>
                )}
                <ul className="space-y-2">
                  {categoryNavigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive(item.href)
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                        }`}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </nav>

          {/* Settings */}
          <div className="p-4 border-t border-zinc-800/50">
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">Settings</span>}
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
