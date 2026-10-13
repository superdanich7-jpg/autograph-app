import {
  appendMessage,
  buildConversations,
  createMessage,
  dayKey,
  formatDayLabel,
  getConversationId,
  getThread,
  getUnreadCount,
  groupByDay,
  markThreadRead,
  validateMessageText,
  type ChatMessage,
} from '../chat';

describe('chat', () => {
  const NOW = '2026-10-14T12:00:00.000Z';
  const msg = (from: string, to: string, text: string, ts: string, read = false): ChatMessage => ({
    id: `m-${from}-${to}-${ts}`,
    fromId: from,
    toId: to,
    text,
    timestamp: ts,
    read,
  });

  describe('getConversationId', () => {
    it('is symmetric', () => {
      expect(getConversationId('a', 'b')).toBe(getConversationId('b', 'a'));
      expect(getConversationId('a', 'b')).toBe('a__b');
    });
  });

  describe('validateMessageText', () => {
    it('accepts text', () => {
      expect(validateMessageText('привет')).toEqual({ valid: true });
    });
    it('rejects empty', () => {
      expect(validateMessageText('   ').error).toBe('Введите сообщение');
    });
    it('rejects too long', () => {
      expect(validateMessageText('x'.repeat(1001)).valid).toBe(false);
    });
  });

  describe('createMessage + appendMessage', () => {
    it('trims text and defaults read=false', () => {
      const m = createMessage({ fromId: 'a', toId: 'b', text: '  hi  ' }, 'm1', NOW);
      expect(m.text).toBe('hi');
      expect(m.read).toBe(false);
    });
    it('appends immutably', () => {
      const base = [createMessage({ fromId: 'a', toId: 'b', text: 'x' }, 'm1', NOW)];
      const next = appendMessage(base, createMessage({ fromId: 'b', toId: 'a', text: 'y' }, 'm2', NOW));
      expect(base).toHaveLength(1);
      expect(next).toHaveLength(2);
    });
  });

  describe('getThread', () => {
    it('returns both directions sorted by time', () => {
      const messages = [
        msg('b', 'a', 'later', '2026-10-14T12:05:00Z'),
        msg('a', 'b', 'earlier', '2026-10-14T12:00:00Z'),
        msg('c', 'a', 'other', '2026-10-14T12:02:00Z'),
      ];
      const thread = getThread(messages, 'a', 'b');
      expect(thread.map((m) => m.text)).toEqual(['earlier', 'later']);
    });
  });

  describe('unread + markRead', () => {
    it('counts incoming unread', () => {
      const messages = [
        msg('b', 'a', 'x', NOW),
        msg('b', 'a', 'y', NOW),
        msg('a', 'b', 'z', NOW),
      ];
      expect(getUnreadCount(messages, 'a', 'b')).toBe(2);
    });
    it('markThreadRead clears incoming unread', () => {
      const messages = [msg('b', 'a', 'x', NOW)];
      const after = markThreadRead(messages, 'a', 'b');
      expect(getUnreadCount(after, 'a', 'b')).toBe(0);
    });
  });

  describe('day grouping', () => {
    it('dayKey formats YYYY-MM-DD', () => {
      expect(dayKey(NOW)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
    it('formatDayLabel today/yesterday', () => {
      const now = new Date('2026-10-14T12:00:00Z');
      expect(formatDayLabel('2026-10-14T09:00:00Z', now)).toBe('Сегодня');
      expect(formatDayLabel('2026-10-13T09:00:00Z', now)).toBe('Вчера');
    });
    it('groupByDay splits into day sections', () => {
      const messages = [
        msg('b', 'a', 'z', '2026-10-13T11:00:00Z'),
        msg('a', 'b', 'x', '2026-10-14T10:00:00Z'),
        msg('a', 'b', 'y', '2026-10-14T11:00:00Z'),
      ];
      const groups = groupByDay(messages);
      expect(groups).toHaveLength(2);
      expect(groups[0].messages).toHaveLength(1); // 13-е
      expect(groups[1].messages).toHaveLength(2); // 14-е
    });
  });

  describe('buildConversations', () => {
    it('builds sorted list with last message and unread, skips empty', () => {
      const peers = [
        { id: 'b', name: 'Bob', avatar: '👤' },
        { id: 'c', name: 'Cat', avatar: '🐱' }, // no messages -> skipped
      ];
      const messages = [
        msg('b', 'a', 'old', '2026-10-14T10:00:00Z'),
        msg('b', 'a', 'new', '2026-10-14T12:00:00Z'),
        msg('b', 'a', 'unread', '2026-10-14T12:30:00Z'),
      ];
      const convs = buildConversations(messages, 'a', peers);
      expect(convs).toHaveLength(1);
      expect(convs[0].peerName).toBe('Bob');
      expect(convs[0].lastMessage?.text).toBe('unread');
      expect(convs[0].unreadCount).toBe(3);
    });
  });
});
