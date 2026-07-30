/**
 * Achievements System — логика проверки и начисления достижений.
 *
 * Проверяет статистику пользователя и выдаёт достижения
 * при достижении пороговых значений.
 */

import { supabase } from './supabase';

export interface Achievement {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  threshold: number;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievements?: Achievement;
}

export interface UserStats {
  user_id: string;
  total_uploads: number;
  total_votes_cast: number;
  total_comments: number;
  total_likes_given: number;
  total_points: number;
  level: number;
  streak_days: number;
  last_active_date: string | null;
}

/** Рarity-мультипликатор очков */
const RARITY_MULTIPLIER: Record<string, number> = {
  common: 1,
  rare: 2,
  epic: 3,
  legendary: 5,
};

/** Уровень по очкам: level = floor(points / 100) + 1 */
export function calculateLevel(points: number): number {
  return Math.floor(points / 100) + 1;
}

/** Получить все доступные достижения */
export async function getAllAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('category')
    .order('threshold');

  if (error) {
    console.warn('Failed to load achievements:', error);
    return [];
  }

  return data || [];
}

/** Получить достижения пользователя */
export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  const { data, error } = await supabase
    .from('user_achievements')
    .select('*, achievements(*)')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) {
    console.warn('Failed to load user achievements:', error);
    return [];
  }

  return data || [];
}

/** Получить статистику пользователя */
export async function getUserStats(userId: string): Promise<UserStats | null> {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.warn('Failed to load user stats:', error);
    return null;
  }

  return data;
}

/** Обновить статистику пользователя */
export async function updateUserStats(
  userId: string,
  updates: Partial<Pick<UserStats, 'total_uploads' | 'total_votes_cast' | 'total_comments' | 'total_likes_given'>>
): Promise<UserStats | null> {
  const current = await getUserStats(userId);

  if (!current) {
    // Создаём новую запись
    const newStats: Partial<UserStats> = {
      user_id: userId,
      total_uploads: updates.total_uploads ?? 0,
      total_votes_cast: updates.total_votes_cast ?? 0,
      total_comments: updates.total_comments ?? 0,
      total_likes_given: updates.total_likes_given ?? 0,
      total_points: 0,
      level: 1,
      streak_days: 1,
      last_active_date: new Date().toISOString().split('T')[0],
    };

    const { data, error } = await supabase
      .from('user_stats')
      .insert(newStats)
      .select()
      .single();

    if (error) {
      console.warn('Failed to create user stats:', error);
      return null;
    }
    return data;
  }

  // Обновляем существующую запись
  const merged = {
    total_uploads: updates.total_uploads ?? current.total_uploads,
    total_votes_cast: updates.total_votes_cast ?? current.total_votes_cast,
    total_comments: updates.total_comments ?? current.total_comments,
    total_likes_given: updates.total_likes_given ?? current.total_likes_given,
    last_active_date: new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('user_stats')
    .update(merged)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.warn('Failed to update user stats:', error);
    return null;
  }

  return data;
}

/** Проверить и выдать достижения */
export async function checkAndAwardAchievements(userId: string): Promise<Achievement[]> {
  const stats = await getUserStats(userId);
  if (!stats) return [];

  const allAchievements = await getAllAchievements();
  const userAchievements = await getUserAchievements(userId);
  const earnedSlugs = new Set(userAchievements.map((ua) => ua.achievements?.slug).filter(Boolean));

  const newlyEarned: Achievement[] = [];

  for (const achievement of allAchievements) {
    if (earnedSlugs.has(achievement.slug)) continue;

    let currentValue = 0;

    switch (achievement.category) {
      case 'upload':
        currentValue = stats.total_uploads;
        break;
      case 'vote':
        currentValue = stats.total_votes_cast;
        break;
      case 'social':
        currentValue = stats.total_comments;
        break;
      case 'collection':
        // Пока не реализовано — требует запроса к постам
        continue;
      case 'general':
        currentValue = stats.streak_days;
        break;
    }

    if (currentValue >= achievement.threshold) {
      // Выдаём достижение
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievement.id,
        });

      if (!error) {
        newlyEarned.push(achievement);

        // Начисляем очки
        const points = achievement.points * RARITY_MULTIPLIER[achievement.rarity] || achievement.points;
        await supabase
          .from('user_stats')
          .update({
            total_points: stats.total_points + points,
            level: calculateLevel(stats.total_points + points),
          })
          .eq('user_id', userId);
      }
    }
  }

  return newlyEarned;
}

/** Рассчитать стрик (серия активности) */
export function calculateStreak(lastActiveDate: string | null, currentStreak: number): number {
  if (!lastActiveDate) return 1;

  const last = new Date(lastActiveDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  last.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return currentStreak; // Уже активен сегодня
  if (diffDays === 1) return currentStreak + 1; // Вчера был активен
  return 1; // Серия прервана
}

/** Получить цвет по rarity */
export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common': return '#9CA3AF';
    case 'rare': return '#3B82F6';
    case 'epic': return '#A855F7';
    case 'legendary': return '#F59E0B';
    default: return '#9CA3AF';
  }
}

/** Получить фон по rarity */
export function getRarityBg(rarity: string): string {
  switch (rarity) {
    case 'common': return '#F3F4F6';
    case 'rare': return '#EFF6FF';
    case 'epic': return '#FAF5FF';
    case 'legendary': return '#FFFBEB';
    default: return '#F3F4F6';
  }
}