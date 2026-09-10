// 多设备兼容性测试：在手机 / 平板 / 桌面的常见尺寸下打开四个页面，
// 用真实触摸事件（CDP Input.dispatchTouchEvent）验证滑动与点按能玩，
// 并检查没有横向溢出、没有 404 / 未捕获异常。
//
// 用法（先启动静态服务器）：
//   python3 -m http.server 5181 --directory dist
//   PLAYWRIGHT_MODULE=/path/to/playwright/index.js node scripts/compat-test.mjs
import process from 'node:process'

const playwright = await import(
  process.env.PLAYWRIGHT_MODULE || 'playwright'
)
const chromium = playwright.chromium || playwright.default?.chromium
const devices = playwright.devices || playwright.default?.devices

const baseUrl = process.env.SMOKE_BASE_URL || 'http://localhost:5181'

const browser = await chromium.launch({ channel: 'chrome', headless: true })

const targets = [
  { name: 'iPhone SE', device: devices['iPhone SE'] },
  { name: 'iPhone 13', device: devices['iPhone 13'] },
  { name: 'Pixel 5', device: devices['Pixel 5'] },
  { name: 'iPad (gen 7)', device: devices['iPad (gen 7)'] },
  { name: 'Desktop 1280x800', context: { viewport: { width: 1280, height: 800 } } },
  { name: 'Desktop 1440x900', context: { viewport: { width: 1440, height: 900 } } },
  { name: 'Laptop 1024x768', context: { viewport: { width: 1024, height: 768 } } },
  {
    name: 'Phone landscape 844x390',
    context: { viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true }
  },
  {
    name: 'Mac 矮窗口 1440x600',
    context: { viewport: { width: 1440, height: 600 } }
  },
  {
    name: 'Mac 更矮 1180x460',
    context: { viewport: { width: 1180, height: 460 } }
  },
  {
    name: '极矮窗口 1024x380',
    context: { viewport: { width: 1024, height: 380 } }
  }
]

// 拼图直接用 ?level=easy 进游戏，方便测滑动
const pages = [
  '/',
  '/games/sliding/',
  '/games/sliding/?level=easy',
  '/games/sokoban/',
  '/games/poetry/'
]
const results = []

async function makeContext(target) {
  if (target.device) {
    return browser.newContext({ ...target.device })
  }

  return browser.newContext(target.context)
}

async function touchSwipe(cdp, from, to, steps = 8) {
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: from.x, y: from.y }]
  })

  for (let step = 1; step <= steps; step += 1) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        {
          x: from.x + ((to.x - from.x) * step) / steps,
          y: from.y + ((to.y - from.y) * step) / steps
        }
      ]
    })
    await new Promise(resolve => setTimeout(resolve, 16))
  }

  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: []
  })
}

