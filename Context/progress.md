# 项目进度

## 已完成

- 建立 Expo + React Native + TypeScript 项目
- 完成中文课程表主界面
- 实现一周七天网格、周切换和今日高亮
- 实现 12 节课：上午 5 节、下午 4 节、晚上 3 节
- 实现课程详情底部面板
- 实现点击空白格添加课程
- 删除无实际用途的设置图标
- 修复 Android 状态栏遮挡
- 将手机端检查更新入口改为 Gitee 发行版页面
- 修复本机 Android NDK，并成功构建 release APK
- 在 Pixel 10 模拟器安装并验证独立 APK，确认不包含 Expo Go 开发菜单
- 将 `Context` 文件夹内容全部改为中文并更新到当前状态

## 当前产物

- 应用名称：`日月表`
- APK：`dist/日月表-1.0.0.apk`
- Windows 下载目录副本：`C:/Users/34268/Downloads/日月表-1.0.0.apk`
- Android 包名：`com.daydayup.schooltimetable`
- 当前版本：`1.0.0`，`versionCode` 为 `1`

## 下一步

- 将当前代码推送到 Gitee
- 在 Gitee 创建发行版并上传 APK，使 App 内“检查更新”可实际下载
- 增加本地持久化，避免新增课程在重启后丢失
- 完善课程的编辑、删除、颜色、教室、教师和备注功能
- 为后续版本建立版本号与 `versionCode` 同步更新流程
