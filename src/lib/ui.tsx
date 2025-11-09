export function Spinner(){ return <div className="animate-spin w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full" /> }
// src/lib/ui.ts
export function cn(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(' ');
}
