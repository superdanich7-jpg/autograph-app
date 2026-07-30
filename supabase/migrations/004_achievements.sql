-- ============================================================
-- Миграция 004: Система достижений (Achievements & Badges)
-- ============================================================

-- Таблица доступных достижений
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '🏆',
    category TEXT NOT NULL DEFAULT 'general',
    threshold INTEGER NOT NULL DEFAULT 1,
    points INTEGER NOT NULL DEFAULT 10,
    rarity TEXT NOT NULL DEFAULT 'common',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Связь пользователей с достижениями
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Таблица статистики пользователей (для быстрых запросов)
CREATE TABLE IF NOT EXISTS public.user_stats (
    user_id TEXT PRIMARY KEY,
    total_uploads INTEGER NOT NULL DEFAULT 0,
    total_votes_cast INTEGER NOT NULL DEFAULT 0,
    total_comments INTEGER NOT NULL DEFAULT 0,
    total_likes_given INTEGER NOT NULL DEFAULT 0,
    total_points INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    streak_days INTEGER NOT NULL DEFAULT 0,
    last_active_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Достижения видны всем
CREATE POLICY "achievements_select" ON public.achievements FOR SELECT USING (true);

-- User achievements — чтение всем, запись через service role
CREATE POLICY "user_achievements_select" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "user_achievements_insert" ON public.user_achievements FOR INSERT WITH CHECK (true);

-- User stats — чтение всем, запись через service role
CREATE POLICY "user_stats_select" ON public.user_stats FOR SELECT USING (true);
CREATE POLICY "user_stats_upsert" ON public.user_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "user_stats_update" ON public.user_stats FOR UPDATE USING (true);

-- Наполняем достижения
INSERT INTO public.achievements (slug, title, description, icon, category, threshold, points, rarity) VALUES
-- Загрузки
('first_upload', 'Первый автограф', 'Загрузите свой первый автограф', '📝', 'upload', 1, 10, 'common'),
('five_uploads', 'Коллекционер', 'Загрузите 5 автографов', '📚', 'upload', 5, 50, 'rare'),
('ten_uploads', 'Охотник за автографами', 'Загрузите 10 автографов', '🎯', 'upload', 10, 100, 'epic'),
('fifty_uploads', 'Легенда автографов', 'Загрузите 50 автографов', '👑', 'upload', 50, 500, 'legendary'),
-- Голоса
('first_vote', 'Первое мнение', 'Проголосуйте за первый автограф', '🗳️', 'vote', 1, 5, 'common'),
('hundred_votes', 'Арбитр', 'Проголосуйте за 100 автографов', '⚖️', 'vote', 100, 200, 'epic'),
-- Комментарии
('first_comment', 'Мнение эксперта', 'Оставьте первый комментарий', '💬', 'social', 1, 5, 'common'),
('fifty_comments', 'Обозреватель', 'Оставьте 50 комментариев', '📰', 'social', 50, 150, 'rare'),
-- Коллекция
('legendary_collector', 'Легендарный коллекционер', 'Соберите 3 легендарных автографа', '🌟', 'collection', 3, 300, 'legendary'),
('sports_master', 'Спортивный эксперт', 'Соберите 10 спортивных автографов', '⚽', 'collection', 10, 200, 'rare'),
('music_lover', 'Меломан', 'Соберите 10 музыкальных автографов', '🎵', 'collection', 10, 200, 'rare'),
('movie_buff', 'Киноман', 'Соберите 10 автографов из кино', '🎬', 'collection', 10, 200, 'rare'),
-- Серия
('three_day_streak', 'На связи', 'Заходите 3 дня подряд', '🔥', 'general', 3, 30, 'common'),
('week_streak', 'Неделя без перерыва', 'Заходите 7 дней подряд', '💪', 'general', 7, 100, 'rare'),
('month_streak', 'Месячная серия', 'Заходите 30 дней подряд', '🏆', 'general', 30, 500, 'legendary');

-- Индексы
CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON public.user_achievements(achievement_id);