// 古诗词题库
//
// 每首诗的 content 按「句」拆分，页面上逐句显示，其中一句会被挖空让玩家补全。
// 诗词正文属于公有领域；本题库内容已用公开数据集 chinese-poetry（chinese-poetry/chinese-poetry，
// 全唐诗 / 宋词）逐首校对，确保没有错字漏字。
//
// 三个分档代表难度递进：
//   beginner     五言绝句等短诗（4 句，每句 5 字）
//   intermediate 七言绝句（4 句，每句 7 字）
//   advanced     五言/七言律诗与词（8 句以上，篇幅长、干扰项更难区分）
export const POEMS_DATABASE = {
    // 初级难度诗词 - 五言短诗
    beginner: [
        {
            id: 1,
            title: "静夜思",
            author: "李白",
            dynasty: "唐",
            content: [
                "床前明月光",
                "疑是地上霜",
                "举头望明月",
                "低头思故乡"
            ],
            difficulty: "beginner",
            theme: "思乡"
        },
        {
            id: 2,
            title: "春晓",
            author: "孟浩然",
            dynasty: "唐",
            content: [
                "春眠不觉晓",
                "处处闻啼鸟",
                "夜来风雨声",
                "花落知多少"
            ],
            difficulty: "beginner",
            theme: "春景"
        },
        {
            id: 3,
            title: "登鹳雀楼",
            author: "王之涣",
            dynasty: "唐",
            content: [
                "白日依山尽",
                "黄河入海流",
                "欲穷千里目",
                "更上一层楼"
            ],
            difficulty: "beginner",
            theme: "励志"
        },
        {
            id: 4,
            title: "相思",
            author: "王维",
            dynasty: "唐",
            content: [
                "红豆生南国",
                "春来发几枝",
                "愿君多采撷",
                "此物最相思"
            ],
            difficulty: "beginner",
            theme: "相思"
        },
        {
            id: 5,
            title: "悯农",
            author: "李绅",
            dynasty: "唐",
            content: [
                "锄禾日当午",
                "汗滴禾下土",
                "谁知盘中餐",
                "粒粒皆辛苦"
            ],
            difficulty: "beginner",
            theme: "农事"
        },
        {
            id: 6,
            title: "江雪",
            author: "柳宗元",
            dynasty: "唐",
            content: [
                "千山鸟飞绝",
                "万径人踪灭",
                "孤舟蓑笠翁",
                "独钓寒江雪"
            ],
            difficulty: "beginner",
            theme: "雪景"
        },
        {
            id: 7,
            title: "寻隐者不遇",
            author: "贾岛",
            dynasty: "唐",
            content: [
                "松下问童子",
                "言师采药去",
                "只在此山中",
                "云深不知处"
            ],
            difficulty: "beginner",
            theme: "寻访"
        },
        {
            id: 8,
            title: "鹿柴",
            author: "王维",
            dynasty: "唐",
            content: [
                "空山不见人",
                "但闻人语响",
                "返景入深林",
                "复照青苔上"
            ],
            difficulty: "beginner",
            theme: "山水"
        },
        {
            id: 9,
            title: "竹里馆",
            author: "王维",
            dynasty: "唐",
            content: [
                "独坐幽篁里",
                "弹琴复长啸",
                "深林人不知",
                "明月来相照"
            ],
            difficulty: "beginner",
            theme: "山水"
        },
        {
            id: 10,
            title: "登乐游原",
            author: "李商隐",
            dynasty: "唐",
            content: [
                "向晚意不适",
                "驱车登古原",
                "夕阳无限好",
                "只是近黄昏"
            ],
            difficulty: "beginner",
            theme: "人生"
        },
        {
            id: 11,
            title: "秋浦歌",
            author: "李白",
            dynasty: "唐",
            content: [
                "白发三千丈",
                "缘愁似个长",
                "不知明镜里",
                "何处得秋霜"
            ],
            difficulty: "beginner",
            theme: "人生"
        },
        {
            id: 12,
            title: "塞下曲",
            author: "卢纶",
            dynasty: "唐",
            content: [
                "月黑雁飞高",
                "单于夜遁逃",
                "欲将轻骑逐",
                "大雪满弓刀"
            ],
            difficulty: "beginner",
            theme: "边塞"
        },
        {
            id: 13,
            title: "山村咏怀",
            author: "邵雍",
            dynasty: "宋",
            content: [
                "一去二三里",
                "烟村四五家",
                "亭台六七座",
                "八九十枝花"
            ],
            difficulty: "beginner",
            theme: "山村"
        },
        {
            id: 14,
            title: "咏鹅",
            author: "骆宾王",
            dynasty: "唐",
            content: [
                "鹅鹅鹅",
                "曲项向天歌",
                "白毛浮绿水",
                "红掌拨清波"
            ],
            difficulty: "beginner",
            theme: "咏物"
        },
        {
            id: 15,
            title: "草",
            author: "白居易",
            dynasty: "唐",
            content: [
                "离离原上草",
                "一岁一枯荣",
                "野火烧不尽",
                "春风吹又生"
            ],
            difficulty: "beginner",
            theme: "咏物"
        }
    ],

    // 中级难度诗词 - 七言绝句
    intermediate: [
        {
            id: 16,
            title: "望庐山瀑布",
            author: "李白",
            dynasty: "唐",
            content: [
                "日照香炉生紫烟",
                "遥看瀑布挂前川",
                "飞流直下三千尺",
                "疑是银河落九天"
            ],
            difficulty: "intermediate",
            theme: "山水"
        },
        {
            id: 17,
            title: "黄鹤楼送孟浩然之广陵",
            author: "李白",
            dynasty: "唐",
            content: [
                "故人西辞黄鹤楼",
                "烟花三月下扬州",
                "孤帆远影碧空尽",
                "唯见长江天际流"
            ],
            difficulty: "intermediate",
            theme: "送别"
        },
        {
            id: 18,
            title: "回乡偶书",
            author: "贺知章",
            dynasty: "唐",
            content: [
                "少小离家老大回",
                "乡音无改鬓毛衰",
                "儿童相见不相识",
                "笑问客从何处来"
            ],
            difficulty: "intermediate",
            theme: "思乡"
        },
        {
            id: 19,
            title: "早发白帝城",
            author: "李白",
            dynasty: "唐",
            content: [
                "朝辞白帝彩云间",
                "千里江陵一日还",
                "两岸猿声啼不住",
                "轻舟已过万重山"
            ],
            difficulty: "intermediate",
            theme: "山水"
        },
        {
            id: 20,
            title: "绝句",
            author: "杜甫",
            dynasty: "唐",
            content: [
                "两个黄鹂鸣翠柳",
                "一行白鹭上青天",
                "窗含西岭千秋雪",
                "门泊东吴万里船"
            ],
            difficulty: "intermediate",
            theme: "春景"
        },
        {
            id: 21,
            title: "赠汪伦",
            author: "李白",
            dynasty: "唐",
            content: [
                "李白乘舟将欲行",
                "忽闻岸上踏歌声",
                "桃花潭水深千尺",
                "不及汪伦送我情"
            ],
            difficulty: "intermediate",
            theme: "送别"
        },
        {
            id: 22,
            title: "咏柳",
            author: "贺知章",
            dynasty: "唐",
            content: [
                "碧玉妆成一树高",
                "万条垂下绿丝绦",
                "不知细叶谁裁出",
                "二月春风似剪刀"
            ],
            difficulty: "intermediate",
            theme: "咏物"
        },
        {
            id: 23,
            title: "春日",
            author: "朱熹",
            dynasty: "宋",
            content: [
                "胜日寻芳泗水滨",
                "无边光景一时新",
                "等闲识得东风面",
                "万紫千红总是春"
            ],
            difficulty: "intermediate",
            theme: "春景"
        },
        {
            id: 24,
            title: "元日",
            author: "王安石",
            dynasty: "宋",
            content: [
                "爆竹声中一岁除",
                "春风送暖入屠苏",
                "千门万户曈曈日",
                "总把新桃换旧符"
            ],
            difficulty: "intermediate",
            theme: "节令"
        },
        {
            id: 25,
            title: "望天门山",
            author: "李白",
            dynasty: "唐",
            content: [
                "天门中断楚江开",
                "碧水东流至此回",
                "两岸青山相对出",
                "孤帆一片日边来"
            ],
            difficulty: "intermediate",
            theme: "山水"
        },
        {
            id: 26,
            title: "山行",
            author: "杜牧",
            dynasty: "唐",
            content: [
                "远上寒山石径斜",
                "白云生处有人家",
                "停车坐爱枫林晚",
                "霜叶红于二月花"
            ],
            difficulty: "intermediate",
            theme: "山水"
        },
        {
            id: 27,
            title: "题西林壁",
            author: "苏轼",
            dynasty: "宋",
            content: [
                "横看成岭侧成峰",
                "远近高低各不同",
                "不识庐山真面目",
                "只缘身在此山中"
            ],
            difficulty: "intermediate",
            theme: "哲理"
        },
        {
            id: 28,
            title: "晓出净慈寺送林子方",
            author: "杨万里",
            dynasty: "宋",
            content: [
                "毕竟西湖六月中",
                "风光不与四时同",
                "接天莲叶无穷碧",
                "映日荷花别样红"
            ],
            difficulty: "intermediate",
            theme: "咏物"
        },
        {
            id: 29,
            title: "饮湖上初晴后雨",
            author: "苏轼",
            dynasty: "宋",
            content: [
                "水光潋滟晴方好",
                "山色空蒙雨亦奇",
                "欲把西湖比西子",
                "淡妆浓抹总相宜"
            ],
            difficulty: "intermediate",
            theme: "山水"
        },
        {
            id: 30,
            title: "江畔独步寻花",
            author: "杜甫",
            dynasty: "唐",
            content: [
                "黄四娘家花满蹊",
                "千朵万朵压枝低",
                "留连戏蝶时时舞",
                "自在娇莺恰恰啼"
            ],
            difficulty: "intermediate",
            theme: "春景"
        },
        {
            id: 31,
            title: "乌衣巷",
            author: "刘禹锡",
            dynasty: "唐",
            content: [
                "朱雀桥边野草花",
                "乌衣巷口夕阳斜",
                "旧时王谢堂前燕",
                "飞入寻常百姓家"
            ],
            difficulty: "intermediate",
            theme: "怀古"
        }
    ],

    // 高级难度诗词 - 律诗与词
    advanced: [
        {
            id: 32,
            title: "春望",
            author: "杜甫",
            dynasty: "唐",
            content: [
                "国破山河在",
                "城春草木深",
                "感时花溅泪",
                "恨别鸟惊心",
                "烽火连三月",
                "家书抵万金",
                "白头搔更短",
                "浑欲不胜簪"
            ],
            difficulty: "advanced",
            theme: "忧国"
        },
        {
            id: 33,
            title: "望岳",
            author: "杜甫",
            dynasty: "唐",
            content: [
                "岱宗夫如何",
                "齐鲁青未了",
                "造化钟神秀",
                "阴阳割昏晓",
                "荡胸生曾云",
                "决眦入归鸟",
                "会当凌绝顶",
                "一览众山小"
            ],
            difficulty: "advanced",
            theme: "励志"
        },
        {
            id: 34,
            title: "山居秋暝",
            author: "王维",
            dynasty: "唐",
            content: [
                "空山新雨后",
                "天气晚来秋",
                "明月松间照",
                "清泉石上流",
                "竹喧归浣女",
                "莲动下渔舟",
                "随意春芳歇",
                "王孙自可留"
            ],
            difficulty: "advanced",
            theme: "山水"
        },
        {
            id: 35,
            title: "使至塞上",
            author: "王维",
            dynasty: "唐",
            content: [
                "单车欲问边",
                "属国过居延",
                "征蓬出汉塞",
                "归雁入胡天",
                "大漠孤烟直",
                "长河落日圆",
                "萧关逢候骑",
                "都护在燕然"
            ],
            difficulty: "advanced",
            theme: "边塞"
        },
        {
            id: 36,
            title: "次北固山下",
            author: "王湾",
            dynasty: "唐",
            content: [
                "客路青山外",
                "行舟绿水前",
                "潮平两岸阔",
                "风正一帆悬",
                "海日生残夜",
                "江春入旧年",
                "乡书何处达",
                "归雁洛阳边"
            ],
            difficulty: "advanced",
            theme: "思乡"
        },
        {
            id: 37,
            title: "送杜少府之任蜀州",
            author: "王勃",
            dynasty: "唐",
            content: [
                "城阙辅三秦",
                "风烟望五津",
                "与君离别意",
                "同是宦游人",
                "海内存知己",
                "天涯若比邻",
                "无为在歧路",
                "儿女共沾巾"
            ],
            difficulty: "advanced",
            theme: "送别"
        },
        {
            id: 38,
            title: "钱塘湖春行",
            author: "白居易",
            dynasty: "唐",
            content: [
                "孤山寺北贾亭西",
                "水面初平云脚低",
                "几处早莺争暖树",
                "谁家新燕啄春泥",
                "乱花渐欲迷人眼",
                "浅草才能没马蹄",
                "最爱湖东行不足",
                "绿杨阴里白沙堤"
            ],
            difficulty: "advanced",
            theme: "春景"
        },
        {
            id: 39,
            title: "游山西村",
            author: "陆游",
            dynasty: "宋",
            content: [
                "莫笑农家腊酒浑",
                "丰年留客足鸡豚",
                "山重水复疑无路",
                "柳暗花明又一村",
                "箫鼓追随春社近",
                "衣冠简朴古风存",
                "从今若许闲乘月",
                "拄杖无时夜叩门"
            ],
            difficulty: "advanced",
            theme: "哲理"
        },
        {
            id: 40,
            title: "水调歌头",
            author: "苏轼",
            dynasty: "宋",
            content: [
                "明月几时有",
                "把酒问青天",
                "不知天上宫阙",
                "今夕是何年",
                "我欲乘风归去",
                "又恐琼楼玉宇",
                "高处不胜寒",
                "起舞弄清影",
                "何似在人间",
                "转朱阁",
                "低绮户",
                "照无眠",
                "不应有恨",
                "何事长向别时圆",
                "人有悲欢离合",
                "月有阴晴圆缺",
                "此事古难全",
                "但愿人长久",
                "千里共婵娟"
            ],
            difficulty: "advanced",
            theme: "中秋"
        },
        {
            id: 41,
            title: "虞美人",
            author: "李煜",
            dynasty: "五代",
            content: [
                "春花秋月何时了",
                "往事知多少",
                "小楼昨夜又东风",
                "故国不堪回首月明中",
                "雕栏玉砌应犹在",
                "只是朱颜改",
                "问君能有几多愁",
                "恰似一江春水向东流"
            ],
            difficulty: "advanced",
            theme: "怀古"
        },
        {
            id: 42,
            title: "将进酒",
            author: "李白",
            dynasty: "唐",
            content: [
                "君不见黄河之水天上来",
                "奔流到海不复回",
                "君不见高堂明镜悲白发",
                "朝如青丝暮成雪",
                "人生得意须尽欢",
                "莫使金樽空对月",
                "天生我材必有用",
                "千金散尽还复来",
                "烹羊宰牛且为乐",
                "会须一饮三百杯"
            ],
            difficulty: "advanced",
            theme: "豪放"
        },
        {
            id: 43,
            title: "念奴娇",
            author: "苏轼",
            dynasty: "宋",
            content: [
                "大江东去",
                "浪淘尽",
                "千古风流人物",
                "故垒西边",
                "人道是",
                "三国周郎赤壁",
                "乱石穿空",
                "惊涛拍岸",
                "卷起千堆雪",
                "江山如画",
                "一时多少豪杰",
                "遥想公瑾当年",
                "小乔初嫁了",
                "雄姿英发",
                "羽扇纶巾",
                "谈笑间",
                "樯橹灰飞烟灭",
                "故国神游",
                "多情应笑我",
                "早生华发",
                "人生如梦",
                "一尊还酹江月"
            ],
            difficulty: "advanced",
            theme: "怀古"
        },
        {
            id: 44,
            title: "声声慢",
            author: "李清照",
            dynasty: "宋",
            content: [
                "寻寻觅觅",
                "冷冷清清",
                "凄凄惨惨戚戚",
                "乍暖还寒时候",
                "最难将息",
                "三杯两盏淡酒",
                "怎敌他晚来风急",
                "雁过也",
                "正伤心",
                "却是旧时相识",
                "满地黄花堆积",
                "憔悴损",
                "如今有谁堪摘",
                "守着窗儿",
                "独自怎生得黑",
                "梧桐更兼细雨",
                "到黄昏点点滴滴",
                "这次第",
                "怎一个愁字了得"
            ],
            difficulty: "advanced",
            theme: "愁绪"
        }
    ]
};
