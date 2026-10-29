import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Post, usePosts, getReputation } from '../../context/PostsContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getAuthenticityPercent, getRarityLabel } from '../../lib/helpers';
import { categoryLabel } from '../../lib/i18n';
import { getDayStreak } from '../../lib/stats-share';
import { scheduleStreakReminderIfNeeded } from '../../lib/streak-reminder';
import { radii, shadows } from '../../lib/theme';

import ProfileModal from '../../components/ProfileModal';
import ProfilePostModal from '../../components/ProfilePostModal';
import AuthGate from '../../components/AuthGate';

export default function ProfileScreen() {
    const {
        posts,
            profile,
        currentUserId,
        isAuthenticated,
        authUserEmail,
        syncStatus,
        syncError,
        lastSyncedAt,
        updateProfile,
        setNotificationsEnabled,
        clearPosts,
        signOut,
        } = usePosts();
    const { colors, toggleTheme, theme } = useTheme();
    const { t, lang, setLang } = useLanguage();
    const router = useRouter();

    const [editVisible, setEditVisible] = useState(false);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [draftName, setDraftName] = useState(profile.name);
    const [draftBio, setDraftBio] = useState(profile.bio);

    // Профиль показывает только СВОИ посты: до фикса сюда попадали демо-сиды
    // и чужие карточки из общей ленты — гостю «витрина» была заполнена чужим.
    const myPosts = useMemo(
        () => posts.filter((post) => post.ownerId === currentUserId),
        [posts, currentUserId],
    );

    // Репутация в контексте — «участие» (влияет на вес голоса по всей ленте).
    // В герое показываем доверие, заработанное своими постами.
    const myReputation = useMemo(() => getReputation(myPosts), [myPosts]);

    const totalPosts = myPosts.length;
    const totalRealVotes = myPosts.reduce((sum, post) => sum + post.realVotes, 0);
    const totalFakeVotes = myPosts.reduce((sum, post) => sum + post.fakeVotes, 0);
    const disputedCount = myPosts.filter((post) => post.realScore + post.fakeScore >= 2 && Math.abs(post.realScore - post.fakeScore) <= 1).length;
    const uniqueCelebrities = new Set(myPosts.map((post) => post.celebrityName.trim()).filter(Boolean)).size;
    const legendaryCount = myPosts.filter((post) => post.rarity === 'legendary').length;
    const dayStreak = getDayStreak(myPosts.map((post) => post.timestamp));
    const savedPosts = posts.filter((post) => post.saved);
    const verifiedGoalCount = myPosts.filter((post) => getAuthenticityPercent(post) >= 70).length;
    const topShowcase = [...myPosts]
        .sort((a, b) => {
            const authDiff = getAuthenticityPercent(b) - getAuthenticityPercent(a);
            if (authDiff !== 0) return authDiff;
            return b.realScore - a.realScore;
        })
        .slice(0, 3);

    const favoriteCategory = useMemo(() => {
        if (myPosts.length === 0) return t('favCategoryEmpty');
        const counts = myPosts.reduce<Record<string, number>>((acc, post) => {
            acc[post.category] = (acc[post.category] || 0) + 1;
            return acc;
        }, {});
        const [category] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        return categoryLabel(category, lang);
    }, [myPosts]);

    const trustProgress = useMemo(() => {
        const normalized = Math.max(0, Math.min(100, myReputation.score + 20));
        return `${normalized}%` as const;
    }, [myReputation.score]);

    const saveProfile = () => {
        updateProfile({ name: draftName, bio: draftBio });
        setEditVisible(false);
    };

    const handleClearCache = () => {
        clearPosts();
        setSettingsVisible(false);
        Alert.alert(t('cacheClearedTitle'), t('cacheClearedBody'));
    };

    const handleSignOut = () => {
        signOut();
        setSettingsVisible(false);
        Alert.alert(t('signedOutTitle'), t('signedOutBody'));
    };

    const syncStatusLabel = useMemo(() => {
        if (syncStatus === 'syncing') return t('syncAutoLoading');
        if (syncStatus === 'loading') return t('syncLocalLoading');
        if (syncStatus === 'offline') return t('syncOffline');
        if (syncStatus === 'error') return t('syncErrorStatus');
        if (lastSyncedAt) return t('syncActiveAt', { date: new Date(lastSyncedAt).toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US') });
        return isAuthenticated ? t('syncActive') : t('guestViewOnly');
    }, [isAuthenticated, lastSyncedAt, syncStatus, t, lang]);

    // CEO-идея #9: при открытии профиля планируем push-напоминание о серии
    // (только если уведомления включены, разрешение выдано и сегодня ещё не было активности).
    useEffect(() => {
        if (!profile.notificationsEnabled || posts.length === 0) return;
        (async () => {
            try {
                const { requestNotificationPermission } = await import('../../lib/notifications');
                const granted = await requestNotificationPermission();
                await scheduleStreakReminderIfNeeded({
                    timestamps: posts.map((p) => p.timestamp),
                    notificationsEnabled: profile.notificationsEnabled,
                    hasPermission: granted,
                });
            } catch {
                // Тихо игнорируем: напоминание — не критичный путь.
            }
        })();
    }, [posts, profile.notificationsEnabled]);

    // Гость видит только гейт входа: пустой профиль с чужими нулями путает
    // (ревью основателя: «откуда у неавторизованного вообще что-то есть»).
    if (!isAuthenticated) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
                <AuthGate
                    icon="person"
                    title={t('gateProfileTitle')}
                    hint={t('gateProfileHint')}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <ScrollView
                style={[styles.container, { backgroundColor: colors.background }]}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Card variant="elevated" padding="lg" style={{ alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => Alert.alert(t('avatarAlert'), t('avatarComingSoon'))}>
                        <View style={[styles.avatarRing, { borderColor: colors.accent }]}>
                            <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
                                <Ionicons name="person" size={44} color={colors.primary} />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <Text style={[styles.name, { color: colors.text }]}>{profile.name}</Text>
                    <Text style={[styles.handle, { color: colors.textTertiary }]}>
                        @{(profile.name || 'collector').toLowerCase().replace(/\s+/g, '')}
                    </Text>
                    <Text style={[styles.bio, { color: colors.textSecondary }]}>{profile.bio}</Text>

                    <View style={[styles.badgeRow, { backgroundColor: colors.surface }]}>
                        <View style={[styles.reputationIconWrap, { backgroundColor: colors.accentLight }]}>
                            <Ionicons name="medal" size={20} color={colors.accent} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.badgeTitle, { color: colors.text }]}>{myReputation.label}</Text>
                            <Text style={[styles.badgeSubtitle, { color: colors.textSecondary }]}>
                                {t('trustPoints', { n: myReputation.score })}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.trustBarWrap, { backgroundColor: colors.surface }]}>
                        <View style={[styles.trustBarFill, { backgroundColor: colors.accent, width: trustProgress }]} />
                    </View>

                    <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statNumber, { color: colors.text }]}>{totalPosts}</Text>
                            <Text style={[styles.statLabel, { color: colors.textTertiary }]} numberOfLines={1}>{t('statPosts')}</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statNumber, { color: colors.text }]}>{totalRealVotes}</Text>
                            <Text style={[styles.statLabel, { color: colors.textTertiary }]} numberOfLines={1}>{t('statVerified')}</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statNumber, { color: colors.text }]}>{legendaryCount}</Text>
                            <Text style={[styles.statLabel, { color: colors.textTertiary }]} numberOfLines={1}>{t('statLegendary')}</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.statItem}>
                            <View style={styles.statStreakRow}>
                                {dayStreak > 0 ? (
                                    <Ionicons name="flame" size={18} color={colors.accent} />
                                ) : null}
                                <Text style={[styles.statNumber, { color: colors.text }]}>
                                    {dayStreak > 0 ? dayStreak : '—'}
                                </Text>
                            </View>
                            <Text style={[styles.statLabel, { color: colors.textTertiary }]} numberOfLines={1}>{t('statStreak')}</Text>
                        </View>
                    </View>
                </Card>

                <View style={styles.insightsRow}>
                    <View style={[styles.insightCard, { backgroundColor: colors.card }]}>
                        <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>{t('uniqueNames')}</Text>
                        <Text style={[styles.insightValue, { color: colors.text }]}>{uniqueCelebrities}</Text>
                    </View>
                    <View style={[styles.insightCard, { backgroundColor: colors.card }]}>
                        <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>{t('favCategory')}</Text>
                        <Text style={[styles.insightValue, { color: colors.text }]}>{favoriteCategory}</Text>
                    </View>
                </View>

                <View style={[styles.goalCard, { backgroundColor: colors.card }]}>
                    <View style={styles.goalHeader}>
                        <Text style={[styles.goalTitle, { color: colors.text }]}>{t('goalTitle')}</Text>
                        <Text style={[styles.goalProgress, { color: colors.textSecondary }]}>{verifiedGoalCount}/3</Text>
                    </View>
                    <Text style={[styles.goalHint, { color: colors.textSecondary }]}>
                        Собрать 3 подтвержденных автографа с доверием сообщества 70% и выше.
                    </Text>
                    <View style={[styles.goalBar, { backgroundColor: colors.surface }]}>
                        <View
                            style={[
                                styles.goalBarFill,
                                {
                                    backgroundColor: colors.accent,
                                    width: `${Math.min(100, Math.round((verifiedGoalCount / 3) * 100))}%`,
                                },
                            ]}
                        />
                    </View>
                </View>

                <View style={styles.actions}>
                    <Button
                        title={t('editProfile')}
                        onPress={() => {
                            setDraftName(profile.name);
                            setDraftBio(profile.bio);
                            setEditVisible(true);
                        }}
                        variant="secondary"
                        size="sm"
                        icon="create-outline"
                    />
                    <Button
                        title={t('more')}
                        onPress={() => router.push('/more')}
                        variant="primary"
                        size="sm"
                        icon="grid-outline"
                    />
                    <Button
                        title={t('settings')}
                        onPress={() => setSettingsVisible(true)}
                        variant="secondary"
                        size="sm"
                        icon="settings-outline"
                    />
                </View>

                {savedPosts.length > 0 ? (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('savedTitle')}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.savedRow}>
                            {savedPosts.slice(0, 5).map((post) => (
                                <TouchableOpacity
                                    key={post.id}
                                    style={[styles.savedCard, { backgroundColor: colors.card }]}
                                    onPress={() => setSelectedPost(post)}
                                >
                                    <Image source={{ uri: post.uri }} style={styles.savedImage} resizeMode="cover" />
                                    <View style={styles.savedFooter}>
                                        <Text style={[styles.savedTitle, { color: colors.text }]} numberOfLines={1}>
                                            {post.celebrityName || t('nameless')}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                ) : null}

                {topShowcase.length > 0 ? (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('showcaseTitle')}</Text>
                        {topShowcase.map((post) => (
                            <TouchableOpacity
                                key={post.id}
                                style={[styles.showcaseRow, { backgroundColor: colors.card }]}
                                onPress={() => setSelectedPost(post)}
                            >
                                <Image source={{ uri: post.uri }} style={styles.showcaseImage} resizeMode="cover" />
                                <View style={styles.showcaseBody}>
                                    <Text style={[styles.showcaseTitle, { color: colors.text }]} numberOfLines={1}>
                                        {post.celebrityName || t('nameless')}
                                    </Text>
                                    <Text style={[styles.showcaseMeta, { color: colors.textSecondary }]} numberOfLines={1}>
                                        {categoryLabel(post.category, lang)} • {getRarityLabel(post.rarity)}
                                    </Text>
                                    <Text style={[styles.showcaseScore, { color: colors.text }]}>
                                        {getAuthenticityPercent(post)}% доверия
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : null}

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('myCollection')}</Text>

                    {myPosts.length === 0 ? (
                        <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
                            <View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
                                <Ionicons name="albums-outline" size={28} color={colors.primary} />
                            </View>
                            <Text style={[styles.emptyText, { color: colors.text }]}>{t('collectionEmpty')}</Text>
                            <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
                                {t('collectionEmptyHint')}
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.grid}>
                            {myPosts.slice(0, 6).map((post) => (
                                <TouchableOpacity
                                    key={post.id}
                                    style={[styles.gridItem, { backgroundColor: colors.card }]}
                                    onPress={() => setSelectedPost(post)}
                                >
                                    <Image source={{ uri: post.uri }} style={styles.gridImage} resizeMode="cover" />
                                    <View style={styles.gridFooter}>
                                        <Text style={[styles.gridTitle, { color: colors.text }]} numberOfLines={1}>
                                            {post.celebrityName || t('nameless')}
                                        </Text>
                                        <Text style={[styles.gridSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                                            {categoryLabel(post.category, lang)} • {getRarityLabel(post.rarity)}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            <ProfileModal visible={editVisible} title={t('profileEditTitle')} colors={colors} onClose={() => setEditVisible(false)}>
                <View style={styles.modalContent}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('fieldName')}</Text>
                    <TextInput
                        style={[styles.fieldInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                        value={draftName}
                        onChangeText={setDraftName}
                        placeholder={t("namePlaceholder")}
                        placeholderTextColor={colors.placeholder}
                    />

                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('fieldBio')}</Text>
                    <TextInput
                        style={[
                            styles.fieldInput,
                            styles.fieldTextarea,
                            { color: colors.text, borderColor: colors.border, backgroundColor: colors.card },
                        ]}
                        value={draftBio}
                        onChangeText={setDraftBio}
                        placeholder={t("bioPlaceholder")}
                        placeholderTextColor={colors.placeholder}
                        multiline
                        textAlignVertical="top"
                    />

                    <TouchableOpacity style={[styles.modalAction, { backgroundColor: colors.primary }]} onPress={saveProfile}>
                        <Text style={[styles.modalActionText, { color: colors.primaryText }]}>{t('save')}</Text>
                    </TouchableOpacity>
                </View>
            </ProfileModal>

            <ProfileModal visible={settingsVisible} title={t('settings')} colors={colors} onClose={() => setSettingsVisible(false)}>
                <View style={styles.modalContent}>
                    <View style={[styles.settingRow, { backgroundColor: colors.card }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.settingTitle, { color: colors.text }]}>{t('notifications')}</Text>
                            <Text style={[styles.settingHint, { color: colors.textSecondary }]}>
                                {t('notificationsHint')}
                            </Text>
                        </View>
                        <Switch
                            value={profile.notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor="#ffffff"
                        />
                    </View>

                    <View style={[styles.settingRow, { backgroundColor: colors.card }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.settingTitle, { color: colors.text }]}>{t('disputedCards')}</Text>
                            <Text style={[styles.settingHint, { color: colors.textSecondary }]}>
                                {t('disputedNow', { n: disputedCount })}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.settingRow, { backgroundColor: colors.card }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.settingTitle, { color: colors.text }]}>{t('language')}</Text>
                            <Text style={[styles.settingHint, { color: colors.textSecondary }]}>
                                {lang === 'ru' ? t('languageRu') : t('languageEn')}
                            </Text>
                        </View>
                        <View style={styles.langSwitch}>
                            {(['ru', 'en'] as const).map((code) => (
                                <TouchableOpacity
                                    key={code}
                                    onPress={() => setLang(code)}
                                    style={[
                                        styles.langOption,
                                        {
                                            backgroundColor: lang === code ? colors.primary : colors.surface,
                                            borderColor: colors.border,
                                        },
                                    ]}
                                    accessibilityRole="button"
                                    accessibilityLabel={code === 'ru' ? t('russian') : 'English'}
                                >
                                    <Text
                                        style={[
                                            styles.langOptionText,
                                            { color: lang === code ? colors.primaryText : colors.textSecondary },
                                        ]}
                                    >
                                        {code.toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={[styles.settingRow, { backgroundColor: colors.card }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.settingTitle, { color: colors.text }]}>{t('appearance')}</Text>
                            <Text style={[styles.settingHint, { color: colors.textSecondary }]}>
                                {theme === 'light' ? t('themeNowLight') : t('themeNowDark')}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={toggleTheme}
                            style={[styles.settingButton, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
                            accessibilityRole="button"
                            accessibilityLabel={t('themeToggleLabel')}
                        >
                            <Ionicons name={theme === 'light' ? 'moon-outline' : 'sunny-outline'} size={18} color={colors.text} />
                            <Text style={[styles.settingButtonText, { color: colors.text }]}>
                                {theme === 'light' ? t('themeSwitchToDark') : t('themeSwitchToLight')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.cloudCard, { backgroundColor: colors.card }]}>
                        <View style={styles.cloudHeader}>
                            <View style={[styles.cloudIcon, { backgroundColor: colors.surface }]}>
                                <Ionicons
                                    name={isAuthenticated ? 'cloud-done-outline' : 'eye-outline'}
                                    size={18}
                                    color={isAuthenticated ? colors.primary : colors.textSecondary}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.settingTitle, { color: colors.text }]}>
                                    {isAuthenticated ? t('cloudSync') : t('guestAccess')}
                                </Text>
                                <Text style={[styles.settingHint, { color: colors.textSecondary }]}>
                                    {syncStatusLabel}
                                </Text>
                                {authUserEmail ? (
                                    <Text style={[styles.settingHint, { color: colors.textSecondary }]}>
                                        {authUserEmail}
                                    </Text>
                                ) : null}
                            </View>
                        </View>
                        {syncError ? (
                            <Text style={[styles.syncError, { color: colors.danger }]}>{syncError}</Text>
                        ) : null}
                        {!isAuthenticated ? (
                            <TouchableOpacity
                                style={[styles.authButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                onPress={() => {
                                    setSettingsVisible(false);
                                    router.push('/auth');
                                }}
                            >
                                <Ionicons name="log-in-outline" size={18} color={colors.text} />
                                <Text style={[styles.authButtonText, { color: colors.text }]}>{t('signIn')}</Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    <TouchableOpacity
                        style={[styles.settingButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={handleClearCache}
                    >
                        <Ionicons name="trash-outline" size={18} color={colors.text} />
                        <Text style={[styles.settingButtonText, { color: colors.text }]}>{t('clearCache')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.settingButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => {
                            setSettingsVisible(false);
                            router.push('/privacy');
                        }}
                    >
                        <Ionicons name="shield-checkmark-outline" size={18} color={colors.text} />
                        <Text style={[styles.settingButtonText, { color: colors.text }]}>{t('privacyPolicy')}</Text>
                    </TouchableOpacity>

                    {isAuthenticated ? (
                        <TouchableOpacity
                            style={[styles.settingButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={handleSignOut}
                        >
                            <Ionicons name="log-out-outline" size={18} color={colors.danger} />
                            <Text style={[styles.settingButtonText, { color: colors.danger }]}>{t('signOut')}</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            </ProfileModal>

            <ProfileModal visible={Boolean(selectedPost)} title={selectedPost?.celebrityName || t('autographFallback')} colors={colors} onClose={() => setSelectedPost(null)}>
                <ProfilePostModal post={selectedPost} colors={colors} onClose={() => setSelectedPost(null)} />
            </ProfileModal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flex: 1 },
    content: { padding: 16, paddingBottom: 18 },
    heroCard: {
        borderRadius: radii.xxl,
        padding: 22,
        alignItems: 'center',
    },
    avatar: {
        flex: 1,
        borderRadius: radii.xxl,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarRing: {
        width: 120,
        height: 120,
        borderRadius: radii.xxl + 8,
        borderWidth: 3,
        // padding вместо flex-центрирования: рамка гарантированно концентрична
        // (ревью основателя: «съезжает рамка фото профиля»).
        padding: 5,
        marginBottom: 16,
    },
    name: { fontSize: 24, fontWeight: '700', marginBottom: 2 },
    handle: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
    bio: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 18 },
    badgeRow: {
        width: '100%',
        borderRadius: radii.lg,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    langSwitch: {
        flexDirection: 'row',
        gap: 6,
    },
    langOption: {
        minWidth: 46,
        minHeight: 36,
        borderRadius: radii.md,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    langOptionText: {
        fontSize: 12,
        fontWeight: '700',
    },
    reputationIconWrap: {
        width: 36,
        height: 36,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    badgeSubtitle: {
        marginTop: 2,
        fontSize: 12,
    },
    trustBarWrap: {
        width: '100%',
        height: 10,
        borderRadius: 999,
        overflow: 'hidden',
        marginBottom: 18,
    },
    trustBarFill: {
        height: '100%',
        borderRadius: 999,
    },
    statsContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
        paddingVertical: 18,
        borderRadius: radii.lg,
    },
    statItem: { alignItems: 'center', flex: 1, minWidth: 0 },
    statStreakRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statNumber: { fontSize: 21, fontWeight: '700' },
    statLabel: { fontSize: 11, marginTop: 4 },
    statDivider: { width: 1, height: 34 },
    insightsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    insightCard: {
        ...shadows.sm,
        flex: 1,
        borderRadius: radii.lg,
        padding: 14,
    },
    insightLabel: {
        fontSize: 12,
        marginBottom: 6,
    },
    insightValue: {
        fontSize: 17,
        fontWeight: '700',
    },
    actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
    goalCard: {
        ...shadows.sm,
        borderRadius: radii.xl,
        padding: 16,
        marginTop: 16,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    goalTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    goalProgress: {
        fontSize: 13,
        fontWeight: '600',
    },
    goalHint: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 12,
    },
    goalBar: {
        height: 10,
        borderRadius: 999,
        overflow: 'hidden',
    },
    goalBarFill: {
        height: '100%',
        borderRadius: 999,
    },
    actionBtn: {
        flex: 1,
        minHeight: 54,
        borderRadius: 18,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 10,
    },
    actionText: { fontWeight: '600', fontSize: 13 },
    section: { marginTop: 24 },
    sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 14 },
    savedRow: {
        gap: 12,
        paddingRight: 16,
    },
    savedCard: {
        ...shadows.sm,
        width: 150,
        borderRadius: 18,
        overflow: 'hidden',
    },
    savedImage: {
        width: '100%',
        height: 120,
    },
    savedFooter: {
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    savedTitle: {
        fontSize: 13,
        fontWeight: '700',
    },
    showcaseRow: {
        ...shadows.sm,
        borderRadius: 18,
        flexDirection: 'row',
        overflow: 'hidden',
        marginBottom: 12,
    },
    showcaseImage: {
        width: 88,
        height: 88,
    },
    showcaseBody: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
        justifyContent: 'center',
        gap: 4,
    },
    showcaseTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    showcaseMeta: {
        fontSize: 12,
    },
    showcaseScore: {
        fontSize: 13,
        fontWeight: '600',
    },
    emptyState: {
        ...shadows.sm,
        borderRadius: 24,
        padding: 26,
        alignItems: 'center',
    },
    emptyIcon: {
        width: 60,
        height: 60,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    emptyText: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
    emptyHint: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 12,
    },
    gridItem: {
        ...shadows.sm,
        width: '48%',
        borderRadius: 18,
        overflow: 'hidden',
    },
    gridImage: {
        width: '100%',
        aspectRatio: 1,
    },
    gridFooter: {
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    gridTitle: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 4,
    },
    gridSubtitle: {
        fontSize: 12,
    },
    modalContent: {
        padding: 16,
    },
    fieldLabel: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    fieldInput: {
        borderWidth: 1,
        borderRadius: 16,
        minHeight: 50,
        paddingHorizontal: 14,
        fontSize: 15,
        marginBottom: 16,
    },
    fieldTextarea: {
        minHeight: 110,
        paddingTop: 14,
        paddingBottom: 14,
    },
    modalAction: {
        minHeight: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalActionText: {
        fontSize: 16,
        fontWeight: '700',
    },
    settingRow: {
        ...shadows.sm,
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    settingTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    settingHint: {
        marginTop: 4,
        fontSize: 12,
    },
    cloudCard: {
        ...shadows.sm,
        borderRadius: 18,
        padding: 14,
        marginBottom: 12,
        gap: 12,
    },
    cloudHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    cloudIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    syncError: {
        fontSize: 12,
        lineHeight: 17,
    },
    syncButton: {
        minHeight: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    syncButtonText: {
        fontSize: 14,
        fontWeight: '700',
    },
    authButton: {
        minHeight: 46,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    authButtonText: {
        fontSize: 14,
        fontWeight: '700',
    },
    settingButton: {
        borderWidth: 1,
        borderRadius: 18,
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 14,
        marginBottom: 12,
    },
    settingButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
});
