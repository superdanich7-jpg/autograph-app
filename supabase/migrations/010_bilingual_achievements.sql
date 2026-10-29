-- Migration 010: двуязычные достижения (шаг 2 PLAN-100)
-- UI выбирает title/description по языку пользователя; fallback — RU.

ALTER TABLE achievements
    ADD COLUMN IF NOT EXISTS title_en text,
    ADD COLUMN IF NOT EXISTS description_en text;

UPDATE achievements SET title_en = 'Arbiter', description_en = 'Vote on 100 autographs' WHERE slug = 'hundred_votes';
UPDATE achievements SET title_en = 'Collector', description_en = 'Upload 5 autographs' WHERE slug = 'five_uploads';
UPDATE achievements SET title_en = 'Week Streak', description_en = 'Sign in 7 days in a row' WHERE slug = 'week_streak';
UPDATE achievements SET title_en = 'Autograph Hunter', description_en = 'Upload 10 autographs' WHERE slug = 'ten_uploads';
UPDATE achievements SET title_en = 'Autograph Legend', description_en = 'Upload 50 autographs' WHERE slug = 'fifty_uploads';
UPDATE achievements SET title_en = 'First Autograph', description_en = 'Upload your first autograph' WHERE slug = 'first_upload';
UPDATE achievements SET title_en = 'Movie Buff', description_en = 'Collect 10 movie autographs' WHERE slug = 'movie_buff';
UPDATE achievements SET title_en = 'Stay in Touch', description_en = 'Sign in 3 days in a row' WHERE slug = 'three_day_streak';
UPDATE achievements SET title_en = 'First Opinion', description_en = 'Vote on your first autograph' WHERE slug = 'first_vote';
UPDATE achievements SET title_en = 'Legendary Collector', description_en = 'Collect 3 legendary autographs' WHERE slug = 'legendary_collector';
UPDATE achievements SET title_en = 'Monthly Streak', description_en = 'Sign in 30 days in a row' WHERE slug = 'month_streak';
UPDATE achievements SET title_en = 'Reviewer', description_en = 'Leave 50 comments' WHERE slug = 'fifty_comments';
UPDATE achievements SET title_en = 'Expert Opinion', description_en = 'Leave your first comment' WHERE slug = 'first_comment';
UPDATE achievements SET title_en = 'Music Lover', description_en = 'Collect 10 music autographs' WHERE slug = 'music_lover';
UPDATE achievements SET title_en = 'Sports Expert', description_en = 'Collect 10 sports autographs' WHERE slug = 'sports_master';
