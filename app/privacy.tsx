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
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing, typography } from '../lib/theme';


export default function PrivacyScreen() {
    const { colors } = useTheme();
    const { t } = useLanguage();
    const router = useRouter();

    // Тексты зависят от языка — секции собираются в компоненте.
    const SECTION = [
        { title: t('privacyS1Title'), body: t('privacyS1Body') },
        { title: t('privacyS2Title'), body: t('privacyS2Body') },
        { title: t('privacyS3Title'), body: t('privacyS3Body') },
        { title: t('privacyS4Title'), body: t('privacyS4Body') },
        { title: t('privacyS5Title'), body: t('privacyS5Body') },
        { title: t('privacyS6Title'), body: t('privacyS6Body') },
    ];

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel={t('back')}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[typography.h2, { color: colors.text }]}>{t('privacyTitle')}</Text>
                <View style={styles.backBtn} />
            </View>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <Text style={[typography.caption, { color: colors.textTertiary, marginBottom: spacing.md }]}>
                    {t('privacyUpdated')}
                </Text>
                {SECTION.map((s) => (
                    <View key={s.title} style={[styles.card, { backgroundColor: colors.card }]}>
                        <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.sm }]}>{s.title}</Text>
                        <Text style={[typography.body, { color: colors.textSecondary }]}>{s.body}</Text>
                    </View>
                ))}
                <TouchableOpacity
                    style={[styles.mailButton, { backgroundColor: colors.accentLight }]}
                    onPress={() => Linking.openURL('mailto:autograph.app.support@gmail.com')}
                    accessibilityRole="button"
                    accessibilityLabel={t('privacySupport')}
                >
                    <Ionicons name="mail-outline" size={18} color={colors.accent} />
                    <Text style={[typography.bodyMedium, { color: colors.accent }]}>{t('privacySupport')}</Text>
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
