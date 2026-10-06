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
      <Tabs.Screen name="community" />
      <Tabs.Screen name="upload" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
