import core from '../core'
import {
  Puzzle,
  Menu,
  Info,
  Hint,
  Help,
  Timer
} from '../components'

import {
  Constants,
  Functions
} from '../utils'

// 边框宽度为20像素
const BG_BORDER_RATIO = 1.02
const MENU_RATIO = 0.7
const BTN_RATIO = 0.12
const HINT_RATIO = 0.6
const {
  width,
  height
} = core.screen

export default {

  init () {
    this.container = new PIXI.Container()

    // 拼图大小是屏幕宽度的 85%
    this.contentWidth = width * 0.85

    // 画背景图
    this.bg = PIXI.Sprite.from('bg.jpg')
    this.bg.scale.set(width / this.bg.width)
    this.bg.y = height * 0.04
    this.container.addChild(this.bg)

    // 画纸背景
    this.paper = PIXI.Sprite.from('paper.png')
    this.paper.width = this.contentWidth * BG_BORDER_RATIO
    this.paper.height = this.contentWidth * BG_BORDER_RATIO
    this.paper.x = (width - this.paper.width) / 2
    this.paper.y = height - this.paper.width - this.paper.x
    this.container.addChild(this.paper)

    // 画边框
    this.border = PIXI.Sprite.from('border.png')
    this.border.width = this.paper.width
    this.border.height = this.paper.height
    this.border.x = this.paper.x
    this.border.y = this.paper.y
    this.container.addChild(this.border)

    // 重玩按钮
    this.btn_replay = PIXI.Sprite.from('replay.png')
    this.btn_replay.scale.set((width * BTN_RATIO) / this.btn_replay.width)
    this.btn_replay.x = width / 2 + this.contentWidth / 2 - this.btn_replay.width
    this.btn_replay.y = this.border.y - this.btn_replay.height * 1.3
    this.btn_replay.visible = false
    this.container.addChild(this.btn_replay)

    // 提示按钮
    this.btn_hint = PIXI.Sprite.from('hint.png')
    this.btn_hint.scale.set(this.btn_replay.scale.x, this.btn_replay.scale.y)
    this.btn_hint.x = this.btn_replay.x - this.btn_hint.width * 1.3
    this.btn_hint.y = this.btn_replay.y
    this.btn_hint.visible = false
    this.container.addChild(this.btn_hint)

    // 帮助按钮
    this.btn_help = PIXI.Sprite.from('help.png')
    this.btn_help.scale.set(this.btn_hint.scale.x, this.btn_hint.scale.y)
    this.btn_help.x = this.btn_hint.x - this.btn_help.width * 1.3
    this.btn_help.y = this.btn_hint.y
    this.btn_help.visible = false
    this.container.addChild(this.btn_help)

    // 计时器
    this.timer = new Timer()
    this.timer.scale.set(this.btn_hint.scale.x, this.btn_hint.scale.y)
    this.timer.x = width / 2 - this.contentWidth / 2
    this.timer.y = this.btn_hint.y
    this.timer.visible = false
    this.container.addChild(this.timer)

    // 遮罩层
    this.mask = new PIXI.Graphics()
    this.mask.beginFill(0x000000, 0.6)
    this.mask.drawRect(0, 0, width, height)
    this.mask.endFill()
    this.container.addChild(this.mask)

    // 开始菜单
    this.bgMenu = new Menu()
    this.bgMenu.scale.set((width * MENU_RATIO) / this.bgMenu.width)
    this.bgMenu.x = (width - this.bgMenu.width) / 2
    this.bgMenu.y = (height - this.bgMenu.height) / 2
    this.container.addChild(this.bgMenu)

    // 帮助页面
    this.puzzleHelp = new Help()
    this.puzzleHelp.x = 0
    this.puzzleHelp.y = 0
    this.puzzleHelp.visible = false
    this.container.addChild(this.puzzleHelp)

    // 游戏时间戳
    this.timeStamp = 0
  },

  // 网页版从 URL 上读难度，支持门户首页按难度直接开局
  // 例：games/sliding/?level=hard&pic=2
  applyQueryLevel () {
    const params = new URLSearchParams(location.search)
    const levels = {
      easy: { type: Constants.EASY, dir: 'easy' },
      middle: { type: Constants.MIDDLE, dir: 'middle' },
      hard: { type: Constants.HARD, dir: 'hard' }
    }
    const level = levels[(params.get('level') || '').toLowerCase()]

    if (!level) {
      return
    }

    const pic = Number(params.get('pic'))
    const index = Number.isInteger(pic) && pic >= 0 && pic < 5
      ? pic
      : Functions.getRandomInt(5)

    this.newPuzzle(level.type, `${level.dir}/${index}.jpg`)
  },

  newPuzzle (btnType, puzzleUrl) {
    // 画主要的puzzle
    this.gameType = btnType
    let typeUrl
    switch (btnType) {
      case Constants.EASY:
        typeUrl = 'easy'
        break
      case Constants.MIDDLE:
        typeUrl = 'middle'
        break
      case Constants.HARD:
        typeUrl = 'hard'
        break
      default:
        typeUrl = 'easy'
        break
    }

    this.puzzleUrl = puzzleUrl || `${typeUrl}/${Functions.getRandomInt(5)}.jpg`

    this.puzzle = new Puzzle(this.puzzleUrl, btnType)
    this.info = new Info(this.puzzleUrl)
    this.hint = new Hint(this.puzzleUrl)

    this.puzzle.width = this.contentWidth
    this.puzzle.height = this.contentWidth
    this.puzzle.x = (width - this.puzzle.width) / 2
    this.puzzle.y = height - this.puzzle.width - this.puzzle.x
    this.container.addChildAt(this.puzzle, 3)

    this.info.width = this.contentWidth
    this.info.height = this.contentWidth
    this.info.x = this.puzzle.x
    this.info.y = this.puzzle.y
    this.info.visible = false
    this.container.addChild(this.info)

    this.hint.width = this.contentWidth * HINT_RATIO
    this.hint.height = this.contentWidth * HINT_RATIO
    this.hint.x = width / 2 + this.contentWidth / 2 - this.hint.width
    this.hint.y = this.border.y - this.btn_hint.height * 0.3 - this.hint.height
    this.hint.visible = false
    this.container.addChild(this.hint)

    this.timeStamp = 0
    this.bgMenu.visible = false
    this.mask.visible = false

    this.btn_hint.visible = true
    this.btn_help.visible = true
    this.btn_replay.visible = true
    this.timer.visible = true
  },

  destroyPuzzle () {
    this.container.removeChild(this.puzzle)
    this.container.removeChild(this.info)
    this.container.removeChild(this.hint)
    this.puzzle.destroy()
    this.info.destroy()
    this.hint.destroy()
  },

  // 拼图拼好后的结算界面
  checkFinish () {
    if (this.puzzle.gameOn || this.info.visible) {
      return
    }

    this.info.visible = true
    this.info.setText(`恭喜！您用 ${this.timer.getText()} 完成了拼图！`)

    this.btn_hint.visible = false
    this.hint.visible = false
    this.btn_help.visible = false
    this.puzzleHelp.visible = false
    this.timer.visible = false
  },

  // 桌面端用方向键玩，和滑动手势并存
  bindKeyboard () {
    const directions = {
      ArrowUp: Constants.UP,
      ArrowDown: Constants.DOWN,
      ArrowLeft: Constants.LEFT,
      ArrowRight: Constants.RIGHT
    }

    window.addEventListener('keydown', event => {
      const direction = directions[event.key]

      if (!direction || !this.puzzle || !this.puzzle.gameOn || this.puzzleHelp.visible) {
        return
      }

      event.preventDefault()
      this.puzzle.movePieces(direction)
      this.checkFinish()
    })
  },

  // 统一的指针输入层：pixi 4 的交互在移动端不可靠（canvas 收到了触摸事件，
  // 但按钮不响应），这里改成 DOM 事件，桌面鼠标和手机触摸共用一套逻辑。
  bindInput () {
    const stage = document.getElementById('stage')
    const SWIPE_GAP = 30
    const TAP_LIFE = 600

    let startPoint = null
    let startTime = 0

    const toStagePoint = event => {
      const rect = stage.getBoundingClientRect()

      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      }
    }

    stage.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) {
        return
      }

      startPoint = toStagePoint(event)
      startTime = Date.now()
    })

    stage.addEventListener('pointerup', event => {
      if (!startPoint) {
        return
      }

      const point = toStagePoint(event)
      const deltaX = point.x - startPoint.x
      const deltaY = point.y - startPoint.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const elapsed = Date.now() - startTime

      startPoint = null

      if (distance >= SWIPE_GAP) {
        this.swipe(deltaX, deltaY)
        return
      }

      if (elapsed <= TAP_LIFE) {
        this.tap(point)
      }
    })

    // 手势被系统打断（来电、切到后台等）时丢弃这次操作
    stage.addEventListener('pointercancel', () => {
      startPoint = null
    })
  },

  // 命中判断：用节点在世界坐标里的包围盒
  hit (node, point) {
    if (!node || !node.visible) {
      return false
    }

    const bounds = node.getBounds(false)

    return point.x >= bounds.x && point.x <= bounds.x + bounds.width &&
      point.y >= bounds.y && point.y <= bounds.y + bounds.height
  },

  swipe (deltaX, deltaY) {
    if (!this.puzzle || !this.puzzle.gameOn) {
      return
    }

    if (this.puzzleHelp && this.puzzleHelp.visible) {
      return
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      this.puzzle.movePieces(deltaX > 0 ? Constants.RIGHT : Constants.LEFT)
    } else {
      this.puzzle.movePieces(deltaY > 0 ? Constants.DOWN : Constants.UP)
    }

    this.checkFinish()
  },

  tap (point) {
    // 遮罩层优先关闭
    if (this.puzzleHelp && this.puzzleHelp.visible) {
      this.puzzleHelp.visible = false
      return
    }

    if (this.hint && this.hint.visible) {
      this.hint.visible = false
      return
    }

    if (this.hit(this.btn_replay, point)) {
      this.replay()
      return
    }

    if (this.hit(this.btn_hint, point)) {
      this.hint.visible = true
      return
    }

    if (this.hit(this.btn_help, point)) {
      this.puzzleHelp.visible = true
      return
    }

    if (!this.bgMenu.visible) {
      return
    }

    if (this.hit(this.bgMenu.btnEasy, point)) {
      this.newPuzzle(Constants.EASY)
    } else if (this.hit(this.bgMenu.btnMiddle, point)) {
      this.newPuzzle(Constants.MIDDLE)
    } else if (this.hit(this.bgMenu.btnHard, point)) {
      this.newPuzzle(Constants.HARD)
    }
  },

  // 回到难度选择界面
  replay () {
    if (this.puzzle) {
      this.destroyPuzzle()
      this.puzzle = null
    }

    this.bgMenu.visible = true
    this.mask.visible = true
    this.btn_hint.visible = false
    this.hint.visible = false
    this.btn_help.visible = false
    this.puzzleHelp.visible = false
    this.timer.visible = false
    this.btn_replay.visible = false
  },

  // 画布尺寸在启动时按舞台大小算好，窗口尺寸大幅变化后重新加载最稳妥，
  // 避免出现画布比舞台大（或小）导致的错位。
  bindResize () {
    const stage = document.getElementById('stage')
    const initialWidth = stage.clientWidth
    const initialHeight = stage.clientHeight
    let timer = null

    window.addEventListener('resize', () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        const changed = Math.abs(stage.clientWidth - initialWidth) > 40 ||
          Math.abs(stage.clientHeight - initialHeight) > 40

        if (changed) {
          window.location.reload()
        }
      }, 400)
    })
  },

  isTimeGoing () {
    if (this.puzzle.gameOn && !this.puzzleHelp.visible) {
      return true
    }
    return false
  },

  listen () {
    this.container.once('added', () => {
      core.translate(this.bg)
    })
  },

  update (dt) {
    if (this.puzzle && this.puzzle.update) {
      this.puzzle.update()
      if (this.isTimeGoing()) {
        // 在后台的时候 elapsedMS 也在计数，所以不能直接相加
        if (core.ticker.elapsedMS <= 500) {
          this.timeStamp += core.ticker.elapsedMS
          this.timer.setTime(this.timeStamp)
        }
      }
    }
  },

  start () {
    this.init()
    this.bindInput()
    this.bindKeyboard()
    this.bindResize()
    this.applyQueryLevel()
    // this.listen()
    core.stage.addChild(this.container)
    core.ticker.add(this.update.bind(this))
  }
}
