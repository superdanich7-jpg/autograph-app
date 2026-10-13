import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { generateId } from '../lib/helpers';
import { showToast } from '../components/Toast';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
    Community,
    CommunityCategory,
    approveMember as approveCommunityMember,
    createCommunity as buildCommunity,
    leaveCommunity as leaveCommunityFn,
    rejectMember as rejectCommunityMember,
    requestJoin as requestJoinFn,
} from '../lib/communities';
import {
    Friend,
    FriendRequest,
    acceptFriendRequest as acceptFriendReq,
    getFriendIds,
    getFriendship,
    getIncomingRequests,
    removeFriend as removeFriendFn,
    sendFriendRequest as sendFriendReq,
} from '../lib/friends';
import {
    ChatMessage,
    appendMessage,
    createMessage as createMsg,
    getThread,
    markThreadRead as markThreadReadFn,
} from '../lib/chat';
import { hapticLight } from '../lib/haptics';

export type Comment = {
    id: string;
    user: string;
    text: string;
    timestamp: string;
};

export type VoteChoice = 'real' | 'fake';
export type PostCategory = 'sports' | 'music' | 'movies' | 'politics' | 'other';
export type RarityLevel = 'common' | 'rare' | 'legendary';
export type EvidenceType = 'photo' | 'selfie' | 'ticket' | 'video' | 'certificate';

export const POST_CATEGORIES: { value: PostCategory; label: string }[] = [
    { value: 'sports', label: 'Спорт' },
    { value: 'music', label: 'Музыка' },
    { value: 'movies', label: 'Кино' },
    { value: 'politics', label: 'Политика' },
    { value: 'other', label: 'Другое' },
];

export const RARITY_LEVELS: { value: RarityLevel; label: string }[] = [
    { value: 'common', label: 'Обычный' },
    { value: 'rare', label: 'Редкий' },
    { value: 'legendary', label: 'Легендарный' },
];

export const EVIDENCE_OPTIONS: { value: EvidenceType; label: string }[] = [
    { value: 'photo', label: 'Фото' },
    { value: 'selfie', label: 'Селфи' },
    { value: 'ticket', label: 'Билет' },
    { value: 'video', label: 'Видео' },
    { value: 'certificate', label: 'Сертификат' },
];

export type Post = {
    id: string;
    ownerId: string | null;
    ownerName: string;
    uri: string;
    caption: string;
    timestamp: string;
    likes: number;
    liked: boolean;
    saved: boolean;
    comments: Comment[];
    celebrityName: string;
    location: string;
    dateReceived: string;
    category: PostCategory;
    rarity: RarityLevel;
    evidence: EvidenceType[];
    aiSuggestion?: string;
    aiConfidence?: number;
    isAnalyzed: boolean;
    realVotes: number;
    fakeVotes: number;
    realScore: number;
    fakeScore: number;
    votesByUser: Record<string, VoteChoice>;
    voteWeightsByUser: Record<string, number>;
};

export type CommunityCollector = {
    id: string;
    name: string;
    badge: string;
    specialty: string;
    score: number;
    featuredCelebrity: string;
    bio: string;
    city: string;
    yearsCollecting: number;
    verifiedCount: number;
    legendaryCount: number;
    showcase: Array<{
        id: string;
        title: string;
        note: string;
        authenticity: number;
        rarity: RarityLevel;
    }>;
};

export type UserProfile = {
    name: string;
    bio: string;
    notificationsEnabled: boolean;
    following: string[];
};

export type Collection = {
    id: string;
    name: string;
    description: string;
    color: string;
    postIds: string[];
    createdAt: string;
};

type AddPostInput = {
    uri: string;
    caption: string;
    celebrityName: string;
    location: string;
    dateReceived: string;
    category: PostCategory;
    rarity: RarityLevel;
    evidence: EvidenceType[];
    aiSuggestion?: string;
    aiConfidence?: number;
    isAnalyzed?: boolean;
};

type Reputation = {
    score: number;
    label: string;
    icon: string;
};

type SyncStatus = 'loading' | 'ready' | 'syncing' | 'offline' | 'error';

