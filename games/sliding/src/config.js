export default {
  // 网页版使用相对路径：页面位于 /games/sliding/ 时静态资源解析到
  // ./static/...，本地开发、子路径托管和构建产物都能正常工作。
  cdn: '.',
  bkgColor: 0x9ddadb,
  zoom: {
    mix: [],
    get min () { return Math.min(...this.mix) },
    get max () { return Math.max(...this.mix) }
  },
  screen: {
    width: 750,
    height: 1334,
    resolution: 1,
    mode: 'portrait',
    get ratio () { return this.width / this.height }
  },
  design: {
    width: 750,
    height: 1334,
    mode: 'portrait',
    get ratio () { return this.width / this.height }
  },
  scene: null
}
