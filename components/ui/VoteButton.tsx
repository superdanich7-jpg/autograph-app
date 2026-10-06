import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export type VoteButtonProps = {
    label: string;
    icon: 'checkmark-circle' | 'close-circle';
    active: boolean;
    disabled?: boolean;
    color: string;
    surface: string;
    text: string;
    onPress: () => void;
};

export default function VoteButton({ label, icon, active, disabled = false, color, surface, text, onPress }: VoteButtonProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            disabled={disabled}
            style={[styles.voteButton, { backgroundColor: active ? color : surface, opacity: disabled ? 0.55 : 1 }]}
        >
            <Ionicons name={icon} size={16} color={active ? '#fff' : text} />
            <Text style={[styles.voteButtonText, { color: active ? '#fff' : text }]}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    voteButton: {
        flex: 1,
        borderRadius: 16,
        minHeight: 42,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 10,
    },
    voteButtonText: {
        fontSize: 13,
        fontWeight: '700',
    },
});