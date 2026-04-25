// app/(tabs)/upload.tsx
import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { usePosts } from '../../context/PostsContext';
import { useTheme } from '../../context/ThemeContext';

export default function UploadScreen() {
    const { addPost } = usePosts();
    const { colors } = useTheme();

    const [imageUri, setImageUri] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);
    const isPickerOpen = useRef(false);
    const isMounted = useRef(true);

    // Сброс при уходе с экрана (предотвращает залипание оверлея)
    React.useEffect(() => {
        return () => {
            isMounted.current = false;
            setImageUri(null);
            isPickerOpen.current = false;
        };
    }, []);

    const requestGalleryPermission = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Нужен доступ', 'Разрешите доступ к фото в настройках');
            return false;
        }
        return true;
    };

    const takePhoto = async () => {
        if (isPickerOpen.current) return; // Защита от двойного вызова
        isPickerOpen.current = true;

        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Нужен доступ', 'Разрешите доступ к камере');
            isPickerOpen.current = false;
            return;
        }

        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.9,
                presentationStyle: Platform.OS === 'android' ? 'fullScreen' : undefined,
            });

            if (isMounted.current && !result.canceled && result.assets?.[0]?.uri) {
                setImageUri(result.assets[0].uri);
            }
        } catch (err) {
            console.warn('Camera error:', err);
        } finally {
            isPickerOpen.current = false;
        }
    };

    const pickImage = async () => {
        if (isPickerOpen.current) return;
        isPickerOpen.current = true;

        const hasPermission = await requestGalleryPermission();
        if (!hasPermission) {
            isPickerOpen.current = false;
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                presentationStyle: Platform.OS === 'android' ? 'fullScreen' : undefined,
            });

            if (isMounted.current && !result.canceled && result.assets?.[0]?.uri) {
                setImageUri(result.assets[0].uri);
            }
        } catch (err) {
            console.warn('Picker error:', err);
        } finally {
            isPickerOpen.current = false;
        }
    };

    const handlePublish = async () => {
        if (!imageUri) {
            Alert.alert('Ошибка', 'Сначала выберите фото');
            return;
        }

        setLoading(true);
        setTimeout(() => {
            if (isMounted.current) {
                addPost({
                    uri: imageUri!,
                    caption: caption,
                    timestamp: new Date().toISOString(),
                });
                Alert.alert('✅ Опубликовано!', 'Автограф добавлен в ленту');
                setImageUri(null);
                setCaption('');
                setLoading(false);
            }
        }, 1000);
    };

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            style={{ backgroundColor: colors.background }}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={[styles.title, { color: colors.text }]}>📤 Загрузить автограф</Text>

            <View style={styles.mediaButtons}>
                <TouchableOpacity style={[styles.mediaBtn, { backgroundColor: colors.primary }]} onPress={takePhoto}>
                    <Text style={styles.mediaBtnText}>📷 Камера</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.mediaBtn, { backgroundColor: '#5856D6' }]} onPress={pickImage}>
                    <Text style={styles.mediaBtnText}>🖼 Галерея</Text>
                </TouchableOpacity>
            </View>

            {imageUri && (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
                </View>
            )}

            <TextInput
                style={[styles.input, {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border
                }]}
                placeholder="Подпись (опционально)..."
                placeholderTextColor={colors.placeholder}
                value={caption}
                onChangeText={setCaption}
                multiline
            />

            <TouchableOpacity
                style={[styles.publishButton, (!imageUri || loading) && { backgroundColor: colors.surface }]}
                onPress={handlePublish}
                disabled={!imageUri || loading}
            >
                {loading ? (
                    <ActivityIndicator color={colors.text} />
                ) : (
                    <Text style={[styles.publishButtonText, { color: !imageUri ? colors.textSecondary : '#fff' }]}>
                        ✨ Опубликовать
                    </Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    mediaButtons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    mediaBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center', marginHorizontal: 5 },
    mediaBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    previewContainer: { width: '100%', alignItems: 'center', marginBottom: 20 },
    preview: { width: '100%', height: 300, borderRadius: 12, backgroundColor: '#f0f0f0' },
    input: {
        width: '100%', borderWidth: 1, borderRadius: 10,
        padding: 14, minHeight: 80, textAlignVertical: 'top',
        marginBottom: 25, fontSize: 16,
    },
    publishButton: {
        backgroundColor: '#00c853', paddingVertical: 16, paddingHorizontal: 40,
        borderRadius: 12, width: '100%', alignItems: 'center',
    },
    publishButtonText: { fontSize: 18, fontWeight: 'bold' },
});