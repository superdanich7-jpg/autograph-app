/**
 * Ещё — дом для второстепенных функций профиля (R-09, F-15).
 * Профиль разгружен до hero + витрины + коллекции; всё остальное
 * (соц-функции, инструменты, статистика, достижения) живёт здесь.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import AchievementsSection from '../components/AchievementsSection';
import AdvancedSearch from '../components/AdvancedSearch';
import ExportCollection from '../components/ExportCollection';
import ImportCollection from '../components/ImportCollection';
import ShareStatsCard from '../components/ShareStatsCard';
import CollectionsList from '../components/CollectionsList';
import CommunitiesList from '../components/CommunitiesList';
import FriendsSheet from '../components/FriendsSheet';
import ProfileModal from '../components/ProfileModal';
import ProfilePostModal from '../components/ProfilePostModal';
import { Post, usePosts } from '../context/PostsContext';
import { useTheme } from '../context/ThemeContext';
import { hapticLight } from '../lib/haptics';
import { radii, spacing, typography } from '../lib/theme';

type Row = {
    key: string;
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    onPress: () => void;
};

export default function MoreScreen() {
    const { colors } = useTheme();
    const { posts, authUserEmail } = usePosts();
    const router = useRouter();

    const [collectionsVisible, setCollectionsVisible] = useState(false);
    const [communitiesVisible, setCommunitiesVisible] = useState(false);
    const [friendsVisible, setFriendsVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    const socialRows: Row[] = [
        {
            key: 'friends',
            icon: 'person-add-outline',
            title: 'Друзья',
            subtitle: 'Заявки, Presence, «Для вас»',
            onPress: () => setFriendsVisible(true),
        },
        {
            key: 'chat',
            icon: 'chatbubbles-outline',
            title: 'Сообщения',
            subtitle: 'Личные диалоги коллекционеров',
            onPress: () => {
                hapticLight();
                router.push('/chat');
            },
        },
        {
            key: 'communities',
            icon: 'people-outline',
            title: 'Сообщества',
            subtitle: 'Публичные и приватные клубы',
            onPress: () => setCommunitiesVisible(true),
        },
        {
            key: 'collections',
            icon: 'albums-outline',
            title: 'Подборки',
            subtitle: 'Тематические коллекции постов',
            onPress: () => setCollectionsVisible(true),
        },
    ];

    const renderRow = (row: Row) => (
        <TouchableOpacity
            key={row.key}
            style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={row.onPress}
            accessibilityRole="button"
            accessibilityLabel={row.title}
        >
            <View style={[styles.rowIcon, { backgroundColor: colors.surface }]}>
                <Ionicons name={row.icon} size={20} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[typography.bodyMedium, { color: colors.text, fontWeight: '700' }]}>{row.title}</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>{row.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
    );

    const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <View style={styles.section}>
            <Text style={[typography.label, { color: colors.textTertiary }]}>{title}</Text>
            {children}
        </View>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Назад"
                >
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[typography.h2, { color: colors.text }]}>Ещё</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Section title="Сообщество">
                    {socialRows.map(renderRow)}
                </Section>

                <Section title="Коллекция">
                    <ShareStatsCard />
                    <AchievementsSection userId={authUserEmail || 'guest'} />
                </Section>

                <Section title="Инструменты">
                    <AdvancedSearch posts={posts} onPostPress={(p) => setSelectedPost(p)} />
                    <ExportCollection />
                    <ImportCollection />
                </Section>
            </ScrollView>

            <CollectionsList visible={collectionsVisible} onClose={() => setCollectionsVisible(false)} />
            <CommunitiesList visible={communitiesVisible} onClose={() => setCommunitiesVisible(false)} />
            <FriendsSheet
                visible={friendsVisible}
                onClose={() => setFriendsVisible(false)}
                onOpenChat={() => {
                    setFriendsVisible(false);
                    router.push('/chat');
                }}
            />
            <ProfileModal visible={Boolean(selectedPost)} title={selectedPost?.celebrityName || 'Автограф'} colors={colors} onClose={() => setSelectedPost(null)}>
                <ProfilePostModal post={selectedPost} colors={colors} onClose={() => setSelectedPost(null)} />
            </ProfileModal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flex: 1 },
    content: { padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
    },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    section: { gap: spacing.sm },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        borderWidth: 1,
        borderRadius: radii.lg,
        padding: spacing.md,
    },
    rowIcon: {
        width: 40,
        height: 40,
        borderRadius: radii.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
