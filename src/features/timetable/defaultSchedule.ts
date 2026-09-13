import { Weekday } from '@/types/timetable';

export const weekdays: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export type PeriodTime = [string, string];

export const defaultPeriodTimes: PeriodTime[] = [
  ['08:00', '08:50'],
  ['09:00', '09:50'],
  ['10:10', '11:00'],
  ['11:10', '12:00'],
  ['13:30', '14:20'],
  ['14:30', '15:20'],
  ['15:40', '16:30'],
  ['16:40', '17:30'],
  ['18:30', '19:20'],
  ['19:30', '20:20'],
  ['20:30', '21:20'],
  ['21:25', '22:15']
];

export const courseColors = ['#F29AAF', '#91C7F2', '#9BD6B0', '#F2C879', '#B9A7E8', '#F4A786'];
