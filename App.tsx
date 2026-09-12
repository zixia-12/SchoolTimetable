import { StatusBar } from 'expo-status-bar';

import { TimetableScreen } from '@/features/timetable/TimetableScreen';

export default function App() {
  return (
    <>
      <TimetableScreen />
      <StatusBar style="dark" />
    </>
  );
}

