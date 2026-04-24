import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function AuthScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            router.replace('/'); // Редирект на главную
        } catch (err: any) {
            Alert.alert('Ошибка входа', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            Alert.alert('Успех', 'Письмо подтверждение отправлено (или вход выполнен)');
            router.replace('/');
        } catch (err: any) {
            Alert.alert('Ошибка регистрации', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🔐 Autograph</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Пароль"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <View style={styles.buttonContainer}>
                <Button title="Войти" onPress={handleLogin} disabled={loading} />
                <View style={{ marginVertical: 10 }} />
                <Button title="Регистрация" onPress={handleRegister} disabled={loading} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, // !!! ЭТО ВАЖНО: растягивает экран на всю высоту
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff'
    },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
    input: { marginVertical: 8, padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, fontSize: 16 },
    buttonContainer: { marginTop: 20 },
});