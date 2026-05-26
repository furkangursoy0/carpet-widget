'use client';

import { useState } from 'react';
import { getBrowserSupabase } from '@/lib/supabase-browser';

export default function SettingsClient({
  initialBrandName,
  initialStoreUrl,
  userEmail,
  userId,
}: {
  initialBrandName: string;
  initialStoreUrl: string;
  userEmail: string;
  userId: string;
}) {
  const [brandName, setBrandName] = useState(initialBrandName);
  const [storeUrl, setStoreUrl] = useState(initialStoreUrl);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function save() {
    setSaving(true);
    await getBrowserSupabase()
      .from('users')
      .update({ brand_name: brandName.trim() || null, store_url: storeUrl.trim() || null })
      .eq('id', userId);
    setSaving(false);
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2000);
  }

  return (
    <>
      <div className="card p-6">
        <h2 className="text-base font-extrabold mb-1">Brand</h2>
        <p className="text-sm text-sub mb-5">Shown on widget headers, emails, and analytics.</p>

        <div className="space-y-4">
          <div>
            <label className="label">Brand name</label>
            <input className="input" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Nomad Rugs" />
          </div>
          <div>
            <label className="label">Store URL</label>
            <input className="input" value={storeUrl} onChange={(e) => setStoreUrl(e.target.value)} placeholder="https://nomadrugs.com" />
            <p className="help">Used as a default when creating new widgets. Per-widget authorized domains are managed under <a href="/widgets" className="text-brand font-semibold">Widgets</a>.</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-rail">
          {savedAt ? <span className="text-xs text-success font-bold">✓ Saved</span> : null}
          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-base font-extrabold mb-1">Account</h2>
        <p className="text-sm text-sub mb-4">Signed in as <strong className="text-ink">{userEmail}</strong>.</p>
        <p className="text-xs text-sub">
          Need to change your email or password? <a href="/forgot-password" className="text-brand font-semibold">Reset password</a>.
        </p>
      </div>

      <div className="card p-6">
        <h2 className="text-base font-extrabold mb-1">Widget management</h2>
        <p className="text-sm text-sub mb-4">Widget appearance, embed code, and authorized domains are managed per-widget.</p>
        <a href="/widgets" className="btn-primary inline-flex items-center">Go to Widgets →</a>
      </div>
    </>
  );
}
