# 开发备注

## 当前观察

- 本地项目已配置 GitHub 远程仓库，并使用 Gitee 作为国内分发渠道
- 手机端更新地址为 `https://gitee.com/haozixia26/school-timetable/releases`
- Gitee 对本机命令行匿名页面请求返回 403；仓库公开后需要再次验证
- `DEVELOPMENT.md` 是仅供本机使用的开发命令参考，不纳入 Git
- 当前只检测到 Pixel 10 模拟器，没有检测到实体 Android 手机

## 需要注意

- EAS Update 可更新 JavaScript、样式和普通资源；国内网络不可达时，应用会自动退回 Gitee 完整版检查
- 当前 EAS 测试通道为 `preview`，运行时版本为 `1.0.2`
- 发布测试热更新使用独立临时目录：`npx eas-cli update --channel preview --environment preview --input-dir .eas-update --message "更新说明"`
- 旧本地 APK 与 EAS 云端签名不同，首次换用 EAS 基础版需要卸载旧 App；之后 EAS 构建会沿用同一云端签名
- 新增原生依赖、修改权限或升级 Expo SDK 后，必须重新发布并安装 APK
- Android 覆盖更新要求包名和签名保持一致，并提高 `versionCode`
- 从 `1.0.2` 起 release APK 固定使用 `android/riyuebiao-release.jks`；必须同时备份该证书和 `android/keystore.properties`，二者不上传公开仓库
- 后续用于 EAS 热更新的基础 APK 应继续使用 EAS 云端保存的固定签名
- 课程和节次设置已使用 AsyncStorage 保存在本机
