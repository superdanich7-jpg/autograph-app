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
    // ✅ Хук вызываем ВНАЧАЛЕ
    const { addPost } = usePosts();

    const [imageUri, setImageUri] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);

    // Запрос прав на галерею
    const requestGalleryPermission = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Нужен доступ', 'Разрешите доступ к фото в настройках');
            return false;
        }
        return true;
    };

    // 📷 СЪЁМКА НА КАМЕРУ
    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Нужен доступ', 'Разрешите доступ к камере в настройках');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: 'images', // ✅ Строка вместо энума
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.9,
        });

        if (!result.canceled && result.assets?.[0]?.uri) {
            setImageUri(result.assets[0].uri);
        }
    };

    // 🖼 Выбор из галереи
    const pickImage = async () => {
        const hasPermission = await requestGalleryPermission();
        if (!hasPermission) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images', // ✅ Строка вместо энума
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets?.[0]?.uri) {
            setImageUri(result.assets[0].uri);
        }
    };

    // 🚀 Публикация
    const handlePublish = async () => {
        if (!imageUri) {
            Alert.alert('Ошибка', 'Сначала выберите или снимите фото');
            return;
        }

        setLoading(true);

        setTimeout(() => {
            addPost({
                uri: imageUri!,
                caption: caption,
                timestamp: new Date().toISOString(),
            });

            setLoading(false);
            Alert.alert('✅ Опубликовано!', 'Автограф добавлен в ленту');
            setImageUri(null);
            setCaption('');
        }, 1500);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>📤 Загрузить автограф</Text>

            {/* Кнопки выбора медиа */}
            <View style={styles.mediaButtons}>
                <TouchableOpacity style={[styles.mediaBtn, styles.cameraBtn]} onPress={takePhoto}>
                    <Text style={styles.mediaBtnText}>📷 Камера</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.mediaBtn, styles.galleryBtn]} onPress={pickImage}>
                    <Text style={styles.mediaBtnText}>🖼 Галерея</Text>
                </TouchableOpacity>
            </View>

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

            {/* Кнопка публикации */}
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
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },

    // Кнопки медиа
    mediaButtons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    mediaBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center', marginHorizontal: 5 },
    cameraBtn: { backgroundColor: '#007AFF' },
    galleryBtn: { backgroundColor: '#5856D6' },
    mediaBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },

    // Превью
    previewContainer: { width: '100%', alignItems: 'center', marginBottom: 20 },
    preview: { width: '100%', height: 300, borderRadius: 12, backgroundColor: '#f0f0f0' },

    // Поле ввода
    input: {
        width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
        padding: 14, minHeight: 80, textAlignVertical: 'top',
        backgroundColor: '#f9f9f9', marginBottom: 25, fontSize: 16,
    },

    // Кнопка публикации
    publishButton: {
        backgroundColor: '#00c853', paddingVertical: 16, paddingHorizontal: 40,
        borderRadius: 12, width: '100%', alignItems: 'center',
    },
    publishButtonDisabled: { backgroundColor: '#ccc' },
    publishButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});