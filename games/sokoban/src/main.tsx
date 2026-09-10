import './styles/index.css'

import gsap from 'gsap'

import arrowCounterIcon from '@/assets/images/arrow-counter.svg'
import musicOffIcon from '@/assets/images/music-off.svg'
import musicNoteIcon from '@/assets/images/music-note.svg'
import GameSceneCreator, {
  MoveDirection
} from '@/helpers/game-scene-creator'
import ThreeSceneCreator from '@/helpers/three-scene-creator'

const container = document.getElementById('container') as HTMLDivElement

ThreeSceneCreator.init(container)

const { scene, gridSize } = ThreeSceneCreator
const gameSceneCreator = new GameSceneCreator(scene, gridSize)
gameSceneCreator.render()

// 调试钩子：方便自动化冒烟测试和排查问题
;(window as unknown as Record<string, unknown>).__sokoban = { gameSceneCreator }

// 顶栏图标：静态资源交给打包器处理，避免依赖构建后的目录结构
const refreshImg = document.getElementById('refreshImg') as HTMLImageElement
const soundCtrlImg = document.getElementById('soundCtrlImg') as HTMLImageElement
refreshImg.src = arrowCounterIcon
soundCtrlImg.src = musicOffIcon

// 顶栏按钮入场动画
const topBar = document.querySelector('.top-bar')
const topBarItems = document.querySelectorAll('.top-bar__item')

gsap.set(topBarItems, { y: 120, autoAlpha: 0 })

gsap.to(topBar, {
  opacity: 1,
  delay: 0.3,
  onComplete: () => {
    gsap.to(topBarItems, {
      duration: 1,
      y: 0,
      autoAlpha: 1,
      ease: 'elastic.out(1.2, 0.9)',
      stagger: {
        amount: 0.3
      }
    })
  }
})

// 音乐开关（默认关闭，浏览器也不允许自动播放）
const audio = document.getElementById('audio') as HTMLAudioElement
const soundCtrlBtn = document.getElementById('soundCtrl')

audio.src = './music.mp3'

let isSoundOn = false

soundCtrlBtn?.addEventListener('click', () => {
  isSoundOn = !isSoundOn

  if (isSoundOn) {
    void audio.play()
  } else {
    audio.pause()
  }

  soundCtrlImg.src = isSoundOn ? musicNoteIcon : musicOffIcon
})

// 触屏 / 鼠标滑动操作
const SWIPE_THRESHOLD = 24
let swipeStartX = 0
let swipeStartY = 0
let isTracking = false

container.addEventListener('pointerdown', event => {
  isTracking = true
  swipeStartX = event.clientX
  swipeStartY = event.clientY
})

container.addEventListener('pointerup', event => {
  if (!isTracking) return

  isTracking = false

  const deltaX = event.clientX - swipeStartX
  const deltaY = event.clientY - swipeStartY

  if (deltaX * deltaX + deltaY * deltaY < SWIPE_THRESHOLD * SWIPE_THRESHOLD) {
    return
  }

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    gameSceneCreator.move(deltaX > 0 ? 'right' : 'left')
  } else {
    gameSceneCreator.move(deltaY > 0 ? 'down' : 'up')
  }
})

// 屏幕方向键
document
  .querySelectorAll<HTMLButtonElement>('[data-direction]')
  .forEach(button => {
    button.addEventListener('click', () => {
      gameSceneCreator.move(button.dataset.direction as MoveDirection)
    })
  })
