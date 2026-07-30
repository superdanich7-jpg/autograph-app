import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePosts } from '../../context/PostsContext';
import { useTheme } from '../../context/ThemeContext';
import { getRarityLabel } from '../../lib/helpers';

export default function CollectorProfileScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors } = useTheme();
    const { getCollectorById, profile, toggleFollowCollector } = usePosts();

    const collector = getCollectorById(id);

    if (!collector) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.missingWrap}>
                    <Text style={[styles.missingTitle, { color: colors.text }]}>Профиль не найден</Text>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: colors.primary }]}
                        onPress={() => router.back()}
                    >
                        <Text style={[styles.backButtonText, { color: colors.primaryText }]}>Назад</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const isFollowing = profile.following.includes(collector.id);

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView
                style={[styles.container, { backgroundColor: colors.background }]}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.topBar}>
                    <TouchableOpacity
                        style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={18} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
                        <Text style={styles.badge}>{collector.badge}</Text>
                    </View>
                    <Text style={[styles.name, { color: colors.text }]}>{collector.name}</Text>
                    <Text style={[styles.meta, { color: colors.textSecondary }]}>
                        {collector.specialty} • {collector.city}
                    </Text>
                    <Text style={[styles.bio, { color: colors.textSecondary }]}>{collector.bio}</Text>

                    <TouchableOpacity
                        style={[
                            styles.followButton,
                            { backgroundColor: isFollowing ? colors.surface : colors.primary, borderColor: colors.border },
                        ]}
                        onPress={() => toggleFollowCollector(collector.id)}
                    >
                        <Text style={[styles.followText, { color: isFollowing ? colors.text : colors.primaryText }]}>
                            {isFollowing ? 'Вы подписаны' : 'Подписаться'}
                        </Text>
                    </TouchableOpacity>

                    <View style={[styles.statsRow, { backgroundColor: colors.surface }]}>
                        <View style={styles.stat}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{collector.score}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Очков</Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <View style={styles.stat}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{collector.verifiedCount}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Проверено</Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <View style={styles.stat}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{collector.legendaryCount}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Легендарных</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Витрина коллекционера</Text>
                    {collector.showcase.map((item) => (
                        <View key={item.id} style={[styles.showcaseRow, { borderBottomColor: colors.border }]}>
                            <View style={[styles.showcaseIcon, { backgroundColor: colors.surface }]}>
                                <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.showcaseTitle, { color: colors.text }]}>{item.title}</Text>
                                <Text style={[styles.showcaseNote, { color: colors.textSecondary }]}>{item.note}</Text>
                                <Text style={[styles.showcaseMeta, { color: colors.textSecondary }]}>
                                    {getRarityLabel(item.rarity)}
                                </Text>
                            </View>
                            <Text style={[styles.showcaseScore, { color: colors.text }]}>{item.authenticity}%</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flex: 1 },
    content: {
        padding: 16,
        paddingBottom: 20,
    },
    topBar: {
        marginBottom: 12,
    },
    iconButton: {
        width: 42,
        height: 42,
        borderRadius: 14,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroCard: {
        borderWidth: 1,
        borderRadius: 24,
        padding: 20,
        alignItems: 'center',
        marginBottom: 14,
    },
    avatar: {
        width: 92,
        height: 92,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    badge: {
        fontSize: 34,
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
    },
    meta: {
        marginTop: 4,
        fontSize: 14,
    },
    bio: {
        marginTop: 10,
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
    },
    followButton: {
        marginTop: 16,
        minHeight: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 18,
        borderWidth: 1,
    },
    followText: {
        fontSize: 14,
        fontWeight: '700',
    },
    statsRow: {
        width: '100%',
        marginTop: 18,
        paddingVertical: 16,
        borderRadius: 18,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    stat: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    statLabel: {
        marginTop: 4,
        fontSize: 12,
    },
    divider: {
        width: 1,
        height: 34,
    },
    sectionCard: {
        borderWidth: 1,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 10,
    },
    showcaseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    showcaseIcon: {
        width: 40,
        height: 40,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    showcaseTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    showcaseNote: {
        marginTop: 2,
        fontSize: 12,
    },
    showcaseMeta: {
        marginTop: 4,
        fontSize: 12,
    },
    showcaseScore: {
        fontSize: 15,
        fontWeight: '700',
    },
    missingWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    missingTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 16,
    },
    backButton: {
        minHeight: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 18,
    },
    backButtonText: {
        fontSize: 14,
        fontWeight: '700',
    },
});
