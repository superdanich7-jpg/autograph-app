/**
 * Privacy Policy — политика конфиденциальности (R-16, F-24).
 * Экран доступен из профиля → Настройки; на web-стенде — по /privacy.
 * Требование Google Play / App Store при публикации.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing, typography } from '../lib/theme';

const SECTION = [
    {
        title: '1. Какие данные мы обрабатываем',
        body: '• Email и пароль — только для входа в аккаунт (пароль хранится в виде хеша).\n• Фотографии автографов, которые вы сами загружаете.\n• Метаданные поста: имя знаменитости, категория, редкость, дата и место получения (по желанию).\n• Данные на устройстве (локальная коллекция, настройки) — хранятся локально и не покидают телефон без вашего входа в аккаунт.',
    },
    {
        title: '2. Где хранятся данные',
        body: 'Облачные данные — в Supabase (регион EU, Ирландия). Фото — в объектном хранилище Supabase Storage. Передача данных выполняется по HTTPS.',
    },
    {
        title: '3. Аналитика',
        body: 'Мы можем собирать обезличенную статистику использования (события вроде «создан пост», «поделиться») для улучшения продукта. Данные не продаются и не передаются третьим лицам для рекламы.',
    },
    {
        title: '4. Ваши права',
        body: 'Вы можете в любой момент: экспортировать коллекцию (Настройки → Ещё → Экспорт), удалить локальные данные (Настройки → Очистить кэш) или запросить удаление аккаунта и облачных данных по контакту ниже.',
    },
    {
        title: '5. Дети',
        body: 'Приложение не предназначено для лиц младше 13 лет.',
    },
    {
        title: '6. Контакты',
        body: 'Вопросы по приватности: autograph.app.support@gmail.com',
    },
];

export default function PrivacyScreen() {
    const { colors } = useTheme();
    const router = useRouter();

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Назад">
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[typography.h2, { color: colors.text }]}>Политика конфиденциальности</Text>
                <View style={styles.backBtn} />
            </View>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <Text style={[typography.caption, { color: colors.textTertiary, marginBottom: spacing.md }]}>
                    Последнее обновление: 26 октября 2026
                </Text>
                {SECTION.map((s) => (
                    <View key={s.title} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.sm }]}>{s.title}</Text>
                        <Text style={[typography.body, { color: colors.textSecondary }]}>{s.body}</Text>
                    </View>
                ))}
                <TouchableOpacity
                    style={[styles.mailButton, { backgroundColor: colors.accentLight }]}
                    onPress={() => Linking.openURL('mailto:autograph.app.support@gmail.com')}
                    accessibilityRole="button"
                    accessibilityLabel="Написать в поддержку"
                >
                    <Ionicons name="mail-outline" size={18} color={colors.accent} />
                    <Text style={[typography.bodyMedium, { color: colors.accent }]}>Написать в поддержку</Text>
                </TouchableOpacity>
            </ScrollView>
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
    card: {
        borderWidth: 1,
        borderRadius: radii.lg,
        padding: spacing.lg,
    },
    mailButton: {
        borderRadius: radii.full,
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },
});
