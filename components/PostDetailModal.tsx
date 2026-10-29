import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Post } from '../context/PostsContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { getCategoryLabel, getEvidenceLabel, getRarityLabel } from '../lib/helpers';
import AuthenticityVerdictCard from './AuthenticityVerdictCard';
import { showToast } from './Toast';
import { formatCertificateShareText, getAuthenticityVerdict } from '../lib/authenticity';
import { buildCertificateSvg } from '../lib/certificate';
import { getPostDeepLink } from '../lib/sharing';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Sheet } from './ui/Sheet';

type Colors = ReturnType<typeof useTheme>['colors'];

export default function PostDetailModal({
    post,
    visible,
    onClose,
    onShare,
    colors,
}: {
    post: Post | null;
    visible: boolean;
    onClose: () => void;
    onShare?: (post: Post) => void;
    colors: Colors;
}) {
    const { t } = useLanguage();
    if (!post) return null;

    const handleShareCertificate = async () => {
        try {
            const url = getPostDeepLink(post.id);
            // Пытаемся поделиться визуальным SVG-сертификатом с QR (паттерн PSA/Relic).
            const cert = buildCertificateSvg(post, url);
            try {
                const fileUri = `${FileSystem.cacheDirectory}${cert.fileName}`;
                await FileSystem.writeAsStringAsync(fileUri, cert.svg, {
                    encoding: FileSystem.EncodingType.UTF8,
                });
                const canShare = await Sharing.isAvailableAsync();
                if (canShare) {
                    await Sharing.shareAsync(fileUri, {
                        mimeType: 'image/svg+xml',
                        dialogTitle: t('shareCertificate'),
                        UTI: 'public.svg-image',
                    });
                    return;
                }
            } catch (svgError) {
                console.warn('[Certificate] SVG share fallback to text:', svgError);
            }
            // Фолбэк: текстовый сертификат, если файловый шейринг недоступен.
            const text = formatCertificateShareText(post, url);
            await Sharing.shareAsync(text, {
                mimeType: 'text/plain',
                dialogTitle: t('shareCertificate'),
            });
        } catch (error) {
            console.warn('[Certificate] Share failed:', error);
            showToast(t('shareCertificateError'), 'error');
        }
    };

    const verdict = getAuthenticityVerdict(post);

    return (
        <Sheet visible={visible} onClose={onClose} title={post.celebrityName} size="full">
            <View style={styles.contentHeader}>
                <TouchableOpacity onPress={handleShareCertificate} style={[styles.headerActionBtn, { backgroundColor: colors.surface }]}>
                    <Ionicons name="ribbon-outline" size={22} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onShare?.(post)} style={[styles.headerActionBtn, { backgroundColor: colors.surface }]}>
                    <Ionicons name="share-outline" size={22} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.detailScroll} showsVerticalScrollIndicator={false}>
                <Image source={{ uri: post.uri }} style={styles.detailImage} resizeMode="cover" />

                <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.detailTitle, { color: colors.text }]}>{post.celebrityName}</Text>
                    <Text style={[styles.detailMeta, { color: colors.textSecondary }]}>
                        {post.location} • {post.dateReceived}
                    </Text>
                    <Text style={[styles.detailDescription, { color: colors.text }]}>{post.caption || t('detailNoDescription')}</Text>

                    <View style={styles.detailBadges}>
                        <View style={[styles.badge, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.badgeText, { color: colors.text }]}>{getCategoryLabel(post.category)}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.badgeText, { color: colors.text }]}>{getRarityLabel(post.rarity)}</Text>
                        </View>
                    </View>

                    <Text style={[styles.evidenceTitle, { color: colors.textSecondary }]}>{t('detailEvidence')}</Text>
                    <View style={styles.detailBadges}>
                        {post.evidence.map((item) => (
                            <View key={item} style={[styles.badge, { backgroundColor: colors.surface }]}>
                                <Text style={[styles.badgeText, { color: colors.text }]}>{getEvidenceLabel(item)}</Text>
                            </View>
                        ))}
                    </View>

                    <AuthenticityVerdictCard post={post} verdict={verdict} />

                    {post.isAnalyzed && post.aiSuggestion ? (
                        <View style={[styles.aiCard, { backgroundColor: colors.surface }]}>
                            <View style={styles.aiTitleRow}>
                                <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
                                <Text style={[styles.aiTitle, { color: colors.text }]}>{t('detailIdentity')}</Text>
                            </View>
                            <Text style={[styles.aiHint, { color: colors.textSecondary }]}>
                                {post.aiSuggestion}
                                {typeof post.aiConfidence === 'number' ? ` · ${post.aiConfidence}% совпадения` : ''}
                            </Text>
                        </View>
                    ) : null}
                </View>
            </ScrollView>
        </Sheet>
    );
}

const styles = StyleSheet.create({
    contentHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 10,
        marginBottom: 4,
    },
    headerActionBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailScroll: {
        paddingBottom: 24,
        gap: 16,
    },
    detailImage: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 22,
    },
    detailCard: {
        borderWidth: 1,
        borderRadius: 22,
        padding: 16,
        gap: 10,
    },
    detailTitle: {
        fontSize: 22,
        fontWeight: '700',
    },
    detailMeta: {
        fontSize: 13,
        lineHeight: 18,
    },
    detailDescription: {
        fontSize: 15,
        lineHeight: 21,
    },
    detailBadges: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    badge: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 7,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    evidenceTitle: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    detailStats: {
        gap: 6,
    },
    detailConfidence: {
        fontSize: 13,
        fontWeight: '700',
    },
    aiCard: {
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 4,
    },
    aiTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    aiTitle: {
        fontSize: 13,
        fontWeight: '700',
    },
    aiHint: {
        fontSize: 13,
        lineHeight: 18,
    },
});