/**
 * PhotoZoom — шаги 19+17 PLAN-100: полноэкранный просмотр фото с пинч-зумом.
 * PinchGestureHandler (react-native-gesture-handler уже в проекте),
 * тап по фото или крестику закрывает, двойной тап сбрасывает масштаб.
 */

import { Ionicons } from '@expo/vector-icons';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

export default function PhotoZoom({
    uri,
    caption,
    onClose,
}: {
    uri: string;
    caption?: string;
    onClose: () => void;
}) {
    const { t } = useLanguage();
    const scale = useRef(new Animated.Value(1)).current;
    const [zoomed, setZoomed] = useState(false);

    useEffect(() => {
        scale.setValue(1);
        setZoomed(false);
    }, [uri, scale]);

    const onPinch = Animated.event([{ nativeEvent: { scale } }], {
        useNativeDriver: true,
    });

    const onPinchEnd = (e: { nativeEvent: { scale: number; state: number } }) => {
        // После отпускания: меньше 1 — сброс; иначе оставляем достигнутый масштаб
        if (e.nativeEvent.scale < 1.05 || e.nativeEvent.state === State.END) {
            Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
            setZoomed(false);
        } else {
            setZoomed(true);
        }
    };

    return (
        <Modal animationType="fade" transparent={false} visible onRequestClose={onClose}>
            <View style={styles.root}>
                <Pressable style={styles.closeBtn} onPress={onClose} accessibilityRole="button" accessibilityLabel={t('close')}>
                    <Ionicons name="close" size={26} color="#FFFFFF" />
                </Pressable>

                <PinchGestureHandler
                    onGestureEvent={onPinch}
                    onHandlerStateChange={onPinchEnd}
                >
                    <Animated.Image
                        source={{ uri }}
                        style={[styles.photo, { transform: [{ scale }] }]}
                        resizeMode="contain"
                    />
                </PinchGestureHandler>

                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

                {/* Подпись поверх: рендерится после Pressable, чтобы была кликабельна зона только вокруг */}
                {caption ? (
                    <View style={styles.footer} pointerEvents="none">
                        <Text style={styles.footerText} numberOfLines={2}>
                            {caption}
                        </Text>
                    </View>
                ) : null}

                {!zoomed ? (
                    <View style={styles.hint} pointerEvents="none">
                        <Text style={styles.hintText}>{t('pinchHint')}</Text>
                    </View>
                ) : null}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#000000',
    },
    closeBtn: {
        position: 'absolute',
        top: 40,
        right: 16,
        zIndex: 3,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    photo: {
        flex: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 28,
        left: 16,
        right: 16,
    },
    footerText: {
        fontSize: 13,
        lineHeight: 18,
        color: 'rgba(255,255,255,0.85)',
    },
    hint: {
        position: 'absolute',
        bottom: 64,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    hintText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.55)',
    },
});
