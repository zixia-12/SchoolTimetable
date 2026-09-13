import { useMemo, useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { defaultBlocks, periodLabels, weekdays } from '@/features/timetable/defaultSchedule';
import { colors, radius, spacing } from '@/theme/tokens';
import { ClassBlock, Weekday } from '@/types/timetable';

const dayNames: Record<Weekday, string> = {
  Mon: '一', Tue: '二', Wed: '三', Thu: '四', Fri: '五', Sat: '六', Sun: '日'
};

function getWeekStart(offset: number) {
  const date = new Date();
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1 + offset * 7);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatWeek(start: Date) {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`;
}

function CourseCell({ block, onPress, width }: { block?: ClassBlock; onPress: () => void; width: number }) {
  return (
    <Pressable onPress={onPress} style={[styles.cell, { width: width - 4 }, block ? { backgroundColor: block.color } : styles.emptyCell]}>
      {block ? (
        <>
          <Text numberOfLines={2} style={styles.courseTitle}>{block.title}</Text>
          <Text numberOfLines={1} style={styles.courseMeta}>{block.meta?.[0] ?? ''}</Text>
        </>
      ) : <Text style={styles.plus}>+</Text>}
    </Pressable>
  );
}

export function TimetableScreen() {
  const { width } = useWindowDimensions();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selected, setSelected] = useState<ClassBlock | null>(null);
  const [schedule, setSchedule] = useState(defaultBlocks);
  const [adding, setAdding] = useState<{ day: Weekday; periodIndex: number } | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftRoom, setDraftRoom] = useState('');
  const start = useMemo(() => getWeekStart(weekOffset), [weekOffset]);
  const todayIndex = (new Date().getDay() || 7) - 1;
  const tableWidth = width - spacing.lg * 2;
  const columnWidth = (tableWidth - 40) / 7;
  const topInset = StatusBar.currentHeight ?? 0;

  const openAdd = (day: Weekday, periodIndex: number) => {
    setDraftName('');
    setDraftRoom('');
    setAdding({ day, periodIndex });
  };

  const saveCourse = () => {
    if (!adding || !draftName.trim()) return;
    setSchedule((current) => {
      const daySchedule = [...current[adding.day]];
      daySchedule[adding.periodIndex] = {
        id: `${adding.day}-${adding.periodIndex}-${Date.now()}`,
        title: draftName.trim(),
        color: '#DBEAFE',
        meta: draftRoom.trim() ? [draftRoom.trim()] : [],
        memoPreview: '暂无备注'
      };
      return { ...current, [adding.day]: daySchedule };
    });
    setAdding(null);
  };

  return (
    <View style={[styles.root, { paddingTop: topInset + spacing.sm }]}>
      <View style={styles.header}>
        <View><Text style={styles.eyebrow}>课程表</Text><Text style={styles.title}>我的课表</Text></View>
      </View>

      <View style={styles.weekBar}>
        <Pressable onPress={() => setWeekOffset((value) => value - 1)} style={styles.arrowButton}><Text style={styles.arrow}>‹</Text></Pressable>
        <Pressable onPress={() => setWeekOffset(0)} style={styles.weekCenter}>
          <Text style={styles.weekText}>{formatWeek(start)}</Text>
          {weekOffset !== 0 && <Text style={styles.todayLink}>回到本周</Text>}
        </Pressable>
        <Pressable onPress={() => setWeekOffset((value) => value + 1)} style={styles.arrowButton}><Text style={styles.arrow}>›</Text></Pressable>
      </View>

      <ScrollView style={styles.tableScroll} contentContainerStyle={styles.scroller} showsVerticalScrollIndicator={false}>
        <View style={[styles.table, { width: tableWidth }]}>
          <View style={styles.headerRow}>
            <View style={styles.corner} />
            {weekdays.map((day, index) => {
              const date = new Date(start);
              date.setDate(start.getDate() + index);
              const isToday = weekOffset === 0 && index === todayIndex;
              return (
                <View key={day} style={[styles.dayHeader, { width: columnWidth }, isToday && styles.todayHeader]}>
                  <Text style={[styles.dayName, isToday && styles.todayText]}>周{dayNames[day]}</Text>
                  <Text style={[styles.dayNumber, isToday && styles.todayText]}>{date.getDate()}</Text>
                </View>
              );
            })}
          </View>

          {periodLabels.map((period, periodIndex) => (
            <View key={period} style={[styles.row, (periodIndex === 5 || periodIndex === 9) && styles.sectionStart]}>
              <View style={styles.periodLabel}>
                <Text style={styles.periodNumber}>{periodIndex + 1}</Text>
                <Text style={styles.periodTime}>{period}</Text>
              </View>
              {weekdays.map((day) => {
                const block = schedule[day][periodIndex];
                return <CourseCell key={`${day}-${period}`} width={columnWidth} block={block} onPress={() => block ? setSelected(block) : openAdd(day, periodIndex)} />;
              })}
            </View>
          ))}
        </View>
        <Text style={styles.tip}>点击课程查看详情，点击空白格添加课程</Text>
        <Pressable
          accessibilityRole="link"
          onPress={() => Linking.openURL('https://gitee.com/haozixia26/school-timetable/releases')}
          style={styles.updateButton}
        >
          <Text style={styles.updateText}>检查更新 · 当前版本 1.0.0</Text>
        </Pressable>
      </ScrollView>

      <Modal transparent visible={Boolean(selected)} animationType="slide" onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.backdrop} onPress={() => setSelected(null)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <View style={styles.handle} />
            <View style={[styles.colorMark, { backgroundColor: selected?.color ?? colors.accent }]} />
            <Text style={styles.detailTitle}>{selected?.title}</Text>
            <Text style={styles.detailMeta}>{selected?.meta?.join('  ·  ')}</Text>
            <Text style={styles.detailMemo}>{selected?.memoPreview ?? '暂无备注'}</Text>
            <Pressable style={styles.doneButton} onPress={() => setSelected(null)}><Text style={styles.doneText}>完成</Text></Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={Boolean(adding)} animationType="slide" onRequestClose={() => setAdding(null)}>
        <Pressable style={styles.backdrop} onPress={() => setAdding(null)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>添加课程</Text>
            <TextInput autoFocus value={draftName} onChangeText={setDraftName} placeholder="课程名称" placeholderTextColor={colors.subtext} style={styles.input} />
            <TextInput value={draftRoom} onChangeText={setDraftRoom} placeholder="教室（可选）" placeholderTextColor={colors.subtext} style={styles.input} />
            <Pressable disabled={!draftName.trim()} style={[styles.doneButton, !draftName.trim() && styles.disabledButton]} onPress={saveCourse}>
              <Text style={styles.doneText}>保存课程</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  eyebrow: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: 2 },
  weekBar: { marginHorizontal: spacing.lg, height: 52, backgroundColor: colors.surface, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  arrowButton: { width: 48, alignItems: 'center' }, arrow: { color: colors.accent, fontSize: 30, fontWeight: '300' },
  weekCenter: { flex: 1, alignItems: 'center' }, weekText: { color: colors.text, fontSize: 14, fontWeight: '700' }, todayLink: { color: colors.accent, fontSize: 11, marginTop: 2 },
  tableScroll: { flex: 1 }, scroller: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md },
  table: { backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  headerRow: { height: 60, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  corner: { width: 40, backgroundColor: colors.background },
  dayHeader: { alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderLeftColor: colors.border }, todayHeader: { backgroundColor: colors.accentSoft },
  dayName: { color: colors.subtext, fontSize: 12, fontWeight: '700' }, dayNumber: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 2 }, todayText: { color: colors.accent },
  row: { height: 68, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border }, sectionStart: { borderTopWidth: 3, borderTopColor: colors.accentSoft },
  periodLabel: { width: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }, periodNumber: { color: colors.text, fontSize: 14, fontWeight: '800' }, periodTime: { color: colors.subtext, fontSize: 8, marginTop: 3 },
  cell: { margin: 2, borderRadius: 6, padding: 4, justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(20,33,61,0.06)' },
  emptyCell: { backgroundColor: '#FAFBFD', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' }, plus: { color: '#C3CAD5', fontSize: 18 },
  courseTitle: { color: colors.text, fontSize: 10, fontWeight: '800', lineHeight: 13 }, courseMeta: { color: colors.subtext, fontSize: 8 },
  tip: { color: colors.subtext, fontSize: 12, textAlign: 'center', paddingVertical: spacing.md },
  updateButton: { alignSelf: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm }, updateText: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  backdrop: { flex: 1, backgroundColor: 'rgba(20,33,61,0.28)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: spacing.lg, paddingBottom: spacing.xl },
  handle: { width: 42, height: 4, borderRadius: 4, backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.lg },
  sheetTitle: { color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: spacing.sm },
  colorMark: { width: 42, height: 8, borderRadius: 4, marginBottom: spacing.md }, detailTitle: { color: colors.text, fontSize: 26, fontWeight: '800' }, detailMeta: { color: colors.subtext, fontSize: 14, marginTop: spacing.sm }, detailMemo: { color: colors.text, fontSize: 15, marginTop: spacing.lg, minHeight: 48 },
  input: { height: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, color: colors.text, fontSize: 15, marginTop: spacing.sm },
  doneButton: { backgroundColor: colors.accent, borderRadius: radius.md, alignItems: 'center', paddingVertical: 13, marginTop: spacing.lg }, disabledButton: { opacity: 0.4 }, doneText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' }
});
