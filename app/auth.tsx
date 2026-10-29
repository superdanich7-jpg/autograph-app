import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { withTimeout } from '../lib/async';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { Lang } from '../lib/i18n';
import { useTheme } from '../context/ThemeContext';
import { translate } from '../lib/i18n';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

type Message = {
    type: 'error' | 'success' | 'info';
    text: string;
};

type AuthAction = 'login' | 'register';

function getFriendlyAuthError(message: string, lang: Lang) {
    const normalized = message.toLowerCase();

    if (normalized.includes('invalid login credentials')) {
        return translate(lang, 'authWrongCredentials');
    }

    if (normalized.includes('email not confirmed')) {
        return translate(lang, 'authEmailNotConfirmed');
    }

    if (normalized.includes('already registered') || normalized.includes('user already registered')) {
        return translate(lang, 'authEmailExists');
    }

    if (normalized.includes('password') && normalized.includes('6')) {
        return translate(lang, 'authPasswordTooShort');
    }

    if (normalized.includes('signup')) {
        return translate(lang, 'authSignupDisabled');
    }

    return message || translate(lang, 'authServiceError');
}

export default function AuthScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { t, lang } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loadingAction, setLoadingAction] = useState<AuthAction | null>(null);
    const [message, setMessage] = useState<Message | null>(null);

    useEffect(() => {
        const checkExistingSession = async () => {
            if (Platform.OS === 'web' && typeof window !== 'undefined') {
                const code = new URL(window.location.href).searchParams.get('code');
                if (code) {
                    await supabase.auth.exchangeCodeForSession(code);
                    window.history.replaceState({}, document.title, '/auth');
                }
            }

            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session) {
                router.replace('/profile');
            }
        };

        checkExistingSession();
    }, [router]);

    const canSubmit = useMemo(() => {
        return isSupabaseConfigured && email.trim().length > 0 && password.length > 0 && !loadingAction;
    }, [email, loadingAction, password]);

    const validateForm = () => {
        if (!isSupabaseConfigured) {
            setMessage({
                type: 'error',
                text: t('authCloudNotConfigured'),
            });
            return false;
        }

        if (!email.trim() || !email.includes('@')) {
            setMessage({ type: 'error', text: t('authInvalidEmail') });
            return false;
        }

        if (password.length < 6) {
            setMessage({ type: 'error', text: t('authPasswordTooShort') });
            return false;
        }

        return true;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoadingAction('login');
        setMessage({ type: 'info', text: t('authChecking') });

        try {
            const { error } = await withTimeout(
                supabase.auth.signInWithPassword({
                    email: email.trim().toLowerCase(),
                    password,
                }),
                15000,
            );

            if (error) throw error;

            setMessage({ type: 'success', text: t('authSignedIn') });
            router.replace('/profile');
        } catch (error) {
            const message = error instanceof Error ? error.message : '';
            if (message.includes('Сервер не отвечает')) {
                setMessage({
                    type: 'error',
                    text: t('authServerNoResponseBody'),
                });
            } else {
                setMessage({
                    type: 'error',
                    text: getFriendlyAuthError(message, lang),
                });
            }
        } finally {
            setLoadingAction(null);
        }
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoadingAction('register');
        setMessage({ type: 'info', text: t('authCreating') });

        try {
            const { data, error } = await withTimeout(
                supabase.auth.signUp({
                    email: email.trim().toLowerCase(),
                    password,
                options: {
                    emailRedirectTo:
                        Platform.OS === 'web' && typeof window !== 'undefined'
                            ? `${window.location.origin}/auth`
                            : Linking.createURL('/auth'),
                    },
                }),
                15000,
            );

            if (error) throw error;

            if (data.session) {
                setMessage({ type: 'success', text: t('authCreated') });
                router.replace('/profile');
                return;
            }

            setMessage({
                type: 'success',
                text: t('authCreatedConfirm'),
            });
        } catch (error) {
            setMessage({
                type: 'error',
                text: getFriendlyAuthError(error instanceof Error ? error.message : '', lang),
            });
        } finally {
            setLoadingAction(null);
        }
    };

    const handleGuestMode = () => {
        setMessage({ type: 'info', text: t('authGuestBanner') });
        router.replace('/');
    };

    const messageBackground =
        message?.type === 'error'
            ? `${colors.danger}14`
            : message?.type === 'success'
                ? `${colors.primary}14`
                : colors.surface;

    const messageColor = message?.type === 'error' ? colors.danger : colors.text;

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                style={styles.keyboardWrap}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.iconWrap, { backgroundColor: colors.surface }]}>
                            <Ionicons name="finger-print-outline" size={34} color={colors.primary} />
                        </View>

                        <Text style={[styles.title, { color: colors.text }]}>Autograph</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            {t('authSubtitle')}
                        </Text>

                        <View style={styles.form}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
                                ]}
                                placeholder="you@example.com"
                                placeholderTextColor={colors.placeholder}
                                value={email}
                                onChangeText={(value) => {
                                    setEmail(value);
                                    setMessage(null);
                                }}
                                autoCapitalize="none"
                                autoComplete="username"
                                autoCorrect={false}
                                keyboardType="email-address"
                                textContentType="emailAddress"
                            />

                            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('authPassword')}</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
                                ]}
                                placeholder={t("authMinLength")}
                                placeholderTextColor={colors.placeholder}
                                secureTextEntry
                                autoComplete="current-password"
                                value={password}
                                onChangeText={(value) => {
                                    setPassword(value);
                                    setMessage(null);
                                }}
                                textContentType="password"
                            />
                        </View>

                        {message ? (
                            <View style={[styles.messageBox, { backgroundColor: messageBackground }]}>
                                <Ionicons
                                    name={message.type === 'error' ? 'alert-circle-outline' : 'information-circle-outline'}
                                    size={18}
                                    color={messageColor}
                                />
                                <Text style={[styles.messageText, { color: messageColor }]}>{message.text}</Text>
                            </View>
                        ) : null}

                        <TouchableOpacity
                            style={[
                                styles.primaryButton,
                                { backgroundColor: canSubmit ? colors.primary : colors.surface },
                            ]}
                            onPress={handleLogin}
                            activeOpacity={0.88}
                            disabled={!canSubmit}
                        >
                            {loadingAction === 'login' ? (
                                <ActivityIndicator color={colors.primaryText} />
                            ) : (
                                <>
                                    <Ionicons
                                        name="log-in-outline"
                                        size={18}
                                        color={canSubmit ? colors.primaryText : colors.textSecondary}
                                    />
                                    <Text
                                        style={[
                                            styles.primaryButtonText,
                                            { color: canSubmit ? colors.primaryText : colors.textSecondary },
                                        ]}
                                    >
                                        {t('signInAction')}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            onPress={handleRegister}
                            activeOpacity={0.88}
                            disabled={!canSubmit}
                        >
                            {loadingAction === 'register' ? (
                                <ActivityIndicator color={colors.text} />
                            ) : (
                                <>
                                    <Ionicons name="person-add-outline" size={18} color={colors.text} />
                                    <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                                        {t('authRegister')}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.guestButton} onPress={handleGuestMode} activeOpacity={0.8}>
                            <Text style={[styles.guestButtonText, { color: colors.textSecondary }]}>
                                {t('authGuestContinue')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    keyboardWrap: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 18,
    },
    card: {
        borderWidth: 1,
        borderRadius: 26,
        padding: 22,
    },
    iconWrap: {
        width: 72,
        height: 72,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        textAlign: 'center',
    },
    subtitle: {
        marginTop: 8,
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
    },
    form: {
        marginTop: 22,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 16,
        minHeight: 52,
        paddingHorizontal: 14,
        fontSize: 15,
        marginBottom: 14,
    },
    messageBox: {
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 12,
        flexDirection: 'row',
        gap: 8,
        marginBottom: 14,
    },
    messageText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '600',
    },
    primaryButton: {
        minHeight: 54,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        marginBottom: 10,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '800',
    },
    secondaryButton: {
        minHeight: 52,
        borderRadius: 18,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    secondaryButtonText: {
        fontSize: 15,
        fontWeight: '800',
    },
    guestButton: {
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    guestButtonText: {
        fontSize: 14,
        fontWeight: '700',
    },
});
