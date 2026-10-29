/**
 * AuthGate — экран «нужен аккаунт»: закрывает профиль и загрузку для гостей.
 * Решение основателя (2026-10-29): без входа в этих разделах «вообще ничего нет»,
 * публикация только для зарегистрированных.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { hapticMedium } from '../lib/haptics';
import { radii, shadows, spacing, typography } from '../lib/theme';

type Props = {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    hint: string;
};

export default function AuthGate({ icon, title, hint }: Props) {
    const { colors } = useTheme();
    const { t, lang, setLang } = useLanguage();
    const router = useRouter();

    return (
        <View style={[styles.wrap, { backgroundColor: colors.background }]}>
            <View style={[styles.logoRing, { borderColor: colors.accent, ...shadows.md }]}>
                <View style={[styles.logo, { backgroundColor: colors.card }]}>
                    <Ionicons name={icon} size={40} color={colors.accent} />
                </View>
            </View>

            <Text style={[typography.h1, { color: colors.text, textAlign: 'center' }]}>{title}</Text>
            <Text style={[styles.hint, { color: colors.textSecondary }]}>{hint}</Text>

            <TouchableOpacity
                style={[styles.signInButton, { backgroundColor: colors.accent, ...shadows.md }]}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={t('signIn')}
                onPress={() => {
                    hapticMedium();
                    router.push('/auth');
                }}
            >
                <Ionicons name="log-in-outline" size={20} color="#0B1220" />
                <Text style={styles.signInText}>{t('signIn')}</Text>
            </TouchableOpacity>

            <View style={styles.langRow}>
                {(['ru', 'en'] as const).map((code) => (
                    <TouchableOpacity
                        key={code}
                        onPress={() => setLang(code)}
                        style={[
                            styles.langOption,
                            { backgroundColor: lang === code ? colors.primary : colors.card },
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={code === 'ru' ? 'Русский' : 'English'}
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
    );
}

const styles = StyleSheet.create({
    wrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xxl,
        gap: spacing.md,
    },
    logoRing: {
        width: 104,
        height: 104,
        borderRadius: radii.full,
        borderWidth: 3,
        padding: spacing.sm,
        marginBottom: spacing.sm,
    },
    logo: {
        flex: 1,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    hint: {
        ...typography.body,
        textAlign: 'center',
        maxWidth: 280,
        marginBottom: spacing.md,
    },
    signInButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        minHeight: 52,
        borderRadius: radii.full,
        paddingHorizontal: spacing.xxl,
    },
    signInText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0B1220',
    },
    langRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.lg,
    },
    langOption: {
        minWidth: 56,
        minHeight: 40,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.md,
    },
    langOptionText: {
        fontSize: 13,
        fontWeight: '700',
    },
});