type PostsContextType = {
    posts: Post[];
    profile: UserProfile;
    communityCollectors: CommunityCollector[];
    currentUserId: string;
    isAuthenticated: boolean;
    canInteract: boolean;
    authUserEmail: string | null;
    reputation: Reputation;
    isCloudConfigured: boolean;
    syncStatus: SyncStatus;
    syncError: string | null;
    lastSyncedAt: string | null;
    collections: Collection[];
    addPost: (data: AddPostInput) => void;
    toggleLike: (postId: string) => void;
    toggleSaved: (postId: string) => void;
    addComment: (postId: string, text: string) => void;
    voteAuthenticity: (postId: string, vote: VoteChoice) => void;
    updateProfile: (data: Pick<UserProfile, 'name' | 'bio'>) => void;
    setNotificationsEnabled: (enabled: boolean) => void;
    toggleFollowCollector: (collectorId: string) => void;
    getCollectorById: (collectorId: string) => CommunityCollector | undefined;
    createCollection: (data: { name: string; description: string; color: string }) => Collection;
    updateCollection: (id: string, data: { name?: string; description?: string; color?: string }) => void;
    deleteCollection: (id: string) => void;
    addPostToCollection: (collectionId: string, postId: string) => void;
    removePostFromCollection: (collectionId: string, postId: string) => void;
    communities: Community[];
    createCommunity: (data: { name: string; description: string; category: CommunityCategory; isPrivate: boolean; emoji: string }) => Community;
    requestJoinCommunity: (communityId: string) => void;
    approveCommunityJoin: (communityId: string, userId: string) => void;
    rejectCommunityJoin: (communityId: string, userId: string) => void;
    leaveCommunity: (communityId: string) => void;
    friends: Friend[];
    friendRequests: FriendRequest[];
    friendIds: string[];
    friendList: Friend[];
    incomingFriendRequests: FriendRequest[];
    getFriendById: (friendId: string) => Friend | undefined;
    getFriendshipStatus: (otherId: string) => import('../lib/friends').Friendship;
    sendFriendRequest: (toId: string) => void;
    acceptFriendRequest: (otherId: string) => void;
    declineFriendRequest: (otherId: string) => void;
    cancelFriendRequest: (otherId: string) => void;
    removeFriend: (otherId: string) => void;
    messages: ChatMessage[];
    getThreadWith: (peerId: string) => ChatMessage[];
    sendMessage: (peerId: string, text: string) => void;
    markChatRead: (peerId: string) => void;
    refreshCloudData: () => Promise<void>;
    clearPosts: () => void;
    signOut: () => void;
  };

const GUEST_USER_ID = 'guest-user';
const STORAGE_KEY = 'autograph.local.state.v1';
const DEFAULT_PROFILE: UserProfile = {
    name: 'Autograph Collector',
    bio: 'Личный архив автографов, заметок и историй о встречах.',
    notificationsEnabled: true,
    following: ['arena-hunter'],
};

const COMMUNITY_COLLECTORS: CommunityCollector[] = [
    {
        id: 'arena-hunter',
        name: 'Arena Hunter',
        badge: '🥇',
        specialty: 'Спорт',
        score: 132,
        featuredCelebrity: 'Лионель Месси',
        bio: 'Охотится за подписями с крупных турниров и матчей, любит карточки с билетами и селфи.',
        city: 'Мадрид',
        yearsCollecting: 9,
        verifiedCount: 18,
        legendaryCount: 4,
        showcase: [
            {
                id: 'arena-1',
                title: 'Лионель Месси',
                note: 'Подпись после благотворительного матча.',
                authenticity: 96,
                rarity: 'legendary',
            },
            {
                id: 'arena-2',
                title: 'Новак Джокович',
                note: 'Автограф с турнира Masters.',
                authenticity: 88,
                rarity: 'rare',
            },
        ],
    },
    {
        id: 'signature-vault',
        name: 'Signature Vault',
        badge: '🥈',
        specialty: 'Кино',
        score: 94,
        featuredCelebrity: 'Киану Ривз',
        bio: 'Собирает подписи актёров на премьерах и фестивалях, любит карточки с сертификатами.',
        city: 'Торонто',
        yearsCollecting: 6,
        verifiedCount: 11,
        legendaryCount: 2,
        showcase: [
            {
                id: 'vault-1',
                title: 'Киану Ривз',
                note: 'Премьера фильма в TIFF.',
                authenticity: 91,
                rarity: 'legendary',
            },
            {
                id: 'vault-2',
                title: 'Райан Гослинг',
                note: 'Панель после показа.',
                authenticity: 84,
                rarity: 'rare',
            },
        ],
    },
    {
        id: 'backstage-pass',
        name: 'Backstage Pass',
        badge: '🥉',
        specialty: 'Музыка',
        score: 78,
        featuredCelebrity: 'Тейлор Свифт',
        bio: 'Фокусируется на музыкальных турах, проходках и backstage-подписях.',
        city: 'Лондон',
        yearsCollecting: 5,
        verifiedCount: 9,
        legendaryCount: 1,
        showcase: [
            {
                id: 'backstage-1',
                title: 'Тейлор Свифт',
                note: 'Подпись после саундчека.',
                authenticity: 89,
                rarity: 'legendary',
            },
            {
                id: 'backstage-2',
                title: 'Ed Sheeran',
                note: 'Автограф у служебного входа.',
                authenticity: 81,
                rarity: 'common',
            },
        ],
    },
];

