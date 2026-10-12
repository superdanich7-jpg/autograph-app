/**
 * ImportCollection — импорт коллекции из JSON (round-trip с ExportCollection).
 *
 * UX: кнопка → модалка с полем для вставки JSON → предпросмотр «найдено N»
 * → подтверждение → addPost для каждой записи. Без внешних file-picker
 * зависимостей (только Modal + TextInput из react-native).
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePosts } from '../context/PostsContext';
import { useTheme } from '../context/ThemeContext';
import { parseCollectionImport } from '../lib/collection-io';
import { hapticLight, hapticSuccess } from '../lib/haptics';
import { showToast } from './Toast';

export default function ImportCollection() {
    const { addPost } = usePosts();
    const { colors } = useTheme();
    const [visible, setVisible] = useState(false);
    const [raw, setRaw] = useState('');
    const [busy, setBusy] = useState(false);

    const parsed = raw.trim() ? parseCollectionImport(raw) : null;

    const handleImport = () => {
        if (!parsed || !parsed.valid) return;
        setBusy(true);
        hapticLight();
        let added = 0;
        for (const p of parsed.posts) {
            addPost({
                uri: p.uri || '',
                caption: p.caption || '',
                celebrityName: p.celebrityName || 'Без имени',
                location: p.location || '',
                dateReceived: p.dateReceived || '',
                category: (p.category as any) || 'other',
                rarity: (p.rarity as any) || 'common',
                evidence: (p.evidence as any) || [],
            });
            added += 1;
        }
        setBusy(false);
        hapticSuccess();
        showToast(`Импортировано автографов: ${added}`, 'success');
        setVisible(false);
        setRaw('');
        const warnings = parsed.errors.length > 0 ? `\n\nПредупреждения (${parsed.errors.length}):\n${parsed.errors.slice(0, 5).join('\n')}` : '';
        Alert.alert('Импорт завершён', `Добавлено записей: ${added}.${warnings}`);
    };

    return (
        <>
            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => {
                    hapticLight();
                    setVisible(true);
                }}
                activeOpacity={0.85}
            >
                <Ionicons name="cloud-upload-outline" size={18} color={colors.text} />
                <Text style={[styles.buttonText, { color: colors.text }]}>Импорт</Text>
            </TouchableOpacity>

            <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={() => setVisible(false)}>
                <SafeAreaView style={[styles.modal, { backgroundColor: colors.background }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.title, { color: colors.text }]}>Импорт коллекции</Text>
                        <TouchableOpacity onPress={() => setVisible(false)} style={styles.close}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.body}>
                        <Text style={[styles.hint, { color: colors.textSecondary }]}>
                            Вставьте JSON, экспортированный из Autograph (или похожий формат {'{ posts: [...] }'}).
                            Изображения восстановятся, только если они содержатся в файле.
                        </Text>
                        <TextInput
                            style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
                            placeholder='{ "posts": [ ... ] }'
                            placeholderTextColor={colors.placeholder}
                            value={raw}
                            onChangeText={setRaw}
                            multiline
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        {parsed ? (
                            <View style={[styles.preview, { backgroundColor: parsed.valid ? colors.successLight : colors.dangerLight }]}>
                                <Text style={[styles.previewText, { color: colors.text }]}>
                                    {parsed.valid
                                        ? `Готово к импорту: ${parsed.posts.length} автограф(ов)`
                                        : `Ошибка: ${parsed.errors[0] || 'не удалось разобрать'}`}
                                </Text>
                                {parsed.errors.length > 0 && parsed.valid ? (
                                    <Text style={[styles.previewWarn, { color: colors.textSecondary }]}>
                                        Предупреждений: {parsed.errors.length}
                                    </Text>
                                ) : null}
                            </View>
                        ) : null}
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.cta,
                            { backgroundColor: parsed?.valid ? colors.primary : colors.surface, opacity: busy ? 0.6 : 1 },
                        ]}
                        disabled={!parsed?.valid || busy}
                        onPress={handleImport}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="download-outline" size={18} color={parsed?.valid ? colors.primaryText : colors.textSecondary} />
                        <Text style={[styles.ctaText, { color: parsed?.valid ? colors.primaryText : colors.textSecondary }]}>
                            {busy ? 'Импортируем…' : 'Импортировать'}
                        </Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </Modal>
        </>
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
    modal: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 19,
        fontWeight: '700',
    },
    close: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    body: {
        flex: 1,
        padding: 16,
        gap: 12,
    },
    hint: {
        fontSize: 13,
        lineHeight: 19,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        fontSize: 13,
        minHeight: 180,
        textAlignVertical: 'top',
    },
    preview: {
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 4,
    },
    previewText: {
        fontSize: 14,
        fontWeight: '600',
    },
    previewWarn: {
        fontSize: 12,
    },
    cta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        margin: 16,
        paddingVertical: 15,
        borderRadius: 16,
    },
    ctaText: {
        fontSize: 15,
        fontWeight: '700',
    },
});
