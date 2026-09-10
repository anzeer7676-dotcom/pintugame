import config from '../config'

// 拼图素材：3 个难度 × 5 张图
const PUZZLE_LEVELS = ['easy', 'middle', 'hard']
const PUZZLE_COUNT = 5

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`图片加载失败：${url}`))
    image.src = url
  })
}

async function loadSpriteSheet(name) {
  const baseUrl = `${config.cdn}/static/textures/${name}`
  const [image, frames] = await Promise.all([
    loadImage(`${baseUrl}.png`),
    fetch(`${baseUrl}.json`).then(response => {
      if (!response.ok) {
        throw new Error(`图集数据加载失败：${baseUrl}.json`)
      }
      return response.json()
    })
  ])

  await new Promise(resolve => {
    new PIXI.Spritesheet(new PIXI.BaseTexture(image), frames).parse(resolve)
  })
}

async function loadBaseTexture(url, cacheId) {
  const image = await loadImage(url)
  const baseTexture = new PIXI.BaseTexture(image)
  PIXI.BaseTexture.addToCache(baseTexture, cacheId)
  return baseTexture
}

export default async function () {
  // 主菜单 / 帮助等界面用的图集
  await loadSpriteSheet('misc-0')

  // 拼图外框：上游源码指向的 static/textures/border.png 并不存在，
  // 这里改用仓库里实际存在的 static/img/border.png，否则加载会永远挂住。
  await loadBaseTexture(`${config.cdn}/static/img/border.png`, 'border.png')

  // 计时条 / 提示 / 重玩 / 拼图块边框
  await loadSpriteSheet('misc-2')

  // 15 张拼图并行加载：串行下载在慢网络下会把首屏拖到十几秒
  const jobs = []

  for (let i = 0; i < PUZZLE_COUNT; i++) {
    for (const level of PUZZLE_LEVELS) {
      jobs.push(
        loadBaseTexture(
          `${config.cdn}/static/puzzle/${level}/${i}.jpg`,
          `${level}/${i}.jpg`
        )
      )
    }
  }

  await Promise.all(jobs)
}
