import { ClassBlock, Weekday } from '@/types/timetable';

export const weekdays: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const defaultBlocks: Record<Weekday, ClassBlock[]> = {
  Mon: [
    { id: 'mon-1', title: 'Math', color: '#DBEAFE', memoPreview: 'A', meta: ['Room 201'] },
    { id: 'mon-2', title: 'English', color: '#DCFCE7', memoPreview: 'T', meta: ['Teacher Li'] }
  ],
  Tue: [
    { id: 'tue-1', title: 'Physics', color: '#FCE7F3', memoPreview: 'Lab', meta: ['Lab'] },
    { id: 'tue-2', title: 'PE', color: '#FEF3C7', memoPreview: 'Run', meta: ['Field'] }
  ],
  Wed: [
    { id: 'wed-1', title: 'History', color: '#EDE9FE', memoPreview: 'Note', meta: ['Room 103'] },
    { id: 'wed-2', title: 'Chem', color: '#E0F2FE', memoPreview: 'Exp', meta: ['Lab 2'] }
  ],
  Thu: [
    { id: 'thu-1', title: 'CS', color: '#FEE2E2', memoPreview: 'Code', meta: ['PC Lab'] },
    { id: 'thu-2', title: 'Music', color: '#FAE8FF', memoPreview: 'Choir', meta: ['Studio'] }
  ],
  Fri: [
    { id: 'fri-1', title: 'Biology', color: '#DCFCE7', memoPreview: 'Field', meta: ['Room 204'] },
    { id: 'fri-2', title: 'Art', color: '#FFE4E6', memoPreview: 'Draw', meta: ['Studio'] }
  ],
  Sat: [
    { id: 'sat-1', title: 'Self-study', color: '#E2E8F0', memoPreview: 'Read', meta: ['Library'] },
    { id: 'sat-2', title: 'Club', color: '#D1FAE5', memoPreview: 'Meet', meta: ['Activity'] }
  ],
  Sun: [
    { id: 'sun-1', title: 'Review', color: '#F3E8FF', memoPreview: 'Plan', meta: ['Home'] },
    { id: 'sun-2', title: 'Rest', color: '#E5E7EB', memoPreview: 'Off', meta: ['Free'] }
  ]
};

