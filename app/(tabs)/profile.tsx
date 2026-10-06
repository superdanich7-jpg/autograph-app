import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
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
import AchievementsSection from '../../components/AchievementsSection';
import AdvancedSearch from '../../components/AdvancedSearch';
import ExportCollection from '../../components/ExportCollection';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Collection, Post, usePosts } from '../../context/PostsContext';
import { useTheme } from '../../context/ThemeContext';
import { getAuthenticityPercent, getCategoryLabel, getRarityLabel } from '../../lib/helpers';
import { showToast } from '../../components/Toast';
import CollectionsList from '../../components/CollectionsList';
import ProfileModal from '../../components/ProfileModal';

export default function ProfileScreen() {
    const {
        posts,
        collections,
        profile,
        reputation,
        isAuthenticated,
        authUserEmail,
        syncStatus,
        syncError,
        lastSyncedAt,
        updateProfile,
        setNotificationsEnabled,
        clearPosts,
        signOut,
        addPostToCollection,
    } = usePosts();
    const { colors, toggleTheme, theme } = useTheme();
    const router = useRouter();

    const [editVisible, setEditVisible] = useState(false);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [collectionsVisible, setCollectionsVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [draftName, setDraftName] = useState(profile.name);
    const [draftBio, setDraftBio] = useState(profile.bio);

    const totalPosts = posts.length;
    const totalRealVotes = posts.reduce((sum, post) => sum + post.realVotes, 0);
    const totalFakeVotes = posts.reduce((sum, post) => sum + post.fakeVotes, 0);
    const disputedCount = posts.filter((post) => post.realScore + post.fakeScore >= 2 && Math.abs(post.realScore - post.fakeScore) <= 1).length;
    const uniqueCelebrities = new Set(posts.map((post) => post.celebrityName.trim()).filter(Boolean)).size;
    const legendaryCount = posts.filter((post) => post.rarity === 'legendary').length;
    const savedPosts = posts.filter((post) => post.saved);
    const verifiedGoalCount = posts.filter((post) => getAuthenticityPercent(post) >= 70).length;
    const topShowcase = [...posts]
        .sort((a, b) => {
            const authDiff = getAuthenticityPercent(b) - getAuthenticityPercent(a);
            if (authDiff !== 0) return authDiff;
            return b.realScore - a.realScore;
        })
        .slice(0, 3);

    const favoriteCategory = useMemo(() => {
        if (posts.length === 0) return 'РџРѕРєР° РЅРµ РѕРїСЂРµРґРµР»РµРЅР°';
        const counts = posts.reduce<Record<string, number>>((acc, post) => {
            acc[post.category] = (acc[post.category] || 0) + 1;
            return acc;
        }, {});
        const [category] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        return getCategoryLabel(category as Post['category']);
    }, [posts]);

    const trustProgress = useMemo(() => {
        const normalized = Math.max(0, Math.min(100, reputation.score + 20));
        return `${normalized}%` as const;
    }, [reputation.score]);

    const saveProfile = () => {
        updateProfile({ name: draftName, bio: draftBio });
        setEditVisible(false);
    };

    const handleClearCache = () => {
        clearPosts();
        setSettingsVisible(false);
        Alert.alert('РљСЌС€ РѕС‡РёС‰РµРЅ', 'Р›РѕРєР°Р»СЊРЅР°СЏ РєРѕР»Р»РµРєС†РёСЏ РѕС‡РёС‰РµРЅР°.');
    };

    const handleSignOut = () => {
        signOut();
        setSettingsVisible(false);
        Alert.alert('Р’С‹С…РѕРґ РІС‹РїРѕР»РЅРµРЅ', 'Р›РѕРєР°Р»СЊРЅС‹Р№ РїСЂРѕС„РёР»СЊ СЃР±СЂРѕС€РµРЅ.');
    };

    const syncStatusLabel = useMemo(() => {
        if (syncStatus === 'syncing') return 'РђРІС‚РѕРјР°С‚РёС‡РµСЃРєРё Р·Р°РіСЂСѓР¶Р°СЋ РґР°РЅРЅС‹Рµ...';
        if (syncStatus === 'loading') return 'Р—Р°РіСЂСѓР·РєР° Р»РѕРєР°Р»СЊРЅС‹С… РґР°РЅРЅС‹С…...';
        if (syncStatus === 'offline') return 'РћР±Р»Р°С‡РЅР°СЏ СЃРёРЅС…СЂРѕРЅРёР·Р°С†РёСЏ РЅРµ РїРѕРґРєР»СЋС‡РµРЅР°';
        if (syncStatus === 'error') return 'РќСѓР¶РЅРѕ РїСЂРѕРІРµСЂРёС‚СЊ РїРѕРґРєР»СЋС‡РµРЅРёРµ';
        if (lastSyncedAt) return `РђРІС‚РѕСЃРѕС…СЂР°РЅРµРЅРёРµ Р°РєС‚РёРІРЅРѕ вЂў ${new Date(lastSyncedAt).toLocaleString('ru-RU')}`;
        return isAuthenticated ? 'РђРІС‚РѕСЃРѕС…СЂР°РЅРµРЅРёРµ Р°РєС‚РёРІРЅРѕ' : 'Р“РѕСЃС‚РµРІРѕР№ СЂРµР¶РёРј: С‚РѕР»СЊРєРѕ РїСЂРѕСЃРјРѕС‚СЂ';
    }, [isAuthenticated, lastSyncedAt, syncStatus]);

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <ScrollView
                style={[styles.container, { backgroundColor: colors.background }]}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Card variant="elevated" padding="lg" style={{ alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => Alert.alert('РђРІР°С‚Р°СЂ', 'РЎРјРµРЅР° С„РѕС‚Рѕ РїРѕСЏРІРёС‚СЃСЏ РїРѕР·Р¶Рµ.')}>
                        <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
                            <Ionicons name="person" size={44} color={colors.primary} />
                        </View>
                    </TouchableOpacity>
                    <Text style={[styles.name, { color: colors.text }]}>{profile.name}</Text>
                    <Text style={[styles.bio, { color: colors.textSecondary }]}>{profile.bio}</Text>

                    <View style={[styles.badgeRow, { backgroundColor: colors.surface }]}>
                        <Text style={styles.reputationIcon}>{reputation.icon}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.badgeTitle, { color: colors.text }]}>{reputation.label}</Text>
                            <Text style={[styles.badgeSubtitle, { color: colors.textSecondary }]}>
                                {reputation.score} РѕС‡РєРѕРІ РґРѕРІРµСЂРёСЏ
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.trustBarWrap, { backgroundColor: colors.surface }]}>
                        <View style={[styles.trustBarFill, { backgroundColor: colors.primary, width: trustProgress }]} />
                    </View>

                    <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statNumber, { color: colors.text }]}>{totalPosts}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>РџРѕСЃС‚РѕРІ</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statNumber, { color: colors.text }]}>{totalRealVotes}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>РџРѕРґС‚РІРµСЂР¶РґРµРЅРѕ</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statNumber, { color: colors.text }]}>{legendaryCount}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Р›РµРіРµРЅРґР°СЂРЅС‹С…</Text>
                        </View>
                    </View>
                </Card>

                <View style={styles.insightsRow}>
                    <View style={[styles.insightCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>РЈРЅРёРєР°Р»СЊРЅС‹С… РёРјРµРЅ</Text>
                        <Text style={[styles.insightValue, { color: colors.text }]}>{uniqueCelebrities}</Text>
                    </View>
                    <View style={[styles.insightCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>Р›СЋР±РёРјР°СЏ РєР°С‚РµРіРѕСЂРёСЏ</Text>
                        <Text style={[styles.insightValue, { color: colors.text }]}>{favoriteCategory}</Text>
                    </View>
                </View>

                <View style={[styles.goalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.goalHeader}>
                        <Text style={[styles.goalTitle, { color: colors.text }]}>Р¦РµР»СЊ РјРµСЃСЏС†Р°</Text>
                        <Text style={[styles.goalProgress, { color: colors.textSecondary }]}>{verifiedGoalCount}/3</Text>
                    </View>
                    <Text style={[styles.goalHint, { color: colors.textSecondary }]}>
                        РЎРѕР±СЂР°С‚СЊ 3 РїРѕРґС‚РІРµСЂР¶РґРµРЅРЅС‹С… Р°РІС‚РѕРіСЂР°С„Р° СЃ РґРѕРІРµСЂРёРµРј СЃРѕРѕР±С‰РµСЃС‚РІР° 70% Рё РІС‹С€Рµ.
                    </Text>
                    <View style={[styles.goalBar, { backgroundColor: colors.surface }]}>
                        <View
                            style={[
                                styles.goalBarFill,
                                {
                                    backgroundColor: colors.primary,
                                    width: `${Math.min(100, Math.round((verifiedGoalCount / 3) * 100))}%`,
                                },
                            ]}
                        />
                    </View>
                </View>

                <AchievementsSection userId={authUserEmail || 'guest'} />

                <View style={styles.actions}>
                    <Button
                        title="Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ"
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
                        title="РџРѕРґР±РѕСЂРєРё"
                        onPress={() => setCollectionsVisible(true)}
                        variant="secondary"
                        size="sm"
                        icon="albums-outline"
                    />
                    <Button
                        title="РќР°СЃС‚СЂРѕР№РєРё"
                        onPress={() => setSettingsVisible(true)}
                        variant="secondary"
                        size="sm"
                        icon="settings-outline"
                    />
                    <Button
                        title={theme === 'light' ? 'РўС‘РјРЅР°СЏ' : 'РЎРІРµС‚Р»Р°СЏ'}
                        onPress={toggleTheme}
                        variant="ghost"
                        size="sm"
                        icon={theme === 'light' ? 'moon-outline' : 'sunny-outline'}
                    />
                </View>

                <ExportCollection />

                <AdvancedSearch posts={posts} onPostPress={(p) => setSelectedPost(p)} />

                {savedPosts.length > 0 ? (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>РР·Р±СЂР°РЅРЅРѕРµ</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.savedRow}>
                            {savedPosts.slice(0, 5).map((post) => (
                                <TouchableOpacity
                                    key={post.id}
                                    style={[styles.savedCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                    onPress={() => setSelectedPost(post)}
                                >
                                    <Image source={{ uri: post.uri }} style={styles.savedImage} resizeMode="cover" />
                                    <View style={styles.savedFooter}>
                                        <Text style={[styles.savedTitle, { color: colors.text }]} numberOfLines={1}>
                                            {post.celebrityName || 'Р‘РµР· РёРјРµРЅРё'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                ) : null}

                {topShowcase.length > 0 ? (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Р’РёС‚СЂРёРЅР° Р»СѓС‡С€РёС…</Text>
                        {topShowcase.map((post) => (
                            <TouchableOpacity
                                key={post.id}
                                style={[styles.showcaseRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                                onPress={() => setSelectedPost(post)}
                            >
                                <Image source={{ uri: post.uri }} style={styles.showcaseImage} resizeMode="cover" />
                                <View style={styles.showcaseBody}>
                                    <Text style={[styles.showcaseTitle, { color: colors.text }]} numberOfLines={1}>
                                        {post.celebrityName || 'Р‘РµР· РёРјРµРЅРё'}
                                    </Text>
                                    <Text style={[styles.showcaseMeta, { color: colors.textSecondary }]} numberOfLines={1}>
                                        {getCategoryLabel(post.category)} вЂў {getRarityLabel(post.rarity)}
                                    </Text>
                                    <Text style={[styles.showcaseScore, { color: colors.text }]}>
                                        {getAuthenticityPercent(post)}% РґРѕРІРµСЂРёСЏ
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : null}

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>РњРѕСЏ РєРѕР»Р»РµРєС†РёСЏ</Text>

                    {posts.length === 0 ? (
                        <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
                                <Ionicons name="albums-outline" size={28} color={colors.primary} />
                            </View>
                            <Text style={[styles.emptyText, { color: colors.text }]}>РљРѕР»Р»РµРєС†РёСЏ РµС‰Рµ РЅРµ Р·Р°РїРѕР»РЅРµРЅР°</Text>
                            <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
                                РљРѕРіРґР° РґРѕР±Р°РІРёС‚Рµ РїРµСЂРІС‹Р№ Р°РІС‚РѕРіСЂР°С„, Р·РґРµСЃСЊ РїРѕСЏРІРёС‚СЃСЏ РєРѕРјРїР°РєС‚РЅР°СЏ РіР°Р»РµСЂРµСЏ.
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.grid}>
                            {posts.slice(0, 6).map((post) => (
                                <TouchableOpacity
                                    key={post.id}
                                    style={[styles.gridItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                                    onPress={() => setSelectedPost(post)}
                                >
                                    <Image source={{ uri: post.uri }} style={styles.gridImage} resizeMode="cover" />
                                    <View style={styles.gridFooter}>
                                        <Text style={[styles.gridTitle, { color: colors.text }]} numberOfLines={1}>
                                            {post.celebrityName || 'Р‘РµР· РёРјРµРЅРё'}
                                        </Text>
                                        <Text style={[styles.gridSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                                            {getCategoryLabel(post.category)} вЂў {getRarityLabel(post.rarity)}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            <ProfileModal visible={editVisible} title="Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ РїСЂРѕС„РёР»СЊ" colors={colors} onClose={() => setEditVisible(false)}>
                <View style={styles.modalContent}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>РРјСЏ</Text>
                    <TextInput
                        style={[styles.fieldInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                        value={draftName}
                        onChangeText={setDraftName}
                        placeholder="Р’Р°С€Рµ РёРјСЏ"
                        placeholderTextColor={colors.placeholder}
                    />

                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Р‘РёРѕ</Text>
                    <TextInput
                        style={[
                            styles.fieldInput,
                            styles.fieldTextarea,
                            { color: colors.text, borderColor: colors.border, backgroundColor: colors.card },
                        ]}
                        value={draftBio}
                        onChangeText={setDraftBio}
                        placeholder="РљРѕСЂРѕС‚РєРѕ Рѕ РІР°С€РµР№ РєРѕР»Р»РµРєС†РёРё"
                        placeholderTextColor={colors.placeholder}
                        multiline
                        textAlignVertical="top"
                    />

                    <TouchableOpacity style={[styles.modalAction, { backgroundColor: colors.primary }]} onPress={saveProfile}>
                        <Text style={[styles.modalActionText, { color: colors.primaryText }]}>РЎРѕС…СЂР°РЅРёС‚СЊ</Text>
                    </TouchableOpacity>
                </View>
            </ProfileModal>

            <ProfileModal visible={settingsVisible} title="РќР°СЃС‚СЂРѕР№РєРё" colors={colors} onClose={() => setSettingsVisible(false)}>
                <View style={styles.modalContent}>
                    <View style={[styles.settingRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.settingTitle, { color: colors.text }]}>РЈРІРµРґРѕРјР»РµРЅРёСЏ</Text>
                            <Text style={[styles.settingHint, { color: colors.textSecondary }]}>
                                РќР°РїРѕРјРёРЅР°РЅРёСЏ Рѕ РЅРѕРІС‹С… РіРѕР»РѕСЃР°С… Рё Р°РєС‚РёРІРЅРѕСЃС‚Рё
                            </Text>
                        </View>
                        <Switch
                            value={profile.notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor="#ffffff"
                        />
                    </View>

                    <View style={[styles.settingRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.settingTitle, { color: colors.text }]}>РЎРїРѕСЂРЅС‹Рµ Р°РІС‚РѕРіСЂР°С„С‹</Text>
                            <Text style={[styles.settingHint, { color: colors.textSecondary }]}>
                                РЎРµР№С‡Р°СЃ {disputedCount} РєР°СЂС‚РѕС‡РµРє СЃ РїРѕС‡С‚Рё СЂР°РІРЅС‹Рј РґРѕРІРµСЂРёРµРј СЃРѕРѕР±С‰РµСЃС‚РІР°.
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.cloudCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
                                    {isAuthenticated ? 'РћР±Р»Р°С‡РЅР°СЏ СЃРёРЅС…СЂРѕРЅРёР·Р°С†РёСЏ' : 'Р“РѕСЃС‚РµРІРѕР№ РґРѕСЃС‚СѓРї'}
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
                                <Text style={[styles.authButtonText, { color: colors.text }]}>Р’РѕР№С‚Рё РёР»Рё Р·Р°СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°С‚СЊСЃСЏ</Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    <TouchableOpacity
                        style={[styles.settingButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={handleClearCache}
                    >
                        <Ionicons name="trash-outline" size={18} color={colors.text} />
                        <Text style={[styles.settingButtonText, { color: colors.text }]}>РћС‡РёСЃС‚РёС‚СЊ РєСЌС€</Text>
                    </TouchableOpacity>

                    {isAuthenticated ? (
                        <TouchableOpacity
                            style={[styles.settingButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={handleSignOut}
                        >
                            <Ionicons name="log-out-outline" size={18} color={colors.danger} />
                            <Text style={[styles.settingButtonText, { color: colors.danger }]}>Р’С‹Р№С‚Рё</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            </ProfileModal>

            <CollectionsList visible={collectionsVisible} onClose={() => setCollectionsVisible(false)} />

            <ProfileModal visible={Boolean(selectedPost)} title={selectedPost?.celebrityName || 'РђРІС‚РѕРіСЂР°С„'} colors={colors} onClose={() => setSelectedPost(null)}>
                {selectedPost ? (
                    <ScrollView style={styles.modalPostScroll} contentContainerStyle={styles.modalPostContent}>
                        <Image source={{ uri: selectedPost.uri }} style={styles.modalPostImage} resizeMode="cover" />
                        <View style={[styles.modalPostCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Text style={[styles.modalPostTitle, { color: colors.text }]}>{selectedPost.celebrityName || 'Р‘РµР· РёРјРµРЅРё'}</Text>
                            <Text style={[styles.modalPostMeta, { color: colors.textSecondary }]}>
                                {selectedPost.location || 'РњРµСЃС‚Рѕ РЅРµ СѓРєР°Р·Р°РЅРѕ'} вЂў {selectedPost.dateReceived || 'Р”Р°С‚Р° РЅРµ СѓРєР°Р·Р°РЅР°'}
                            </Text>
                            <Text style={[styles.modalPostMeta, { color: colors.textSecondary }]}>
                                {getCategoryLabel(selectedPost.category)} вЂў {getRarityLabel(selectedPost.rarity)}
                            </Text>
                            {selectedPost.caption ? (
                                <Text style={[styles.modalPostCaption, { color: colors.text }]}>{selectedPost.caption}</Text>
                            ) : null}

                            <View style={styles.fullStatsRow}>
                                <View style={[styles.fullStat, { backgroundColor: colors.surface }]}>
                                    <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                                    <Text style={[styles.fullStatText, { color: colors.text }]}>
                                        {selectedPost.realVotes} РїРѕРґС‚РІРµСЂР¶РґРµРЅРёР№
                                    </Text>
                                </View>
                                <View style={[styles.fullStat, { backgroundColor: colors.surface }]}>
                                    <Ionicons name="close-circle" size={16} color={colors.danger} />
                                    <Text style={[styles.fullStatText, { color: colors.text }]}>
                                        {selectedPost.fakeVotes} С„РµР№Рє-РјРµС‚РѕРє
                                    </Text>
                                </View>
                            </View>

                            <Text style={[styles.modalPostMeta, { color: colors.textSecondary }]}>
                                Р”РѕСЃС‚РѕРІРµСЂРЅРѕСЃС‚СЊ: {getAuthenticityPercent(selectedPost)}%
                            </Text>

                            <View style={styles.modalActionsRow}>
                                <TouchableOpacity
                                    style={[styles.modalActionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                    onPress={() => {
                                        if (collections.length === 0) {
                                            Alert.alert('РќРµС‚ РїРѕРґР±РѕСЂРѕРє', 'РЎРЅР°С‡Р°Р»Р° СЃРѕР·РґР°Р№С‚Рµ РїРѕРґР±РѕСЂРєСѓ РІ РїСЂРѕС„РёР»Рµ.');
                                            return;
                                        }
                                        const options = collections.map((c) => ({
                                            text: c.name,
                                            onPress: () => {
                                                addPostToCollection(c.id, selectedPost.id);
                                                showToast('Р”РѕР±Р°РІР»РµРЅРѕ РІ РїРѕРґР±РѕСЂРєСѓ', 'success');
                                            },
                                        }));
                                        options.push({ text: 'РћС‚РјРµРЅР°', onPress: () => {} });
                                        Alert.alert('Р”РѕР±Р°РІРёС‚СЊ РІ РїРѕРґР±РѕСЂРєСѓ', 'Р’С‹Р±РµСЂРёС‚Рµ РїРѕРґР±РѕСЂРєСѓ:', options, { cancelable: true });
                                    }}
                                >
                                    <Ionicons name="albums-outline" size={18} color={colors.text} />
                                    <Text style={[styles.modalActionText, { color: colors.text }]}>Р’ РїРѕРґР±РѕСЂРєСѓ</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                ) : null}
            </ProfileModal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flex: 1 },
    content: { padding: 16, paddingBottom: 18 },
    heroCard: {
        borderWidth: 1,
        borderRadius: 26,
        padding: 22,
        alignItems: 'center',
    },
    avatar: {
        width: 104,
        height: 104,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    name: { fontSize: 24, fontWeight: '700', marginBottom: 6 },
    bio: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 18 },
    badgeRow: {
        width: '100%',
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    reputationIcon: {
        fontSize: 22,
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
        borderRadius: 18,
    },
    statItem: { alignItems: 'center', flex: 1 },
    statNumber: { fontSize: 21, fontWeight: '700' },
    statLabel: { fontSize: 12, marginTop: 4 },
    statDivider: { width: 1, height: 34 },
    insightsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    insightCard: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 18,
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
        borderWidth: 1,
        borderRadius: 20,
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
        width: 150,
        borderWidth: 1,
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
        borderWidth: 1,
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
        borderWidth: 1,
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
        width: '48%',
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
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
        borderWidth: 1,
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
        borderWidth: 1,
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
    modalPostScroll: {
        flex: 1,
    },
    modalPostContent: {
        padding: 16,
        gap: 16,
    },
    modalPostImage: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 22,
    },
    modalPostCard: {
        borderWidth: 1,
        borderRadius: 22,
        padding: 16,
        gap: 10,
    },
    modalPostTitle: {
        fontSize: 22,
        fontWeight: '700',
    },
    modalPostMeta: {
        fontSize: 13,
        lineHeight: 18,
    },
    modalPostCaption: {
        fontSize: 15,
        lineHeight: 21,
    },
    fullStatsRow: {
        flexDirection: 'row',
        gap: 10,
        flexWrap: 'wrap',
    },
    fullStat: {
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    fullStatText: {
        fontSize: 13,
        fontWeight: '600',
    },
    modalActionsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
    modalActionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
});
