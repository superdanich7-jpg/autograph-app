/**
 * ExportCollection — экспорт коллекции автографов в JSON.
 * Позволяет пользователю скачать все свои автографы.
 */

import { Ionicons } from '@expo/vector-icons';
import { documentDirectory, EncodingType, writeAsStringAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native';
import { usePosts } from '../context/PostsContext';
import { useTheme } from '../context/ThemeContext';
import { getAuthenticityPercent, getCategoryLabel, getRarityLabel } from '../lib/helpers';
import { showToast } from './Toast';

export default function ExportCollection() {
    const { posts } = usePosts();
    const { colors } = useTheme();
    const [exporting, setExporting] = useState(false);

    async function handleExport() {
        if (posts.length === 0) {
            Alert.alert('Пустая коллекция', 'Нет автографов для экспорта.');
            return;
        }

        setExporting(true);

        try {
            const exportData = {
                exportedAt: new Date().toISOString(),
                version: '1.0',
                totalPosts: posts.length,
                posts: posts.map((p) => ({
                    id: p.id,
                    celebrityName: p.celebrityName,
                    category: p.category,
                    categoryLabel: getCategoryLabel(p.category),
                    rarity: p.rarity,
                    rarityLabel: getRarityLabel(p.rarity),
                    description: p.caption,
                    location: p.location,
                    dateReceived: p.dateReceived,
                    authenticity: getAuthenticityPercent(p),
                    realVotes: p.realVotes,
                    fakeVotes: p.fakeVotes,
                    realScore: p.realScore,
                    fakeScore: p.fakeScore,
                    saved: p.saved,
                    timestamp: p.timestamp,
                })),
                stats: {
                    totalPosts: posts.length,
                    totalRealVotes: posts.reduce((s, p) => s + p.realVotes, 0),
                    totalFakeVotes: posts.reduce((s, p) => s + p.fakeVotes, 0),
                    legendary: posts.filter((p) => p.rarity === 'legendary').length,
                    rare: posts.filter((p) => p.rarity === 'rare').length,
                    common: posts.filter((p) => p.rarity === 'common').length,
                },
            };

            const json = JSON.stringify(exportData, null, 2);
            const fileName = `autograph_collection_${Date.now()}.json`;
            const filePath = `${documentDirectory}${fileName}`;

            await writeAsStringAsync(filePath, json, {
                encoding: EncodingType.UTF8,
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(filePath, {
                    mimeType: 'application/json',
                    dialogTitle: 'Экспорт коллекции',
                    UTI: 'public.json',
                });
            } else {
                Alert.alert('Файл сохранён', `Путь: ${filePath}`);
            }
        } catch (e) {
            Alert.alert('Ошибка', 'Не удалось экспортировать коллекцию.');
            showToast('Ошибка при экспорте', 'error');
        } finally {
            setExporting(false);
        }
    }

    return (
        <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleExport}
            disabled={exporting}
        >
            <Ionicons name="download-outline" size={18} color={colors.text} />
            <Text style={[styles.buttonText, { color: colors.text }]}>
                {exporting ? 'Экспорт...' : `Экспорт (${posts.length})`}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
    },
});