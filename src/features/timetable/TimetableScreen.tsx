import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { defaultBlocks, weekdays } from '@/features/timetable/defaultSchedule';
import { colors, radius, spacing } from '@/theme/tokens';
import { ClassBlock, MenuAction } from '@/types/timetable';

const menuItems: Array<{ key: MenuAction; label: string; hint: string }> = [
  { key: 'time', label: '时间', hint: '设置分割线时间' },
  { key: 'merge', label: '合并', hint: '连堂隐藏分界线' },
  { key: 'color', label: '颜色', hint: '选择预设色块' },
  { key: 'info', label: '信息', hint: '添加教室、老师' },
  { key: 'memo', label: '备忘', hint: '写长文本摘要' }
];

function BlockCard({ block }: { block: ClassBlock }) {
  return (
    <View style={[styles.blockCard, { backgroundColor: block.color }]}>
      <Text numberOfLines={1} style={styles.blockTitle}>
        {block.title}
      </Text>
      <Text numberOfLines={1} style={styles.blockMeta}>
        {(block.meta ?? []).join(' · ')}
      </Text>
      <Text numberOfLines={1} style={styles.blockMemo}>
        {block.memoPreview ?? '·'}
      </Text>
    </View>
  );
}

export function TimetableScreen() {
  const [menuVisible, setMenuVisible] = useState(false);

  const board = useMemo(() => weekdays.map((day) => ({ day, blocks: defaultBlocks[day] })), []);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>Android first</Text>
          <Text style={styles.title}>School Timetable</Text>
          <Text style={styles.subtitle}>One-screen overview, no scrolling in the core view.</Text>
        </View>
        <Pressable onPress={() => setMenuVisible(true)} style={styles.editButton}>
          <Text style={styles.editButtonText}>编辑</Text>
        </Pressable>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>7</Text>
          <Text style={styles.summaryLabel}>Days</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>Avg</Text>
          <Text style={styles.summaryLabel}>Default Split</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>5+</Text>
          <Text style={styles.summaryLabel}>Colors</Text>
        </View>
      </View>

      <View style={styles.board}>
        {board.map((column) => (
          <View key={column.day} style={styles.dayColumn}>
            <Text style={styles.dayLabel}>{column.day}</Text>
            <View style={styles.dayStack}>
              {column.blocks.map((block) => (
                <BlockCard key={block.id} block={block} />
              ))}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Local-first structure, ready for future features.</Text>
      </View>

      <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setMenuVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>编辑菜单</Text>
            {menuItems.map((item) => (
              <Pressable key={item.key} style={styles.menuRow}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuHint}>{item.hint}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.lg
  },
  kicker: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2
  },
  subtitle: {
    fontSize: 13,
    color: colors.subtext,
    marginTop: 4
  },
  editButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text
  },
  summaryLabel: {
    marginTop: 2,
    fontSize: 12,
    color: colors.subtext
  },
  board: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: 0
  },
  dayColumn: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 6
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center'
  },
  dayStack: {
    flex: 1,
    gap: 6
  },
  blockCard: {
    flex: 1,
    borderRadius: radius.sm,
    padding: 6,
    justifyContent: 'space-between',
    minHeight: 0
  },
  blockTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text
  },
  blockMeta: {
    fontSize: 10,
    color: colors.text
  },
  blockMemo: {
    fontSize: 10,
    color: colors.subtext
  },
  footer: {
    paddingVertical: spacing.md
  },
  footerText: {
    fontSize: 12,
    color: colors.subtext,
    textAlign: 'center'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 33, 61, 0.25)',
    justifyContent: 'flex-end'
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl
  },
  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md
  },
  menuRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text
  },
  menuHint: {
    fontSize: 12,
    color: colors.subtext,
    marginTop: 2
  }
});

