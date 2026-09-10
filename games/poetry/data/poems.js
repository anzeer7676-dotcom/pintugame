// 古诗词数据库

import { POEMS_DATABASE } from './poems-data.js'

export { POEMS_DATABASE }

// 三档难度：诗词本身由易到难，机制也逐档加难
//   初级：五言短诗，4 个选项，干扰项与正确答案字数相同（可以靠字数先排除一部分）
//   中级：七言绝句，5 个选项，干扰项仍然同字数
//   高级：律诗与词（8 句以上），6 个选项，干扰项不再限制字数，只能靠内容判断
export const POETRY_DIFFICULTIES = {
    beginner: {
        key: 'beginner',
        name: '初级',
        subtitle: '五言短诗',
        description: '4 个选项，诗句短、上手快',
        tier: 'beginner',
        levels: 10,
        optionCount: 4,
        sameLength: true
    },
    intermediate: {
        key: 'intermediate',
        name: '中级',
        subtitle: '七言绝句',
        description: '5 个选项，七言名句，干扰项更像',
        tier: 'intermediate',
        levels: 10,
        optionCount: 5,
        sameLength: true
    },
    advanced: {
        key: 'advanced',
        name: '高级',
        subtitle: '律诗与词',
        description: '6 个选项，长诗长调，不给字数线索',
        tier: 'advanced',
        levels: 10,
        optionCount: 6,
        sameLength: false
    }
}

// 取某档难度的配置，非法值回落到初级
export function getDifficulty(difficulty) {
    return POETRY_DIFFICULTIES[difficulty] || POETRY_DIFFICULTIES.beginner
}

// 取某档难度的题目配置（选项数量、是否按字数筛干扰项）
export function getLevelConfig(difficulty) {
    const config = getDifficulty(difficulty)

    return {
        optionCount: config.optionCount,
        sameLength: config.sameLength
    }
}

// 取某档难度的关卡诗词：洗完牌取前 N 首，每局顺序不同
export function getLevelPoems(difficulty) {
    const config = getDifficulty(difficulty)
    const pool = [...getPoemsByDifficulty(config.tier)]

    for (let i = pool.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]]
    }

    return pool.slice(0, Math.min(config.levels, pool.length))
}

// 干扰选项数据库 - 用于生成错误选项
export const DISTRACTOR_LINES = {
    // 按主题分类的干扰句子
    思乡: [
        "独在异乡为异客",
        "每逢佳节倍思亲",
        "春风又绿江南岸",
        "明月何时照我还",
        "洛阳亲友如相问",
        "一片冰心在玉壶"
    ],
    春景: [
        "春色满园关不住",
        "一枝红杏出墙来",
        "春江潮水连海平",
        "海上明月共潮生",
        "竹外桃花三两枝",
        "春江水暖鸭先知"
    ],
    励志: [
        "山重水复疑无路",
        "柳暗花明又一村",
        "长风破浪会有时",
        "直挂云帆济沧海",
        "会当凌绝顶",
        "一览众山小"
    ],
    相思: [
        "在天愿作比翼鸟",
        "在地愿为连理枝",
        "身无彩凤双飞翼",
        "心有灵犀一点通",
        "两情若是久长时",
        "又岂在朝朝暮暮"
    ],
    咏物: [
        "墙角数枝梅",
        "凌寒独自开",
        "不要人夸好颜色",
        "只留清气满乾坤",
        "千磨万击还坚劲",
        "任尔东西南北风"
    ],
    农事: [
        "春种一粒粟",
        "秋收万颗子",
        "四海无闲田",
        "农夫犹饿死",
        "足蒸暑土气",
        "背灼炎天光"
    ],
    雪景: [
        "忽如一夜春风来",
        "千树万树梨花开",
        "窗含西岭千秋雪",
        "门泊东吴万里船",
        "雪花飞舞满天飘",
        "银装素裹分外娇"
    ],
    寻访: [
        "不识庐山真面目",
        "只缘身在此山中",
        "山穷水尽疑无路",
        "柳暗花明又一村",
        "踏破铁鞋无觅处",
        "得来全不费工夫"
    ],
    山水: [
        "桂林山水甲天下",
        "阳朔山水甲桂林",
        "山清水秀风光好",
        "鸟语花香春意浓",
        "青山绿水绕人家",
        "白云深处有人家"
    ],
    送别: [
        "劝君更尽一杯酒",
        "西出阳关无故人",
        "桃花潭水深千尺",
        "不及汪伦送我情",
        "莫愁前路无知己",
        "天下谁人不识君"
    ],
    山村: [
        "绿树村边合",
        "青山郭外斜",
        "开轩面场圃",
        "把酒话桑麻",
        "采菊东篱下",
        "悠然见南山"
    ]
};

