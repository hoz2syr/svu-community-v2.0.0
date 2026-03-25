/**
 * Supabase Edge Function — OCR Proxy
 * يحمي OCR_API_KEY من العميل عبر تمرير الطلبات عبر هذا الوسيط
 *
 * النشر:
 *   supabase functions deploy ocr-proxy --no-verify-jwt
 *   supabase secrets set OCR_API_KEY=your-key
 *
 * ⚠️ يجب النشر بـ --no-verify-jwt لأن OCR لا يحتاج تسجيل دخول
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const OCR_ENDPOINT = 'https://api.ocr.space/parse/image';

const ALLOWED_ORIGINS = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || ['http://localhost:3000'];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('OCR_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OCR_API_KEY_NOT_CONFIGURED' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { base64Image } = await req.json();

    if (!base64Image || typeof base64Image !== 'string' || base64Image.length < 100) {
      return new Response(
        JSON.stringify({ error: 'INVALID_IMAGE_DATA' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const formData = new FormData();
    formData.append('base64Image', base64Image);
    formData.append('apikey', apiKey);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2');

    const ocrResponse = await fetch(OCR_ENDPOINT, {
      method: 'POST',
      body: formData,
    });

    if (!ocrResponse.ok) {
      const status = ocrResponse.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: 'OCR_QUOTA_EXCEEDED' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      if (status === 403 || status === 401) {
        return new Response(
          JSON.stringify({ error: 'OCR_API_KEY_INVALID' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      return new Response(
        JSON.stringify({ error: `OCR_HTTP_ERROR: ${status}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const data = await ocrResponse.json();

    if (data.IsErroredOnProcessing) {
      return new Response(
        JSON.stringify({ error: `OCR_PROCESSING_ERROR: ${data.ErrorMessage || 'خطأ'}` }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!data.ParsedResults || data.ParsedResults.length === 0) {
      return new Response(
        JSON.stringify({ error: 'OCR_NO_TEXT' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    let fullText = '';
    data.ParsedResults.forEach((r: { ParsedText?: string }) => {
      if (r.ParsedText) fullText += r.ParsedText + '\n';
    });

    return new Response(
      JSON.stringify({ text: fullText.trim() }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (err) {
    console.error('[ocr-proxy] Error:', err);
    return new Response(
      JSON.stringify({ error: 'OCR_NETWORK_ERROR' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
