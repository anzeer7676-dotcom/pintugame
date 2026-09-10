// 浏览器冒烟测试：检查门户与三个游戏页面能正常加载、无 404 / 未捕获异常，
// 并验证拼图、推箱子、古诗词三个游戏的核心交互确实生效。
//
// 依赖 playwright（未放进 package.json，避免给正式依赖增重）：
//   PLAYWRIGHT_MODULE=/path/to/playwright/index.js node scripts/smoke-test.mjs
//
// 需要先启动静态服务器，例如：python3 -m http.server 5181 --directory dist
import process from 'node:process'

const playwrightModule = process.env.PLAYWRIGHT_MODULE || 'playwright'
const playwright = await import(playwrightModule)
const chromium = playwright.chromium || playwright.default?.chromium

const baseUrl = process.env.SMOKE_BASE_URL || 'http://localhost:5181'

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const results = []

async function openPage(path, options = {}) {
  const context = await browser.newContext({
    viewport: options.viewport || { width: 1440, height: 900 }
  })
  const page = await context.newPage()
  const problems = []

  page.on('console', message => {
    if (message.type() === 'error') {
      problems.push(`console: ${message.text()}`)
    }
  })
  page.on('pageerror', error => problems.push(`pageerror: ${error.message}`))
  page.on('requestfailed', request =>
    problems.push(`requestfailed: ${request.url()}`)
  )
  page.on('response', response => {
    if (response.status() >= 400) {
      problems.push(`http ${response.status()}: ${response.url()}`)
    }
  })

  await page.goto(`${baseUrl}${path}`, { waitUntil: 'load' })

  return { context, page, problems }
}

function report(name, detail, problems, ok) {
  results.push({ name, ok, detail, problems })
}

// 门户首页
{
  const { context, page, problems } = await openPage('/')
  await page.waitForLoadState('networkidle')

  const images = await page.$$eval('img', nodes =>
    nodes.map(node => ({
      src: node.getAttribute('src'),
      width: node.naturalWidth
    }))
  )
  const brokenImages = images.filter(image => image.width === 0)
  const cards = await page.$$eval('.card', nodes => nodes.length)
  const links = await page.$$eval('.card__actions a', nodes =>
    nodes.map(node => node.getAttribute('href'))
  )

  report(
    'portal',
    { cards, images: images.length, links },
    [...problems, ...brokenImages.map(image => `broken image: ${image.src}`)],
    cards === 3 && brokenImages.length === 0 && links.length === 5
  )
  await context.close()
}

// 滑块拼图：能开局 + 键盘能推动方块
{
  const { context, page, problems } = await openPage('/games/sliding/?level=easy')
  await page.waitForFunction(
    () => window.__slidingGame && window.__slidingGame.puzzle,
    null,
    { timeout: 45000 }
  )
  await page.waitForTimeout(500)

  const before = await page.evaluate(() => ({
    emptyPosition: window.__slidingGame.puzzle.emptyPosition,
    pieces: window.__slidingGame.puzzle.children.length,
    type: window.__slidingGame.puzzle.puzzleType,
    canvas: (() => {
      const canvas = document.querySelector('#stage canvas')
      return canvas ? { width: canvas.width, height: canvas.height } : null
    })(),
    bootHidden: document.getElementById('boot').classList.contains('is-hidden')
  }))

  // 记录每一次按键后的空格位置：只要出现过变化就说明键盘操作生效
  const positions = [before.emptyPosition]
  for (const key of ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft']) {
    await page.keyboard.press(key)
    await page.waitForTimeout(300)
    positions.push(
      await page.evaluate(() => window.__slidingGame.puzzle.emptyPosition)
    )
  }

  report(
    'sliding',
    { ...before, positions, moved: new Set(positions).size > 1 },
    problems,
    Boolean(before.canvas) &&
      before.bootHidden &&
      before.pieces === 8 &&
      before.type === 3 &&
      new Set(positions).size > 1
  )

  // 把拼图摆成「只差一步」的状态，再用方向键走完，验证结算弹窗会被触发
  await page.evaluate(() => {
    const puzzle = window.__slidingGame.puzzle
    const blankIndex = puzzle.puzzleType * puzzle.puzzleType - 1
    const nearBlankIndex = blankIndex - 1

    puzzle.children.forEach(piece => {
      if (piece.pieceIndex === blankIndex) {
        piece.piecePosition = nearBlankIndex
      } else if (piece.pieceIndex === nearBlankIndex) {
        piece.piecePosition = blankIndex
      } else {
        piece.piecePosition = piece.pieceIndex
      }
      piece.ani = 1
    })
    puzzle.emptyPosition = nearBlankIndex
  })

  await page.keyboard.press('ArrowLeft')
  await page.waitForTimeout(400)

  const finish = await page.evaluate(() => ({
    gameOn: window.__slidingGame.puzzle.gameOn,
    infoVisible: window.__slidingGame.info.visible,
    message: window.__slidingGame.info.message.text,
    replayVisible: window.__slidingGame.btn_replay.visible,
    timerVisible: window.__slidingGame.timer.visible
  }))

  report(
    'sliding-finish',
    finish,
    problems,
    finish.gameOn === false &&
      finish.infoVisible === true &&
      finish.message.includes('恭喜') &&
      finish.timerVisible === false
  )

  await context.close()
}

