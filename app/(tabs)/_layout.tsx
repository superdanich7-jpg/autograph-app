import { Tabs } from 'expo-router';
import CustomTabBar from '../../components/TabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={() => <CustomTabBar />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      {/* Клуб убран из таб-бара (решение основателя) — маршрут живёт,
          вход через экран «Ещё». */}
      <Tabs.Screen name="community" options={{ href: null }} />
      <Tabs.Screen name="upload" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
