# 开发备注

## 当前观察

- 本地项目已配置 GitHub 远程仓库，并使用 Gitee 作为国内分发渠道
- 手机端更新地址为 `https://gitee.com/haozixia26/school-timetable/releases`
- Gitee 对本机命令行匿名页面请求返回 403；仓库公开后需要再次验证
- `DEVELOPMENT.md` 是仅供本机使用的开发命令参考，不纳入 Git
- 当前只检测到 Pixel 10 模拟器，没有检测到实体 Android 手机

## 需要注意

- EAS Update 可更新 JavaScript、样式和资源，但国内网络可达性不稳定，因此暂不作为主要更新方式
- 新增原生依赖、修改权限或升级 Expo SDK 后，必须重新发布并安装 APK
- Android 覆盖更新要求包名和签名保持一致，并提高 `versionCode`
- 当前个人版 release APK 使用项目现有的固定调试签名；可持续覆盖安装，但正式上架前应迁移为专用发布签名
- 课程表数据目前只保存在内存，关闭应用后新增课程会丢失
