/**
 * Supabase Edge Function: analyze-autograph (v2, zero-dependency)
 *
 * Анализирует изображение автографа:
 * 1. Распознает текст (OCR) через Google Vision API
 * 2. Ищет совпадения в таблице autograph_celebrity_signatures (PostgREST)
 * 3. Возвращает предполагаемую знаменитость и уровень уверенности
 *
 * v2 (2026-10-25): Deno.serve + ноль внешних импортов (deno.land/esm.sh убраны —
 * вызывали BOOT_ERROR на свежем runtime). Контракт ответов сохранён 1:1.
 *
 * Секреты (Dashboard -> Edge Functions -> Secrets или Management API):
 *   GOOGLE_VISION_API_KEY  — ключ Google Cloud Vision (обязателен для OCR)
 *   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — инжектятся платформой автоматически
 *   ALLOWED_ORIGIN         — необязательный CORS-origin (по умолчанию *)
 */

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

function json(body: AnalyzeResponse, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const GOOGLE_VISION_API_KEY = Deno.env.get('GOOGLE_VISION_API_KEY') || '';
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!GOOGLE_VISION_API_KEY) {
      return json({ success: false, error: 'GOOGLE_VISION_API_KEY not configured' }, 400);
    }

    const { imageBase64 }: AnalyzeRequest = await req.json();

    if (!imageBase64) {
      return json({ success: false, error: 'Missing imageBase64' }, 400);
    }

    // Validate image size: max 5MB (base64 ~1.37x binary size)
    const maxSize = 5 * 1024 * 1024 * 1.37; // ~7MB base64
    if (imageBase64.length > maxSize) {
      return json({ success: false, error: 'Image too large. Max 5MB.' }, 400);
    }

    // Validate base64 format
    if (!/^[A-Za-z0-9+/=]+$/.test(imageBase64)) {
      return json({ success: false, error: 'Invalid image format. Expected base64.' }, 400);
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
    const detectedText: string = visionData.responses?.[0]?.textAnnotations?.[0]?.description || '';

    // Шаг 2: Ищем совпадения в базе (PostgREST без SDK)
    let matches: AnalyzeMatch[] = [];

    if (detectedText && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const dbRes = await fetch(
        `${SUPABASE_URL}/rest/v1/autograph_celebrity_signatures?select=celebrity_name,category,reference_url`,
        { headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } }
      );

      if (dbRes.ok) {
        const celebrities: Array<{ celebrity_name: string; category: string; reference_url: string | null }> =
          await dbRes.json();
        const searchText = detectedText.toLowerCase();

        // Ищем совпадения по имени в распознанном тексте
        for (const celeb of celebrities) {
          const celebLower = celeb.celebrity_name.toLowerCase();
          const nameParts = celebLower.split(' ');

          // Проверяем: содержит ли распознанный текст имя знаменитости
          const matchCount = nameParts.filter((part) => part.length > 2 && searchText.includes(part)).length;

          if (matchCount > 0) {
            const score = Math.round((matchCount / nameParts.length) * 100);
            matches.push({
              celebrity_name: celeb.celebrity_name,
              category: celeb.category,
              score,
              reference_url: celeb.reference_url ?? null,
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
                reference_url: celeb.reference_url ?? null,
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

    return json({
      success: true,
      suggestion,
      confidence,
      matches: matches.length > 0 ? matches : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return json({ success: false, error: message }, 500);
  }
});
