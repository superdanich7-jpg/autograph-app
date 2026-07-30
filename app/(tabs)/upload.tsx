import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
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
import Button from '../../components/ui/Button';
import {
    EVIDENCE_OPTIONS,
    EvidenceType,
    POST_CATEGORIES,
    PostCategory,
    RARITY_LEVELS,
    RarityLevel,
    usePosts,
} from '../../context/PostsContext';
import { useTheme } from '../../context/ThemeContext';
import { checkAndAwardAchievements, updateUserStats } from '../../lib/achievements';
import { quickMatch } from '../../lib/signature-analyzer';

type UploadFieldProps = {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    colors: ReturnType<typeof useTheme>['colors'];
    multiline?: boolean;
};

type AnalysisResult = {
    suggestion: string;
    confidence: number;
};

function getTodayLabel() {
    return new Date().toLocaleDateString('ru-RU');
}

function formatAddress(address: Location.LocationGeocodedAddress) {
    return [address.city, address.region, address.country].filter(Boolean).join(', ');
}

function UploadField({
    label,
    value,
    onChangeText,
    placeholder,
    colors,
    multiline = false,
}: UploadFieldProps) {
    return (
        <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
            <TextInput
                style={[
                    styles.input,
                    multiline && styles.textArea,
                    {
                        backgroundColor: colors.card,
                        color: colors.text,
                        borderColor: colors.border,
                    },
                ]}
                placeholder={placeholder}
                placeholderTextColor={colors.placeholder}
                value={value}
                onChangeText={onChangeText}
                multiline={multiline}
                textAlignVertical={multiline ? 'top' : 'center'}
            />
        </View>
    );
}

