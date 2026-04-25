// app/_layout.tsx
import { Slot } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { PostsProvider } from '../context/PostsContext';
import { ThemeProvider } from '../context/ThemeContext';

export default function RootLayout() {
  return (
    <View style={styles.root} pointerEvents="box-none">
      <ThemeProvider>
        <PostsProvider>
          <Slot />
        </PostsProvider>
      </ThemeProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});