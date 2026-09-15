import { Buffer } from 'buffer';
import iconv from 'iconv-lite';
import { HTMLElement, parse } from 'node-html-parser';

import { Weekday } from '@/types/timetable';

export type ImportedCourse = {
  title: string;
  day: Weekday;
  startPeriod: number;
  duration: number;
  weeks: number[];
  room?: string;
  teacher?: string;
};

export type ImportedGeneralCourse = {
  title: string;
  weeks: number[];
  courseCode?: string;
  section?: string;
  teacher?: string;
};

export type TimetableImportResult = {
  courses: ImportedCourse[];
  generalCourses: ImportedGeneralCourse[];
};

const weekdayByName: Record<string, Weekday> = {
  一: 'Mon', 二: 'Tue', 三: 'Wed', 四: 'Thu', 五: 'Fri', 六: 'Sat', 日: 'Sun', 天: 'Sun'
};

function decodeSchoolExport(bytes: Uint8Array) {
  const prefix = Array.from(bytes.slice(0, 1024), (byte) => String.fromCharCode(byte)).join('');
  if (!/<(?:!doctype|html)\b/i.test(prefix.trimStart())) {
    throw new Error('这不是学校导出的教学安排表');
  }

  const charset = prefix.match(/charset\s*=\s*["']?([^\s"'/>]+)/i)?.[1]?.toLowerCase();
  const encoding = charset === 'gb2312' || charset === 'gbk' || charset === 'gb18030'
    ? 'gb18030'
    : 'utf8';
  return iconv.decode(Buffer.from(bytes), encoding);
}

function positiveSpan(value: string | undefined) {
  const parsed = Number.parseInt(value ?? '1', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function tableToGrid(table: HTMLElement) {
  const grid: string[][] = [];
  const spans = new Map<number, { rowsLeft: number; text: string }>();

  for (const row of table.querySelectorAll('tr')) {
    const values: string[] = [];
    let column = 0;
    const consumeSpans = () => {
      while (spans.has(column)) {
        const span = spans.get(column)!;
        values[column] = span.text;
        span.rowsLeft -= 1;
        if (span.rowsLeft === 0) spans.delete(column);
        column += 1;
      }
    };

    for (const cell of row.querySelectorAll('td,th')) {
      consumeSpans();
      const text = cell.structuredText.trim();
      const colspan = positiveSpan(cell.getAttribute('colspan'));
      const rowspan = positiveSpan(cell.getAttribute('rowspan'));
      for (let offset = 0; offset < colspan; offset += 1) {
        values[column + offset] = text;
        if (rowspan > 1) spans.set(column + offset, { rowsLeft: rowspan - 1, text });
      }
      column += colspan;
    }
    consumeSpans();
    grid.push(values);
  }

  return grid;
}

function expandWeeks(expression: string, parity?: string) {
  const weeks = new Set<number>();
  for (const match of expression.matchAll(/(\d{1,2})(?:\s*-\s*(\d{1,2}))?/g)) {
    const start = Number(match[1]);
    const end = Number(match[2] ?? match[1]);
    if (start < 1 || end < start || end > 30) continue;
    for (let week = start; week <= end; week += 1) {
      if (parity === '单' && week % 2 === 0) continue;
      if (parity === '双' && week % 2 !== 0) continue;
      weeks.add(week);
    }
  }
  return [...weeks].sort((left, right) => left - right);
}

export function cleanImportedRoom(room: string | undefined) {
  return room?.replace(/\s*[（(][^()（）]*校区[)）]\s*$/, '').trim() || undefined;
}

function parseCourseCell(text: string, day: Weekday) {
  const lines = text.split(/\n+/).map((line) => line.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const courses: ImportedCourse[] = [];
  const schedulePattern = /^(.+?)(?:周)?\s*(?:[（(]\s*([单双])周?\s*[)）])?\s*\[\s*(\d{1,2})(?:\s*-\s*(\d{1,2}))?\s*\]$/;

  for (let index = 0; index < lines.length; index += 1) {
    const schedule = lines[index].match(schedulePattern);
    if (!schedule || index < 2) continue;
    const start = Number(schedule[3]);
    const end = Number(schedule[4] ?? schedule[3]);
    const weeks = expandWeeks(schedule[1], schedule[2]);
    if (weeks.length === 0 || start < 1 || end < start || end > 20) continue;

    courses.push({
      title: lines[index - 2],
      teacher: lines[index - 1] || undefined,
      weeks,
      day,
      startPeriod: start - 1,
      duration: end - start + 1,
      room: cleanImportedRoom(lines[index + 1])
    });
  }
  return courses;
}

function parseGeneralCourses(table: HTMLElement) {
  const grid = tableToGrid(table);
  const headerIndex = grid.findIndex((row) => row.includes('课程') && row.includes('上课时间地点'));
  if (headerIndex < 0) return [];
  const header = grid[headerIndex];
  const classColumn = header.indexOf('上课班级代码');
  const courseColumn = header.indexOf('课程');
  const teacherColumn = header.indexOf('任课教师');
  const scheduleColumn = header.indexOf('上课时间地点');

  return grid.slice(headerIndex + 1).flatMap((row): ImportedGeneralCourse[] => {
    const schedule = row[scheduleColumn]?.match(/^(.+?)周\s*\[\s*\]/);
    const courseText = row[courseColumn]?.trim();
    if (!schedule || !courseText) return [];
    const courseMatch = courseText.match(/^\[([^\]]+)]\s*(.+)$/);
    const classCode = row[classColumn]?.trim();
    const teacher = row[teacherColumn]?.replace(/^\[[^\]]+]\s*/, '').trim();
    return [{
      title: courseMatch?.[2] ?? courseText,
      courseCode: courseMatch?.[1],
      section: classCode?.match(/-(\d+)$/)?.[1],
      teacher: teacher || undefined,
      weeks: expandWeeks(schedule[1])
    }];
  });
}

export function parseSchoolTimetable(bytes: Uint8Array): TimetableImportResult {
  const root = parse(decodeSchoolExport(bytes));
  const tables = root.querySelectorAll('table');
  const timetable = tables.find((table) => /星期一/.test(table.structuredText) && /星期日/.test(table.structuredText));
  if (!timetable) throw new Error('文件中没有找到周课表');

  const grid = tableToGrid(timetable);
  const headerRowIndex = grid.findIndex((row) => row.some((cell) => /^\s*星期[一二三四五六日天]\s*$/.test(cell ?? '')));
  if (headerRowIndex < 0) throw new Error('无法识别课表的星期列');

  const dayColumns = new Map<number, Weekday>();
  grid[headerRowIndex].forEach((cell, column) => {
    const name = cell?.match(/星期([一二三四五六日天])/)?.[1];
    if (name) dayColumns.set(column, weekdayByName[name]);
  });

  const courses = grid.slice(headerRowIndex + 1).flatMap((row) =>
    [...dayColumns].flatMap(([column, day]) => parseCourseCell(row[column] ?? '', day))
  );
  if (courses.length === 0) throw new Error('没有识别到带星期和节次的课程');

  const generalCourses = tables
    .filter((table) => table !== timetable)
    .flatMap(parseGeneralCourses);

  return { courses, generalCourses };
}