const PostsContext = createContext<PostsContextType | undefined>(undefined);

// Seed-друзья для гостевого режима (offline-first демо). Соцграф на базе
// сообщества коллекционеров. presence/lastSeen фиксированы для детерминизма тестов.
const SEED_FRIENDS: Friend[] = [
    { id: 'arena-hunter', name: 'Arena Hunter', handle: 'arenahunter', avatar: '🥇', online: true, lastSeen: new Date().toISOString(), specialty: 'Спорт', mutualCount: 3 },
    { id: 'vinyl-girl', name: 'Vinyl Girl', handle: 'vinylgirl', avatar: '🎸', online: false, lastSeen: new Date(Date.now() - 12 * 60000).toISOString(), specialty: 'Музыка', mutualCount: 5 },
    { id: 'cinema-buff', name: 'Cinema Buff', handle: 'cinemabuff', avatar: '🎬', online: true, lastSeen: new Date().toISOString(), specialty: 'Кино', mutualCount: 2 },
    { id: 'rookie-sig', name: 'Rookie Sig', handle: 'rookiesig', avatar: '🌱', online: false, lastSeen: new Date(Date.now() - 3 * 3600000).toISOString(), specialty: 'Другое', mutualCount: 1 },
];

// Заявки в друзья для seed (чтобы были входящие и подтверждённые).
const SEED_FRIEND_REQUESTS: FriendRequest[] = [
    { id: 'seed-req-1', fromId: 'vinyl-girl', toId: 'guest-user', createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
    { id: 'seed-req-2', fromId: 'guest-user', toId: 'cinema-buff', createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
];

// Seed-переписка для демо (чтобы чат не был пустым при первом запуске).
const SEED_MESSAGES: ChatMessage[] = [
    { id: 'seed-msg-1', fromId: 'arena-hunter', toId: 'guest-user', text: 'Привет! Видел твою коллекцию — огонь 🔥', timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), read: false },
    { id: 'seed-msg-2', fromId: 'guest-user', toId: 'arena-hunter', text: 'Спасибо! Давно коллекционирую.', timestamp: new Date(Date.now() - 2.5 * 3600000).toISOString(), read: true },
    { id: 'seed-msg-3', fromId: 'arena-hunter', toId: 'guest-user', text: 'Есть автограф Месси с финала ЛЧ?', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), read: false },
];

type StoredState = {
    posts: Post[];
    profile: UserProfile;
    collections: Collection[];
    communities: Community[];
    friends: Friend[];
    friendRequests: FriendRequest[];
    messages: ChatMessage[];
    lastSyncedAt: string | null;
};

type CloudPostRow = {
    id: string;
    owner_id: string;
    payload: Post;
    updated_at: string;
};

function getReputation(posts: Post[]): Reputation {
    const score = posts.reduce((sum, post) => {
        const evidenceBonus = Math.min(post.evidence.length * 3, 12);
        const rarityBonus = post.rarity === 'legendary' ? 8 : post.rarity === 'rare' ? 4 : 0;
        return sum + post.realScore * 12 - post.fakeScore * 8 + evidenceBonus + rarityBonus;
    }, 0);

    if (score >= 80) {
        return { score, label: 'Эксперт', icon: '🥇' };
    }

    if (score >= 25) {
        return { score, label: 'Коллекционер', icon: '🥈' };
    }

    return { score, label: 'Новичок', icon: '🥉' };
}

function getVoteWeight(score: number) {
    if (score >= 80) return 3;
    if (score >= 25) return 2;
    return 1;
}

