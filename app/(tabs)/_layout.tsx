import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import CustomTabBar from '../../components/TabBar';
import { useSwipeNavigation } from '../../hooks/useSwipeNavigation';

export default function TabsLayout() {
  const swipeGesture = useSwipeNavigation();

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={{ flex: 1 }} collapsable={false}>
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
      </View>
    </GestureDetector>
  );
}
