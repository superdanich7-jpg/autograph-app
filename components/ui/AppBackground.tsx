/**
 * AppBackground — liquid-glass фон приложения: глубокий градиент «чернила»
 * с тёплым золотым и холодным свечениями. Рендерится ОДИН раз в корневом layout,
 * экраны лежат поверх с прозрачным фоном — стекло карточек размывает его.
 *
 * На web градиент — инлайн background-image (RNW его поддерживает): у
 * expo-linear-gradient на web градиент кэшируется и не реагирует на смену темы.
 */

import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function AppBackground() {
    const { colors, theme } = useTheme();
    // Пререндер (Node) печатает light-инлайн-стили, а React при гидрации
    // не перезаписывает style-атрибуты, если пропсы не менялись. Поэтому
    // градиент существует только на клиенте, после монтирования.
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) {
        return null;
    }
    const gradient = ((colors as { bgGradient?: string[] }).bgGradient ??
        [colors.background, colors.background]) as [string, string, ...string[]];
    const glow = (colors as { glow?: string }).glow ?? 'rgba(0,0,0,0)';
    const coolGlow = theme === 'dark' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(147, 197, 253, 0.18)';

    if (Platform.OS === 'web') {
        // backgroundImage отсутствует в RN ViewStyle (это web-расширение RNW) —
        // поэтому каст; на web стиль применяется как CSS.
        const bgStyle = { backgroundImage: `linear-gradient(180deg, ${gradient.join(', ')})` } as unknown as ViewStyle;
        const glowStyle = { backgroundImage: `linear-gradient(180deg, ${glow}, rgba(0,0,0,0))` } as unknown as ViewStyle;
        return (
            <View style={[StyleSheet.absoluteFill, bgStyle]} pointerEvents="none">
                <View style={[StyleSheet.absoluteFill, styles.topGlow, glowStyle]} />
                <View style={[styles.glowBlob, styles.glowTopRight, { backgroundColor: glow }]} />
                <View style={[styles.glowBlob, styles.glowBottomLeft, { backgroundColor: glow }]} />
                <View style={[styles.glowBlob, styles.glowMid, { backgroundColor: coolGlow }]} />
            </View>
        );
    }

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <LinearGradient
                colors={gradient}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            />
            <LinearGradient
                colors={[glow, 'rgba(0,0,0,0)']}
                style={[StyleSheet.absoluteFill, styles.topGlow]}
            />
            <View style={[styles.glowBlob, styles.glowTopRight, { backgroundColor: glow }]} />
            <View style={[styles.glowBlob, styles.glowBottomLeft, { backgroundColor: glow }]} />
            <View style={[styles.glowBlob, styles.glowMid, { backgroundColor: coolGlow }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    topGlow: {
        height: '40%',
    },
    glowBlob: {
        position: 'absolute',
        width: 320,
        height: 320,
        borderRadius: 160,
        opacity: 0.8,
    },
    glowTopRight: {
        top: -120,
        right: -80,
    },
    glowBottomLeft: {
        bottom: -140,
        left: -100,
    },
    glowMid: {
        top: '42%',
        right: -140,
        width: 380,
        height: 380,
        borderRadius: 190,
    },
});
