import { Slot } from 'expo-router';
import { PostsProvider } from '../context/PostsContext';

export default function RootLayout() {
  return (
    <PostsProvider>
      <Slot />
    </PostsProvider>
  );
}