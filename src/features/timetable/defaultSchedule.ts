import { ClassBlock, Weekday } from '@/types/timetable';

export const weekdays: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const periodLabels = [
  '08:00', '08:50', '09:50', '10:40', '11:30',
  '14:00', '14:50', '15:50', '16:40',
  '19:00', '19:50', '20:40'
];

export const defaultBlocks: Record<Weekday, Array<ClassBlock | undefined>> = {
  Mon: [
    { id: 'mon-1', title: '高等数学', color: '#DBEAFE', memoPreview: '第三章习题', meta: ['教学楼 A201', '陈老师'] },
    { id: 'mon-2', title: '大学英语', color: '#DCFCE7', memoPreview: 'Unit 4', meta: ['博学楼 305', '李老师'] },
    undefined,
    undefined,
    { id: 'mon-5', title: '体育', color: '#FEF3C7', memoPreview: '篮球', meta: ['东操场', '周老师'] }
  ],
  Tue: [
    undefined,
    { id: 'tue-2', title: '大学物理', color: '#FCE7F3', memoPreview: '力学实验', meta: ['实验楼 102', '王老师'] },
    { id: 'tue-3', title: '程序设计', color: '#E0F2FE', memoPreview: '数组练习', meta: ['机房 4', '赵老师'] }
  ],
  Wed: [
    { id: 'wed-1', title: '线性代数', color: '#EDE9FE', memoPreview: '矩阵', meta: ['教学楼 B103', '孙老师'] },
    undefined,
    { id: 'wed-3', title: '中国近代史', color: '#FEE2E2', memoPreview: '课堂展示', meta: ['博学楼 210', '刘老师'] }
  ],
  Thu: [
    undefined,
    { id: 'thu-2', title: '数据结构', color: '#D1FAE5', memoPreview: '二叉树', meta: ['机房 2', '高老师'] },
    undefined,
    { id: 'thu-4', title: '大学英语', color: '#DCFCE7', memoPreview: 'Presentation', meta: ['博学楼 305', '李老师'] }
  ],
  Fri: [
    { id: 'fri-1', title: '高等数学', color: '#DBEAFE', memoPreview: '第三章习题', meta: ['教学楼 A201', '陈老师'] },
    undefined,
    undefined,
    undefined,
    undefined,
    { id: 'fri-6', title: '形势与政策', color: '#FFE4E6', memoPreview: '专题讨论', meta: ['报告厅', '吴老师'] },
    undefined,
    undefined,
    undefined,
    { id: 'fri-10', title: '通识选修', color: '#F3E8FF', memoPreview: '小组讨论', meta: ['博学楼 108', '郑老师'] }
  ],
  Sat: [],
  Sun: []
};
