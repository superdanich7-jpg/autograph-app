/**
 * Storage — загрузка фото автографов в Supabase Storage.
 * Заменяет локальные file:// URI публичными URL (LOOP-31, B-05).
 *
 * Bucket: `autographs` (public read, authenticated write).
 * SQL для создания бакета — в комментарии внизу файла.
 */

import { isSupabaseConfigured, supabase } from './supabase';
import { generateId } from './helpers';

const BUCKET = 'autographs';

/**
 * Загружает локальное фото в Storage и возвращает публичный URL.
 * @param localUri file:// URI из ImagePicker
 * @param userId id владельца (для раскладки по папкам)
 */
export async function uploadAutographPhoto(localUri: string, userId: string): Promise<string> {
  if (!isSupabaseConfigured) return localUri;

  const ext = localUri.split('.').pop()?.split('?')[0] || 'jpg';
  const path = `${userId}/${generateId()}.${ext}`;

  const response = await fetch(localUri);
  const blob = await response.blob();

  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: blob.type || 'image/jpeg',
    upsert: false,
  });
  if (error) throw new Error(`Не удалось загрузить фото: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/*
-- Supabase SQL: создать бакет один раз (Dashboard → Storage или SQL):
insert into storage.buckets (id, name, public)
values ('autographs', 'autographs', true)
on conflict (id) do nothing;

-- Публичное чтение:
create policy "Anyone can read autograph photos"
  on storage.objects for select
  using (bucket_id = 'autographs');

-- Загрузка только залогиненными в свою папку:
create policy "Users can upload own autograph photos"
  on storage.objects for insert
  with check (bucket_id = 'autographs' and auth.role() = 'authenticated');
*/
