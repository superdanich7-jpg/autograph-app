import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type Colors = ReturnType<typeof useTheme>['colors'];

export type AnalysisResult = {
    suggestion: string;
    confidence: number;
};

export default function AnalysisCard({
    analyzing,
    result,
    colors,
}: {
    analyzing: boolean;
    result: AnalysisResult | null;
    colors: Colors;
}) {
    if (!analyzing && !result) return null;

    if (analyzing) {
        return (
            <View style={[styles.analysisCard, { backgroundColor: colors.surface }]}>
                <ActivityIndicator color={colors.primary} />
                <Text style={[styles.analysisTitle, { color: colors.text }]}>Проверяю подпись...</Text>
                <Text style={[styles.analysisHint, { color: colors.textSecondary }]}>
                    Выполняю предварительную оценку по фото и доступным признакам.
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.analysisCard, { backgroundColor: colors.surface }]}>
            <View style={styles.analysisHeader}>
                <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
                <Text style={[styles.analysisTitle, { color: colors.text }]}>Предварительная проверка</Text>
            </View>
            <Text style={[styles.analysisResult, { color: colors.text }]}>
                Возможное совпадение: {result?.suggestion}
            </Text>
            <Text style={[styles.analysisHint, { color: colors.textSecondary }]}>
                Уверенность оценки: {result?.confidence}%
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    analysisCard: {
        borderRadius: 16,
        padding: 14,
        gap: 6,
        marginTop: 12,
    },
    analysisHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    analysisTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    analysisResult: {
        fontSize: 14,
        fontWeight: '600',
    },
    analysisHint: {
        fontSize: 13,
        lineHeight: 18,
    },
});