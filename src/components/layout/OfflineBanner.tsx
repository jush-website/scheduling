import React from 'react';
import { WifiOff } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export const OfflineBanner: React.FC = () => {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="bg-destructive text-destructive-foreground py-2 px-4 flex items-center justify-center gap-2 sticky top-16 z-30 animate-in slide-in-from-top duration-300">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-medium">目前處於離線狀態，請檢查您的網路連線。</span>
    </div>
  );
};
