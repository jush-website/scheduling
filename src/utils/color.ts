export const getEventColor = (id: string) => {
  const colors = [
    { bg: 'bg-indigo-500', text: 'text-indigo-700', light: 'bg-indigo-50', bar: 'bg-indigo-500/20' },
    { bg: 'bg-violet-500', text: 'text-violet-700', light: 'bg-violet-50', bar: 'bg-violet-500/20' },
    { bg: 'bg-cyan-500', text: 'text-cyan-700', light: 'bg-cyan-50', bar: 'bg-cyan-500/20' },
    { bg: 'bg-amber-500', text: 'text-amber-700', light: 'bg-amber-50', bar: 'bg-amber-500/20' },
    { bg: 'bg-emerald-500', text: 'text-emerald-700', light: 'bg-emerald-50', bar: 'bg-emerald-500/20' },
    { bg: 'bg-rose-500', text: 'text-rose-700', light: 'bg-rose-50', bar: 'bg-rose-500/20' },
    { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-50', bar: 'bg-blue-500/20' },
    { bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-50', bar: 'bg-orange-500/20' },
  ];
  
  // 使用 ID 的簡單 hash 選擇顏色
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};
