// ═══════════════════════════════════════════════════════════════════
// Shared types — keep in sync with supabase/schema.sql
// ═══════════════════════════════════════════════════════════════════

export type WidgetFormat = 'floating-button' | 'side-tab';
export type WidgetPosition = 'bottom-right' | 'bottom-left' | 'right' | 'left';
export type ButtonShape = 'pill' | 'circle';

export type SubscriptionStatus = 'pending' | 'active' | 'past_due' | 'cancelled' | 'expired';

export type UsageEventType = 'opened' | 'uploaded' | 'generated' | 'downloaded' | 'shared' | 'error';

export type DbUser = {
  id: string;
  email: string;
  brand_name: string | null;
  store_url: string | null;
  onboarded: boolean;
  created_at: string;
};

export type DbWidget = {
  id: string;
  user_id: string;
  name: string;
  embed_key: string;
  format: WidgetFormat;
  position: WidgetPosition;
  accent_color: string;
  border_radius: number;
  button_text: string;
  button_shape: ButtonShape;
  status: 'active' | 'paused';
  allowed_domains: string[];
  custom_image_selector: string | null;
  created_at: string;
  updated_at: string;
};

export type DbSubscription = {
  id: string;
  user_id: string;
  lemon_subscription_id: string | null;
  lemon_customer_id: string | null;
  lemon_variant_id: string | null;
  plan: string;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  monthly_limit: number;
  cancel_at: string | null;
};

export type DbUsageEvent = {
  id: string;
  widget_id: string;
  user_id: string;
  event_type: UsageEventType;
  page_url: string | null;
  product_image_url: string | null;
  product_title: string | null;
  device: string | null;
  result_storage_path: string | null;
  error_code: string | null;
  duration_ms: number | null;
  meta: Record<string, unknown>;
  created_at: string;
};

// ─── Widget runtime types (sent over the wire to widget JS) ──────
export type WidgetConfig = {
  embed_key: string;
  format: WidgetFormat;
  position: WidgetPosition;
  accent_color: string;
  border_radius: number;
  button_text: string;
  button_shape: ButtonShape;
  status: 'active' | 'paused';
  limit_reached: boolean;
  custom_image_selector: string | null;
};

export type VisualizeRequest = {
  widget_key: string;
  room_image_base64: string;
  product_image_url: string;
  product_title?: string;
  page_url?: string;
  room_width?: number;             // pixels — widget reports so backend picks aspect
  room_height?: number;
};

export type VisualizeResponse =
  | { ok: true; result_image_url: string; generation_id: string }
  | { ok: false; error: 'limit_reached' | 'invalid_key' | 'paused' | 'forbidden_origin' | 'rate_limited' | 'generation_failed'; message: string };