// 滑块拼图：菜单点选难度、提示 / 帮助 / 重玩按钮（走新的 DOM 输入层）
{
  const { context, page, problems } = await openPage('/games/sliding/')
  await page.waitForFunction(() => window.__slidingGame, null, { timeout: 45000 })
  await page.waitForTimeout(500)

  const stageBox = await page.locator('#stage').boundingBox()

  const clickNode = async selector => {
    const point = await page.evaluate(sel => {
      const game = window.__slidingGame
      const node = sel.split('.').reduce((target, key) => target[key], game)
      // 用世界坐标包围盒，菜单做过缩放，不能直接用 width/height
      const bounds = node.getBounds(false)
      return {
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2
      }
    }, selector)

    await page.mouse.click(stageBox.x + point.x, stageBox.y + point.y)
    await page.waitForTimeout(250)
  }

  await clickNode('bgMenu.btnMiddle')
  const started = await page.evaluate(() => ({
    type: window.__slidingGame.puzzle?.puzzleType,
    menuVisible: window.__slidingGame.bgMenu.visible,
    timerVisible: window.__slidingGame.timer.visible
  }))

  await clickNode('btn_hint')
  const hintShown = await page.evaluate(() => window.__slidingGame.hint.visible)
  await clickNode('btn_hint')
  const hintHidden = await page.evaluate(() => !window.__slidingGame.hint.visible)

  await clickNode('btn_help')
  const helpShown = await page.evaluate(
    () => window.__slidingGame.puzzleHelp.visible
  )
  await clickNode('btn_help')
  const helpHidden = await page.evaluate(
    () => !window.__slidingGame.puzzleHelp.visible
  )

  await clickNode('btn_replay')
  const backToMenu = await page.evaluate(() => ({
    menuVisible: window.__slidingGame.bgMenu.visible,
    puzzle: window.__slidingGame.puzzle,
    btnReplayVisible: window.__slidingGame.btn_replay.visible
  }))

  report(
    'sliding-menu',
    { started, hintShown, hintHidden, helpShown, helpHidden, backToMenu },
    problems,
    started.type === 4 &&
      started.menuVisible === false &&
      started.timerVisible === true &&
      hintShown === true &&
      hintHidden === true &&
      helpShown === true &&
      helpHidden === true &&
      backToMenu.menuVisible === true &&
      backToMenu.puzzle === null &&
      backToMenu.btnReplayVisible === false
  )

  await context.close()
}

// 滑块拼图：4x4 与 5x5 也能开局
for (const [level, type, pieces] of [
  ['middle', 4, 15],
  ['hard', 5, 24]
]) {
  const { context, page, problems } = await openPage(
    `/games/sliding/?level=${level}`
  )
  await page.waitForFunction(
    () => window.__slidingGame && window.__slidingGame.puzzle,
    null,
    { timeout: 45000 }
  )

  const state = await page.evaluate(() => ({
    type: window.__slidingGame.puzzle.puzzleType,
    pieces: window.__slidingGame.puzzle.children.length
  }))

  report(
    `sliding-${level}`,
    state,
    problems,
    state.type === type && state.pieces === pieces
  )
  await context.close()
}

