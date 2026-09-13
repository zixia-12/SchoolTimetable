import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { courseColors, defaultPeriodTimes, PeriodTime, weekdays } from '@/features/timetable/defaultSchedule';
import { colors, radius, spacing } from '@/theme/tokens';
import { Course, Weekday } from '@/types/timetable';

const STORAGE_KEY = '@riyuebiao/courses-v2';
const PERIODS_STORAGE_KEY = '@riyuebiao/period-times-v1';
const APP_VERSION = '1.0.0';
const LATEST_RELEASE_URL = 'https://gitee.com/api/v5/repos/haozixia26/school-timetable/releases/latest';
const PERIOD_HEIGHT = 82;
const PERIOD_COLUMN_WIDTH = 52;
const CURRENT_WEEK = 2;

const dayNames: Record<Weekday, string> = {
  Mon: '一', Tue: '二', Wed: '三', Thu: '四', Fri: '五', Sat: '六', Sun: '日'
};

type DraftCourse = {
  id?: string;
  title: string;
  color: string;
  day: Weekday;
  startPeriod: number;
  duration: number;
  room: string;
  teacher: string;
  note: string;
};

type UpdateStatus = 'idle' | 'checking' | 'latest' | 'available' | 'error';

function getWeekStart(offset: number) {
  const date = new Date();
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1 + offset * 7);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDate(date: Date) {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

function createDraft(day: Weekday, period: number, periodCount: number, course?: Course): DraftCourse {
  return {
    id: course?.id,
    title: course?.title ?? '',
    color: course?.color ?? courseColors[0],
    day: course?.day ?? day,
    startPeriod: course?.startPeriod ?? period,
    duration: course?.duration ?? Math.min(2, periodCount - period),
    room: course?.room ?? '',
    teacher: course?.teacher ?? '',
    note: course?.note ?? ''
  };
}

function normalizeVersion(version: string) {
  return version.trim().replace(/^v/i, '').split('.').map((part) => Number.parseInt(part, 10) || 0);
}

function isNewerVersion(latest: string, current: string) {
  const latestParts = normalizeVersion(latest);
  const currentParts = normalizeVersion(current);
  const length = Math.max(latestParts.length, currentParts.length);
  for (let index = 0; index < length; index += 1) {
    const difference = (latestParts[index] ?? 0) - (currentParts[index] ?? 0);
    if (difference !== 0) return difference > 0;
  }
  return false;
}

function addMinutes(time: string, minutes: number) {
  const [hour = 0, minute = 0] = time.split(':').map(Number);
  const total = (hour * 60 + minute + minutes) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function TimetableScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [weekOffset, setWeekOffset] = useState(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [periodTimes, setPeriodTimes] = useState<PeriodTime[]>(defaultPeriodTimes);
  const [selected, setSelected] = useState<Course | null>(null);
  const [draft, setDraft] = useState<DraftCourse | null>(null);
  const [editingPeriods, setEditingPeriods] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [periodsHydrated, setPeriodsHydrated] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle');
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const start = useMemo(() => getWeekStart(weekOffset), [weekOffset]);
  const weekNumber = CURRENT_WEEK + weekOffset;
  const todayIndex = (new Date().getDay() || 7) - 1;
  const tableWidth = width - spacing.md * 2;
  const columnWidth = (tableWidth - PERIOD_COLUMN_WIDTH) / 7;
  const topInset = StatusBar.currentHeight ?? 0;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => stored && setCourses(JSON.parse(stored) as Course[]))
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(courses)).catch(() => undefined);
  }, [courses, hydrated]);

  useEffect(() => {
    AsyncStorage.getItem(PERIODS_STORAGE_KEY)
      .then((stored) => stored && setPeriodTimes(JSON.parse(stored) as PeriodTime[]))
      .catch(() => undefined)
      .finally(() => setPeriodsHydrated(true));
  }, []);

  useEffect(() => {
    if (periodsHydrated) AsyncStorage.setItem(PERIODS_STORAGE_KEY, JSON.stringify(periodTimes)).catch(() => undefined);
  }, [periodTimes, periodsHydrated]);

  const changeWeek = (delta: number) => {
    setWeekOffset((current) => Math.max(1 - CURRENT_WEEK, Math.min(20 - CURRENT_WEEK, current + delta)));
  };

  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 18 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx < -45) changeWeek(1);
      if (gesture.dx > 45) changeWeek(-1);
    }
  }), []);

  const visibleCourses = courses.filter((course) => course.weeks.includes(weekNumber) && course.startPeriod < periodTimes.length);

  const openAdd = (day: Weekday, period: number) => setDraft(createDraft(day, period, periodTimes.length));

  const saveCourse = () => {
    if (!draft?.title.trim()) return;
    const course: Course = {
      id: draft.id ?? `course-${Date.now()}`,
      title: draft.title.trim(),
      color: draft.color,
      day: draft.day,
      startPeriod: draft.startPeriod,
      duration: Math.min(draft.duration, periodTimes.length - draft.startPeriod),
      weeks: Array.from({ length: 20 }, (_, index) => index + 1),
      room: draft.room.trim() || undefined,
      teacher: draft.teacher.trim() || undefined,
      note: draft.note.trim() || undefined
    };
    setCourses((current) => draft.id
      ? current.map((item) => item.id === draft.id ? course : item)
      : [...current, course]);
    setDraft(null);
    setSelected(null);
  };

  const copyCourse = (course: Course) => {
    const occupied = new Set(courses.filter((item) => item.day === course.day).flatMap((item) =>
      Array.from({ length: item.duration }, (_, index) => item.startPeriod + index)));
    const nextPeriod = periodTimes.findIndex((_, index) => !occupied.has(index));
    setCourses((current) => [...current, {
      ...course,
      id: `course-${Date.now()}`,
      startPeriod: nextPeriod >= 0 ? nextPeriod : course.startPeriod
    }]);
    setSelected(null);
  };

  const deleteCourse = (course: Course) => {
    Alert.alert('删除课程', `确定删除“${course.title}”吗？`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => {
        setCourses((current) => current.filter((item) => item.id !== course.id));
        setSelected(null);
      } }
    ]);
  };

  const addFromHeader = () => {
    const day = weekdays[Math.max(0, todayIndex)];
    const occupied = new Set(visibleCourses.filter((course) => course.day === day).flatMap((course) =>
      Array.from({ length: course.duration }, (_, index) => course.startPeriod + index)));
    const period = periodTimes.findIndex((_, index) => !occupied.has(index));
    openAdd(day, Math.max(0, period));
  };

  const checkForUpdates = async () => {
    if (updateStatus === 'checking') return;
    setUpdateStatus('checking');
    try {
      const response = await fetch(LATEST_RELEASE_URL, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const release = await response.json() as { tag_name?: string; name?: string; body?: string };
      const version = release.tag_name || release.name;
      if (!version) throw new Error('Missing release version');
      const normalized = version.replace(/^v/i, '');
      setLatestVersion(normalized);
      if (isNewerVersion(normalized, APP_VERSION)) {
        setUpdateStatus('available');
        const summary = release.body?.trim()
          .replace(/^#+\s*/gm, '')
          .replace(/^[-*]\s+/gm, '• ')
          .slice(0, 500) || '新版本已经发布。';
        Alert.alert(`发现新版本 ${normalized}`, summary, [{ text: '知道了' }]);
      } else {
        setUpdateStatus('latest');
        Alert.alert('已是最新版', `当前版本为 ${APP_VERSION}`, [{ text: '知道了' }]);
      }
    } catch {
      setUpdateStatus('error');
      Alert.alert('检查更新失败', '暂时无法连接 Gitee，请稍后重试。', [{ text: '知道了' }]);
    }
  };

  const updatePeriodTime = (index: number, part: 0 | 1, value: string) => {
    setPeriodTimes((current) => current.map((time, timeIndex) => {
      if (timeIndex !== index) return time;
      const next: PeriodTime = [...time];
      next[part] = value;
      return next;
    }));
  };

  const addPeriod = () => {
    if (periodTimes.length >= 20) {
      Alert.alert('最多设置 20 节课');
      return;
    }
    const previousEnd = periodTimes.at(-1)?.[1] ?? '08:00';
    const begin = addMinutes(previousEnd, 10);
    setPeriodTimes((current) => [...current, [begin, addMinutes(begin, 50)]]);
  };

  const removePeriod = (index: number) => {
    if (periodTimes.length === 1) {
      Alert.alert('至少保留一节课');
      return;
    }
    setPeriodTimes((current) => current.filter((_, timeIndex) => timeIndex !== index));
    setCourses((current) => current.map((course) => {
      if (course.startPeriod <= index) return course;
      return { ...course, startPeriod: course.startPeriod - 1 };
    }));
  };

  const updateLabel = updateStatus === 'checking'
    ? '正在后台检查…'
    : updateStatus === 'latest'
      ? `已是最新版 · ${APP_VERSION}`
      : updateStatus === 'available'
        ? `发现新版本 · ${latestVersion}`
        : updateStatus === 'error'
          ? '检查失败，点击重试'
          : `当前版本 ${APP_VERSION}`;

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
    <View style={[styles.root, { paddingTop: topInset + spacing.sm }]}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.weekTitle}>第{weekNumber}周  周{dayNames[weekdays[todayIndex]]}</Text>
          <Text style={styles.currentDate}>{formatDate(new Date())}</Text>
        </View>
        <Pressable accessibilityLabel="更多功能" onPress={() => setMenuOpen(true)} style={styles.moreButton}>
          <Text style={styles.moreIcon}>•••</Text>
        </Pressable>
      </View>

      <View style={styles.weekBar}>
        <Pressable accessibilityLabel="上一周" onPress={() => changeWeek(-1)} style={styles.weekArrow}><Text style={styles.arrow}>‹</Text></Pressable>
        <Pressable onPress={() => setWeekOffset(0)} style={styles.weekCenter}>
          <Text style={styles.weekRange}>{formatDate(start)} - {formatDate(new Date(start.getTime() + 6 * 86400000))}</Text>
          {weekOffset !== 0 && <Text style={styles.backToWeek}>回到本周</Text>}
        </Pressable>
        <Pressable accessibilityLabel="下一周" onPress={() => changeWeek(1)} style={styles.weekArrow}><Text style={styles.arrow}>›</Text></Pressable>
      </View>

      <View style={[styles.dayRow, { width: tableWidth }]}>
        <View style={styles.monthCell}><Text style={styles.monthText}>{start.getMonth() + 1}月</Text></View>
        {weekdays.map((day, index) => {
          const date = new Date(start);
          date.setDate(start.getDate() + index);
          const isToday = weekOffset === 0 && index === todayIndex;
          return (
            <View key={day} style={[styles.dayCell, { width: columnWidth }]}>
              <Text style={[styles.dayName, isToday && styles.todayText]}>周{dayNames[day]}</Text>
              <View style={[styles.dateBadge, isToday && styles.todayBadge]}>
                <Text style={[styles.dateText, isToday && styles.todayDateText]}>{date.getDate()}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <ScrollView
        style={styles.tableScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        {...panResponder.panHandlers}
      >
        <View style={[styles.grid, { width: tableWidth, height: periodTimes.length * PERIOD_HEIGHT }]}>
          {periodTimes.map(([begin, end], periodIndex) => (
            <View key={begin} style={[styles.periodRow, { top: periodIndex * PERIOD_HEIGHT }]}>
              <View style={styles.periodLabel}>
                <Text style={styles.periodNumber}>{periodIndex + 1}</Text>
                <Text style={styles.periodTime}>{begin}</Text>
                <Text style={styles.periodTime}>{end}</Text>
              </View>
              {weekdays.map((day) => (
                <Pressable
                  accessibilityLabel={`周${dayNames[day]}第${periodIndex + 1}节，添加课程`}
                  key={day}
                  onPress={() => openAdd(day, periodIndex)}
                  style={[styles.emptySlot, { width: columnWidth }]}
                />
              ))}
            </View>
          ))}

          {visibleCourses.map((course) => {
            const dayIndex = weekdays.indexOf(course.day);
            return (
              <Pressable
                key={course.id}
                onPress={() => setSelected(course)}
                style={[
                  styles.courseBlock,
                  {
                    backgroundColor: course.color,
                    height: Math.min(course.duration, periodTimes.length - course.startPeriod) * PERIOD_HEIGHT - 6,
                    left: PERIOD_COLUMN_WIDTH + dayIndex * columnWidth + 3,
                    top: course.startPeriod * PERIOD_HEIGHT + 3,
                    width: columnWidth - 6
                  }
                ]}
              >
                <Text numberOfLines={3} style={styles.courseTitle}>{course.title}</Text>
                <Text numberOfLines={2} style={styles.courseMeta}>{course.room}</Text>
              </Pressable>
            );
          })}
        </View>

      </ScrollView>

      <Modal transparent visible={menuOpen} animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)}>
          <Pressable style={[styles.menuPanel, { top: topInset + 68 }]} onPress={() => undefined}>
            <Pressable style={styles.menuItem} onPress={() => { setMenuOpen(false); addFromHeader(); }}>
              <Text style={styles.menuItemTitle}>添加课程</Text>
              <Text style={styles.menuItemHint}>添加到今天的空闲节次</Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={() => { setMenuOpen(false); setEditingPeriods(true); }}>
              <Text style={styles.menuItemTitle}>节次时间</Text>
              <Text style={styles.menuItemHint}>当前每天 {periodTimes.length} 节课</Text>
            </Pressable>
            <Pressable
              disabled={updateStatus === 'checking'}
              style={[styles.menuItem, styles.lastMenuItem]}
              onPress={() => { setMenuOpen(false); void checkForUpdates(); }}
            >
              <Text style={styles.menuItemTitle}>检查更新</Text>
              <Text style={styles.menuItemHint}>{updateLabel}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={Boolean(selected)} animationType="slide" onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.backdrop} onPress={() => setSelected(null)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <View style={styles.handle} />
            <View style={styles.detailHeading}>
              <View style={[styles.colorMark, { backgroundColor: selected?.color }]} />
              <Text style={styles.detailTitle}>{selected?.title}</Text>
            </View>
            <View style={styles.detailRows}>
              <Text style={styles.detailText}>第1 - 20周</Text>
              <Text style={styles.detailText}>周{selected ? dayNames[selected.day] : ''}  第{(selected?.startPeriod ?? 0) + 1} - {(selected?.startPeriod ?? 0) + (selected?.duration ?? 1)}节</Text>
              {!!selected?.room && <Text style={styles.detailText}>教室  {selected.room}</Text>}
              {!!selected?.teacher && <Text style={styles.detailText}>老师  {selected.teacher}</Text>}
              {!!selected?.note && <Text style={styles.detailText}>备注  {selected.note}</Text>}
            </View>
            <View style={styles.actionRow}>
              <Pressable style={styles.primaryAction} onPress={() => selected && setDraft(createDraft(selected.day, selected.startPeriod, periodTimes.length, selected))}><Text style={styles.primaryActionText}>编辑</Text></Pressable>
              <Pressable style={styles.secondaryAction} onPress={() => selected && copyCourse(selected)}><Text style={styles.secondaryActionText}>复制</Text></Pressable>
              <Pressable style={styles.secondaryAction} onPress={() => selected && deleteCourse(selected)}><Text style={styles.deleteText}>删除</Text></Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={editingPeriods} animationType="slide" onRequestClose={() => setEditingPeriods(false)}>
        <View style={[styles.editorRoot, { paddingTop: topInset + spacing.md, paddingBottom: insets.bottom }]}>
          <View style={styles.editorHeader}>
            <Pressable onPress={() => setEditingPeriods(false)} style={styles.closeButton}><Text style={styles.closeText}>×</Text></Pressable>
            <Text style={styles.editorTitle}>节次时间</Text>
            <Pressable onPress={() => setEditingPeriods(false)} style={styles.saveButton}><Text style={styles.saveText}>完成</Text></Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.periodEditorContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.periodHint}>共 {periodTimes.length} 节课</Text>
            <View style={styles.formSection}>
              {periodTimes.map(([begin, end], index) => (
                <View key={`period-${index}`} style={styles.periodEditRow}>
                  <Text style={styles.periodEditNumber}>{index + 1}</Text>
                  <TextInput
                    accessibilityLabel={`第${index + 1}节开始时间`}
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                    onChangeText={(value) => updatePeriodTime(index, 0, value)}
                    placeholder="08:00"
                    selectTextOnFocus
                    style={styles.timeInput}
                    value={begin}
                  />
                  <Text style={styles.timeSeparator}>至</Text>
                  <TextInput
                    accessibilityLabel={`第${index + 1}节结束时间`}
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                    onChangeText={(value) => updatePeriodTime(index, 1, value)}
                    placeholder="08:50"
                    selectTextOnFocus
                    style={styles.timeInput}
                    value={end}
                  />
                  <Pressable accessibilityLabel={`删除第${index + 1}节`} onPress={() => removePeriod(index)} style={styles.removePeriodButton}>
                    <Text style={styles.removePeriodText}>×</Text>
                  </Pressable>
                </View>
              ))}
            </View>
            <Pressable onPress={addPeriod} style={styles.addPeriodButton}>
              <Text style={styles.addPeriodText}>＋ 添加一节</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={Boolean(draft)} animationType="slide" onRequestClose={() => setDraft(null)}>
        <View style={[styles.editorRoot, { paddingTop: topInset + spacing.md, paddingBottom: insets.bottom }]}>
          <View style={styles.editorHeader}>
            <Pressable onPress={() => setDraft(null)} style={styles.closeButton}><Text style={styles.closeText}>×</Text></Pressable>
            <Text style={styles.editorTitle}>{draft?.id ? '编辑课程' : '添加课程'}</Text>
            <Pressable disabled={!draft?.title.trim()} onPress={saveCourse} style={styles.saveButton}><Text style={[styles.saveText, !draft?.title.trim() && styles.disabledText]}>保存</Text></Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.editorContent} keyboardShouldPersistTaps="handled">
            <View style={styles.formSection}>
              <TextInput autoFocus value={draft?.title ?? ''} onChangeText={(title) => setDraft((current) => current && { ...current, title })} placeholder="输入课程名称" placeholderTextColor="#A8ADB8" style={styles.nameInput} />
              <View style={styles.formRow}><Text style={styles.formLabel}>颜色</Text><View style={styles.palette}>{courseColors.map((color) => <Pressable accessibilityLabel={`选择颜色 ${color}`} key={color} onPress={() => setDraft((current) => current && { ...current, color })} style={[styles.swatch, { backgroundColor: color }, draft?.color === color && styles.selectedSwatch]} />)}</View></View>
            </View>

            <Text style={styles.sectionLabel}>时间</Text>
            <View style={styles.formSection}>
              <View style={styles.formRow}><Text style={styles.formLabel}>星期</Text><View style={styles.segment}>{weekdays.map((day) => <Pressable key={day} onPress={() => setDraft((current) => current && { ...current, day })} style={[styles.segmentItem, draft?.day === day && styles.segmentActive]}><Text style={[styles.segmentText, draft?.day === day && styles.segmentTextActive]}>{dayNames[day]}</Text></Pressable>)}</View></View>
              <View style={styles.formRow}><Text style={styles.formLabel}>开始节次</Text><View style={styles.stepper}><Pressable onPress={() => setDraft((current) => current && { ...current, startPeriod: Math.max(0, current.startPeriod - 1) })} style={styles.stepButton}><Text style={styles.stepText}>−</Text></Pressable><Text style={styles.stepValue}>第 {(draft?.startPeriod ?? 0) + 1} 节</Text><Pressable onPress={() => setDraft((current) => current && { ...current, startPeriod: Math.min(periodTimes.length - 1, current.startPeriod + 1), duration: Math.min(current.duration, periodTimes.length - Math.min(periodTimes.length - 1, current.startPeriod + 1)) })} style={styles.stepButton}><Text style={styles.stepText}>＋</Text></Pressable></View></View>
              <View style={styles.formRow}><Text style={styles.formLabel}>连续节数</Text><View style={styles.stepper}><Pressable onPress={() => setDraft((current) => current && { ...current, duration: Math.max(1, current.duration - 1) })} style={styles.stepButton}><Text style={styles.stepText}>−</Text></Pressable><Text style={styles.stepValue}>{draft?.duration ?? 1} 节</Text><Pressable onPress={() => setDraft((current) => current && { ...current, duration: Math.min(periodTimes.length - current.startPeriod, current.duration + 1) })} style={styles.stepButton}><Text style={styles.stepText}>＋</Text></Pressable></View></View>
            </View>

            <Text style={styles.sectionLabel}>课程信息</Text>
            <View style={styles.formSection}>
              <TextInput value={draft?.room ?? ''} onChangeText={(room) => setDraft((current) => current && { ...current, room })} placeholder="教室（选填）" placeholderTextColor="#A8ADB8" style={styles.input} />
              <TextInput value={draft?.teacher ?? ''} onChangeText={(teacher) => setDraft((current) => current && { ...current, teacher })} placeholder="老师（选填）" placeholderTextColor="#A8ADB8" style={styles.input} />
              <TextInput multiline value={draft?.note ?? ''} onChangeText={(note) => setDraft((current) => current && { ...current, note })} placeholder="备注（选填）" placeholderTextColor="#A8ADB8" style={[styles.input, styles.noteInput]} />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F5FB' },
  root: { flex: 1, backgroundColor: '#F3F5FB' },
  topBar: { minHeight: 70, paddingHorizontal: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weekTitle: { color: colors.text, fontSize: 25, fontWeight: '900' },
  currentDate: { color: colors.subtext, fontSize: 14, fontWeight: '700', marginTop: 2 },
  moreButton: { width: 52, height: 48, alignItems: 'center', justifyContent: 'center' },
  moreIcon: { color: colors.text, fontSize: 22, fontWeight: '900', letterSpacing: 0 },
  weekBar: { height: 42, marginHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center' },
  weekArrow: { width: 44, height: 42, alignItems: 'center', justifyContent: 'center' },
  arrow: { color: colors.text, fontSize: 28 },
  weekCenter: { flex: 1, alignItems: 'center' },
  weekRange: { color: colors.subtext, fontSize: 13, fontWeight: '600' },
  backToWeek: { color: colors.accent, fontSize: 10, marginTop: 1 },
  dayRow: { height: 58, alignSelf: 'center', flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E2E6EF' },
  monthCell: { width: PERIOD_COLUMN_WIDTH, alignItems: 'center', justifyContent: 'center' },
  monthText: { color: colors.text, fontSize: 13, fontWeight: '800' },
  dayCell: { alignItems: 'center', justifyContent: 'center' },
  dayName: { color: '#8B93A2', fontSize: 12, fontWeight: '700' },
  dateBadge: { width: 28, height: 28, borderRadius: 7, alignItems: 'center', justifyContent: 'center', marginTop: 3 },
  todayBadge: { backgroundColor: colors.text },
  dateText: { color: '#8B93A2', fontSize: 14, fontWeight: '700' },
  todayText: { color: colors.text },
  todayDateText: { color: '#FFFFFF' },
  tableScroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.lg },
  grid: { alignSelf: 'center', position: 'relative' },
  periodRow: { height: PERIOD_HEIGHT, position: 'absolute', left: 0, right: 0, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E8F0' },
  periodLabel: { width: PERIOD_COLUMN_WIDTH, alignItems: 'center', justifyContent: 'center' },
  periodNumber: { color: colors.text, fontSize: 17, fontWeight: '900', marginBottom: 3 },
  periodTime: { color: '#7D8594', fontSize: 10, lineHeight: 14 },
  emptySlot: { height: PERIOD_HEIGHT, borderLeftWidth: 1, borderLeftColor: '#E5E8F0' },
  courseBlock: { position: 'absolute', zIndex: 2, borderRadius: 7, padding: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.75)' },
  courseTitle: { color: '#FFFFFF', fontSize: 11, lineHeight: 14, fontWeight: '900', textAlign: 'center' },
  courseMeta: { color: 'rgba(255,255,255,0.92)', fontSize: 9, lineHeight: 12, marginTop: 4, textAlign: 'center' },
  menuBackdrop: { flex: 1, backgroundColor: 'rgba(16,24,40,0.12)' },
  menuPanel: { position: 'absolute', right: spacing.md, width: 240, backgroundColor: '#FFFFFF', borderRadius: radius.sm, paddingHorizontal: spacing.md, shadowColor: '#101828', shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  menuItem: { minHeight: 68, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#EAECF0' },
  lastMenuItem: { borderBottomWidth: 0 },
  menuItemTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  menuItemHint: { color: colors.subtext, fontSize: 12, marginTop: 3 },
  backdrop: { flex: 1, backgroundColor: 'rgba(16,24,40,0.34)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: spacing.lg, paddingBottom: spacing.xl },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: '#D0D5DD', alignSelf: 'center', marginBottom: spacing.lg },
  detailHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: '#EAECF0' },
  colorMark: { width: 6, height: 34, borderRadius: 3 },
  detailTitle: { flex: 1, color: colors.text, fontSize: 24, fontWeight: '900' },
  detailRows: { gap: spacing.md, paddingVertical: spacing.lg },
  detailText: { color: colors.text, fontSize: 16, lineHeight: 22 },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  primaryAction: { flex: 1, height: 48, backgroundColor: colors.text, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  primaryActionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  secondaryAction: { minWidth: 68, height: 48, backgroundColor: '#F2F4F7', borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  secondaryActionText: { color: colors.text, fontSize: 15, fontWeight: '700' },
  deleteText: { color: '#D92D20', fontSize: 15, fontWeight: '700' },
  editorRoot: { flex: 1, backgroundColor: '#F5F6F8' },
  editorHeader: { height: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md },
  closeButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: colors.text, fontSize: 35, fontWeight: '300' },
  editorTitle: { color: colors.text, fontSize: 22, fontWeight: '900' },
  saveButton: { minWidth: 60, height: 42, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: '#F04468', fontSize: 17, fontWeight: '900' },
  disabledText: { opacity: 0.35 },
  editorContent: { padding: spacing.md, paddingBottom: 40 },
  formSection: { backgroundColor: '#FFFFFF', borderRadius: radius.md, paddingHorizontal: spacing.md, overflow: 'hidden' },
  nameInput: { height: 70, color: colors.text, fontSize: 22, borderBottomWidth: 1, borderBottomColor: '#EAECF0' },
  formRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#EAECF0', gap: spacing.md },
  formLabel: { color: colors.text, fontSize: 16, fontWeight: '700' },
  palette: { flexDirection: 'row', gap: 7 },
  swatch: { width: 25, height: 25, borderRadius: 13, borderWidth: 2, borderColor: 'transparent' },
  selectedSwatch: { borderColor: colors.text },
  sectionLabel: { color: colors.subtext, fontSize: 14, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.sm, marginLeft: spacing.xs },
  segment: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end' },
  segmentItem: { width: 32, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 6 },
  segmentActive: { backgroundColor: colors.text },
  segmentText: { color: colors.subtext, fontSize: 13, fontWeight: '700' },
  segmentTextActive: { color: '#FFFFFF' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepButton: { width: 36, height: 36, backgroundColor: '#F2F4F7', borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  stepText: { color: colors.text, fontSize: 20 },
  stepValue: { minWidth: 58, color: colors.text, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  input: { minHeight: 58, color: colors.text, fontSize: 16, borderBottomWidth: 1, borderBottomColor: '#EAECF0' },
  noteInput: { minHeight: 86, paddingTop: spacing.md, textAlignVertical: 'top' },
  periodEditorContent: { padding: spacing.md, paddingBottom: 40 },
  periodHint: { color: colors.subtext, fontSize: 14, fontWeight: '700', marginBottom: spacing.sm, marginLeft: spacing.xs },
  periodEditRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EAECF0' },
  periodEditNumber: { width: 34, color: colors.text, fontSize: 17, fontWeight: '900', textAlign: 'center' },
  timeInput: { flex: 1, height: 44, backgroundColor: '#F5F6F8', borderRadius: 7, color: colors.text, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  timeSeparator: { color: colors.subtext, fontSize: 14, marginHorizontal: spacing.sm },
  removePeriodButton: { width: 42, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: spacing.xs },
  removePeriodText: { color: '#D92D20', fontSize: 26, fontWeight: '400' },
  addPeriodButton: { height: 50, marginTop: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  addPeriodText: { color: colors.accent, fontSize: 16, fontWeight: '800' }
});
