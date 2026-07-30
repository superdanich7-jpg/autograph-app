import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
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
import { useTheme } from '../context/ThemeContext';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

type Message = {
    type: 'error' | 'success' | 'info';
    text: string;
};

type AuthAction = 'login' | 'register';

function getFriendlyAuthError(message: string) {
    const normalized = message.toLowerCase();

    if (normalized.includes('invalid login credentials')) {
        return 'Неверный email или пароль. Проверьте данные и попробуйте еще раз.';
    }

    if (normalized.includes('email not confirmed')) {
        return 'Email еще не подтвержден. Откройте письмо и подтвердите аккаунт.';
    }

    if (normalized.includes('already registered') || normalized.includes('user already registered')) {
        return 'Аккаунт с таким email уже есть. Попробуйте войти.';
    }

    if (normalized.includes('password') && normalized.includes('6')) {
        return 'Пароль должен быть не короче 6 символов.';
    }

    if (normalized.includes('signup')) {
        return 'Регистрация сейчас временно отключена.';
    }

    return message || 'Сервис авторизации вернул ошибку.';
}

export default function AuthScreen() {
    const router = useRouter();
    const { colors } = useTheme();
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
                text: 'Облачная синхронизация не подключена. Проверьте настройки окружения.',
            });
            return false;
        }

        if (!email.trim() || !email.includes('@')) {
            setMessage({ type: 'error', text: 'Введите корректный email.' });
            return false;
        }

        if (password.length < 6) {
            setMessage({ type: 'error', text: 'Пароль должен быть не короче 6 символов.' });
            return false;
        }

        return true;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoadingAction('login');
        setMessage({ type: 'info', text: 'Проверяю данные аккаунта...' });

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password,
            });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Вход выполнен. Перехожу в профиль...' });
            router.replace('/profile');
        } catch (error) {
            setMessage({
                type: 'error',
                text: getFriendlyAuthError(error instanceof Error ? error.message : ''),
            });
        } finally {
            setLoadingAction(null);
        }
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoadingAction('register');
        setMessage({ type: 'info', text: 'Создаю аккаунт...' });

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim().toLowerCase(),
                password,
                options: {
                    emailRedirectTo:
                        Platform.OS === 'web' && typeof window !== 'undefined'
                            ? `${window.location.origin}/auth`
                            : Linking.createURL('/auth'),
                },
            });

            if (error) throw error;

            if (data.session) {
                setMessage({ type: 'success', text: 'Аккаунт создан. Перехожу в профиль...' });
                router.replace('/profile');
                return;
            }

            setMessage({
                type: 'success',
                text: 'Аккаунт создан. Если включено подтверждение email, откройте письмо и подтвердите вход.',
            });
        } catch (error) {
            setMessage({
                type: 'error',
                text: getFriendlyAuthError(error instanceof Error ? error.message : ''),
            });
        } finally {
            setLoadingAction(null);
        }
    };

    const handleGuestMode = () => {
        setMessage({ type: 'info', text: 'Гостевой режим: просмотр доступен, лайки, комментарии и голоса выключены.' });
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
                            Войдите, чтобы синхронизировать коллекцию в облаке.
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
                                autoCorrect={false}
                                keyboardType="email-address"
                                textContentType="emailAddress"
                            />

                            <Text style={[styles.label, { color: colors.textSecondary }]}>Пароль</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
                                ]}
                                placeholder="Минимум 6 символов"
                                placeholderTextColor={colors.placeholder}
                                secureTextEntry
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
                                        Войти
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
                                        Зарегистрироваться
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.guestButton} onPress={handleGuestMode} activeOpacity={0.8}>
                            <Text style={[styles.guestButtonText, { color: colors.textSecondary }]}>
                                Продолжить без входа
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
