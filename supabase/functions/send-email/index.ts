/**
 * Supabase Edge Function — Send Email via Resend
 * يحمي RESEND_API_KEY من العميل عبر تمرير الطلبات عبر هذا الوسيط
 *
 * الإعداد:
 *   supabase secrets set RESEND_API_KEY=re_your-key
 *
 * النشر:
 *   supabase functions deploy send-email
 *
 * الاستخدام من Frontend:
 *   const { data, error } = await db.functions.invoke('send-email', {
 *     body: {
 *       to: 'user@example.com',
 *       subject: 'مرحباً',
 *       html: '<h1>Hello</h1>',
 *     },
 *   });
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_URL = 'https://api.resend.com/emails';
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'SVU Community <onboarding@resend.dev>';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const ALLOWED_ORIGINS = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || ['http://localhost:3001'];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

interface EmailRequest {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

function validateEmailRequest(body: Record<string, unknown>): { valid: boolean; error?: string } {
  if (!body.to) return { valid: false, error: 'MISSING_RECIPIENT' };
  if (!body.subject) return { valid: false, error: 'MISSING_SUBJECT' };
  if (!body.html && !body.text) return { valid: false, error: 'MISSING_CONTENT' };

  const toField = body.to;
  if (typeof toField === 'string') {
    if (!toField.includes('@')) return { valid: false, error: 'INVALID_EMAIL' };
  } else if (Array.isArray(toField)) {
    if (toField.length === 0) return { valid: false, error: 'EMPTY_RECIPIENT_LIST' };
    if (toField.length > 50) return { valid: false, error: 'TOO_MANY_RECIPIENTS' };
    for (const email of toField) {
      if (typeof email !== 'string' || !email.includes('@')) {
        return { valid: false, error: 'INVALID_EMAIL_IN_LIST' };
      }
    }
  } else {
    return { valid: false, error: 'INVALID_RECIPIENT_FORMAT' };
  }

  return { valid: true };
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY_NOT_CONFIGURED' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Verify admin access
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'INVALID_TOKEN' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { data: profile } = await supabase
      .from('users')
      .select('is_admin, is_active')
      .eq('id', user.id)
      .single();

    if (!profile || !profile.is_admin || !profile.is_active) {
      return new Response(
        JSON.stringify({ error: 'FORBIDDEN' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const body: EmailRequest = await req.json();

    const validation = validateEmailRequest(body as unknown as Record<string, unknown>);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const payload: Record<string, unknown> = {
      from: FROM_EMAIL,
      to: body.to,
      subject: body.subject,
    };

    if (body.html) payload.html = body.html;
    if (body.text) payload.text = body.text;
    if (body.replyTo) payload.reply_to = body.replyTo;
    if (body.tags) payload.tags = body.tags;

    const resendResponse = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json().catch(() => ({}));
      const status = resendResponse.status;

      if (status === 429) {
        return new Response(
          JSON.stringify({ error: 'RATE_LIMIT_EXCEEDED' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      if (status === 401 || status === 403) {
        return new Response(
          JSON.stringify({ error: 'RESEND_API_KEY_INVALID' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      console.error('[send-email] Resend error:', status, errorData);
      return new Response(
        JSON.stringify({ error: 'EMAIL_SEND_FAILED', details: errorData }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const data = await resendResponse.json();

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[send-email] Error:', err);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
