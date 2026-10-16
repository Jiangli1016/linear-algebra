# 高等代数交互课件

面向应用统计学专业大一的高等代数交互课件，配合谢启鸿、姚慕生、吴泉水《高等代数学（第四版）》。

在线访问：https://jiangli1016.github.io/linear-algebra/

- 讲义模式：手机、平板、电脑均可阅读
- 放映模式：右上角“放映”或按 P，← → 翻页，N 教师备注，Esc 退出
- 打印讲义：设置 → 打印本章讲义 / 另存为 PDF

整个网站就是一个 `index.html`，公式、字体与脚本全部内嵌，不依赖外部资源。

## 如何在 VS Code 中修改课件

### 一次性准备
1. 安装 [Node.js](https://nodejs.org/)（LTS 版）、[Git](https://git-scm.com/) 和 VS Code。
2. 在 VS Code 中按 `Ctrl+Shift+P`（Mac 为 `Cmd+Shift+P`）→ `Git: Clone` → 输入 `https://github.com/Jiangli1016/linear-algebra` → 选一个文件夹 → 打开。
3. 打开终端（菜单 终端 → 新建终端），运行一次 `npm install`。
4. 右下角提示安装推荐扩展 **Live Server** 时点“安装”。

### 日常修改
| 想改什么 | 改哪个文件 |
|---|---|
| 某一节的正文、例题、证明 | `src/pages/s11.html` … `s17.html`（§1.1–§1.7），`ch1.html` 本章导引，`summary.html` 小结，`practice.html` 综合练习，`home.html` 课程主页 |
| 颜色、字号、版式 | `src/style.css`（开头的 `--accent` 等是主题色） |
| 互动实验 | `src/widgets-a.js`（主页、§1.1–§1.4）、`src/widgets-b.js`（§1.5–§1.7） |
| 侧边栏、放映模式、章节列表 | `src/shell.html`、`src/core.js` |

1. **不要直接改根目录的 `index.html`**，它是自动生成的，下次构建会被覆盖。
2. 运行 `npm run watch`（或 `Ctrl+Shift+B` → “自动构建”），之后每次保存 `src/` 里的文件都会自动重新生成 `index.html`。
3. 右键根目录的 `index.html` → **Open with Live Server**，浏览器里实时预览（刷新即可看到修改）。
4. 改好后在终端运行 `npm run deploy`，约 1 分钟后网站 https://jiangli1016.github.io/linear-algebra/ 更新。

### 写法速查
- 公式：行内 `\(a_{ij}\)`，独立成行 `\[ |A|=\sum a_{i1}A_{i1} \]`。公式里的小于号写 `\lt`，不要写 `<`。
- 性质框：`<div class="box prop"><span class="tag">性质 9<em>名称</em></span><p>内容</p></div>`；
  其他框把 `prop` 换成 `def`（定义）、`thm`（定理）、`note`（注）、`warn`（易错）、`idea`（思想）、`stat`（统计视角）。
- 可折叠证明：`<details class="proof"><summary>证明</summary><div class="dbody">……</div></details>`
- 分步解答：`<div class="sol" data-steps><div class="st">第一步</div><div class="st">第二步</div></div>`
- 插入已有互动实验：`<div class="widget" data-widget="vol3" data-t="标题" data-d="说明"></div>`
- 公式写错时 `npm run build` 会在终端报出是哪一页、哪个公式。
