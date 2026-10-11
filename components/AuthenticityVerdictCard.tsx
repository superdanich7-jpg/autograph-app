import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Post } from '../context/PostsContext';
import { useTheme } from '../context/ThemeContext';
import { getAuthenticityVerdict, AuthenticityVerdict } from '../lib/authenticity';
import { getEvidenceLabel } from '../lib/helpers';

type Colors = ReturnType<typeof useTheme>['colors'];

const VERDICT_ICON: Record<string, string> = {
    genuine: 'shield-checkmark',
    'likely-fake': 'warning',
    disputed: 'help-buoy',
    inconclusive: 'help-circle-outline',
};

const CONFIDENCE_LABEL: Record<string, string> = {
    low: 'Низкая',
    medium: 'Средняя',
    high: 'Высокая',
};

function SignalBar({
    icon,
    label,
    value,
    color,
    colors,
}: {
    icon: string;
    label: string;
    value: number | null;
    color: string;
    colors: Colors;
}) {
    return (
        <View style={styles.signalRow}>
            <Ionicons name={icon as any} size={16} color={colors.textSecondary} />
            <Text style={[styles.signalLabel, { color: colors.textSecondary }]}>{label}</Text>
            <View style={[styles.signalTrack, { backgroundColor: colors.surface }]}>
                <View style={[styles.signalFill, { width: `${value ?? 0}%`, backgroundColor: color }]} />
            </View>
            <Text style={[styles.signalValue, { color: colors.text }]}>
                {value === null ? '—' : `${value}%`}
            </Text>
        </View>
    );
}

/**
 * AuthenticityVerdictCard — витрина нашего УТП.
 * Показывает объединённый вердикт «AI + сообщество + доказательства»
 * с разбивкой по сигналам. В отличие от платных аналогов — бесплатно.
 */
export default function AuthenticityVerdictCard({
    post,
    verdict,
}: {
    post: Post;
    verdict?: AuthenticityVerdict;
}) {
    const { colors } = useTheme();
    const v = verdict ?? getAuthenticityVerdict(post);

    const verdictColor = v.colorHint === 'success' ? colors.success
        : v.colorHint === 'danger' ? colors.danger
            : v.colorHint === 'warning' ? colors.warning
                : colors.info;
    const verdictBg = v.colorHint === 'success' ? colors.successLight
        : v.colorHint === 'danger' ? colors.dangerLight
            : v.colorHint === 'warning' ? colors.warningLight
                : colors.infoLight;

    return (
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.headerRow}>
                <Ionicons name="ribbon" size={18} color={colors.primary} />
                <Text style={[styles.headerTitle, { color: colors.text }]}>Вердикт Autograph</Text>
                <View style={[styles.confidenceChip, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.confidenceChipText, { color: colors.textSecondary }]}>
                        Уверенность: {CONFIDENCE_LABEL[v.confidenceLevel]}
                    </Text>
                </View>
            </View>

            <View style={[styles.verdictBlock, { backgroundColor: verdictBg }]}>
                <View style={[styles.verdictIconWrap, { backgroundColor: verdictColor }]}>
                    <Ionicons name={VERDICT_ICON[v.verdict] as any} size={26} color="#ffffff" />
                </View>
                <View style={styles.verdictTextWrap}>
                    <Text style={[styles.verdictLabel, { color: verdictColor }]}>{v.label}</Text>
                    <Text style={[styles.verdictScore, { color: colors.text }]}>
                        {v.score}% · {v.totalVotes} {v.totalVotes === 1 ? 'голос' : 'голосов'}
                    </Text>
                </View>
            </View>

            <View style={styles.signals}>
                <Text style={[styles.signalsTitle, { color: colors.textSecondary }]}>На основе</Text>
                <SignalBar icon="sparkles" label="AI-анализ" value={v.aiScore} color={colors.primary} colors={colors} />
                <SignalBar icon="people" label="Сообщество" value={v.communityScore} color={colors.info} colors={colors} />
                <SignalBar icon="document-attach" label="Доказательства" value={v.evidenceScore} color={colors.warning} colors={colors} />
            </View>

            {post.evidence.length > 0 && (
                <View style={styles.evidenceChips}>
                    {post.evidence.map((item, idx) => (
                        <View key={`${item}-${idx}`} style={[styles.evidenceChip, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.evidenceChipText, { color: colors.textSecondary }]}>
                                {getEvidenceLabel(item)}
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderRadius: 22,
        padding: 16,
        gap: 14,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 15,
        fontWeight: '700',
        flex: 1,
    },
    confidenceChip: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    confidenceChipText: {
        fontSize: 11,
        fontWeight: '600',
    },
    verdictBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        borderRadius: 18,
        padding: 14,
    },
    verdictIconWrap: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    verdictTextWrap: {
        flex: 1,
        gap: 2,
    },
    verdictLabel: {
        fontSize: 19,
        fontWeight: '800',
    },
    verdictScore: {
        fontSize: 13,
        fontWeight: '600',
    },
    signals: {
        gap: 8,
    },
    signalsTitle: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    signalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    signalLabel: {
        fontSize: 13,
        width: 110,
    },
    signalTrack: {
        flex: 1,
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    signalFill: {
        height: 8,
        borderRadius: 4,
    },
    signalValue: {
        fontSize: 12,
        fontWeight: '700',
        width: 40,
        textAlign: 'right',
    },
    evidenceChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    evidenceChip: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    evidenceChipText: {
        fontSize: 11,
        fontWeight: '600',
    },
});

