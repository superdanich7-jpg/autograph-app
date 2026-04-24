import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: '📸 Feed', tabBarIcon: ({ color }) => <></> }}
      />
      <Tabs.Screen
        name="upload"
        options={{ title: '📤 Upload', tabBarIcon: ({ color }) => <></> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: '👤 Profile', tabBarIcon: ({ color }) => <></> }}
      />
    </Tabs>
  );
}