// 工具函数：根据难度获取诗词
export function getPoemsByDifficulty(difficulty) {
    return POEMS_DATABASE[difficulty] || [];
}

// 工具函数：随机获取一首诗
export function getRandomPoem(difficulty = 'beginner') {
    const poems = getPoemsByDifficulty(difficulty);
    if (poems.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * poems.length);
    return poems[randomIndex];
}

// 工具函数：生成干扰选项
export function generateDistractors(correctLine, theme, count = 3, sameLength = true) {
    const themeDistractors = DISTRACTOR_LINES[theme] || [];
    const allDistractors = Object.values(DISTRACTOR_LINES).flat();

    // 获取正确答案的字数
    const correctLineLength = correctLine.length;

    // 优先从相同主题里挑干扰项
    let distractors = themeDistractors.filter(line => line !== correctLine);

    // 初级/中级：干扰项与正确答案字数相同，靠长度就能排除一部分
    if (sameLength) {
        distractors = distractors.filter(line => line.length === correctLineLength);
    }

    // 如果同主题字数相同的干扰项不够，从其他主题补充字数相同的
    if (sameLength && distractors.length < count) {
        const otherDistractors = allDistractors.filter(line => 
            !themeDistractors.includes(line) && 
            line !== correctLine && 
            line.length === correctLineLength
        );
        distractors = distractors.concat(otherDistractors);
    }

    // 如果字数相同的干扰项还是不够，放宽条件选择字数相近的（±1字）
    if (sameLength && distractors.length < count) {
        const nearLengthDistractors = allDistractors.filter(line => 
            line !== correctLine && 
            !distractors.includes(line) &&
            Math.abs(line.length - correctLineLength) <= 1
        );
        distractors = distractors.concat(nearLengthDistractors);
    }

    // 兜底：像「鹅鹅鹅」这种超短句，按字数根本挑不出干扰项，
    // 这里从整个干扰句库补齐，保证选项数量始终够用。
    if (distractors.length < count) {
        const fallback = allDistractors.filter(line => line !== correctLine);
        distractors = distractors.concat(fallback);
    }

    // 去重后随机选择指定数量的干扰项
    const unique = [...new Set(distractors)];
    const shuffled = unique.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// 工具函数：为诗句修复游戏准备数据
export function preparePoemForRepair(poem, config = {}) {
    if (!poem || !poem.content || poem.content.length === 0) {
        return null;
    }

    const optionCount = config.optionCount || 4;
    const sameLength = config.sameLength !== false;

    // 随机选择一句作为缺失句
    const missingIndex = Math.floor(Math.random() * poem.content.length);
    const missingLine = poem.content[missingIndex];

    // 生成干扰选项
    const distractors = generateDistractors(
        missingLine,
        poem.theme,
        Math.max(1, optionCount - 1),
        sameLength
    );
    
    // 创建选项数组（包含正确答案和干扰项）
    const options = [missingLine, ...distractors].sort(() => Math.random() - 0.5);
    
    // 创建显示用的诗句数组
    const displayContent = poem.content.map((line, index) => ({
        text: index === missingIndex ? '___________' : line,
        isMissing: index === missingIndex,
        originalText: line
    }));
    
    return {
        ...poem,
        displayContent,
        missingIndex,
        missingLine,
        options,
        correctAnswer: missingLine
    };
}
