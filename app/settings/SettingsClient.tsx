'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { getBrowserSupabase } from '@/lib/supabase-browser';
import { defaultAllowedDomains } from '@/lib/utils';

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
  const [propagateDomains, setPropagateDomains] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [savedNote, setSavedNote] = useState<string>('');

  // Detect whether the URL actually changed from what was loaded.
  const urlChanged = useMemo(() => storeUrl.trim() !== initialStoreUrl.trim(), [storeUrl, initialStoreUrl]);
  const previewHosts = useMemo(() => defaultAllowedDomains(storeUrl), [storeUrl]);

  async function save() {
    setSaving(true);
    const supabase = getBrowserSupabase();
    const cleanStoreUrl = storeUrl.trim() || null;

    await supabase
      .from('users')
      .update({ brand_name: brandName.trim() || null, store_url: cleanStoreUrl })
      .eq('id', userId);

    let propagated = 0;
    if (urlChanged && propagateDomains && previewHosts.length) {
      // Only overwrite a widget's allowed_domains list when it's empty
      // OR when the existing list still matches the domains derived from
      // the previous store_url (i.e. the merchant never customised it).
      // This protects per-widget overrides while fixing the common case
      // where a merchant just typed the wrong URL during onboarding.
      const previousDefault = defaultAllowedDomains(initialStoreUrl);
      const { data: widgets } = await supabase
        .from('widgets')
        .select('id, allowed_domains')
        .eq('user_id', userId);
      for (const w of widgets ?? []) {
        const current = (w.allowed_domains ?? []) as string[];
        const safeToReplace =
          current.length === 0 ||
          (previousDefault.length > 0 && sameSet(current, previousDefault));
        if (!safeToReplace) continue;
        const { error } = await supabase
          .from('widgets')
          .update({ allowed_domains: previewHosts })
          .eq('id', w.id);
        if (!error) propagated++;
      }
    }

    setSaving(false);
    setSavedAt(Date.now());
    setSavedNote(propagated > 0 ? `✓ Saved · synced ${propagated} widget${propagated === 1 ? '' : 's'}` : '✓ Saved');
    setTimeout(() => setSavedAt(null), 2500);
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
            <p className="help">Per-widget authorized domains are managed under <a href="/widgets" className="text-brand font-semibold">Widgets</a>.</p>
          </div>

          {urlChanged ? (
            <label className="flex items-start gap-3 p-3 rounded-lg bg-warn/10 cursor-pointer">
              <input
                type="checkbox"
                checked={propagateDomains}
                onChange={(e) => setPropagateDomains(e.target.checked)}
                className="mt-0.5 accent-brand"
              />
              <div className="text-sm text-warn-ink">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <AlertTriangle size={14} /> Update widget authorized domains too
                </div>
                <p className="text-xs leading-relaxed">
                  Replace empty or untouched widget domain lists with{' '}
                  {previewHosts.length ? (
                    <>
                      {previewHosts.map((h, i) => (
                        <span key={h}>
                          {i > 0 ? ', ' : ''}
                          <code className="font-mono bg-white px-1 py-0.5 rounded">{h}</code>
                        </span>
                      ))}
                    </>
                  ) : (
                    <em>nothing — your new URL has no hostname</em>
                  )}
                  . Custom per-widget overrides are kept as-is.
                </p>
              </div>
            </label>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-rail">
          {savedAt ? <span className="text-xs text-success font-bold">{savedNote}</span> : null}
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

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  return b.every((x) => setA.has(x));
}
