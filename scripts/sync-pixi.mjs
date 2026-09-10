// 把 node_modules 里的 pixi.js UMD 构建复制到 public/games/sliding/vendor/，
// 滑块拼图页面用普通 <script> 引入它来提供全局 PIXI（等价原项目的 webpack ProvidePlugin）。
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

const candidates = [
  'node_modules/pixi.js/dist/pixi.min.js',
  'node_modules/pixi.js/dist/pixi.js'
]

const source = candidates
  .map(item => resolve(root, item))
  .find(item => existsSync(item))

if (!source) {
  console.error(
    '[sync-pixi] 找不到 pixi.js 的 UMD 构建，请先安装依赖：pnpm install'
  )
  process.exit(1)
}

const target = resolve(root, 'public/games/sliding/vendor/pixi.min.js')
mkdirSync(dirname(target), { recursive: true })
copyFileSync(source, target)

console.log(`[sync-pixi] ${source} -> ${target}`)
