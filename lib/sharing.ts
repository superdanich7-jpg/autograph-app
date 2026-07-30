/**
 * Sharing Service — диплинки и шаринг постов.
 * Использует expo-linking и expo-sharing для шаринга контента.
 */

import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';
import * as MediaLibrary from 'expo-media-library';
import QRCode from 'qrcode-generator';

// ─── Deep Link URL ─────────────────────────────

export function getPostDeepLink(postId: string): string {
  return Linking.createURL(`/post/${postId}`);
}

// ─── Share post ────────────────────────────────

export async function sharePost({
  postId,
  celebrityName,
  imageUrl,
}: {
  postId: string;
  celebrityName: string;
  imageUrl?: string;
}): Promise<boolean> {
  try {
    const url = getPostDeepLink(postId);
    const message = `Check out this autograph from ${celebrityName}! ${url}`;

    await Sharing.shareAsync(url, {
      mimeType: 'text/plain',
      dialogTitle: `Share autograph from ${celebrityName}`,
    });

    return true;
  } catch (error) {
    console.warn('[Sharing] Failed to share post:', error);
    return false;
  }
}

// ─── Share collection ──────────────────────────

export async function shareCollection({
  count,
  url,
}: {
  count: number;
  url?: string;
}): Promise<boolean> {
  try {
    const shareUrl = url || Linking.createURL('/profile');
    const message = `I have ${count} autographs in my collection! Check it out: ${shareUrl}`;

    await Sharing.shareAsync(shareUrl, {
      mimeType: 'text/plain',
      dialogTitle: 'Share your collection',
    });

    return true;
  } catch (error) {
    console.warn('[Sharing] Failed to share collection:', error);
    return false;
  }
}

// ─── Open deep link ────────────────────────────

export async function openDeepLink(url: string): Promise<boolean> {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
    return false;
  } catch (error) {
    console.warn('[DeepLink] Failed to open URL:', error);
    return false;
  }
}

// ─── Get initial URL ───────────────────────────

export async function getInitialUrl(): Promise<string | null> {
  try {
    return await Linking.getInitialURL();
  } catch (error) {
    return null;
  }
}

// ─── Add URL listener ──────────────────────────

export function addUrlListener(handler: (url: string) => void) {
  return Linking.addEventListener('url', ({ url }) => handler(url));
}

// ─── QR Code generation ────────────────────────

export async function generateQrCodeDataUrl(text: string, size = 400): Promise<string> {
  const qr = QRCode(0, 'M');
  qr.addData(text);
  qr.make();

  const moduleCount = qr.getModuleCount();
  const cellSize = Math.max(1, Math.floor(size / moduleCount));
  const canvasSize = cellSize * moduleCount;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasSize} ${canvasSize}" width="${canvasSize}" height="${canvasSize}">
    <rect width="${canvasSize}" height="${canvasSize}" fill="#ffffff"/>
    ${Array.from({ length: moduleCount }).map((_, y) =>
      Array.from({ length: moduleCount }).map((_, x) =>
        qr.isDark(y, x)
          ? `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="#000000"/>`
          : ''
      ).join('')
    ).join('')}
  </svg>`;

  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
}

export async function saveQrCodeToGallery(dataUrl: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return dataUrl;
    }

    const permission = await MediaLibrary.requestPermissionsAsync();
    if (!permission.granted) {
      return null;
    }

    const fileName = `autograph-qr-${Date.now()}.png`;
    const fs = FileSystem as any;
    const documentDirectory = fs.documentDirectory;
    const fileUri = `${documentDirectory}${fileName}`;

    const base64 = dataUrl.split(',')[1];
    if (!base64) return null;

    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: fs.EncodingType.Base64,
    });

    await MediaLibrary.saveToLibraryAsync(fileUri);
    return fileUri;
  } catch (error) {
    console.warn('[QR] Failed to save QR code:', error);
    return null;
  }
}
