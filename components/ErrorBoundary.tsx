/**
 * ErrorBoundary — ловит ошибки рендеринга в React дереве.
 * Поддерживает тему, показывает fallback UI с кнопкой перезагрузки.
 * В production отправляет ошибку в showToast.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showToast } from './Toast';

type Props = {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  colors?: {
    background: string;
    text: string;
    textSecondary: string;
    primary: string;
    primaryText: string;
    danger: string;
  };
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error.message, info.componentStack);
    showToast(error.message || 'Произошла ошибка', 'error');
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const c = this.props.colors || {
        background: '#0F172A',
        text: '#F8FAFC',
        textSecondary: '#94A3B8',
        primary: '#3B82F6',
        primaryText: '#FFFFFF',
        danger: '#EF4444',
      };

      return (
        <View style={[styles.container, { backgroundColor: c.background }]}>
          <View style={styles.iconWrap}>
            <Ionicons name="alert-circle" size={48} color={c.danger} />
          </View>
          <Text style={[styles.title, { color: c.text }]}>
            {this.props.fallbackTitle ?? 'Что-то пошло не так'}
          </Text>
          <Text style={[styles.message, { color: c.textSecondary }]}>
            {this.props.fallbackMessage ?? 'Произошла непредвиденная ошибка. Попробуйте перезапустить экран.'}
          </Text>
          {this.state.error ? (
            <Text style={[styles.errorDetail, { color: c.textSecondary }]}>{this.state.error.message}</Text>
          ) : null}
          <TouchableOpacity style={[styles.button, { backgroundColor: c.primary }]} onPress={this.handleReset}>
            <Text style={[styles.buttonText, { color: c.primaryText }]}>Попробовать снова</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconWrap: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  errorDetail: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
