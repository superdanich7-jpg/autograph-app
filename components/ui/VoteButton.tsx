import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { radii } from '../../lib/theme';

export type VoteButtonProps = {
    label: string;
    icon: 'checkmark-circle' | 'close-circle';
    active: boolean;
    disabled?: boolean;
    /** Цвет механики: success для «Подтверждаю», danger для «Фейк» */
    color: string;
    onPress: () => void;
};

/**
 * Кнопка голосования — главная механика сообщества, поэтому громкая:
 * неактивная = цветной контур (видно, что это действие, а не disabled-пилюля),
 * активная = сплошная заливка.
 */
export default function VoteButton({ label, icon, active, disabled = false, color, onPress }: VoteButtonProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            disabled={disabled}
            style={[
                styles.voteButton,
                active
                    ? { backgroundColor: color, borderColor: color }
                    : { backgroundColor: 'transparent', borderColor: color },
                { opacity: disabled ? 0.45 : 1 },
            ]}
        >
            <Ionicons
                name={icon}
                size={18}
                color={active ? '#FFFFFF' : color}
            />
            <Text
                style={[styles.voteButtonText, { color: active ? '#FFFFFF' : color }]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    voteButton: {
        flex: 1,
        borderRadius: radii.lg,
        minHeight: 46,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 10,
        borderWidth: 1.5,
    },
    voteButtonText: {
        fontSize: 14,
        fontWeight: '800',
    },
});
