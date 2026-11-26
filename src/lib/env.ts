export const env = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  mpAccessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
  mpWebhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET || "",
};

export const hasSupabase = Boolean(env.supabaseUrl && env.supabaseAnonKey);
export const hasMercadoPago = Boolean(env.mpAccessToken);
