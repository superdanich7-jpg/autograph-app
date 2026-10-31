/**
 * StoryViewer — шаг 12 PLAN-100: полноэкранный просмотр историй как в Instagram.
 * Сегменты прогресса сверху, тап справа = следующая, слева = предыдущая,
 * шапка с автором и временем, автопрокрутка сегмента 6 секунд.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Post } from '../context/PostsContext';
import { useLanguage } from '../context/LanguageContext';
import { hapticLight } from '../lib/haptics';

const SEGMENT_MS = 6000;

function timeAgoShort(iso: string, lang: 'ru' | 'en'): string {
    const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (minutes < 1) return lang === 'ru' ? 'сейчас' : 'now';
    if (minutes < 60) return lang === 'ru' ? `${minutes} мин` : `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return lang === 'ru' ? `${hours} ч` : `${hours} h`;
    return `${Math.floor(hours / 24)} ${lang === 'ru' ? 'дн' : 'd'}`;
}

export default function StoryViewer({
    stories,
    startIndex,
    onClose,
}: {
    stories: Post[];
    startIndex: number;
    onClose: () => void;
}) {
    const { t, lang } = useLanguage();
    const [index, setIndex] = useState(Math.max(0, Math.min(startIndex, stories.length - 1)));
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        setIndex(Math.max(0, Math.min(startIndex, stories.length - 1)));
        setProgress(0);
    }, [startIndex, stories.length]);

    useEffect(() => {
        if (stories.length === 0) return;
        setProgress(0);
        const started = Date.now();
        const id = setInterval(() => {
            const ratio = Math.min(1, (Date.now() - started) / SEGMENT_MS);
            setProgress(ratio);
            if (ratio >= 1) {
                clearInterval(id);
                // Автопереход/закрытие — вне setState-updater (апдейтеры обязаны быть чистыми)
                if (index < stories.length - 1) {
                    hapticLight();
                    setIndex(index + 1);
                } else {
                    onClose();
                }
            }
        }, 50);
        return () => clearInterval(id);
    }, [index, stories.length, onClose]);

    if (stories.length === 0) return null;
    const post = stories[index];
    if (!post) return null;

    const goPrev = () => {
        hapticLight();
        setProgress(0);
        if (index > 0) setIndex(index - 1);
        else onClose();
    };

    const goNext = () => {
        hapticLight();
        setProgress(0);
        if (index < stories.length - 1) setIndex(index + 1);
        else onClose();
    };

    return (
        <Modal animationType="fade" transparent={false} visible onRequestClose={onClose}>
            <View style={styles.root}>
                {/* Прогресс-сегменты */}
                <View style={styles.segments}>
                    {stories.map((_, i) => (
                        <View key={i} style={[styles.segmentTrack, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                            <View
                                style={[
                                    styles.segmentFill,
                                    {
                                        backgroundColor: '#FFFFFF',
                                        width: `${i < index ? 100 : i === index ? progress * 100 : 0}%`,
                                    },
                                ]}
                            />
                        </View>
                    ))}
                </View>

                {/* Шапка */}
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {(post.ownerName || 'C').trim().charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.headerText}>
                        <Text style={styles.headerName}>{post.ownerName || 'Collector'}</Text>
                        <Text style={styles.headerTime}>{timeAgoShort(post.timestamp, lang)}</Text>
                    </View>
                    <Pressable onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel={t('close')}>
                        <Ionicons name="close" size={28} color="#FFFFFF" />
                    </Pressable>
                </View>

                {/* Фото */}
                <Image source={{ uri: post.uri }} style={styles.photo} resizeMode="contain" />

                {/* Зоны тапа: слева назад, справа вперёд */}
                <View style={styles.tapRow} pointerEvents="box-none">
                    <Pressable style={styles.tapZone} onPress={goPrev} accessibilityLabel={t('back')} />
                    <Pressable style={styles.tapZone} onPress={goNext} accessibilityLabel={t('onbNext')} />
                </View>

                {/* Подпись снизу */}
                <View style={styles.footer}>
                    <Text style={styles.footerName} numberOfLines={1}>
                        {post.celebrityName || t('noName')}
                    </Text>
                    {post.caption ? (
                        <Text style={styles.footerCaption} numberOfLines={2}>
                            {post.caption}
                        </Text>
                    ) : null}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#000000',
    },
    segments: {
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        flexDirection: 'row',
        gap: 4,
        zIndex: 2,
    },
    segmentTrack: {
        flex: 1,
        height: 3,
        borderRadius: 2,
        overflow: 'hidden',
    },
    segmentFill: {
        height: '100%',
    },
    header: {
        position: 'absolute',
        top: 24,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 14,
        paddingTop: 8,
        zIndex: 2,
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#C9A227',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0B1220',
    },
    headerText: {
        flex: 1,
    },
    headerName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    headerTime: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
    },
    closeBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    photo: {
        flex: 1,
    },
    tapRow: {
        position: 'absolute',
        top: 70,
        bottom: 90,
        left: 0,
        right: 0,
        flexDirection: 'row',
    },
    tapZone: {
        flex: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 24,
        left: 16,
        right: 16,
        gap: 4,
    },
    footerName: {
        fontSize: 17,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    footerCaption: {
        fontSize: 13,
        lineHeight: 18,
        color: 'rgba(255,255,255,0.85)',
    },
});
