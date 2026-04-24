// app/(tabs)/upload.tsx
import * as ImagePicker from 'expo-image-picker';

import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { usePosts } from '../../context/PostsContext';


export default function UploadScreen() {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);

    // Запрос прав (обязательно для Android 13+)
    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Нужен доступ', 'Разрешите доступ к фото в настройках');
            return false;
        }
        return true;
    };

    // Выбор изображения — ИСПРАВЛЕНО под новый API
    const pickImage = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        // ✅ Новый API: canceled (не cancelled) и assets[0].uri (не uris)
        if (!result.canceled && result.assets?.[0]?.uri) {
            setImageUri(result.assets[0].uri);
        } else if (result.canceled) {
            console.log('Выбор отменён');
        } else {
            Alert.alert('Ошибка', 'Не удалось загрузить изображение');
        }
    };

    // Публикация (демо-режим)
    const handlePublish = async () => {
        if (!imageUri) {
            Alert.alert('Ошибка', 'Сначала выберите фото');
            return;
        }

        setLoading(true);

        // Имитация загрузки (здесь потом будет Supabase)
        setTimeout(() => {
            setLoading(false);
            Alert.alert('✅ Опубликовано!', 'Фото добавлено в ленту (демо)');

            // Сброс формы
            setImageUri(null);
            setCaption('');
        }, 1500);

        addPost({
            uri: imageUri!,
            caption: caption,
            timestamp: new Date().toISOString(),
        });
    };

    const { addPost } = usePosts();

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>📤 Загрузить автограф</Text>

            {/* Кнопка выбора фото */}
            <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
                <Text style={styles.pickButtonText}>
                    {imageUri ? '🔄 Заменить фото' : '🖼 Выбрать из галереи'}
                </Text>
            </TouchableOpacity>

            {/* Превью изображения */}
            {imageUri && (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
                </View>
            )}

            {/* Подпись */}
            <TextInput
                style={styles.input}
                placeholder="Подпись (опционально)..."
                value={caption}
                onChangeText={setCaption}
                multiline
                placeholderTextColor="#999"
            />

            {/* Кнопка публикации — ИСПРАВЛЕНО: TouchableOpacity вместо Button */}
            <TouchableOpacity
                style={[styles.publishButton, (!imageUri || loading) && styles.publishButtonDisabled]}
                onPress={handlePublish}
                disabled={!imageUri || loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.publishButtonText}>✨ Опубликовать</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        alignItems: 'center'
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 25,
        textAlign: 'center'
    },
    pickButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginBottom: 20,
    },
    pickButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    previewContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    preview: {
        width: '100%',
        height: 300,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 14,
        minHeight: 80,
        textAlignVertical: 'top',
        backgroundColor: '#f9f9f9',
        marginBottom: 25,
        fontSize: 16,
    },
    publishButton: {
        backgroundColor: '#00c853',
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    publishButtonDisabled: {
        backgroundColor: '#ccc',
    },
    publishButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});