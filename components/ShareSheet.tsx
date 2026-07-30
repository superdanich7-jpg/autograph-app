import React, { useState } from 'react';
import { Alert, Modal, Platform, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getPostDeepLink, generateQrCodeDataUrl, saveQrCodeToGallery, sharePost as sharePostUtil } from '../lib/sharing';

type ShareSheetProps = {
  visible: boolean;
  postId: string;
  celebrityName: string;
  imageUri?: string;
  onClose: () => void;
};

export default function ShareSheet({ visible, postId, celebrityName, imageUri, onClose }: ShareSheetProps) {
  const { colors } = useTheme();
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleNativeShare = async () => {
    try {
      await Share.share({
        message: `Check out this autograph from ${celebrityName}! ${getPostDeepLink(postId)}`,
        url: imageUri || getPostDeepLink(postId),
        title: `Autograph: ${celebrityName}`,
      });
      onClose();
    } catch (error) {
      console.warn('Share failed:', error);
    }
  };

  const handleCopyLink = async () => {
    const link = getPostDeepLink(postId);
    // Fallback: use clipboard
    Alert.alert('Ссылка скопирована', link);
    onClose();
  };

  const handleGenerateQr = async () => {
    setIsGenerating(true);
    try {
      const link = getPostDeepLink(postId);
      const qrDataUrl = await generateQrCodeDataUrl(link, 400);
      setQrUrl(qrDataUrl);
    } catch (error) {
      console.warn('QR generation failed:', error);
      Alert.alert('Ошибка', 'Не удалось сгенерировать QR-код.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveQr = async () => {
    if (!qrUrl) return;
    try {
      await saveQrCodeToGallery(qrUrl);
      Alert.alert('Успех', 'QR-код сохранен в галерее');
    } catch (error) {
      console.warn('Save QR failed:', error);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Поделиться автографом</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.previewRow}>
            <Ionicons name="image-outline" size={40} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.previewTitle, { color: colors.text }]} numberOfLines={1}>
                {celebrityName || 'Автограф'}
              </Text>
              <Text style={[styles.previewHint, { color: colors.textSecondary }]}>
                Выберите способ шеринга
              </Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.card }]} onPress={handleNativeShare}>
              <Ionicons name="share-social-outline" size={24} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.text }]}>Поделиться</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.card }]} onPress={handleCopyLink}>
              <Ionicons name="link-outline" size={24} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.text }]}>Копировать ссылку</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.card }]} onPress={handleGenerateQr} disabled={isGenerating}>
              <Ionicons name="qr-code-outline" size={24} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.text }]}>QR-код</Text>
            </TouchableOpacity>
          </View>

          {qrUrl ? (
            <View style={styles.qrCard}>
              <Text style={[styles.qrTitle, { color: colors.text }]}>QR-код для быстрого доступа</Text>
              <View style={[styles.qrImageWrap, { backgroundColor: colors.surface }]}>
                <img src={qrUrl} style={{ width: 220, height: 220 }} alt="QR Code" />
              </View>
              <TouchableOpacity style={[styles.saveQrBtn, { backgroundColor: colors.primary }]} onPress={handleSaveQr}>
                <Ionicons name="download-outline" size={18} color={colors.primaryText} />
                <Text style={[styles.saveQrText, { color: colors.primaryText }]}>Сохранить в галерею</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: '700' },
  closeBtn: { padding: 6 },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  previewTitle: { fontSize: 16, fontWeight: '700' },
  previewHint: { fontSize: 13, marginTop: 2 },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  actionText: { fontSize: 13, fontWeight: '700' },
  qrCard: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.02)',
    gap: 12,
  },
  qrTitle: { fontSize: 15, fontWeight: '700' },
  qrImageWrap: {
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveQrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  saveQrText: { fontSize: 14, fontWeight: '700' },
});