// 推箱子：键盘与屏幕方向键都能移动玩家
{
  // 用手机视口跑，顺带验证触屏方向键会显示出来
  const { context, page, problems } = await openPage('/games/sokoban/', {
    viewport: { width: 390, height: 844 }
  })
  await page.waitForFunction(() => window.__sokoban, null, { timeout: 45000 })
  await page.waitForTimeout(1500)

  const readPlayer = () =>
    page.evaluate(() => {
      const scene = window.__sokoban.gameSceneCreator
      return {
        x: scene.elementManager.playerPos.x,
        z: scene.elementManager.playerPos.z
      }
    })

  const before = await readPlayer()

  await page.keyboard.press('ArrowDown')
  await page.waitForTimeout(400)
  const afterKey = await readPlayer()

  const dpadVisible = await page.isVisible('.dpad__btn--right')

  // 往回推一格，验证屏幕方向键也能驱动同一套移动逻辑
  await page.evaluate(() => document.querySelector('.dpad__btn--up').click())
  await page.waitForTimeout(400)
  const afterButton = await readPlayer()

  const canvas = await page.evaluate(() => {
    const node = document.querySelector('#container canvas')
    return node ? { width: node.width, height: node.height } : null
  })

  report(
    'sokoban',
    { before, afterKey, afterButton, canvas, dpadVisible },
    problems,
    Boolean(canvas) &&
      dpadVisible &&
      (before.z !== afterKey.z || before.x !== afterKey.x) &&
      (afterKey.x !== afterButton.x || afterKey.z !== afterButton.z)
  )

  // 按离线求解出来的最短解把第 1 关推完，验证「箱子全部归位 → 撒花 → 进入第 2 关」
  const levelOneSolution = [
    'ArrowRight', 'ArrowRight', 'ArrowDown', 'ArrowDown', 'ArrowDown',
    'ArrowDown', 'ArrowRight', 'ArrowDown', 'ArrowDown', 'ArrowLeft',
    'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowRight',
    'ArrowUp', 'ArrowLeft', 'ArrowUp', 'ArrowUp', 'ArrowUp', 'ArrowUp',
    'ArrowUp', 'ArrowLeft', 'ArrowLeft', 'ArrowDown', 'ArrowRight',
    'ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowDown', 'ArrowDown',
    'ArrowDown', 'ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowDown',
    'ArrowRight', 'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowLeft',
    'ArrowLeft', 'ArrowLeft', 'ArrowDown', 'ArrowDown', 'ArrowLeft',
    'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowRight',
    'ArrowUp', 'ArrowLeft', 'ArrowUp', 'ArrowUp', 'ArrowUp', 'ArrowUp',
    'ArrowLeft', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'ArrowUp',
    'ArrowRight', 'ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowRight',
    'ArrowRight', 'ArrowRight', 'ArrowDown', 'ArrowRight', 'ArrowUp',
    'ArrowLeft', 'ArrowLeft', 'ArrowLeft', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown',
    'ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowUp', 'ArrowRight',
    'ArrowRight', 'ArrowRight'
  ]

  for (const key of levelOneSolution) {
    await page.keyboard.press(key)
    await page.waitForTimeout(90)
  }

  let clearState = null

  try {
    await page.waitForFunction(
      () => window.__sokoban.gameSceneCreator.level === 2,
      null,
      { timeout: 12000 }
    )
    clearState = await page.evaluate(() => ({
      level: window.__sokoban.gameSceneCreator.level,
      isPlaying: window.__sokoban.gameSceneCreator.isPlaying,
      player: {
        x: window.__sokoban.gameSceneCreator.elementManager.playerPos.x,
        z: window.__sokoban.gameSceneCreator.elementManager.playerPos.z
      }
    }))
  } catch (error) {
    clearState = { error: `${error.message}`, level: await page.evaluate(
      () => window.__sokoban.gameSceneCreator.level
    ) }
  }

  report(
    'sokoban-clear',
    { moves: levelOneSolution.length, clearState },
    problems,
    clearState?.level === 2 && clearState?.isPlaying === true
  )

  await context.close()
}