export default function UploadScreen() {
    const { addPost, posts, authUserEmail } = usePosts();
    const { colors } = useTheme();

    const [imageUri, setImageUri] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [celebrityName, setCelebrityName] = useState('');
    const [location, setLocation] = useState('');
    const [dateReceived, setDateReceived] = useState(getTodayLabel);
    const [category, setCategory] = useState<PostCategory>('sports');
    const [rarity, setRarity] = useState<RarityLevel>('common');
    const [evidence, setEvidence] = useState<EvidenceType[]>(['photo']);
    const [loading, setLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

    const isPickerOpen = useRef(false);
    const isMounted = useRef(true);

    const checklist = useMemo(
        () => [
            { id: 'photo', label: 'Фото', done: Boolean(imageUri) },
            { id: 'name', label: 'Имя', done: Boolean(celebrityName.trim()) },
            { id: 'origin', label: 'Место или дата', done: Boolean(location.trim() || dateReceived.trim()) },
            { id: 'proof', label: 'Доказательства', done: evidence.length > 0 },
        ],
        [celebrityName, dateReceived, evidence.length, imageUri, location]
    );

    const completion = Math.round((checklist.filter((item) => item.done).length / checklist.length) * 100);

    useEffect(() => {
        const fillLocation = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') return;

                const currentPosition = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                const [address] = await Location.reverseGeocodeAsync(currentPosition.coords);
                if (!isMounted.current || !address) return;

                const nextLocation = formatAddress(address);
                if (nextLocation) {
                    setLocation((prev) => prev || nextLocation);
                }
            } catch (error) {
                console.warn(error);
            }
        };

        fillLocation();

        return () => {
            isMounted.current = false;
        };
    }, []);

    const runAnalysis = async () => {
        setIsAnalyzing(true);
        setAnalysis(null);

        // Небольшая задержка для UX
        await new Promise((resolve) => setTimeout(resolve, 300));

        if (!isMounted.current || !imageUri) return;

        try {
            // Локальная ML-модель на клиенте — работает без сервера
            const result = await Promise.race([
                quickMatch(imageUri),
                new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
            ]);

            if (!isMounted.current) return;

            if (result && result.confidence >= 30) {
                const analysisResult: AnalysisResult = {
                    suggestion: result.name,
                    confidence: result.confidence,
                };
                setAnalysis(analysisResult);
                if (!celebrityName.trim()) {
                    setCelebrityName(result.name);
                }
            }
        } catch (error) {
            console.warn('Analysis error:', error);
            if (!isMounted.current) return;
            setAnalysis(null);
        } finally {
            if (isMounted.current) {
                setIsAnalyzing(false);
            }
        }
    };

    const requestGalleryPermission = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Нужен доступ', 'Разрешите доступ к фото в настройках устройства.');
            return false;
        }
        return true;
    };

    const applyPickedImage = async (uri: string) => {
        setImageUri(uri);
        await runAnalysis();
    };

    const takePhoto = async () => {
        if (isPickerOpen.current) return;
        isPickerOpen.current = true;

        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Нужен доступ', 'Разрешите доступ к камере в настройках устройства.');
            isPickerOpen.current = false;
            return;
        }

        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.9,
                ...(Platform.OS === 'ios'
                    ? { presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN }
                    : {}),
            });

            if (isMounted.current && !result.canceled && result.assets?.[0]?.uri) {
                await applyPickedImage(result.assets[0].uri);
            }
        } catch (error) {
            console.warn(error);
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
                ...(Platform.OS === 'ios'
                    ? { presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN }
                    : {}),
            });

            if (isMounted.current && !result.canceled && result.assets?.[0]?.uri) {
                await applyPickedImage(result.assets[0].uri);
            }
        } catch (error) {
            console.warn(error);
        } finally {
            isPickerOpen.current = false;
        }
    };

    const toggleEvidence = (value: EvidenceType) => {
        setEvidence((prev) =>
            prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
        );
    };

    const resetForm = () => {
        setImageUri(null);
        setCaption('');
        setCelebrityName('');
        setLocation('');
        setDateReceived(getTodayLabel());
        setCategory('sports');
        setRarity('common');
        setEvidence(['photo']);
        setAnalysis(null);
        setIsAnalyzing(false);
    };

    const handlePublish = () => {
        if (!imageUri) {
            Alert.alert('Ошибка', 'Сначала выберите фотографию автографа.');
            return;
        }

        if (!celebrityName.trim()) {
            Alert.alert('Ошибка', 'Укажите, чей это автограф.');
            return;
        }

        setLoading(true);
        setTimeout(() => {
            if (!isMounted.current) return;

            addPost({
                uri: imageUri,
                caption,
                celebrityName,
                location: location.trim() || 'Место не указано',
                dateReceived: dateReceived.trim() || new Date().toLocaleDateString('ru-RU'),
                category,
                rarity,
                evidence,
                aiSuggestion: analysis?.suggestion,
                aiConfidence: analysis?.confidence,
                isAnalyzed: Boolean(analysis),
            });

            Alert.alert('Опубликовано', 'Автограф добавлен в коллекцию.');

            // Check achievements (non-blocking)
            const currentUser = authUserEmail || 'guest';
            if (currentUser !== 'guest') {
                updateUserStats(currentUser, { total_uploads: posts.length + 1 })
                    .then(() => checkAndAwardAchievements(currentUser))
                    .then((newAch) => {
                        if (newAch.length > 0) {
                            Alert.alert('🏆 Новое достижение!', newAch.map((a) => `${a.icon} ${a.title}`).join('\n'));
                        }
                    })
                    .catch((e) => console.warn('Achievement check failed:', e));
            }

            resetForm();
            setLoading(false);
        }, 500);
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView
                style={[styles.keyboardWrap, { backgroundColor: colors.background }]}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'android' ? 20 : 0}
            >
                <ScrollView
                    contentContainerStyle={styles.container}
                    style={{ backgroundColor: colors.background }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>Новый автограф</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Добавьте фото, укажите происхождение и соберите пакет доказательств.
                        </Text>
                    </View>

                    <View style={[styles.readinessCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.readinessHeader}>
                            <Text style={[styles.readinessTitle, { color: colors.text }]}>Готовность карточки</Text>
                            <Text style={[styles.readinessPercent, { color: colors.textSecondary }]}>{completion}%</Text>
                        </View>
                        <View style={[styles.readinessBar, { backgroundColor: colors.surface }]}>
                            <View style={[styles.readinessFill, { backgroundColor: colors.primary, width: `${completion}%` }]} />
                        </View>
                        <View style={styles.checklistRow}>
                            {checklist.map((item) => (
                                <View
                                    key={item.id}
                                    style={[
                                        styles.checkItem,
                                        { backgroundColor: item.done ? colors.primary : colors.surface },
                                    ]}
                                >
                                    <Ionicons
                                        name={item.done ? 'checkmark-circle' : 'ellipse-outline'}
                                        size={14}
                                        color={item.done ? colors.primaryText : colors.textSecondary}
                                    />
                                    <Text
                                        style={[
                                            styles.checkItemText,
                                            { color: item.done ? colors.primaryText : colors.textSecondary },
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        {imageUri ? (
                            <View style={[styles.previewContainer, { borderColor: colors.border }]}>
                                <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
                                <TouchableOpacity
                                    style={[styles.removeBtn, { backgroundColor: colors.background }]}
                                    onPress={resetForm}
                                >
                                    <Ionicons name="close" size={18} color={colors.text} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={[styles.emptyPreview, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <View style={[styles.emptyPreviewIcon, { backgroundColor: colors.card }]}>
                                    <Ionicons name="camera-outline" size={30} color={colors.primary} />
                                </View>
                                <Text style={[styles.emptyText, { color: colors.text }]}>Выберите фото автографа</Text>
                                <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
                                    Лучше всего смотрится фото без бликов и с ровным светом.
                                </Text>
                            </View>
                        )}

                        <View style={styles.mediaButtons}>
                            <TouchableOpacity
                                style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                                onPress={takePhoto}
                                activeOpacity={0.85}
                                disabled={isAnalyzing}
                            >
                                <Ionicons name="camera-outline" size={18} color={colors.primaryText} />
                                <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>Камера</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                onPress={pickImage}
                                activeOpacity={0.85}
                                disabled={isAnalyzing}
                            >
                                <Ionicons name="images-outline" size={18} color={colors.text} />
                                <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Галерея</Text>
                            </TouchableOpacity>
                        </View>

                        {isAnalyzing ? (
                            <View style={[styles.analysisCard, { backgroundColor: colors.surface }]}>
                                <ActivityIndicator color={colors.primary} />
                                <Text style={[styles.analysisTitle, { color: colors.text }]}>Проверяю подпись...</Text>
                                <Text style={[styles.analysisHint, { color: colors.textSecondary }]}>
                                    Выполняю предварительную оценку по фото и доступным признакам.
                                </Text>
                            </View>
                        ) : analysis ? (
                            <View style={[styles.analysisCard, { backgroundColor: colors.surface }]}>
                                <View style={styles.analysisHeader}>
                                    <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
                                    <Text style={[styles.analysisTitle, { color: colors.text }]}>Предварительная проверка</Text>
                                </View>
                                <Text style={[styles.analysisResult, { color: colors.text }]}>
                                    Возможное совпадение: {analysis.suggestion}
                                </Text>
                                <Text style={[styles.analysisHint, { color: colors.textSecondary }]}>
                                    Уверенность оценки: {analysis.confidence}%
                                </Text>
                            </View>
                        ) : null}
                    </View>

                    <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <UploadField
                            label="Чей автограф"
                            value={celebrityName}
                            onChangeText={setCelebrityName}
                            placeholder="Например: Лионель Месси"
                            colors={colors}
                        />
                        <UploadField
                            label="Где получен"
                            value={location}
                            onChangeText={setLocation}
                            placeholder="Например: Стадион Лужники"
                            colors={colors}
                        />
                        <UploadField
                            label="Когда получен"
                            value={dateReceived}
                            onChangeText={setDateReceived}
                            placeholder="Например: 15.04.2024"
                            colors={colors}
                        />
                        <UploadField
                            label="Комментарий"
                            value={caption}
                            onChangeText={setCaption}
                            placeholder="Пара деталей о встрече, атмосфере или самой подписи"
                            colors={colors}
                            multiline
                        />

                        <Text style={[styles.blockLabel, { color: colors.textSecondary }]}>Категория</Text>
                        <View style={styles.chipsRow}>
                            {POST_CATEGORIES.map((item) => {
                                const active = category === item.value;
                                return (
                                    <TouchableOpacity
                                        key={item.value}
                                        style={[
                                            styles.chip,
                                            {
                                                backgroundColor: active ? colors.primary : colors.surface,
                                            },
                                        ]}
                                        onPress={() => setCategory(item.value)}
                                    >
                                        <Text style={[styles.chipText, { color: active ? colors.primaryText : colors.text }]}>
                                            {item.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <Text style={[styles.blockLabel, { color: colors.textSecondary }]}>Редкость</Text>
                        <View style={styles.chipsRow}>
                            {RARITY_LEVELS.map((item) => {
                                const active = rarity === item.value;
                                return (
                                    <TouchableOpacity
                                        key={item.value}
                                        style={[
                                            styles.chip,
                                            {
                                                backgroundColor: active ? colors.primary : colors.surface,
                                            },
                                        ]}
                                        onPress={() => setRarity(item.value)}
                                    >
                                        <Text style={[styles.chipText, { color: active ? colors.primaryText : colors.text }]}>
                                            {item.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <Text style={[styles.blockLabel, { color: colors.textSecondary }]}>Доказательства</Text>
                        <View style={styles.chipsRow}>
                            {EVIDENCE_OPTIONS.map((item) => {
                                const active = evidence.includes(item.value);
                                return (
                                    <TouchableOpacity
                                        key={item.value}
                                        style={[
                                            styles.chip,
                                            {
                                                backgroundColor: active ? colors.primary : colors.surface,
                                            },
                                        ]}
                                        onPress={() => toggleEvidence(item.value)}
                                    >
                                        <Text style={[styles.chipText, { color: active ? colors.primaryText : colors.text }]}>
                                            {item.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <Button
                        title={loading ? 'Публикация...' : 'Опубликовать'}
                        onPress={handlePublish}
                        variant="primary"
                        size="lg"
                        icon="cloud-upload-outline"
                        loading={loading}
                        disabled={!imageUri}
                        fullWidth
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    keyboardWrap: { flex: 1 },
    container: {
        padding: 16,
        paddingBottom: 24,
    },
    header: {
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
    },
    subtitle: {
        marginTop: 6,
        fontSize: 14,
        lineHeight: 20,
    },
    readinessCard: {
        borderWidth: 1,
        borderRadius: 22,
        padding: 14,
        marginBottom: 16,
        gap: 12,
    },
    readinessHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    readinessTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    readinessPercent: {
        fontSize: 13,
        fontWeight: '700',
    },
    readinessBar: {
        height: 8,
        borderRadius: 999,
        overflow: 'hidden',
    },
    readinessFill: {
        height: '100%',
        borderRadius: 999,
    },
    checklistRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    checkItem: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    checkItemText: {
        fontSize: 12,
        fontWeight: '700',
    },
    card: {
        borderWidth: 1,
        borderRadius: 24,
        padding: 14,
        marginBottom: 16,
    },
    previewContainer: {
        width: '100%',
        height: 260,
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 14,
        borderWidth: 1,
    },
    preview: { width: '100%', height: '100%' },
    removeBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 32,
        height: 32,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyPreview: {
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 18,
        minHeight: 220,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 14,
    },
    emptyPreviewIcon: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
        textAlign: 'center',
    },
    emptyHint: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
    },
    mediaButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    primaryButton: {
        flex: 1,
        minHeight: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    primaryButtonText: {
        fontSize: 15,
        fontWeight: '700',
    },
    secondaryButton: {
        flex: 1,
        minHeight: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        borderWidth: 1,
    },
    secondaryButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    analysisCard: {
        marginTop: 14,
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 14,
        gap: 6,
    },
    analysisHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    analysisTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    analysisResult: {
        fontSize: 14,
        fontWeight: '600',
    },
    analysisHint: {
        fontSize: 13,
        lineHeight: 18,
    },
    formCard: {
        borderWidth: 1,
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 14,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 14,
        minHeight: 50,
        fontSize: 15,
    },
    textArea: {
        minHeight: 108,
        paddingTop: 14,
        paddingBottom: 14,
    },
    blockLabel: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginTop: 6,
        marginBottom: 8,
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    chip: {
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 9,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
    },
    publishButton: {
        minHeight: 54,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    publishButtonText: {
        fontSize: 16,
        fontWeight: '700',
    },
});
