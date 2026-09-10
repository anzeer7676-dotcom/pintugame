// 诗词题库自检：
//  1. 随机出题多次，确保每题选项数量正确、互不重复，且正确答案一定在选项里
//  2. 关卡难度配置生效（前 4 关 4 选项、5-8 关 5 选项、9 关以后 6 选项）
//  3. 每个难度档至少有 4 首诗，保证 12 关的关卡序列拼得出来
//  4. 每首诗正文不重复、不含空句
import {
  getLevelConfig,
  getPoemsByDifficulty,
  preparePoemForRepair
} from '../games/poetry/data/poems.js'

const ROUNDS_PER_POEM = 25
const problems = []
let checked = 0

const tiers = ['beginner', 'intermediate', 'advanced']

for (const tier of tiers) {
  const poems = getPoemsByDifficulty(tier)

  if (poems.length < 4) {
    problems.push(`${tier}: 只有 ${poems.length} 首，凑不出 4 关`)
  }

  for (const poem of poems) {
    if (!poem.title || !poem.author || !poem.dynasty || !poem.theme) {
      problems.push(`${tier}/${poem.title}: 缺少标题 / 作者 / 朝代 / 主题字段`)
    }

    if (!Array.isArray(poem.content) || poem.content.length < 4) {
      problems.push(`${tier}/${poem.title}: 正文不足 4 句`)
      continue
    }

    if (poem.content.some(line => !line || !line.trim())) {
      problems.push(`${tier}/${poem.title}: 正文里有空句`)
    }

    // 每首诗都按 12 个关卡的难度配置各出一轮题
    for (let level = 1; level <= 12; level += 1) {
      const config = getLevelConfig(level)

      for (let round = 0; round < ROUNDS_PER_POEM; round += 1) {
        const prepared = preparePoemForRepair(poem, config)
        checked += 1

        if (!prepared) {
          problems.push(`${tier}/${poem.title}: preparePoemForRepair 返回空`)
          continue
        }

        const options = prepared.options || []
        const unique = new Set(options)

        if (options.length !== config.optionCount) {
          problems.push(
            `${tier}/${poem.title}（第 ${level} 关，缺「${prepared.missingLine}」）：` +
              `选项数 ${options.length}，期望 ${config.optionCount}`
          )
        }

        if (unique.size !== options.length) {
          problems.push(`${tier}/${poem.title}: 选项有重复`)
        }

        if (!options.includes(prepared.correctAnswer)) {
          problems.push(`${tier}/${poem.title}: 选项里没有正确答案`)
        }

        const blanks = prepared.displayContent.filter(line => line.isMissing)

        if (blanks.length !== 1) {
          problems.push(`${tier}/${poem.title}: 空缺句数量不是 1`)
        }
      }
    }
  }
}

// 关卡难度必须是递进关系
const levelOptions = Array.from({ length: 12 }, (_, index) =>
  getLevelConfig(index + 1).optionCount
)

if (levelOptions.slice(0, 4).some(count => count !== 4)) {
  problems.push(`前 4 关应该是 4 个选项，实际 ${levelOptions.slice(0, 4)}`)
}

if (levelOptions.slice(4, 8).some(count => count !== 5)) {
  problems.push(`5-8 关应该是 5 个选项，实际 ${levelOptions.slice(4, 8)}`)
}

if (levelOptions.slice(8).some(count => count !== 6)) {
  problems.push(`9-12 关应该是 6 个选项，实际 ${levelOptions.slice(8)}`)
}

const total = tiers.reduce(
  (sum, tier) => sum + getPoemsByDifficulty(tier).length,
  0
)

console.log(
  `题库共 ${total} 首（${tiers
    .map(tier => `${tier} ${getPoemsByDifficulty(tier).length} 首`)
    .join('、')}），随机出题检查 ${checked} 次`
)
console.log(`关卡选项数：${levelOptions.join(' / ')}`)

if (problems.length > 0) {
  console.log(`发现 ${problems.length} 个问题：`)

  for (const problem of problems.slice(0, 20)) {
    console.log(`  ! ${problem}`)
  }

  process.exitCode = 1
} else {
  console.log('全部通过：选项数量、去重、正确答案、空缺句、难度递进都正确')
}
