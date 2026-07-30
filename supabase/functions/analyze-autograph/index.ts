/**
 * Supabase Edge Function: analyze-autograph
 *
 * Анализирует изображение автографа:
 * 1. Распознает текст на изображении (OCR) через Google Vision API
 * 2. Ищет совпадения в таблице autograph_celebrity_signatures
 * 3. Возвращает предполагаемую знаменитость и уровень уверенности
 *
 * Запуск локально: supabase functions serve analyze-autograph
 * Деплой: supabase functions deploy analyze-autograph
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

interface AnalyzeRequest {
  imageBase64: string;
}

interface AnalyzeMatch {
  celebrity_name: string;
  category: string;
  score: number;
  reference_url: string | null;
}

interface AnalyzeResponse {
  success: boolean;
  suggestion?: string;
  confidence?: number;
  matches?: AnalyzeMatch[];
  error?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const GOOGLE_VISION_API_KEY = Deno.env.get('GOOGLE_VISION_API_KEY') || '';
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!GOOGLE_VISION_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'GOOGLE_VISION_API_KEY not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { imageBase64 }: AnalyzeRequest = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing imageBase64' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate image size: max 5MB (base64 ~1.37x binary size)
    const maxSize = 5 * 1024 * 1024 * 1.37; // ~7MB base64
    if (imageBase64.length > maxSize) {
      return new Response(
        JSON.stringify({ success: false, error: 'Image too large. Max 5MB.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate base64 format
    if (!/^[A-Za-z0-9+/=]+$/.test(imageBase64)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid image format. Expected base64.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Шаг 1: OCR через Google Vision API
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: { content: imageBase64 },
              features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
            },
          ],
        }),
      }
    );

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      throw new Error(`Google Vision API error: ${visionResponse.status} - ${errorText}`);
    }

    const visionData = await visionResponse.json();
    const detectedText = visionData.responses?.[0]?.textAnnotations?.[0]?.description || '';

    // Шаг 2: Ищем совпадения в базе
    let matches: AnalyzeMatch[] = [];

    if (detectedText && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Получаем всех знаменитостей из базы
      const { data: celebrities, error: dbError } = await supabase
        .from('autograph_celebrity_signatures')
        .select('celebrity_name, category, image_url, reference_url');

      if (!dbError && celebrities) {
        const searchText = detectedText.toLowerCase();

        // Ищем совпадения по имени в распознанном тексте
        for (const celeb of celebrities) {
          const celebLower = celeb.celebrity_name.toLowerCase();
          const nameParts = celebLower.split(' ');

          // Проверяем: содержит ли распознанный текст имя знаменитости
          const matchCount = nameParts.filter((part) =>
            part.length > 2 && searchText.includes(part)
          ).length;

          if (matchCount > 0) {
            const score = Math.round((matchCount / nameParts.length) * 100);
            matches.push({
              celebrity_name: celeb.celebrity_name,
              category: celeb.category,
              score,
              reference_url: celeb.reference_url,
            });
          }

          // Проверяем обратное: есть ли фамилия в тексте
          const lastName = nameParts[nameParts.length - 1];
          if (lastName && lastName.length > 2 && searchText.includes(lastName)) {
            const score = Math.min(90, Math.round((1 / nameParts.length) * 100) + 50);
            if (!matches.find((m) => m.celebrity_name === celeb.celebrity_name)) {
              matches.push({
                celebrity_name: celeb.celebrity_name,
                category: celeb.category,
                score,
                reference_url: celeb.reference_url,
              });
            }
          }
        }
      }
    }

    // Сортируем по score
    matches = matches.sort((a, b) => b.score - a.score).slice(0, 5);

    let suggestion: string | undefined;
    let confidence: number | undefined;

    if (matches.length > 0) {
      suggestion = matches[0].celebrity_name;
      confidence = matches[0].score;
    }

    const response: AnalyzeResponse = {
      success: true,
      suggestion,
      confidence,
      matches: matches.length > 0 ? matches : undefined,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});