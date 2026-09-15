/// <reference types="node" />

import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'buffer';
import iconv from 'iconv-lite';

import { parseSchoolTimetable } from './schoolTimetableImporter';

test('解析学校导出的 GBK HTML 教学安排表', () => {
  const html = `<!DOCTYPE HTML><html><head><meta http-equiv="Content-Type" content="text/html; charset=GBK"></head><body>
    <table><tr><td>学生信息</td></tr></table>
    <table id="mytable">
      <tr><td colspan="2"></td><td>星期一</td><td>星期二</td><td>星期三</td><td>星期四</td><td>星期五</td><td>星期六</td><td>星期日</td></tr>
      <tr><td rowspan="2">上午</td><td>一</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
      <tr><td>二</td><td></td><td><div>多元统计模型与方法<br>杨老师<br>2-6(双)[3-5]<br>二教2107(麦庐园校区)<br>大学英语<br>李老师<br>1-8周[1-2]<br>英教楼 301 （蛟桥园校区） </div></td><td></td><td></td><td></td><td></td><td></td></tr>
    </table>
    <table><tr><td>上课班级代码</td><td>课程</td><td>任课教师</td><td>上课时间地点</td></tr>
      <tr><td>005123-001</td><td>[1602301561]文化传统与现代文明(尔雅网络课程)</td><td>[023001]网课老师</td><td>2-9周 []</td></tr>
    </table>
  </body></html>`;
  const result = parseSchoolTimetable(new Uint8Array(iconv.encode(html, 'gbk')));

  assert.equal(result.courses.length, 2);
  assert.deepEqual(result.courses[0], {
    title: '多元统计模型与方法',
    teacher: '杨老师',
    weeks: [2, 4, 6],
    day: 'Tue',
    startPeriod: 2,
    duration: 3,
    room: '二教2107'
  });
  assert.equal(result.courses[1].room, '英教楼 301');
  assert.deepEqual(result.generalCourses, [{
    title: '文化传统与现代文明(尔雅网络课程)',
    courseCode: '1602301561',
    section: '001',
    teacher: '网课老师',
    weeks: [2, 3, 4, 5, 6, 7, 8, 9]
  }]);
});

test('拒绝非学校 HTML 导出文件', () => {
  assert.throws(() => parseSchoolTimetable(new Uint8Array(Buffer.from('not a timetable'))), /不是学校导出的教学安排表/);
});
