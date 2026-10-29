/**
 * AppBackground — liquid-glass фон приложения: глубокий градиент «чернила»
 * с тёплыми золотыми свечениями. Рендерится ОДИН раз в корневом layout,
 * экраны лежат поверх с прозрачным фоном — стекло карточек размывает его.
 */

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function AppBackground() {
    const { colors } = useTheme();
    const gradient = ((colors as { bgGradient?: string[] }).bgGradient ??
        [colors.background, colors.background]) as [string, string, ...string[]];
    const glow = (colors as { glow?: string }).glow ?? 'rgba(0,0,0,0)';

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <LinearGradient
                colors={gradient}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            />
            {/* Тёплое свечение сверху — как блик света на стекле */}
            <LinearGradient
                colors={[glow, 'rgba(0,0,0,0)']}
                style={[StyleSheet.absoluteFill, styles.topGlow]}
            />
            <View style={[styles.glowBlob, styles.glowTopRight, { backgroundColor: glow }]} />
            <View style={[styles.glowBlob, styles.glowBottomLeft, { backgroundColor: glow }]} />
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
});
