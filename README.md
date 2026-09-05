# 蓝溪镇 · 星夜湖

与阿根、小白和小黑一起乘舟，在星空和湖面倒影之间探索蓝溪镇。

这是一个基于《罗小黑战记》动画参考制作的 **非官方同人网页场景原型**，由项目维护者使用 AI 辅助编程与图像生成完成。没有使用官方三维模型，也不是官方产品。

![星夜湖与水上入口](docs/preview.png)

**[观看 / 下载 35 秒展示视频](docs/showcase.mp4)** · [素材与版权说明](ASSET_CREDITS.md) · [许可范围](LICENSE_SCOPE.md)

## 可以体验什么

- 沿湖上路线乘舟前进、暂停、拖动进度或重新出发。
- 拖动画面环顾、滚轮拉近，切换随舟、船上、全景、同舟视角。
- 点击星夜湖、水上入口、借火岩、老君山，阅读地点介绍。
- 星空、水面倒影、借火岩雕刻、山顶住处，以及船上的三位伙伴。
- 行舟最高 30 帧；暂停并且镜头稳定后停止持续渲染，减少不必要的负担。

## 本地运行

需要 Node.js 22.13 或更新版本、npm，以及支持 WebGL 2 的浏览器。

```sh
git clone https://github.com/melody-yu112358/lanxi-boat.git
cd lanxi-boat
npm ci
npm run dev
```

打开终端输出的本地地址，通常为 `http://localhost:3000`。无需 API 密钥、Blender 或付费服务。

```sh
npm run typecheck
npm run build
npm start
```

项目保留 React、Three.js、vinext/Vite 和 Cloudflare 的现有架构。`npm start` 使用本机构建结果；这不是自动部署命令。GitHub 仓库上传也不等于已经发布了在线试玩网站。

`hosting.example.json` 只含空的本地绑定设置，不包含个人托管项目编号或凭据。

## 目前的局限

- 当前模型以程序生成几何和贴图为主，人物侧面、山岩转折仍然简化。
- 借火岩使用 AI 辅助生成的同人图像，并非官方设定集中的原始素材。
- 尚无正式骨骼动画、精细人物三视图建模或完整的蓝溪镇世界。
- 介绍里说明了老君控制昼夜的设定，但当前版本未实现昼夜切换。
- 展示视频增加了拍摄镜头、字幕和背景音；视频里的山顶近景不代表网页已有独立的近景按钮。
- 不保证所有设备上的帧率；低功耗设备可缩小窗口、暂停赏景。

## 文件结构

| 文件 | 用途 |
|---|---|
| `app/page.tsx` | 操作界面与地点介绍弹窗 |
| `app/scene.ts` | 船、镜头、动画和渲染调度 |
| `app/night-world.ts` | 星空、倒影、地形与借火岩 |
| `app/companions.ts` | 程序化人物原型 |
| `app/exploration.ts` | 航线与介绍内容 |
| `public/assets/` | 同人场景贴图 |
| `docs/` | 实际场景截图与展示视频 |

## 许可与原作权利

- 本项目是《罗小黑战记》的非官方同人网页场景，供学习与交流。
- 本项目中有权授权的程序代码采用 [MIT License](LICENSE)，第三方代码遵循各自许可。《罗小黑战记》相关原作权益归各自权利人所有。
- MIT 许可不覆盖本仓库中的同人贴图、截图和视频，也不授予原作角色及美术设计等相关权利。素材来源与说明见 [ASSET_CREDITS.md](ASSET_CREDITS.md)。如需复用这些素材，请另行确认相应授权。

## 参与改进

欢迎通过 Issue 反馈构图、性能和交互问题。提交模型或贴图时，请同时提供作者、来源链接和许可说明；不要提交动画原片、设定集扫描件、来历不明的模型或账号凭据。详细要求见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 参考

- [《罗小黑战记》TV 片段](https://www.bilibili.com/bangumi/play/ep32364)：场景、角色和设定参考。
- [Fantasy Crescendo](https://github.com/HouraiTeahouse/FantasyCrescendo#license)：参考其代码与同人内容分别说明许可的组织方式；没有复制其资产或代码。
- [Khronos glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets)：参考逐项标注模型来源、作者和许可的方式；没有复制其模型。
- [Taisei Project](https://github.com/taisei-project/taisei)：参考其同人项目定位、运行说明和贡献文档。东方项目的同人规则不适用于罗小黑。
