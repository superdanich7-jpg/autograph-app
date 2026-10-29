/**
 * GlassCard — liquid-glass поверхность: полупрозрачный фон + blur подложки
 * (expo-blur на нативе; на web — CSS backdrop-filter) + светлый блик сверху.
 * Заменяет «коробки» с рамками на стеклянные плоскости.
 */

import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';

type Props = {
    children: React.ReactNode;
    style?: ViewStyle;
    /** Настройка радиуса (по умолчанию 20 — карточка) */
    radius?: number;
    /** Отключить blur (дешёвые поверхности: чипы, плашки) */
    flat?: boolean;
};

export default function GlassCard({ children, style, radius = 20, flat = false }: Props) {
    const { colors, theme } = useTheme();
    const dark = theme === 'dark';
    const glass = (colors as { glassCard?: string }).glassCard ?? colors.card;
    const hairline = (colors as { glassBorder?: string }).glassBorder ?? colors.border;
    const highlight = (colors as { glassHighlight?: string }).glassHighlight ?? 'rgba(255,255,255,0.06)';

    return (
        <View
            style={[
                styles.card,
                {
                    borderRadius: radius,
                    backgroundColor: glass,
                    borderColor: hairline,
                },
                style,
            ]}
        >
            {!flat ? (
                <BlurView intensity={40} tint={dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
            ) : null}
            <View
                pointerEvents="none"
                style={[
                    styles.highlight,
                    {
                        borderTopLeftRadius: radius,
                        borderTopRightRadius: radius,
                        backgroundColor: highlight,
                    },
                ]}
            />
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        overflow: 'hidden',
        borderWidth: 1,
        ...(Platform.OS === 'web'
            ? ({ backdropFilter: 'blur(24px) saturate(160%)' } as unknown as ViewStyle)
            : {}),
    },
    highlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 44,
    },
});
