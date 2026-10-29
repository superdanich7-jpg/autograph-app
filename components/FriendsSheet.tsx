/**
 * FriendsSheet — система друзей: список, заявки, предложения.
 * Тренды соцсетей 2026: presence (онлайн-точка), mutual friends, suggestions.
 * Дизайн-система Ink&Gold + bottom-sheet.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { usePosts } from '../context/PostsContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { hapticLight } from '../lib/haptics';
import { formatPresence, suggestFriends, type Friend } from '../lib/friends';
import { radii, spacing, typography } from '../lib/theme';
import { PressableScale } from './ui/primitives';
import { Sheet } from './ui/Sheet';

type TabKey = 'friends' | 'requests' | 'suggested';

type Colors = ReturnType<typeof useTheme>['colors'];

function PresenceDot({ online, colors }: { online: boolean; colors: Colors }) {
  return (
    <View
      style={[
        styles.presenceDot,
        { backgroundColor: online ? colors.success : colors.textTertiary, borderColor: colors.card },
      ]}
    />
  );
}

function FriendRow({
  friend,
  colors,
  onMessage,
  action,
  presence = true,
}: {
  friend: Friend;
  colors: Colors;
  onMessage?: () => void;
  action?: React.ReactNode;
  presence?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.avatarWrap}>
        <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
          <Text style={styles.avatarEmoji}>{friend.avatar}</Text>
        </View>
        {presence ? <PresenceDot online={friend.online} colors={colors} /> : null}
      </View>
      <View style={styles.rowBody}>
        <View style={styles.nameRow}>
          <Text style={[typography.bodyMedium, { color: colors.text, fontWeight: '700' }]} numberOfLines={1}>
            {friend.name}
          </Text>
          {friend.isDemo ? (
            <View style={[styles.demoBadge, { backgroundColor: colors.accentLight }]}>
              <Text style={[typography.labelSmall, { color: colors.accent, fontSize: 9, letterSpacing: 0.4 }]}>{t('friendsDemo')}</Text>
            </View>
          ) : null}
        </View>
        <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
          @{friend.handle}
          {friend.specialty ? ` • ${friend.specialty}` : ''}
          {presence ? ` • ${formatPresence(friend)}` : ''}
          {typeof friend.mutualCount === 'number' && friend.mutualCount > 0 ? t('friendsMutualShort', { n: friend.mutualCount }) : ''}
        </Text>
      </View>
      {onMessage ? (
        <TouchableOpacity
          onPress={() => {
            hapticLight();
            onMessage();
          }}
          style={[styles.msgBtn, { backgroundColor: colors.accentLight }]}
          accessibilityRole="button"
          accessibilityLabel={`Написать ${friend.name}`}
        >
          <Ionicons name="chatbubble-ellipses" size={18} color={colors.accent} />
        </TouchableOpacity>
      ) : null}
      {action}
    </View>
  );
}

export default function FriendsSheet({
  visible,
  onClose,
  onOpenChat,
}: {
  visible: boolean;
  onClose: () => void;
  onOpenChat?: (friendId: string, friendName: string) => void;
}) {
  const { colors } = useTheme();
    const { t } = useLanguage();
  const {
    friends,
    friendList,
    incomingFriendRequests,
    getFriendById,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    currentUserId,
    canInteract,
  } = usePosts();
  const [tab, setTab] = useState<TabKey>('friends');

  const suggested = useMemo(() => suggestFriends(friends, [], currentUserId, 10), [friends, currentUserId]);

  const renderRemoveAction = (friendId: string) => (
    <TouchableOpacity
      onPress={() => {
        hapticLight();
        removeFriend(friendId);
      }}
      style={[styles.iconBtn, { backgroundColor: colors.surface }]}
      accessibilityRole="button"
      accessibilityLabel={t('friendsRemove')}
    >
      <Ionicons name="person-remove-outline" size={18} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'friends', label: t('rowFriends') },
    { key: 'requests', label: t('friendsRequests') },
    { key: 'suggested', label: t('friendsForYou') },
  ];

  return (
    <Sheet visible={visible} onClose={onClose} title={t('rowFriends')} subtitle={t('friendsConnected')} size="full">
      <View style={[styles.tabs, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {TABS.map((tabItem) => {
          const active = tab === tabItem.key;
          const badge = tabItem.key === 'requests' ? incomingFriendRequests.length : 0;
          return (
            <TouchableOpacity
              key={tabItem.key}
              onPress={() => {
                hapticLight();
                setTab(tabItem.key);
              }}
              style={[styles.tab, active && { backgroundColor: colors.card }]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Text style={[typography.bodySmall, { color: active ? colors.text : colors.textSecondary, fontWeight: active ? '700' : '500' }]}>
                {tabItem.label}
              </Text>
              {badge > 0 ? (
                <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                  <Text style={[typography.labelSmall, { color: colors.primaryText }]}>{badge}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {tab === 'friends' ? (
        <FlatList
          data={friendList}
          keyExtractor={(f) => f.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <FriendRow
              friend={item}
              colors={colors}
              onMessage={canInteract ? () => onOpenChat?.(item.id, item.name) : undefined}
              action={renderRemoveAction(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={40} color={colors.textTertiary} />
              <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
                Пока нет друзей. Добавьте кого-нибудь из раздела «Для вас».
              </Text>
            </View>
          }
        />
      ) : null}

      {tab === 'requests' ? (
        <FlatList
          data={incomingFriendRequests}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const friend = getFriendById(item.fromId);
            if (!friend) return null;
            return (
              <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
                  <Text style={styles.avatarEmoji}>{friend.avatar}</Text>
                </View>
                <View style={styles.rowBody}>
                  <Text style={[typography.bodyMedium, { color: colors.text, fontWeight: '700' }]} numberOfLines={1}>
                    {friend.name}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
                    хочет добавить вас в друзья
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    hapticLight();
                    acceptFriendRequest(item.fromId);
                  }}
                  style={[styles.acceptBtn, { backgroundColor: colors.primary }]}
                  accessibilityRole="button"
                  accessibilityLabel={t('friendsAccept')}
                >
                  <Ionicons name="checkmark" size={18} color={colors.primaryText} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    hapticLight();
                    declineFriendRequest(item.fromId);
                  }}
                  style={[styles.iconBtn, { backgroundColor: colors.surface }]}
                  accessibilityRole="button"
                  accessibilityLabel={t('friendsDecline')}
                >
                  <Ionicons name="close" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="mail-outline" size={40} color={colors.textTertiary} />
              <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
                Нет новых заявок в друзья.
              </Text>
            </View>
          }
        />
      ) : null}

      {tab === 'suggested' ? (
        <FlatList
          data={suggested}
          keyExtractor={(f) => f.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <FriendRow
              friend={item}
              colors={colors}
              presence={false}
              action={
                <PressableScale onPress={() => canInteract && sendFriendRequest(item.id)} accessibilityLabel={t('friendsAdd')}>
                  <View style={[styles.addBtn, { backgroundColor: colors.accentLight }]}>
                    <Ionicons name="person-add" size={18} color={colors.accent} />
                  </View>
                </PressableScale>
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="sparkles-outline" size={40} color={colors.textTertiary} />
              <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
                Все возможные знакомства уже добавлены.
              </Text>
            </View>
          }
        />
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  demoBadge: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.xs + 1,
    paddingVertical: 1,
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: radii.full,
    borderWidth: 1,
    padding: spacing.xs,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 44,
    borderRadius: radii.full,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  presenceDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  msgBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
});