for (const target of targets) {
  const context = await makeContext(target)
  const problems = []
  const detail = {}

  console.log(`--- ${target.name} ---`)

  for (const path of pages) {
    const page = await context.newPage()

    page.on('console', message => {
      if (message.type() === 'error') {
        problems.push(`${target.name} ${path} console: ${message.text()}`)
      }
    })
    page.on('pageerror', error =>
      problems.push(`${target.name} ${path} pageerror: ${error.message}`)
    )
    page.on('response', response => {
      if (response.status() >= 400) {
        problems.push(
          `${target.name} ${path} http ${response.status()}: ${response.url()}`
        )
      }
    })

    try {
      await page.goto(`${baseUrl}${path}`, { waitUntil: 'load' })
      await page.waitForTimeout(path.includes('sliding') ? 3000 : 1800)

      detail[path] = await page.evaluate(() => {
      const link = document.querySelector(
        '.site-bar a[href*="index.html"], .header a[href*="index.html"]'
      )
      const box = link?.getBoundingClientRect()
      const hit = box
        ? document.elementFromPoint(
            box.left + box.width / 2,
            box.top + box.height / 2
          )
        : null

      return {
        overflowX: document.documentElement.scrollWidth - window.innerWidth,
        backLinkClickable: Boolean(link && hit && link.contains(hit)),
        canvas: Boolean(document.querySelector('canvas')),
        stage: (() => {
          const stage = document.getElementById('stage')
          return stage
            ? [stage.clientWidth, stage.clientHeight]
            : null
        })()
      }
      })

      // 真触屏交互
      if (path.includes('sliding')) {
      const cdp = await context.newCDPSession(page)

      await page.waitForFunction(() => window.__slidingGame, null, {
        timeout: 20000
      })

      // 窗口太矮时：页面要能滚动，并且必须能滚到看见舞台底部
      detail[path].stageBottomReachable = await page.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight)
        const stage = document.getElementById('stage')
        const reachable =
          stage.getBoundingClientRect().bottom <= window.innerHeight + 2
        window.scrollTo(0, 0)
        return reachable
      })

      // 舞台比视口高时，先把拼图区域滚到视口中间，触摸坐标才落在可视区域内
      await page.evaluate(() => {
        const puzzle = window.__slidingGame.puzzle

        if (!puzzle) {
          return
        }

        const stage = document.getElementById('stage')
        const boardCenter =
          stage.getBoundingClientRect().top +
          window.scrollY +
          puzzle.y +
          puzzle.height / 2
        const offset = boardCenter - window.innerHeight / 2

        if (Math.abs(offset) > 4) {
          window.scrollTo(0, Math.max(0, window.scrollY + offset))
        }
      })
      await page.waitForTimeout(200)

      const box = await page.locator('#stage').boundingBox()

      if (!path.includes('level=')) {
        // 手机上的入口：触摸难度按钮要能开局
        const middle = await page.evaluate(() => {
          const button = window.__slidingGame.bgMenu.btnMiddle
          const bounds = button.getBounds(false)
          return {
            x: bounds.x + bounds.width / 2,
            y: bounds.y + bounds.height / 2
          }
        })

        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchStart',
          touchPoints: [{ x: box.x + middle.x, y: box.y + middle.y }]
        })
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchEnd',
          touchPoints: []
        })
        await page.waitForTimeout(900)

        detail[path].menuTapStarted = await page.evaluate(
          () => window.__slidingGame.puzzle?.puzzleType === 4
        )
      } else {
        await page.waitForFunction(() => window.__slidingGame?.puzzle, null, {
          timeout: 20000
        })

        const start = await page.evaluate(
          () => window.__slidingGame.puzzle.emptyPosition
        )
        // 拼图块区域在舞台下半部分，滑动要落在拼图容器上才会被识别
        const boardCenter = await page.evaluate(() => {
          const puzzle = window.__slidingGame.puzzle
          return {
            x: puzzle.x + puzzle.width / 2,
            y: puzzle.y + puzzle.height / 2
          }
        })
        const center = {
          x: box.x + boardCenter.x,
          y: box.y + boardCenter.y
        }
        const offset = Math.min(70, boardCenter.x / 2)
        const positions = [start]

        for (const [dx, dy] of [
          [0, offset],
          [0, -offset],
          [offset, 0],
          [-offset, 0]
        ]) {
          await touchSwipe(cdp, center, { x: center.x + dx, y: center.y + dy })
          await page.waitForTimeout(320)
          positions.push(
            await page.evaluate(() => window.__slidingGame.puzzle.emptyPosition)
          )
        }

        detail[path].swipeMoved = new Set(positions).size > 1
      }
      }

      if (path.includes('sokoban')) {
      const cdp = await context.newCDPSession(page)
      await page.waitForFunction(() => window.__sokoban, null, { timeout: 20000 })
      await page.waitForTimeout(600)

      const readPlayer = () =>
        page.evaluate(() => {
          const scene = window.__sokoban.gameSceneCreator
          return [scene.elementManager.playerPos.x, scene.elementManager.playerPos.z]
        })

      const before = await readPlayer()
      const size = page.viewportSize()

      await touchSwipe(
        cdp,
        { x: size.width * 0.5, y: size.height * 0.45 },
        { x: size.width * 0.5, y: size.height * 0.45 + 90 }
      )
      await page.waitForTimeout(400)
      const afterSwipe = await readPlayer()

      // 触屏设备上还应该有屏幕方向键可点
      const dpadVisible = await page.isVisible('.dpad__btn--down').catch(() => false)
      let afterButton = afterSwipe

      if (dpadVisible) {
        await page.locator('.dpad__btn--up').tap().catch(async () => {
          await page.evaluate(() =>
            document.querySelector('.dpad__btn--up')?.click()
          )
        })
        await page.waitForTimeout(400)
        afterButton = await readPlayer()
      }

      detail[path].dpadVisible = dpadVisible
      detail[path].swipeMoved = before.join() !== afterSwipe.join()
      detail[path].dpadMoved = afterSwipe.join() !== afterButton.join()
      }

      if (path.includes('poetry')) {
      await page.waitForFunction(() => window.app, null, { timeout: 15000 })
      const difficulty = page.locator('.difficulty-btn[data-level="beginner"]')

      await difficulty.scrollIntoViewIfNeeded()
      await difficulty
        .tap({ timeout: 5000 })
        .catch(() => difficulty.click({ timeout: 5000 }))

      await page.waitForFunction(
        () => document.querySelectorAll('.option-btn').length >= 4,
        null,
        { timeout: 8000 }
      )

      const correct = await page.evaluate(
        () => window.app.currentPoem.correctAnswer
      )
      const correctOption = page
        .locator('.option-btn', { hasText: correct })
        .first()

      await correctOption
        .tap({ timeout: 5000 })
        .catch(() => correctOption.click({ timeout: 5000 }))

      const feedbackVisible = await page
        .waitForSelector('#resultFeedback', { state: 'visible', timeout: 5000 })
        .then(() => true)
        .catch(() => false)

      detail[path].answered = feedbackVisible &&
        (await page.evaluate(() => window.app.score)) > 0
      }

      const entry = detail[path]
      const problemsBefore = problems.length
      const expectsSwipe = path.includes('sliding') && path.includes('level=')
      const expectsMenuTap = path.includes('sliding') && !path.includes('level=')
      const pageOk =
        problems.length === problemsBefore &&
        entry.overflowX <= 1 &&
        (path.includes('sliding') ? entry.stageBottomReachable === true : true) &&
        (expectsSwipe ? entry.swipeMoved === true : true) &&
        (expectsMenuTap ? entry.menuTapStarted === true : true) &&
        (path.includes('sokoban') ? entry.swipeMoved === true : true) &&
        (path.includes('poetry') ? entry.answered === true : true)

      console.log(
        `    ${pageOk ? 'ok  ' : 'FAIL'} ${path} ` +
          `overflow=${entry.overflowX} ` +
          `${entry.swipeMoved !== undefined ? `swipe=${entry.swipeMoved} ` : ''}` +
          `${entry.menuTapStarted !== undefined ? `menuTap=${entry.menuTapStarted} ` : ''}` +
          `${entry.answered !== undefined ? `answered=${entry.answered}` : ''}`
      )
    } catch (error) {
      detail[path] = { ...(detail[path] || {}), error: error.message }
      problems.push(`${target.name} ${path} error: ${error.message}`)
      console.log(`    FAIL ${path} -> ${error.message}`)
    }

    await page.close()
  }

  const failedPages = Object.entries(detail).filter(([, entry]) => {
    if (entry.overflowX > 1) return true
    if (problems.length > 0) return true
    return false
  })

  const ok =
    problems.length === 0 &&
    failedPages.length === 0 &&
    detail['/games/sliding/'].menuTapStarted === true &&
    detail['/games/sliding/?level=easy'].swipeMoved === true &&
    detail['/games/sokoban/'].swipeMoved === true &&
    detail['/games/poetry/'].answered === true &&
    detail['/games/sliding/?level=easy'].backLinkClickable === true

  results.push({
    device: target.name,
    viewport: await (async () => {
      const page = await context.newPage()
      const size = page.viewportSize()
      await page.close()
      return size
    })(),
    ok,
    problems,
    detail
  })

  await context.close()
}

await browser.close()

const failed = results.filter(result => !result.ok)

for (const result of results) {
  const detail = result.detail
  console.log(
    `${result.ok ? 'PASS' : 'FAIL'}  ${result.device.padEnd(22)} ` +
      `viewport=${result.viewport.width}x${result.viewport.height} ` +
      `slide-swipe=${detail['/games/sliding/?level=easy'].swipeMoved} ` +
      `menu-tap=${detail['/games/sliding/'].menuTapStarted} ` +
      `soko-swipe=${detail['/games/sokoban/'].swipeMoved} ` +
      `dpad=${detail['/games/sokoban/'].dpadVisible} ` +
      `poetry=${detail['/games/poetry/'].answered}`
  )

  for (const problem of result.problems) {
    console.log(`      ! ${problem}`)
  }
}

console.log(`\n${results.length - failed.length}/${results.length} devices passed`)

if (failed.length > 0) {
  process.exitCode = 1
}
