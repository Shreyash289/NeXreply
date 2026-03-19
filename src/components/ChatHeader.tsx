import NeXreplyLogo from './NeXreplyLogo';

export default function ChatHeader() {
  return (
    <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white px-6 py-4 flex items-center space-x-4 shadow-lg border-b border-pink-500/10">
      <div className="flex-1">
        <NeXreplyLogo />
        <p className="text-xs text-slate-400 mt-1">Sales Assistant</p>
      </div>
      <div className="w-2.5 h-2.5 bg-gradient-to-br from-pink-500 to-pink-600 rounded-sm"></div>
    </div>
  );
}
