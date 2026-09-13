export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type Course = {
  id: string;
  title: string;
  color: string;
  day: Weekday;
  startPeriod: number;
  duration: number;
  weeks: number[];
  room?: string;
  teacher?: string;
  note?: string;
};