function normalizePost(post: Post, fallbackOwnerId: string | null, fallbackOwnerName: string): Post {
    return {
        ...post,
        ownerId: post.ownerId ?? fallbackOwnerId,
        ownerName: post.ownerName || fallbackOwnerName,
        comments: post.comments ?? [],
        votesByUser: post.votesByUser ?? {},
        voteWeightsByUser: post.voteWeightsByUser ?? {},
        saved: post.saved ?? false,
        liked: post.liked ?? false,
        likes: post.likes ?? 0,
    };
}

export const PostsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
    const [authUserId, setAuthUserId] = useState<string | null>(null);
    const [authUserEmail, setAuthUserEmail] = useState<string | null>(null);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('loading');
    const [syncError, setSyncError] = useState<string | null>(null);
    const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [communities, setCommunities] = useState<Community[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const isHydrated = useRef(false);
    const mountedRef = useRef(true);
    const profileRef = useRef(profile);
    const authUserIdRef = useRef<string | null>(null);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        profileRef.current = profile;
    }, [profile]);

    useEffect(() => {
        authUserIdRef.current = authUserId;
    }, [authUserId]);

    const currentUserId = authUserId ?? GUEST_USER_ID;
    const isAuthenticated = Boolean(authUserId);
    const canInteract = isAuthenticated;

    useEffect(() => {
        const loadLocalState = async () => {
            try {
                const rawState = await AsyncStorage.getItem(STORAGE_KEY);
                if (rawState) {
                    const storedState = JSON.parse(rawState) as Partial<StoredState>;
                    if (Array.isArray(storedState.posts)) {
                        setPosts(storedState.posts.map((post) => normalizePost(post, null, DEFAULT_PROFILE.name)));
                    }
                    if (storedState.profile) {
                        setProfile({ ...DEFAULT_PROFILE, ...storedState.profile });
                    }
                    if (storedState.lastSyncedAt) {
                        setLastSyncedAt(storedState.lastSyncedAt);
                    }
                    if (Array.isArray(storedState.communities)) {
                        setCommunities(storedState.communities);
                    }
                    // Друзья: если сохранено — грузим; иначе seed для демо.
                    if (Array.isArray(storedState.friends)) {
                        setFriends(storedState.friends);
                    } else {
                        setFriends(SEED_FRIENDS);
                    }
                    if (Array.isArray(storedState.friendRequests)) {
                        setFriendRequests(storedState.friendRequests);
                    } else {
                        setFriendRequests(SEED_FRIEND_REQUESTS);
                    }
                    // Сообщения: если сохранено — грузим; иначе seed.
                    if (Array.isArray(storedState.messages)) {
                        setMessages(storedState.messages);
                    } else {
                        setMessages(SEED_MESSAGES);
                    }
                }
                setSyncStatus(isSupabaseConfigured ? 'ready' : 'offline');
            } catch (error) {
                console.warn(error);
                setSyncStatus('error');
                setSyncError('Не удалось загрузить локальную коллекцию.');
            } finally {
                isHydrated.current = true;
            }
        };

        loadLocalState();
    }, []);

    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!isHydrated.current) return;

        // Debounce: ждем 500ms после последнего изменения перед сохранением
        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
        }

        saveTimerRef.current = setTimeout(async () => {
            try {
                const state: StoredState = { posts, profile, collections, communities, friends, friendRequests, messages, lastSyncedAt };
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            } catch (error) {
                showToast(error instanceof Error ? error.message : 'Ошибка при сохранении данных', 'error');
            }
        }, 500);

        return () => {
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }
        };
    }, [lastSyncedAt, posts, profile, collections, communities]);

    const persistProfileToCloud = useCallback(async (nextProfile: UserProfile, userId = authUserIdRef.current) => {
        if (!isSupabaseConfigured || !userId) return;

        const now = new Date().toISOString();
        const { error } = await supabase.from('autograph_profiles').upsert({
            user_id: userId,
            name: nextProfile.name,
            bio: nextProfile.bio,
            notifications_enabled: nextProfile.notificationsEnabled,
            following: nextProfile.following,
            payload: nextProfile,
            updated_at: now,
        });

        if (error) {
            setSyncStatus('error');
            setSyncError(error.message);
            return;
        }

        setLastSyncedAt(now);
        setSyncStatus('ready');
    }, []);

    // Queue-based cloud sync: collects post updates, writes batch with debounce
    const postQueueRef = useRef<Map<string, Post>>(new Map());
    const postFlushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const flushPostQueue = useCallback(async () => {
        const userId = authUserIdRef.current;
        if (!isSupabaseConfigured || !userId || postQueueRef.current.size === 0) return;

        const batch = new Map(postQueueRef.current);
        postQueueRef.current.clear();

        try {
            const rows = Array.from(batch.values()).map((post) => {
                const ownerId = post.ownerId ?? userId;
                const normalizedPost = normalizePost(post, ownerId, post.ownerName || profileRef.current.name);
                return {
                    id: normalizedPost.id,
                    owner_id: ownerId,
                    celebrity_name: normalizedPost.celebrityName,
                    category: normalizedPost.category,
                    rarity: normalizedPost.rarity,
                    payload: normalizedPost,
                    updated_at: new Date().toISOString(),
                };
            });

            const { error } = await supabase.from('autograph_posts').upsert(rows);

            if (!mountedRef.current) return;
            if (error) {
                setSyncStatus('error');
                setSyncError(error.message);
                // Re-queue failed posts
                for (const post of batch.values()) {
                    postQueueRef.current.set(post.id, post);
                }
            } else {
                setLastSyncedAt(new Date().toISOString());
                setSyncStatus('ready');
            }
        } catch (e) {
            if (!mountedRef.current) return;
            showToast('Ошибка синхронизации. Попробуйте позже.', 'error');
            for (const post of batch.values()) {
                postQueueRef.current.set(post.id, post);
            }
        }
    }, []);

    const scheduleFlush = useCallback(() => {
        if (postFlushTimerRef.current) clearTimeout(postFlushTimerRef.current);
        postFlushTimerRef.current = setTimeout(() => {
            flushPostQueue();
        }, 1000); // Flush after 1 second of inactivity
    }, [flushPostQueue]);

    const persistPostToCloud = useCallback((post: Post, userId = authUserIdRef.current) => {
        if (!isSupabaseConfigured || !userId) return;
        postQueueRef.current.set(post.id, post);
        scheduleFlush();
    }, [scheduleFlush]);

    const refreshCloudData = useCallback(async () => {
        if (!isSupabaseConfigured) {
            setSyncStatus('offline');
            setSyncError('Добавьте настройки облачной синхронизации в .env.');
            return;
        }

        setSyncStatus('syncing');
        setSyncError(null);

        try {
            const {
                data: { session },
                error: sessionError,
            } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;

            const user = session?.user ?? null;
            setAuthUserId(user?.id ?? null);
            setAuthUserEmail(user?.email ?? null);
            authUserIdRef.current = user?.id ?? null;

            if (user) {
                const { data: remoteProfile, error: remoteProfileError } = await supabase
                    .from('autograph_profiles')
                    .select('payload')
                    .eq('user_id', user.id)
                    .maybeSingle();
                if (remoteProfileError) throw remoteProfileError;

                const nextProfile = remoteProfile?.payload
                    ? { ...DEFAULT_PROFILE, ...(remoteProfile.payload as UserProfile) }
                    : { ...DEFAULT_PROFILE, name: user.email?.split('@')[0] || DEFAULT_PROFILE.name };

                setProfile(nextProfile);
                profileRef.current = nextProfile;

                if (!remoteProfile?.payload) {
                    await persistProfileToCloud(nextProfile, user.id);
                }
            } else {
                setProfile(DEFAULT_PROFILE);
                profileRef.current = DEFAULT_PROFILE;
            }

            const { data: remotePosts, error: remotePostsError } = await supabase
                .from('autograph_posts')
                .select('id, owner_id, payload, updated_at')
                .order('updated_at', { ascending: false });
            if (remotePostsError) throw remotePostsError;

            const nextPosts = ((remotePosts ?? []) as CloudPostRow[]).map((row) =>
                normalizePost(row.payload, row.owner_id, row.payload.ownerName || 'Collector')
            );

            setPosts(nextPosts);
            setLastSyncedAt(new Date().toISOString());
            setSyncStatus('ready');
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Не удалось загрузить данные из облака.', 'error');
            setSyncStatus('error');
            setSyncError(error instanceof Error ? error.message : 'Не удалось загрузить данные из облака.');
        }
    }, [persistProfileToCloud]);

    useEffect(() => {
        if (!isSupabaseConfigured) {
            setSyncStatus('offline');
            return;
        }

        refreshCloudData();
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setAuthUserId(session?.user?.id ?? null);
            setAuthUserEmail(session?.user?.email ?? null);
            authUserIdRef.current = session?.user?.id ?? null;
            refreshCloudData();
        });

        return () => subscription.unsubscribe();
    }, [refreshCloudData]);

    const addPost = ({
        uri,
        caption,
        celebrityName,
        location,
        dateReceived,
        category,
        rarity,
        evidence,
        aiSuggestion,
        aiConfidence,
        isAnalyzed = false,
    }: AddPostInput) => {
        const ownerId = authUserIdRef.current;
        const ownerName = profileRef.current.name;
        const newPost: Post = {
            ownerId,
            ownerName,
            uri,
            caption,
            celebrityName,
            location,
            dateReceived,
            category,
            rarity,
            evidence,
            aiSuggestion,
            aiConfidence,
            isAnalyzed,
            id: generateId(),
            timestamp: new Date().toISOString(),
            likes: 0,
            liked: false,
            saved: false,
            comments: [],
            realVotes: 0,
            fakeVotes: 0,
            realScore: 0,
            fakeScore: 0,
            votesByUser: {},
            voteWeightsByUser: {},
        };

        setPosts((prev) => [newPost, ...prev]);
        if (ownerId) {
            persistPostToCloud(newPost, ownerId);
        }
    };

    const toggleLike = (postId: string) => {
        if (!authUserIdRef.current) return;
        setPosts((prev) =>
            prev.map((post) => {
                if (post.id !== postId) return post;
                const nextPost = { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 };
                persistPostToCloud(nextPost);
                return nextPost;
            })
        );
    };

    const toggleSaved = (postId: string) => {
        setPosts((prev) =>
            prev.map((post) => {
                if (post.id !== postId) return post;
                const nextPost = { ...post, saved: !post.saved };
                if (authUserIdRef.current) {
                    persistPostToCloud(nextPost);
                }
                return nextPost;
            })
        );
    };

    const addComment = (postId: string, text: string) => {
        if (!authUserIdRef.current) return;
        const trimmed = text.trim();
        if (!trimmed || trimmed.length > 1000) return;

        const newComment: Comment = {
            id: generateId(),
            user: profile.name,
            text: trimmed.slice(0, 1000),
            timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        };

        setPosts((prev) =>
            prev.map((post) => {
                if (post.id !== postId) return post;
                const nextPost = { ...post, comments: [...post.comments, newComment] };
                persistPostToCloud(nextPost);
                return nextPost;
            })
        );
    };

    const reputation = useMemo(() => getReputation(posts), [posts]);

    const lastVoteTimeRef = useRef<Record<string, number>>({});

    const voteAuthenticity = (postId: string, vote: VoteChoice) => {
        const userId = authUserIdRef.current;
        if (!userId) return;

        // Rate limit: max 1 vote per post per 2 seconds
        const now = Date.now();
        const lastVote = lastVoteTimeRef.current[postId] || 0;
        if (now - lastVote < 2000) return;
        lastVoteTimeRef.current[postId] = now;
        const voteWeight = getVoteWeight(reputation.score);

        setPosts((prev) =>
            prev.map((post) => {
                if (post.id !== postId) return post;
                if (post.ownerId === userId) return post;

                const previousVote = post.votesByUser[userId];
                const previousWeight = post.voteWeightsByUser[userId] ?? voteWeight;
                if (previousVote === vote) return post;

                const nextVotesByUser = {
                    ...post.votesByUser,
                    [userId]: vote,
                };

                const nextVoteWeightsByUser = {
                    ...post.voteWeightsByUser,
                    [userId]: voteWeight,
                };

                let realVotes = post.realVotes;
                let fakeVotes = post.fakeVotes;
                let realScore = post.realScore;
                let fakeScore = post.fakeScore;

                if (previousVote === 'real') {
                    realVotes -= 1;
                    realScore -= previousWeight;
                }
                if (previousVote === 'fake') {
                    fakeVotes -= 1;
                    fakeScore -= previousWeight;
                }
                if (vote === 'real') {
                    realVotes += 1;
                    realScore += voteWeight;
                }
                if (vote === 'fake') {
                    fakeVotes += 1;
                    fakeScore += voteWeight;
                }

                const nextPost = {
                    ...post,
                    realVotes,
                    fakeVotes,
                    realScore,
                    fakeScore,
                    votesByUser: nextVotesByUser,
                    voteWeightsByUser: nextVoteWeightsByUser,
                };
                persistPostToCloud(nextPost);
                return nextPost;
            })
        );
    };

    const updateProfile = (data: Pick<UserProfile, 'name' | 'bio'>) => {
        const newName = data.name.trim() || profileRef.current.name;
        const newBio = data.bio.trim() || profileRef.current.bio;

        const nextProfile = { ...profileRef.current, name: newName, bio: newBio };
        profileRef.current = nextProfile;

        setProfile(nextProfile);

        // Persist profile to cloud (single write, no per-post updates)
        persistProfileToCloud(nextProfile);

        // Update ownerName locally (no cloud writes per post)
        if (authUserIdRef.current) {
            setPosts((prev) =>
                prev.map((post) =>
                    post.ownerId === authUserIdRef.current
                        ? { ...post, ownerName: newName }
                        : post
                )
            );
        }
    };

    const setNotificationsEnabled = (enabled: boolean) => {
        const nextProfile = { ...profileRef.current, notificationsEnabled: enabled };
        setProfile(nextProfile);
        profileRef.current = nextProfile;
        persistProfileToCloud(nextProfile);
    };

    const toggleFollowCollector = (collectorId: string) => {
        const nextProfile = {
            ...profileRef.current,
            following: profileRef.current.following.includes(collectorId)
                ? profileRef.current.following.filter((id) => id !== collectorId)
                : [...profileRef.current.following, collectorId],
        };
        setProfile(nextProfile);
        profileRef.current = nextProfile;
        persistProfileToCloud(nextProfile);
    };

    const clearPosts = () => {
        setPosts([]);
        // Persist empty state locally (debounced save will handle it)
    };

    const getCollectorById = (collectorId: string) => {
        return COMMUNITY_COLLECTORS.find((collector) => collector.id === collectorId);
    };

    // ─── Friends (соцграф, offline-first) ──────────
    const getFriendById = (friendId: string) => friends.find((f) => f.id === friendId);

    const sendFriendRequest = (toId: string) => {
        if (!canInteract) return;
        hapticLight();
        const next = sendFriendReq(friendRequests, currentUserId, toId, `req-${currentUserId}-${toId}-${Date.now()}`);
        setFriendRequests(next);
    };

    const acceptFriendRequest = (otherId: string) => {
        if (!canInteract) return;
        hapticLight();
        const next = acceptFriendReq(friendRequests, currentUserId, otherId);
        setFriendRequests(next);
    };

    const declineFriendRequest = (otherId: string) => {
        hapticLight();
        // Удаляем встречную (входящую) заявку.
        const next = friendRequests.filter((r) => !(r.fromId === otherId && r.toId === currentUserId));
        setFriendRequests(next);
    };

    const cancelFriendRequest = (otherId: string) => {
        hapticLight();
        const next = friendRequests.filter((r) => !(r.fromId === currentUserId && r.toId === otherId));
        setFriendRequests(next);
    };

    const removeFriend = (otherId: string) => {
        hapticLight();
        setFriendRequests(removeFriendFn(friendRequests, currentUserId, otherId));
    };

    // Производные: id друзей, входящие заявки, friendship-статус.
    const friendIds = useMemo(() => getFriendIds(friendRequests, currentUserId), [friendRequests, currentUserId]);
    const incomingFriendRequests = useMemo(() => getIncomingRequests(friendRequests, currentUserId), [friendRequests, currentUserId]);
    const getFriendshipStatus = (otherId: string) => getFriendship(friendRequests, currentUserId, otherId);
    const friendList = useMemo(
        () => friends.filter((f) => friendIds.includes(f.id)),
        [friends, friendIds]
    );

    // ─── Chat (DM, offline-first) ─────────────────
    const getThreadWith = (peerId: string) => getThread(messages, currentUserId, peerId);

    const sendMessage = (peerId: string, text: string) => {
        const trimmed = text.trim();
        if (!canInteract || !trimmed) return;
        hapticLight();
        const message = createMsg(
            { fromId: currentUserId, toId: peerId, text: trimmed },
            `msg-${currentUserId}-${peerId}-${Date.now()}`
        );
        setMessages(appendMessage(messages, message));
    };

    const markChatRead = (peerId: string) => {
        setMessages(markThreadReadFn(messages, currentUserId, peerId));
    };

    const createCollection = (data: { name: string; description: string; color: string }): Collection => {
        const newCollection: Collection = {
            id: generateId(),
            name: data.name,
            description: data.description,
            color: data.color,
            postIds: [],
            createdAt: new Date().toISOString(),
        };
        setCollections((prev) => [...prev, newCollection]);
        return newCollection;
    };

    const updateCollection = (id: string, data: { name?: string; description?: string; color?: string }) => {
        setCollections((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    };

    const deleteCollection = (id: string) => {
        setCollections((prev) => prev.filter((c) => c.id !== id));
    };

    const addPostToCollection = (collectionId: string, postId: string) => {
        setCollections((prev) =>
            prev.map((c) => (c.id === collectionId ? { ...c, postIds: [...new Set(c.postIds), postId] } : c))
        );
    };

    const removePostFromCollection = (collectionId: string, postId: string) => {
        setCollections((prev) =>
            prev.map((c) => (c.id === collectionId ? { ...c, postIds: c.postIds.filter((id) => id !== postId) } : c))
        );
    };

    const createCommunity = (data: { name: string; description: string; category: CommunityCategory; isPrivate: boolean; emoji: string }): Community => {
        const newCommunity = buildCommunity(data, currentUserId, generateId());
        setCommunities((prev) => [newCommunity, ...prev]);
        hapticLight();
        showToast(newCommunity.isPrivate ? 'Приватное сообщество создано' : 'Сообщество создано', 'success');
        return newCommunity;
    };

    const requestJoinCommunity = (communityId: string) => {
        setCommunities((prev) => prev.map((c) => (c.id === communityId ? requestJoinFn(c, currentUserId) : c)));
    };

    const approveCommunityJoin = (communityId: string, userId: string) => {
        setCommunities((prev) => prev.map((c) => (c.id === communityId ? approveCommunityMember(c, userId) : c)));
    };

    const rejectCommunityJoin = (communityId: string, userId: string) => {
        setCommunities((prev) => prev.map((c) => (c.id === communityId ? rejectCommunityMember(c, userId) : c)));
    };

    const leaveCommunity = (communityId: string) => {
        setCommunities((prev) => prev.map((c) => (c.id === communityId ? leaveCommunityFn(c, currentUserId) : c)));
    };

    const signOut = async () => {
        if (isSupabaseConfigured) {
            try { await supabase.auth.signOut(); } catch (e) { showToast('Ошибка при выходе', 'error'); }
        }
        setProfile(DEFAULT_PROFILE);
        setAuthUserId(null);
        setAuthUserEmail(null);
        authUserIdRef.current = null;
        setSyncStatus(isSupabaseConfigured ? 'ready' : 'offline');
        setSyncError(null);
        refreshCloudData();
    };

    return (
        <PostsContext.Provider
            value={{
                posts,
                profile,
                communityCollectors: COMMUNITY_COLLECTORS,
                currentUserId,
                isAuthenticated,
                canInteract,
                authUserEmail,
                reputation,
                isCloudConfigured: isSupabaseConfigured,
                syncStatus,
                syncError,
                lastSyncedAt,
                collections,
                addPost,
                toggleLike,
                toggleSaved,
                addComment,
                voteAuthenticity,
                updateProfile,
                setNotificationsEnabled,
                toggleFollowCollector,
                getCollectorById,
                createCollection,
                updateCollection,
                deleteCollection,
                addPostToCollection,
                removePostFromCollection,
                communities,
                createCommunity,
                requestJoinCommunity,
                approveCommunityJoin,
                rejectCommunityJoin,
                leaveCommunity,
                friends,
                friendRequests,
                friendIds,
                friendList,
                incomingFriendRequests,
                getFriendById,
                getFriendshipStatus,
                sendFriendRequest,
                acceptFriendRequest,
                declineFriendRequest,
                cancelFriendRequest,
                removeFriend,
                messages,
                getThreadWith,
                sendMessage,
                markChatRead,
                refreshCloudData,
                clearPosts,
                signOut,
            }}
        >
            {children}
        </PostsContext.Provider>
    );
};

export const usePosts = () => {
    const context = useContext(PostsContext);
    if (!context) throw new Error('usePosts must be used within PostsProvider');
    return context;
};



