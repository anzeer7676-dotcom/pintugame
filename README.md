# 拾趣小游戏

**线上地址：<https://anzeer7676-dotcom.github.io/pintugame/>** —— 手机、平板、电脑浏览器都能直接打开玩。

推送到 `main` 分支后，GitHub Actions 会自动构建并发布（见 `.github/workflows/deploy-pages.yml`），无需手动部署。

一个纯静态的中文小游戏站：像素复古门户首页 + 三个独立游戏页面。

- **滑块拼图**（pixi.js 4）—— 3×3 / 4×4 / 5×5 三档难度，滑动、鼠标拖动或方向键都能玩
- **推箱子**（three.js + TypeScript）—— 3 个关卡，WASD / 方向键 / 滑动手势 / 屏幕方向键
- **古诗词**（原生 HTML + CSS + JS）—— 诗句修复三档难度：初级 10 关 / 中级 10 关 / 高级 10 关，共 44 首唐诗宋词

零后端：没有排行榜、没有数据上报、不写入 localStorage，成绩只在单局内展示。所有资源本地化，不依赖任何 CDN 或外部字体。

## 快速开始

需要 Node.js 18 以上（推荐 20/22）与 npm / pnpm 任一。

```bash
npm install          # 或 pnpm install
npm run dev          # 开发服务器，默认 http://localhost:5180
npm run build        # 类型检查 + 构建到 dist/
npm run preview      # 预览构建产物
```

构建产物是纯静态文件，可以直接托管到任意静态服务器 / GitHub Pages / Vercel：

```bash
npm run build
python3 -m http.server 5181 --directory dist
# 打开 http://localhost:5181/
```

> 注意：页面使用 ES 模块，必须通过 HTTP 打开（`file://` 直接双击会加载失败）。

## 目录结构

```
index.html                     门户首页（像素复古）
portal/portal.css|portal.js    门户与游戏页共用的外壳样式、首页交互
assets/portal/                 AI 生成的像素素材（hero、3 张卡片图、图标）
games/sliding/                 滑块拼图（移植自微信小游戏，pixi.js 4）
games/sokoban/                 推箱子（Vite + TS + three.js）
games/poetry/                  古诗词（原生 HTML/CSS/JS）
public/games/                  各游戏按运行时 URL 加载的图片 / 音频资源
scripts/sync-pixi.mjs          从 node_modules 复制 pixi UMD 构建到 public/
scripts/smoke-test.mjs         Playwright 冒烟测试
vite.config.ts                 多页构建配置（4 个 HTML 入口）
```

## 三个游戏的改造要点

### 滑块拼图

上游是**微信小游戏**项目（依赖 `wx.*` API 与 webpack 的 `ProvidePlugin`），本次移植到浏览器：

- 用 `public/games/sliding/vendor/pixi.min.js`（由 `scripts/sync-pixi.mjs` 从依赖里复制）以全局 `PIXI` 的方式加载，保持源码风格不变，避开 pixi 4 的 CJS/ESM 互操作问题
- `core/index.js` 去掉 `wx.getSystemInfoSync()`，改为读取 `#stage` 的 CSS 尺寸 + `devicePixelRatio`，用 `resolution` / `autoDensity` 处理高清屏
- `scenes/prepare.js` 重写资源加载：**修复了上游指向不存在的 `static/textures/border.png` 导致加载永久卡住的问题**（改为加载 `static/img/border.png`），失败时会显示可读的错误提示而不是黑屏
- 删除微信分享 / 音频 / 适配层代码；新增方向键操作与 `?level=easy|middle|hard&pic=0..4` 直接开局
- 输入层不再依赖 pixi 的交互系统（pixi 4 在现代移动端收不到点击），滑动与点击统一由 DOM 指针事件处理，鼠标和触屏同一套逻辑
- 布局固定 9:16 竖屏并显式设置画布 CSS 尺寸；窗口太矮时页面可以纵向滚动，窗口尺寸大幅变化会自动重载重排

### 推箱子

保留上游的 three.js 场景、3 个关卡、撒花与音乐开关，改动集中在：

- 资源路径改为相对路径，页面可以从任意子路径托管
- 把键盘里的移动判定抽成 `move(direction)`，键盘、滑动手势、屏幕方向键共用同一套逻辑
- 新增屏幕方向键（窄屏 / 触屏自动显示）与「返回大厅」
- 边界处理：贴着地图边缘推箱子时不再越界报错

### 古诗词

- 转成 ES 模块（`import` / `export`），修复了上游 `index.html` 引用不存在的 `js/config.js` 的问题
- 题库从 14 首扩到 **44 首**：15 首五言短诗、16 首七言绝句、13 首律诗与词
- 三档难度各自独立成局（每档 10 关，每局随机抽题，重玩题目会变）：

  | 难度 | 诗词 | 选项 | 干扰项 |
  | --- | --- | --- | --- |
  | 初级 | 五言短诗，4 句 | 4 个 | 与正确答案字数相同，可以靠字数先排除 |
  | 中级 | 七言绝句，4 句 | 5 个 | 仍然同字数，但句子更长更像 |
  | 高级 | 律诗与词，8 句以上 | 6 个 | 不再限制字数，只能靠内容判断 |

