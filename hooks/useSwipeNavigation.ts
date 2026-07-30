import { Href, usePathname, useRouter } from 'expo-router';
import { Gesture } from 'react-native-gesture-handler';

const TABS = ['/', '/community', '/upload', '/profile'] as const satisfies readonly Href[];

export const useSwipeNavigation = () => {
    const router = useRouter();
    const pathname = usePathname();

    const currentIndex = TABS.findIndex(route => route === pathname);

    return Gesture.Pan()
        .activeOffsetX([-40, 40])
        .failOffsetY([-15, 15])
        .onEnd((event) => {
            if (event.translationX > 80 && currentIndex > 0) {
                router.push(TABS[currentIndex - 1]);
            } else if (event.translationX < -80 && currentIndex < TABS.length - 1) {
                router.push(TABS[currentIndex + 1]);
            }
        })
        .runOnJS(true);
};
