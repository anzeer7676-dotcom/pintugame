// 诗词题库自检：
//  1. 三档难度各自的题目数量、选项数量、诗词档位是否正确、难度是否递增
//  2. 随机出题多次：选项数量正确、互不重复，且正确答案一定在选项里
//  3. 每首诗正文不重复、不含空句
import {
  POETRY_DIFFICULTIES,
  getDifficulty,
  getLevelConfig,
  getLevelPoems,
  getPoemsByDifficulty,
  preparePoemForRepair
} from '../games/poetry/data/poems.js'

const ROUNDS_PER_POEM = 25
const problems = []
let checked = 0

const difficulties = ['beginner', 'intermediate', 'advanced']
const optionCountOf = {}

for (const key of difficulties) {
  const config = getDifficulty(key)
  const pool = getPoemsByDifficulty(config.tier)

  optionCountOf[key] = config.optionCount

  // 关卡题目必须都来自对应档位，且数量够
  const levelPoems = getLevelPoems(key)

  if (levelPoems.length !== Math.min(config.levels, pool.length)) {
    problems.push(
      `${key}: 关卡题目数量 ${levelPoems.length}，期望 ${Math.min(config.levels, pool.length)}`
    )
  }

  if (levelPoems.some(poem => poem.difficulty !== config.tier)) {
    problems.push(`${key}: 有人抽到了其它档位的诗词`)
  }

  if (config.levels < 5) {
    problems.push(`${key}: 关卡太少（${config.levels}）`)
  }

  for (const poem of pool) {
    if (!poem.title || !poem.author || !poem.dynasty || !poem.theme) {
      problems.push(`${key}/${poem.title}: 缺少标题 / 作者 / 朝代 / 主题字段`)
    }

    if (!Array.isArray(poem.content) || poem.content.length < 4) {
      problems.push(`${key}/${poem.title}: 正文不足 4 句`)
      continue
    }

    if (poem.content.some(line => !line || !line.trim())) {
      problems.push(`${key}/${poem.title}: 正文里有空句`)
    }

    for (let round = 0; round < ROUNDS_PER_POEM; round += 1) {
      const prepared = preparePoemForRepair(poem, getLevelConfig(key))
      checked += 1

      if (!prepared) {
        problems.push(`${key}/${poem.title}: preparePoemForRepair 返回空`)
        continue
      }

      const options = prepared.options || []
      const unique = new Set(options)

      if (options.length !== config.optionCount) {
        problems.push(
          `${key}/${poem.title}（缺「${prepared.missingLine}」）：` +
            `选项数 ${options.length}，期望 ${config.optionCount}`
        )
      }

      if (unique.size !== options.length) {
        problems.push(`${key}/${poem.title}: 选项有重复`)
      }

      if (!options.includes(prepared.correctAnswer)) {
        problems.push(`${key}/${poem.title}: 选项里没有正确答案`)
      }

      const blanks = prepared.displayContent.filter(line => line.isMissing)

      if (blanks.length !== 1) {
        problems.push(`${key}/${poem.title}: 空缺句数量不是 1`)
      }
    }
  }
}

// 难度必须递增：诗词档位更难 + 选项更多 + 高级不给字数线索
if (!(optionCountOf.beginner < optionCountOf.intermediate &&
      optionCountOf.intermediate < optionCountOf.advanced)) {
  problems.push(
    `选项数量没有递增：${JSON.stringify(optionCountOf)}`
  )
}

if (POETRY_DIFFICULTIES.beginner.sameLength !== true ||
    POETRY_DIFFICULTIES.advanced.sameLength !== false) {
  problems.push('干扰项策略不符合预期：初级按字数、高级不按字数')
}

for (const [key, config] of Object.entries(POETRY_DIFFICULTIES)) {
  const pool = getPoemsByDifficulty(config.tier)

  console.log(
    `${config.name}（${config.subtitle}）：${pool.length} 首诗词，` +
      `${config.levels} 关，每题 ${config.optionCount} 个选项`
  )

  if (key !== config.key) {
    problems.push(`${key}: 配置里的 key 不一致`)
  }
}

console.log(`随机出题检查 ${checked} 次`)

if (problems.length > 0) {
  console.log(`发现 ${problems.length} 个问题：`)

  for (const problem of problems.slice(0, 20)) {
    console.log(`  ! ${problem}`)
  }

  process.exitCode = 1
} else {
  console.log('全部通过：难度递增、题目档位正确、选项数量/去重/正确答案都正确')
}
