import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import Button from './ui/Button';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; description: string; color: string }) => void;
};

const COLORS = ['#007AFF', '#FF2D55', '#34C759', '#FF9500', '#AF52DE', '#5AC8FA', '#FFCC02', '#FF6B6B'];

export default function CreateCollectionModal({ visible, onClose, onCreate }: Props) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#007AFF');

  const reset = () => {
    setName('');
    setDescription('');
    setColor('#007AFF');
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate({ name: name.trim(), description: description.trim(), color });
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Новая подборка</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.form}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Название</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={name}
              onChangeText={setName}
              placeholder="Например: Спорт"
              placeholderTextColor={colors.placeholder}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Описание</Text>
            <TextInput
              style={[
                styles.input,
                styles.textarea,
                { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Кратко о коллекции"
              placeholderTextColor={colors.placeholder}
              multiline
              textAlignVertical="top"
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Цвет</Text>
            <View style={styles.colorRow}>
              {COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: c, borderColor: color === c ? colors.text : 'transparent' },
                  ]}
                  onPress={() => setColor(c)}
                />
              ))}
            </View>

            <Button title="Создать" onPress={handleCreate} variant="primary" size="md" disabled={!name.trim()} />
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: '700' },
  form: { gap: 12 },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    minHeight: 50,
    fontSize: 15,
  },
  textarea: { minHeight: 100, paddingTop: 14, paddingBottom: 14 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorSwatch: { width: 34, height: 34, borderRadius: 17, borderWidth: 3 },
});