// 古诗词：能答一题、能把五关走完
{
  const { context, page, problems } = await openPage('/games/poetry/')
  await page.waitForFunction(() => window.app, null, { timeout: 45000 })

  await page.click('.difficulty-btn[data-level="beginner"]')
  // 选项是一个个渲染出来的，等四个都在再继续
  await page.waitForFunction(
    () => document.querySelectorAll('.option-btn').length === 4
  )

  const question = await page.evaluate(() => ({
    level: window.app.currentLevel,
    options: document.querySelectorAll('.option-btn').length,
    blanks: document.querySelectorAll('.missing-line, .blank-line').length
  }))

  // 这个游戏点选选项后会自动提交答案；连续答完 12 关看是否进入结算界面
  const levels = []

  for (let round = 1; round <= 12; round += 1) {
    const expectedOptions = round <= 4 ? 4 : round <= 8 ? 5 : 6

    await page.waitForFunction(
      expected =>
        !document.querySelector('.completion-container') &&
        document.querySelectorAll('.option-btn').length === expected.options &&
        window.app.currentLevel === expected.level,
      { level: round, options: expectedOptions }
    )

    await page.evaluate(() => {
      const correct = window.app.currentPoem.correctAnswer
      document.querySelectorAll('.option-btn').forEach(button => {
        if (button.dataset.option === correct && !button.disabled) {
          button.click()
        }
      })
    })
    await page.waitForSelector('#resultFeedback', { state: 'visible' })

    levels.push(
      await page.evaluate(() => ({
        level: window.app.currentLevel,
        score: window.app.score,
        correct: window.app.gameStats.correct,
        options: document.querySelectorAll('.option-btn').length
      }))
    )

    // 点掉反馈进入下一题 / 结算界面
    await page.click('#resultFeedback')
    await page.waitForTimeout(300)
  }

  await page.waitForSelector('.completion-container', { timeout: 5000 })

  const completion = await page.evaluate(() => ({
    score: window.app.score,
    correct: window.app.gameStats.correct,
    hasBackLink: Boolean(
      document.querySelector('.completion-container a[href="../../index.html"]')
    ),
    text: document
      .querySelector('.completion-container')
      .textContent.replace(/\s+/g, ' ')
      .trim()
      .slice(0, 40)
  }))

  report(
    'poetry',
    { question, levels, completion },
    problems,
    question.options === 4 &&
      levels.map(item => item.level).join(',') ===
        '1,2,3,4,5,6,7,8,9,10,11,12' &&
      levels.map(item => item.options).join(',') ===
        '4,4,4,4,5,5,5,5,6,6,6,6' &&
      completion.score === 120 &&
      completion.correct === 12 &&
      completion.hasBackLink
  )
  await context.close()
}

// 布局检查：返回大厅入口可点、竖屏舞台比例正常、页面没有横向溢出
{
  const problems = []
  const pages = [
    { path: '/', check: 'hero' },
    { path: '/games/sliding/', check: 'stage' },
    { path: '/games/sokoban/', check: 'bar' },
    { path: '/games/poetry/', check: 'bar' }
  ]
  const detail = {}

  for (const item of pages) {
    const { context, page, problems: pageProblems } = await openPage(item.path, {
      viewport: { width: 390, height: 844 }
    })
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1200)

    detail[item.path] = await page.evaluate(() => {
      const rect = selector => {
        const node = document.querySelector(selector)
        if (!node) return null
        const box = node.getBoundingClientRect()
        return {
          width: Math.round(box.width),
          height: Math.round(box.height),
          top: Math.round(box.top),
          left: Math.round(box.left),
          center: [
            Math.round(box.left + box.width / 2),
            Math.round(box.top + box.height / 2)
          ]
        }
      }

      const link = document.querySelector(
        '.site-bar a[href*="index.html"], .header a[href*="index.html"]'
      )
      const cta = document.querySelector('.hero__actions a')
      const linkBox = link?.getBoundingClientRect()
      const hit = linkBox
        ? document.elementFromPoint(
            linkBox.left + linkBox.width / 2,
            linkBox.top + linkBox.height / 2
          )
        : null
      const ctaBox = cta?.getBoundingClientRect()
      const ctaHit = ctaBox
        ? document.elementFromPoint(
            ctaBox.left + ctaBox.width / 2,
            ctaBox.top + ctaBox.height / 2
          )
        : null

      return {
        viewport: [window.innerWidth, window.innerHeight],
        hasHorizontalOverflow:
          document.documentElement.scrollWidth > window.innerWidth + 1,
        hero: rect('.hero__content'),
        stage: rect('.stage'),
        siteBar: rect('.site-bar'),
        backLinkClickable: Boolean(link && hit && link.contains(hit)),
        ctaClickable: Boolean(cta && ctaHit && cta.contains(ctaHit)),
        backLinkVisible: Boolean(
          linkBox && linkBox.width > 0 && linkBox.top >= -1
        )
      }
    })

    problems.push(...pageProblems)
    await context.close()
  }

  const stage = detail['/games/sliding/'].stage
  const gamePages = Object.entries(detail).filter(([path]) => path !== '/')
  const ok =
    problems.length === 0 &&
    Object.values(detail).every(entry => !entry.hasHorizontalOverflow) &&
    gamePages.every(([, entry]) => entry.backLinkClickable) &&
    detail['/'].ctaClickable &&
    detail['/'].hero?.width > 0 &&
    Boolean(stage) &&
    stage.height > stage.width &&
    stage.height <= detail['/games/sliding/'].viewport[1]

  report('layout', detail, problems, ok)
}

await browser.close()

const failed = results.filter(result => !result.ok)

console.log(JSON.stringify({ results, failed: failed.length }, null, 2))

if (failed.length > 0) {
  process.exitCode = 1
}
