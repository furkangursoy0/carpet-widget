// ═══════════════════════════════════════════════════════════════════
// GET /api/widget/:key
// Returns widget config (color, position, button text, allow-list,
// custom selector) — called by the widget script on each merchant
// site when it boots.
// ═══════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase-server';
import type { WidgetConfig } from '@/lib/types';

export const runtime = 'edge';

export async function GET(_req: Request, ctx: { params: { key: string } }) {
  const supabase = getServiceSupabase();
  const { data: widget } = await supabase
    .from('widgets')
    .select('embed_key, format, position, accent_color, border_radius, button_text, button_shape, status, user_id, custom_image_selector')
    .eq('embed_key', ctx.params.key)
    .maybeSingle();

  if (!widget) {
    return NextResponse.json({ error: 'not_found' }, { status: 404, headers: cors() });
  }

  const { data: usage } = await supabase.rpc('current_period_usage', { uid: widget.user_id }).single();
  const limitReached = (usage as any) ? (usage as any).used >= (usage as any).limit_total : false;

  const format = widget.format === 'side-tab' ? 'side-tab' : 'floating-button';
  const position = normalizePosition(format, widget.position);
  const shape = widget.button_shape === 'circle' ? 'circle' : 'pill';

  const config: WidgetConfig = {
    embed_key: widget.embed_key,
    format,
    position,
    accent_color: widget.accent_color,
    border_radius: widget.border_radius,
    button_text: widget.button_text,
    button_shape: shape,
    status: widget.status,
    limit_reached: limitReached,
    custom_image_selector: widget.custom_image_selector,
  };

  return NextResponse.json(config, {
    headers: {
      ...cors(),
      'Cache-Control': 'public, max-age=120, s-maxage=120',
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: cors() });
}

// Each format has its own set of valid positions; fall back to the
// format's primary default when the stored value doesn't apply.
function normalizePosition(format: 'floating-button' | 'side-tab', raw: string | null): 'bottom-right' | 'bottom-left' | 'right' | 'left' {
  if (format === 'side-tab') return raw === 'left' ? 'left' : 'right';
  return raw === 'bottom-left' ? 'bottom-left' : 'bottom-right';
}

function cors() {
  // Config is non-sensitive (it's the same info embedded in the merchant's
  // public HTML), so we keep the open CORS read here. Write endpoints
  // (visualize, event) enforce the domain allow-list instead.
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
