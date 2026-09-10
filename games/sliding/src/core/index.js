import config from '../config'

// 全局 PIXI 由 index.html 里的 ./vendor/pixi.min.js 提供（等价原项目的 webpack ProvidePlugin）
const stage = document.getElementById('stage')

const width = Math.max(1, Math.round(stage.clientWidth))
const height = Math.max(1, Math.round(stage.clientHeight))
const resolution = Math.min(window.devicePixelRatio || 1, 3)

const canvas = document.createElement('canvas')
stage.appendChild(canvas)

// 游戏内部布局都按 CSS 像素计算，设备像素比交给 PIXI 的 resolution / autoDensity
config.screen.width = width
config.screen.height = height
config.screen.resolution = resolution

const app = new PIXI.Application({
  view: canvas,
  width,
  height,
  resolution,
  autoDensity: true,
  backgroundColor: config.bkgColor,
  antialias: true,
  sharedLoader: true
})

// 设置节点相对屏幕中心的偏移
app.translate = (node, x = 0, y = 0) => {
  const rect = node.getBounds(false)
  node.position.set(
    (app.screen.width + rect.width) * .5 - rect.right + x,
    (app.screen.height + rect.height) * .5 - rect.bottom + y
  )
}

app.gl = app.renderer.gl

// 明确设置画布的显示尺寸：pixi 4 的 autoDensity 在部分移动端浏览器上不会写
// canvas 的 CSS 尺寸，导致画布按设备像素尺寸撑破竖屏舞台。
canvas.style.width = `${width}px`
canvas.style.height = `${height}px`

// 调试钩子：方便自动化冒烟测试和排查问题
window.__sliding = { app, config }

export default app
export const monitor = new PIXI.utils.EventEmitter()
