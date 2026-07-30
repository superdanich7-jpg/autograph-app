import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export type Notification = {
    id: string;
    type: 'new_vote' | 'achievement' | 'comment' | 'system';
    title: string;
    body: string;
    read: boolean;
    created_at: string;
};

type Props = {
    notifications: Notification[];
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'только что';
    if (mins < 60) return `${mins} мин. назад`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} ч. назад`;
    const days = Math.floor(hrs / 24);
    return `${days} дн. назад`;
}

const ICON_MAP: Record<Notification['type'], { name: keyof typeof Ionicons.glyphMap; color: string }> = {
    new_vote: { name: 'checkmark-circle', color: '#34D399' },
    achievement: { name: 'trophy', color: '#FBBF24' },
    comment: { name: 'chatbubble-ellipses', color: '#60A5FA' },
    system: { name: 'information-circle', color: '#A78BFA' },
};

export default function NotificationsList({ notifications }: Props) {
    const { colors } = useTheme();

    if (notifications.length === 0) {
        return (
            <View style={[styles.empty, { backgroundColor: colors.card }]}>
                <Ionicons name="notifications-off-outline" size={40} color={colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Нет уведомлений</Text>
                <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
                    Здесь будут новости о голосах за ваши автографы и достижения.
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
                const icon = ICON_MAP[item.type] || ICON_MAP.system;
                return (
                    <View
                        style={[
                            styles.row,
                            {
                                backgroundColor: item.read ? colors.surface : colors.card,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <View style={[styles.iconWrap, { backgroundColor: icon.color + '22' }]}>
                            <Ionicons name={icon.name} size={20} color={icon.color} />
                        </View>
                        <View style={styles.textWrap}>
                            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                                {item.title}
                            </Text>
                            <Text style={[styles.body, { color: colors.textSecondary }]} numberOfLines={2}>
                                {item.body}
                            </Text>
                            <Text style={[styles.time, { color: colors.placeholder }]}>
                                {timeAgo(item.created_at)}
                            </Text>
                        </View>
                        {!item.read && (
                            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                        )}
                    </View>
                );
            }}
        />
    );
}

const styles = StyleSheet.create({
    list: {
        padding: 16,
        gap: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 1,
        padding: 12,
        gap: 12,
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textWrap: {
        flex: 1,
        gap: 2,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
    },
    body: {
        fontSize: 13,
        lineHeight: 18,
    },
    time: {
        fontSize: 11,
        marginTop: 2,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    empty: {
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        gap: 10,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    emptyBody: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
});