- **修复了上游只出 1 个选项的缺陷**（《咏鹅》「鹅鹅鹅」这类超短句按字数挑不出干扰项），现在任何题目都保证足够选项
- 移除排行榜、Supabase 反馈与 `localStorage` 读写，只保留单局得分、结算与「再玩一次 / 返回大厅」

题库正文属于公有领域，内容取自公开数据集 [chinese-poetry](https://github.com/chinese-poetry/chinese-poetry)（全唐诗 / 唐诗三百首 / 千家诗 / 宋词三百首 / 南唐词），用 OpenCC 转成简体后逐首比对正文；少数宋诗（如《题西林壁》《游山西村》）不在该数据集里，以及「至此回 / 至北回」「候骑 / 候吏」这类教材异体字，采用人教版教材写法。

## 素材说明

`assets/portal/` 下的 hero、三张卡片缩略图和图标，是用 `codex-image2` 技能（模型 `gpt-image-2`）生成的 16-bit 像素风格位图，均不含文字；页面标题与说明全部由 HTML/CSS 渲染。图片只作为本地静态资源加载，不依赖外链。

## 冒烟测试（可选）

`scripts/smoke-test.mjs` 会用 Playwright 打开构建产物，检查四个页面无 404 / 未捕获异常，并真实跑一遍：拼图三档开局 + 菜单按钮 + 完成弹窗、推箱子键盘 + 屏幕方向键 + 通关第 1 关进入第 2 关、古诗词连过 12 关（校验每关选项数 4/5/6）到结算界面。

Playwright 不在 package.json 依赖里（避免给正式依赖增重），本机装了 Playwright 后：

```bash
npm run build
python3 -m http.server 5181 --directory dist &
node scripts/smoke-test.mjs          # 或 npm run test:smoke
```

另外两个检查脚本：

```bash
npm run test:data    # 诗词题库自检：12600 次随机出题，校验选项数量、去重、正确答案、难度递进
npm run test:compat  # 多设备兼容：iPhone SE/13、Pixel 5、iPad、桌面、手机横屏、Mac 矮窗口
```

`test:compat` 用 Playwright 的设备描述符 + 真实触摸事件（CDP `Input.dispatchTouchEvent`）验证：手机上点难度按钮能开局、拼图能滑动、推箱子能滑动 + 屏幕方向键、诗词能点选作答；并检查没有横向溢出，窗口比舞台矮时页面能滚动且能滚到看见拼图底部。

## 发布

构建产物是纯静态文件，`base` 用的是相对路径（`./`），所以托管在域名根目录或子路径（例如 `https://用户名.github.io/仓库名/`）都能正常工作。三种常见方式都已配好：

### 1. GitHub Pages（推荐，仓库里已带工作流）

`.github/workflows/deploy-pages.yml` 会在推送到 `main` 时自动安装依赖、构建并发布。

1. 在 GitHub 上新建一个仓库（例如 `pintugame`），**Public**；
2. 本地推到该仓库的 `main` 分支；
3. 仓库 `Settings → Pages → Build and deployment → Source` 选 **GitHub Actions**；
4. 等 Actions 跑完，访问 `https://<用户名>.github.io/<仓库名>/`。

> 如果改成「Deploy from a branch」的方式发布 `dist/`，记得保留 `public/.nojekyll`（构建产物里已带），否则 Vite 生成的 `assets/_commonjsHelpers-*.js` 会被 Jekyll 忽略导致打不开。

### 2. Vercel

仓库里已有 `vercel.json`。在 Vercel 里 Import 这个仓库即可，构建命令 `npm run build`、输出目录 `dist` 都已配好。

### 3. Netlify

仓库里已有 `netlify.toml`（命令 `npm run build`、发布目录 `dist`）。也可以在 [netlify.com/drop](https://app.netlify.com/drop) 直接把构建好的 `dist` 文件夹拖进去，立刻得到一个临时网址，不用登录也能先试玩。

### 注意

- 必须通过 http/https 访问（ES 模块在 `file://` 下会被浏览器拦截，表现为白屏）；
- 手机上如果看不到最新版本，强制刷新一次（`Cmd+Shift+R` / 清除缓存），避免旧缓存。

## 参考来源与授权

三个游戏改造自下列开源仓库：

- 滑块拼图：[nanwangjkl/sliding_puzzle](https://github.com/nanwangjkl/sliding_puzzle)
- 推箱子：[LiamWu50/three-sokoban-live](https://github.com/LiamWu50/three-sokoban-live)
- 古诗词：[mumunew/ancient-poetry-game](https://github.com/mumunew/ancient-poetry-game)

**需要留意**：这三个上游仓库目前都没有附带 `LICENSE` 文件（`package.json` 里的 `license` 字段不能替代许可证全文）。公开可浏览不等于已授权再分发，本项目按「参考实现、本地演示」使用；如果要商用或公开分发，请先联系原作者确认授权范围。

## 已知限制

- 滑块拼图没有音效：上游仓库缺少它引用的 `static/sounds/bgm.*.mp3` 文件
- 推箱子的「关卡 N」3D 文字使用上游 4.5MB 字体 JSON，首次进入会额外下载一次（已改为运行时加载，不阻塞首屏）
- 生成的像素素材共约 3.5MB，卡片图已缩到 720×720；如需进一步瘦身可再压缩或改 WebP
