/**
 * Seed-соцданные для гостевого демо (R-12: извлечено из PostsContext).
 * Offline-first: при первом запуске (пока нет своего состояния в AsyncStorage)
 * показываем демо-друзей/заявки/переписку — все помечены isDemo (R-11).
 */

import { ChatMessage } from './chat';
import { Friend, FriendRequest } from './friends';

// Seed-друзья для гостевого режима (offline-first демо). Соцграф на базе
// сообщества коллекционеров. presence/lastSeen фиксированы для детерминизма тестов.
export const SEED_FRIENDS: Friend[] = [
    { id: 'arena-hunter', name: 'Arena Hunter', handle: 'arenahunter', avatar: '🥇', online: true, lastSeen: new Date().toISOString(), specialty: 'Спорт', mutualCount: 3, isDemo: true },
    { id: 'vinyl-girl', name: 'Vinyl Girl', handle: 'vinylgirl', avatar: '🎸', online: false, lastSeen: new Date(Date.now() - 12 * 60000).toISOString(), specialty: 'Музыка', mutualCount: 5, isDemo: true },
    { id: 'cinema-buff', name: 'Cinema Buff', handle: 'cinemabuff', avatar: '🎬', online: true, lastSeen: new Date().toISOString(), specialty: 'Кино', mutualCount: 2, isDemo: true },
    { id: 'rookie-sig', name: 'Rookie Sig', handle: 'rookiesig', avatar: '🌱', online: false, lastSeen: new Date(Date.now() - 3 * 3600000).toISOString(), specialty: 'Другое', mutualCount: 1, isDemo: true },
];

// Заявки в друзья для seed (чтобы были входящие и подтверждённые).
export const SEED_FRIEND_REQUESTS: FriendRequest[] = [
    { id: 'seed-req-1', fromId: 'vinyl-girl', toId: 'guest-user', createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), isDemo: true },
    { id: 'seed-req-2', fromId: 'guest-user', toId: 'cinema-buff', createdAt: new Date(Date.now() - 5 * 3600000).toISOString(), isDemo: true },
];

// Seed-переписка для демо (чтобы чат не был пустым при первом запуске).
export const SEED_MESSAGES: ChatMessage[] = [
    { id: 'seed-msg-1', fromId: 'arena-hunter', toId: 'guest-user', text: 'Привет! Видел твою коллекцию — огонь 🔥', timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), read: false, isDemo: true },
    { id: 'seed-msg-2', fromId: 'guest-user', toId: 'arena-hunter', text: 'Спасибо! Давно коллекционирую.', timestamp: new Date(Date.now() - 2.5 * 3600000).toISOString(), read: true, isDemo: true },
    { id: 'seed-msg-3', fromId: 'arena-hunter', toId: 'guest-user', text: 'Есть автограф Месси с финала ЛЧ?', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), read: false, isDemo: true },
];
