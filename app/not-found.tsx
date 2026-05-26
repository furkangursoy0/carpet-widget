import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-brand grid place-items-center mx-auto mb-6 shadow-brand">
          <span className="text-white font-black text-2xl">S</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">404</h1>
        <p className="text-sub font-semibold mb-6">
          This page doesn't exist — or it moved. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">Go to homepage</Link>
          <Link href="/login" className="btn-ghost">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
