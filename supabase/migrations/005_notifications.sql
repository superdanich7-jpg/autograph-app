-- ============================================================
-- Миграция 005: Система уведомлений
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,          -- 'new_vote', 'achievement', 'comment', 'system'
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB,                 -- Доп. данные (post_id, achievement_slug и т.д.)
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select" ON public.notifications
    FOR SELECT USING (true);

CREATE POLICY "notifications_insert" ON public.notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "notifications_update" ON public.notifications
    FOR UPDATE USING (true);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id) WHERE NOT read;