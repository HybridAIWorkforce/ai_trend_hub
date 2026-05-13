'use client';

import { useSession, signOut } from 'next-auth/react';
import { RefreshCw, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function Header() {
  const { data: session } = useSession() || {};
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/jobs/refresh', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data?.success) {
        toast.success(`Refreshed! Processed ${data?.itemsProcessed ?? 0} items`);
      } else {
        toast.error(data?.error ?? 'Failed to refresh');
      }
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <header className="bg-zinc-950/50 backdrop-blur-sm border-b border-zinc-800/50 sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Welcome back, {session?.user?.name ?? 'User'}</h2>
          <p className="text-sm text-zinc-500">Stay updated with the latest AI trends</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh Data</span>
          </button>
          
          <button
            onClick={() => signOut({ callbackUrl: '/?logout=true' })}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 text-zinc-400 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
