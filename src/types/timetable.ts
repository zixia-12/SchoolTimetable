export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type MenuAction = 'time' | 'merge' | 'color' | 'info' | 'memo';

export type ClassBlock = {
  id: string;
  title: string;
  color: string;
  memoPreview?: string;
  meta?: string[];
};

