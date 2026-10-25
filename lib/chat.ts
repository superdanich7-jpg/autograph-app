/**
 * Chat — личные сообщения (DM) между коллекционерами.
 *
 * CEO-запрос (Фаза 3). Рисерч соцсетей 2026: DM = ядро «core loop» (React →
 * Notify → Return). Justinmind/GenDesigns: пузыри сообщений, timestamps,
 * presence, read receipts, группировка по дням.
 *
 * Здесь — ЧИСТАЯ модель и логика (тестируемо, без нативных зависимостей).
 * Персистентность: offline-first через PostsContext, опциональный Supabase
 * (см. supabase/migrations/009_chat.sql).
 */

export interface ChatMessage {
  id: string;
  /** id отправителя. */
  fromId: string;
  toId: string;
  text: string;
  /** ISO-время отправки. */
  timestamp: string;
  /** Прочитано получателем. */
  read: boolean;
  /** Демо-сообщение из сида (R-11). */
  isDemo?: boolean;
}

export interface Conversation {
  /** Детерминированный id пары (отсортирован) — 1 диалог на пару участников. */
  id: string;
  /** id собеседника (не текущий юзер). */
  peerId: string;
  /** Имя собеседника (кэш для списка). */
  peerName: string;
  peerAvatar: string;
  /** Последнее сообщение (для превью в списке). */
  lastMessage?: ChatMessage;
  /** Кол-во непрочитанных входящих. */
  unreadCount: number;
}

/** Детерминированный id диалога для пары участников (симметричный). */
export function getConversationId(userA: string, userB: string): string {
  return [userA, userB].sort().join('__');
}

/** Валидация текста сообщения. */
export function validateMessageText(text: unknown): { valid: boolean; error?: string } {
  const t = typeof text === 'string' ? text.trim() : '';
  if (!t) return { valid: false, error: 'Введите сообщение' };
  if (t.length > 1000) return { valid: false, error: 'Сообщение слишком длинное (макс. 1000)' };
  return { valid: true };
}

/** Создаёт сообщение. */
export function createMessage(
  input: { fromId: string; toId: string; text: string; read?: boolean },
  id: string,
  now: string = new Date().toISOString()
): ChatMessage {
  return {
    id,
    fromId: input.fromId,
    toId: input.toId,
    text: input.text.trim(),
    timestamp: now,
    read: input.read ?? false,
  };
}

/** Добавляет сообщение в лог (иммутабельно). */
export function appendMessage(messages: ChatMessage[], message: ChatMessage): ChatMessage[] {
  return [...messages, message];
}

/** Сообщения диалога между двумя юзерами, отсортированные по времени. */
export function getThread(messages: ChatMessage[], userA: string, userB: string): ChatMessage[] {
  return messages
    .filter(
      (m) =>
        (m.fromId === userA && m.toId === userB) || (m.fromId === userB && m.toId === userA)
    )
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

/** Кол-во непрочитанных входящих для юзера от собеседника. */
export function getUnreadCount(messages: ChatMessage[], userId: string, peerId: string): number {
  return messages.filter((m) => m.fromId === peerId && m.toId === userId && !m.read).length;
}

/** Помечает входящие от peer как прочитанные. */
export function markThreadRead(messages: ChatMessage[], userId: string, peerId: string): ChatMessage[] {
  return messages.map((m) =>
    m.fromId === peerId && m.toId === userId && !m.read ? { ...m, read: true } : m
  );
}

/** Строка-«день» для группировки (YYYY-MM-DD) по локальной дате. */
export function dayKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export interface MessageGroup {
  key: string;
  label: string;
  messages: ChatMessage[];
}

/** Человекочитаемая метка дня: Сегодня / Вчера / дата. */
export function formatDayLabel(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const today = dayKey(now.toISOString());
  const yesterday = dayKey(new Date(now.getTime() - 86400000).toISOString());
  const key = dayKey(iso);
  if (key === today) return 'Сегодня';
  if (key === yesterday) return 'Вчера';
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

/** Время сообщения HH:MM. */
export function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

/** Группирует поток по дням (сохраняя порядок), для рендера секциями. */
export function groupByDay(messages: ChatMessage[]): MessageGroup[] {
  const groups: MessageGroup[] = [];
  for (const m of messages) {
    const key = dayKey(m.timestamp);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.messages.push(m);
    } else {
      groups.push({ key, label: formatDayLabel(m.timestamp), messages: [m] });
    }
  }
  return groups;
}

/** Строит список диалогов (Conversation) для юзера из лога и справочника друзей. */
export function buildConversations(
  messages: ChatMessage[],
  userId: string,
  peers: { id: string; name: string; avatar: string }[]
): Conversation[] {
  return peers
    .map((peer) => {
      const thread = getThread(messages, userId, peer.id);
      const lastMessage = thread[thread.length - 1];
      return {
        id: getConversationId(userId, peer.id),
        peerId: peer.id,
        peerName: peer.name,
        peerAvatar: peer.avatar,
        lastMessage,
        unreadCount: getUnreadCount(messages, userId, peer.id),
      } as Conversation;
    })
    .filter((c) => c.lastMessage) // показываем только диалоги с сообщениями
    .sort((a, b) => {
      const at = new Date(a.lastMessage!.timestamp).getTime();
      const bt = new Date(b.lastMessage!.timestamp).getTime();
      return bt - at;
    });
}

