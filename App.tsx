import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TimetableScreen } from '@/features/timetable/TimetableScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <TimetableScreen />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
