import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <span className="text-5xl mb-4">🔍</span>
      <h2 className="text-2xl font-bold text-slate-100 mb-2">Stránka nenalezena (404)</h2>
      <p className="text-sm text-slate-400 max-w-md mb-6">
        Požadovaná stránka neexistuje nebo byla přesunuta.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 bg-[#0f172a] hover:bg-slate-800 text-white font-bold text-sm rounded-lg shadow"
      >
        Zpět do konfigurátoru
      </Link>
    </div>
  );
}
