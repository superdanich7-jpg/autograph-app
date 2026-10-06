import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

type ProfileModalProps = {
    visible: boolean;
    title: string;
    colors: ReturnType<typeof useTheme>['colors'];
    onClose: () => void;
    children: React.ReactNode;
};

export default function ProfileModal({ visible, title, colors, onClose, children }: ProfileModalProps) {
    return (
        <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
            <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: colors.background }]}>
                <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
                    <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
                {children}
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalSafeArea: { flex: 1 },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    modalTitle: { fontSize: 19, fontWeight: '700' },
    modalCloseButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
});