import {
    getDifficulty,
    getLevelConfig,
    getLevelPoems,
    preparePoemForRepair
} from '../data/poems.js';

// 古诗词学习助手 - 主应用逻辑
class PoemLearningApp {
    constructor() {
        this.currentUser = null;
        this.currentPoem = null;
        this.currentScreen = 'welcome';
        this.score = 0;
        this.selectedOption = null;
        this.gameStats = {
            correct: 0,
            total: 0,
            startTime: null
        };
        this.clickToNextHandler = null;
        
        // 十关挑战相关
        this.currentLevel = 1;
        this.maxLevels = 10;
        this.difficulty = 'beginner';
        this.levelPoems = []; // 存储按字数排序的诗词
        this.completedLevels = 0;
        
        this.init();
    }

    // 初始化应用
    init() {
        this.generateUser();
        this.bindEvents();
        this.showScreen('welcome');
        console.log('古诗词学习助手已启动');
    }

    // 生成临时用户
    generateUser() {
        const randomId = Math.floor(Math.random() * 9999) + 1;
        this.currentUser = {
            name: `游客${randomId.toString().padStart(4, '0')}`,
            id: randomId,
            joinTime: new Date()
        };
        
        // 更新界面显示
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = this.currentUser.name;
        }
        
        console.log('用户生成:', this.currentUser);
    }

    // 绑定事件监听器
    bindEvents() {
        // 难度选择按钮
        const difficultyButtons = document.querySelectorAll('.difficulty-btn');
        difficultyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const level = btn.dataset.level;
                if (!btn.disabled) {
                    this.startGame(level);
                }
            });
        });

        // 返回按钮
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.showScreen('welcome');
                this.resetGame();
            });
        }

        // 提交答案按钮
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                this.submitAnswer();
            });
        }

    }
    


    // 重试当前关卡（答错时重新出题）
    retryCurrentLevel() {
        // 隐藏结果反馈
        this.hideResultFeedback();
        
        // 重置选择状态
        this.selectedOption = null;
        
        // 启用所有选项按钮并清除样式
        const allOptions = document.querySelectorAll('.option-btn');
        allOptions.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('selected', 'correct', 'incorrect');
        });
        
        // 重置按钮状态
        const submitBtn = document.getElementById('submitBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (submitBtn) {
            submitBtn.style.display = 'inline-block';
            submitBtn.disabled = true;
        }
        if (nextBtn) nextBtn.style.display = 'none';
        
        // 重新生成当前关卡的题目（不改变currentLevel）
        const currentPoem = this.levelPoems[this.currentLevel - 1];
        if (currentPoem) {
            // 重新准备诗词修复数据，生成新的选项
            this.currentPoem = preparePoemForRepair(
                currentPoem,
                getLevelConfig(this.difficulty)
            );
            if (this.currentPoem) {
            // 更新界面显示新题目
                this.updateGameInterface();
                console.log('重新出题 - 当前关卡:', this.currentLevel, '新题目:', this.currentPoem);
            }
        }
    }

    // 下一题按钮事件绑定
    bindNextButton() {
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextQuestion();
            });
        }

        // 结果反馈点击关闭
        const resultFeedback = document.getElementById('resultFeedback');
        if (resultFeedback) {
            resultFeedback.addEventListener('click', () => {
                this.hideResultFeedback();
            });
        }
    }

    // 显示指定屏幕
    showScreen(screenName) {
        // 隐藏所有屏幕
        const screens = ['welcomeScreen', 'gameScreen'];
        screens.forEach(screen => {
            const element = document.getElementById(screen);
            if (element) {
                element.style.display = 'none';
            }
        });

        // 显示目标屏幕
        const targetScreen = document.getElementById(screenName + 'Screen');
        if (targetScreen) {
            targetScreen.style.display = 'block';
            this.currentScreen = screenName;
        }

    }

    // 开始游戏
    startGame(difficulty) {
        const config = getDifficulty(difficulty);
        console.log('开始游戏，难度:', config.name);

        // 每次开局都重置进度，并按所选难度重新抽题
        this.difficulty = config.key;
        this.currentLevel = 1;
        this.completedLevels = 0;
        this.score = 0;
        this.selectedOption = null;
        this.levelPoems = [];
        this.gameStats = {
            correct: 0,
            total: 0,
            startTime: new Date()
        };

        this.initializeLevelPoems();
        this.updateScore();
        this.startCurrentLevel();
        this.showScreen('game');
    }

    // 开始当前关卡（诗句修复）
    startCurrentLevel() {
        console.log('🎯 startCurrentLevel被调用');
        console.log('📚 当前levelPoems长度:', this.levelPoems.length);
        console.log('🎮 当前关卡:', this.currentLevel);
        
        // 如果是第一次开始游戏，初始化关卡诗词
        if (this.levelPoems.length === 0) {
            console.log('🔄 初始化关卡诗词');
            this.initializeLevelPoems();
            console.log('✅ 初始化完成，levelPoems长度:', this.levelPoems.length);
        }
        
        // 检查是否已完成所有关卡
        if (this.currentLevel > this.maxLevels) {
            console.log('🏆 所有关卡已完成');
            this.showCompletionMessage();
            return;
        }
        
        // 获取当前关卡的诗词
        const currentPoem = this.levelPoems[this.currentLevel - 1];
        console.log('📖 获取当前关卡诗词:', currentPoem ? '成功' : '失败', currentPoem);
        
        if (!currentPoem) {
            console.error('❌ 无法获取当前关卡诗词数据');
            return;
        }

        // 准备诗句修复数据
        console.log('🔧 准备诗词修复数据');
        this.currentPoem = preparePoemForRepair(
            currentPoem,
            getLevelConfig(this.difficulty)
        );
        if (!this.currentPoem) {
            console.error('❌ 无法准备诗词修复数据');
            return;
        }

        console.log('✅ 当前诗词准备完成:', this.currentPoem);
        
        // 更新界面
        console.log('🖼️ 更新游戏界面');
        this.updateGameInterface();
        this.selectedOption = null;
        
        // 更新关卡显示
        const currentLevelElement = document.getElementById('currentLevel');
        if (currentLevelElement) {
            const difficultyName = getDifficulty(this.difficulty).name;
            currentLevelElement.textContent =
                `${difficultyName} · 第${this.currentLevel}关 / 共${this.maxLevels}关`;
            console.log('📊 关卡显示已更新');
        } else {
            console.warn('⚠️ 找不到currentLevel元素');
        }
        
        console.log('🎉 本关准备完成');
    }

    // 初始化关卡诗词：按当前难度洗牌抽题
    initializeLevelPoems() {
        this.levelPoems = getLevelPoems(this.difficulty);
        this.maxLevels = this.levelPoems.length;

        console.log(
            `${getDifficulty(this.difficulty).name}难度题目已生成:`,
            this.levelPoems.map(p => p.title)
        );
    }

    // 更新游戏界面
    updateGameInterface() {
        if (!this.currentPoem) return;

        // 更新诗词信息
        const titleElement = document.getElementById('poemTitle');
        const authorElement = document.getElementById('poemAuthor');
        
        if (titleElement) titleElement.textContent = this.currentPoem.title;
        if (authorElement) authorElement.textContent = `${this.currentPoem.author} · ${this.currentPoem.dynasty}`;

        // 更新诗词内容
        this.updatePoemContent();
        
        // 更新选项
        this.updateOptions();
        
        // 重置按钮状态
        const submitBtn = document.getElementById('submitBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.display = 'inline-block';
        }
        if (nextBtn) {
            nextBtn.style.display = 'none';
        }
    }

    // 更新诗词内容显示
    updatePoemContent() {
        const contentElement = document.getElementById('poemContent');
        if (!contentElement || !this.currentPoem.displayContent) return;

        contentElement.innerHTML = '';
        
        this.currentPoem.displayContent.forEach((line, index) => {
            const lineElement = document.createElement('div');
            lineElement.className = 'poem-line';
            
            if (line.isMissing) {
                lineElement.classList.add('missing-line');
                lineElement.textContent = line.text;
            } else {
                lineElement.textContent = line.text;
            }
            
            contentElement.appendChild(lineElement);
        });
    }

    // 更新选项显示
    updateOptions() {
        const optionsContainer = document.getElementById('optionsContainer');
        if (!optionsContainer || !this.currentPoem.options) return;

        optionsContainer.innerHTML = '';
        
        this.currentPoem.options.forEach((option, index) => {
            const optionButton = document.createElement('button');
            optionButton.className = 'option-btn';
            optionButton.textContent = option;
            optionButton.dataset.option = option;
            optionButton.dataset.index = index;
            
            optionButton.addEventListener('click', () => {
                this.selectOption(option, optionButton);
            });
            
            optionsContainer.appendChild(optionButton);
        });
    }

    // 选择选项
    selectOption(option, buttonElement) {
        // 清除之前的选择
        const allOptions = document.querySelectorAll('.option-btn');
        allOptions.forEach(btn => btn.classList.remove('selected'));
        
        // 标记当前选择
        buttonElement.classList.add('selected');
        this.selectedOption = option;
        
        console.log('选择了选项:', option);
        
        // 立即自动提交答案
        this.submitAnswer();
    }

    // 提交答案
    submitAnswer() {
        if (!this.selectedOption || !this.currentPoem) {
            return;
        }

        const isCorrect = this.selectedOption === this.currentPoem.correctAnswer;
        this.gameStats.total++;
        
        if (isCorrect) {
            this.gameStats.correct++;
            this.score += 10;
        }

        // 更新选项样式
        const allOptions = document.querySelectorAll('.option-btn');
        allOptions.forEach(btn => {
            const option = btn.dataset.option;
            if (option === this.currentPoem.correctAnswer) {
                btn.classList.add('correct');
            } else if (option === this.selectedOption && !isCorrect) {
                btn.classList.add('incorrect');
            }
            btn.disabled = true;
        });

        // 更新按钮状态
        const submitBtn = document.getElementById('submitBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (submitBtn) submitBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'inline-block';

        // 更新分数
        this.updateScore();
        
        // 根据答题结果决定下一步行为
        if (isCorrect) {
            // 答对了，显示结果反馈并进入下一题
            this.showResultFeedback(isCorrect, true);
        } else {
            // 答错了，显示结果反馈但不自动进入下一题，而是重新出题
            this.showResultFeedback(isCorrect, false);
            // 延迟后重新出题（同一关卡）
            setTimeout(() => {
                this.retryCurrentLevel();
            }, 2000);
        }
        
        console.log('答案提交:', {
            selected: this.selectedOption,
            correct: this.currentPoem.correctAnswer,
            isCorrect: isCorrect,
            score: this.score,
            currentLevel: this.currentLevel
        });
    }

    // 显示结果反馈
    showResultFeedback(isCorrect, clickToNext = false) {
        const feedbackElement = document.getElementById('resultFeedback');
        const iconElement = document.getElementById('feedbackIcon');
        const textElement = document.getElementById('feedbackText');
        const animationElement = document.getElementById('characterAnimation');
        
        if (!feedbackElement) return;

        // 清除之前可能存在的事件监听器
        const oldClickHandler = feedbackElement._clickHandler;
        if (oldClickHandler) {
            feedbackElement.removeEventListener('click', oldClickHandler);
            const feedbackContent = feedbackElement.querySelector('.feedback-content');
            if (feedbackContent) {
                feedbackContent.removeEventListener('click', oldClickHandler);
            }
        }

        // 设置反馈内容
        if (isCorrect) {
            iconElement.textContent = '✅';
            textElement.textContent = '回答正确！';
            animationElement.style.display = 'block';
        } else {
            iconElement.textContent = '❌';
            textElement.textContent = '答案错误，继续加油！';
            animationElement.style.display = 'none';
        }

        // 显示反馈
        feedbackElement.style.display = 'flex';
        
        // 创建新的点击处理函数
        const clickHandler = (event) => {
            event.stopPropagation();
            event.preventDefault();
            
            // 立即隐藏窗口
            this.hideResultFeedback();
            
            // 移除事件监听器
            feedbackElement.removeEventListener('click', clickHandler);
            const feedbackContent = feedbackElement.querySelector('.feedback-content');
            if (feedbackContent) {
                feedbackContent.removeEventListener('click', clickHandler);
            }
            feedbackElement._clickHandler = null;
            
            // 如果需要进入下一题
            if (clickToNext) {
                // 使用setTimeout确保窗口先关闭再进入下一题
                setTimeout(() => {
                    this.nextQuestion();
                }, 100);
            }
        };
        
        // 保存处理函数引用以便后续清理
        feedbackElement._clickHandler = clickHandler;
        
        // 添加点击事件监听器
        feedbackElement.addEventListener('click', clickHandler);
        
        // 为内容区域也添加点击事件
        const feedbackContent = feedbackElement.querySelector('.feedback-content');
        if (feedbackContent) {
            feedbackContent.addEventListener('click', clickHandler);
        }
    }

    // 隐藏结果反馈
    hideResultFeedback() {
        const feedbackElement = document.getElementById('resultFeedback');
        if (feedbackElement) {
            feedbackElement.style.display = 'none';
            
            // 清理事件监听器
            const clickHandler = feedbackElement._clickHandler;
            if (clickHandler) {
                feedbackElement.removeEventListener('click', clickHandler);
                const feedbackContent = feedbackElement.querySelector('.feedback-content');
                if (feedbackContent) {
                    feedbackContent.removeEventListener('click', clickHandler);
                }
                feedbackElement._clickHandler = null;
            }
        }
    }

    // 下一题
    nextQuestion() {
        // 移除点击监听器
        if (this.clickToNextHandler) {
            document.removeEventListener('click', this.clickToNextHandler);
            this.clickToNextHandler = null;
        }
        
        // 重置选择状态
        this.selectedOption = null;
        
        // 隐藏结果反馈（如果还没有隐藏的话）
        const resultDiv = document.getElementById('result');
        if (resultDiv) {
            resultDiv.style.display = 'none';
            // 移除提示信息
            const hintElement = resultDiv.querySelector('.click-hint');
            if (hintElement) {
                hintElement.remove();
            }
        }
        
        // 启用所有选项按钮
        const allOptions = document.querySelectorAll('.option-btn');
        allOptions.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('selected', 'correct', 'incorrect');
        });
        
        // 进入下一关
        this.currentLevel++;
        
        // 开始新的游戏
        this.startCurrentLevel();
    }

    // 显示通关完成信息
    showCompletionMessage() {
        const gameContainer = document.querySelector('.beginner-game');
        if (!gameContainer) return;
        
        gameContainer.innerHTML = `
            <div class="completion-container">
                <div class="completion-header">
                    <h2>🎉 恭喜通关！</h2>
                    <p>您已成功完成${getDifficulty(this.difficulty).name}难度的全部${this.maxLevels}关！</p>
                </div>
                
                <div class="completion-stats">
                    <div class="stat-item">
                        <span class="stat-label">总得分：</span>
                        <span class="stat-value">${this.score}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">正确率：</span>
                        <span class="stat-value">${this.gameStats.total > 0 ? Math.round((this.gameStats.correct / this.gameStats.total) * 100) : 0}%</span>
                    </div>
                </div>
                
                <div class="completion-message">
                    <p>感谢您参与古诗词学习游戏！</p>
                    <p>通过这次挑战，您不仅复习了经典诗词，还提升了文学素养。</p>
                    <p>希望这些千古传诵的诗句能在您心中留下美好的印象。</p>
                </div>
                
                <div class="completion-actions">
                    <button class="btn-primary" onclick="app.restartGame()">再玩一次</button>
                    <a class="btn-secondary" href="../../index.html">返回大厅</a>
                </div>
            </div>
        `;
    }

    // 格式化游戏时间
    formatPlayTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}分${remainingSeconds.toString().padStart(2, '0')}秒`;
    }



    // 重新开始游戏
    restartGame() {
        console.log('🔄 重新开始游戏被调用');
        
        // 重置游戏状态（保留积分）
        this.currentLevel = 1;
        this.completedLevels = 0;
        // 新的一局从 0 分算起，难度保持不变
        this.score = 0;
        this.gameStats = {
            correct: 0,
            total: 0,
            startTime: new Date()
        };
        this.selectedOption = null;
        this.levelPoems = []; // 清空关卡诗词，重新初始化
        this.updateScore();
        
        console.log('✅ 游戏状态已重置:', {
            currentLevel: this.currentLevel,
            score: this.score,
            difficulty: this.difficulty,
            levelPoemsLength: this.levelPoems.length
        });
        
        // 重新显示游戏界面
        this.showScreen('game');
        console.log('📺 切换到游戏界面');
        
        // 确保游戏容器存在并重新初始化完整的游戏界面
        const gameContainer = document.querySelector('.beginner-game');
        console.log('🎮 检查游戏容器:', gameContainer ? '存在' : '不存在');
        
        if (!gameContainer) {
            // 如果游戏容器不存在，重新创建完整的游戏界面
            const gameScreen = document.getElementById('gameScreen');
            console.log('🖥️ 游戏屏幕元素:', gameScreen ? '存在' : '不存在');
            
            if (gameScreen) {
                // 重新创建完整的游戏界面结构
                const gameHeader = gameScreen.querySelector('.game-header');
                const existingBeginnerGame = gameScreen.querySelector('.beginner-game');
                const resultFeedback = gameScreen.querySelector('.result-feedback');
                
                console.log('🔍 DOM元素检查:', {
                    gameHeader: gameHeader ? '存在' : '不存在',
                    existingBeginnerGame: existingBeginnerGame ? '存在' : '不存在',
                    resultFeedback: resultFeedback ? '存在' : '不存在'
                });
                
                // 如果beginner-game不存在，创建完整结构
                if (!existingBeginnerGame) {
                    console.log('🏗️ 创建新的游戏界面结构');
                    const beginnerGameHTML = `
                        <div class="beginner-game" id="beginnerGame">
                            <div class="poem-display">
                                <div class="poem-info">
                                    <h3 class="poem-title" id="poemTitle">静夜思</h3>
                                    <p class="poem-author" id="poemAuthor">李白</p>
                                </div>
                                
                                <div class="poem-content" id="poemContent">
                                    <!-- 诗句将通过JavaScript动态生成 -->
                                </div>
                            </div>

                            <div class="options-container" id="optionsContainer">
                                <!-- 选项将通过JavaScript动态生成 -->
                            </div>

                            <div class="game-controls">
                                <button class="submit-btn" id="submitBtn" disabled>提交答案</button>
                                <button class="next-btn" id="nextBtn" style="display: none;">下一题</button>
                            </div>
                        </div>
                    `;
                    
                    // 插入到game-header之后，result-feedback之前
                    if (gameHeader && resultFeedback) {
                        gameHeader.insertAdjacentHTML('afterend', beginnerGameHTML);
                        console.log('✅ 在header和feedback之间插入游戏界面');
                    } else if (gameHeader) {
                        gameHeader.insertAdjacentHTML('afterend', beginnerGameHTML);
                        console.log('✅ 在header之后插入游戏界面');
                    } else {
                        gameScreen.insertAdjacentHTML('afterbegin', beginnerGameHTML);
                        console.log('✅ 在游戏屏幕开头插入游戏界面');
                    }
                }
            }
        } else {
            // 如果容器存在但可能内容被清空，确保有完整结构
            const poemDisplay = gameContainer.querySelector('.poem-display');
            console.log('📝 诗词显示区域:', poemDisplay ? '存在' : '不存在');
            
            if (!poemDisplay) {
                console.log('🔧 修复游戏容器内容');
                gameContainer.innerHTML = `
                    <div class="poem-display">
                        <div class="poem-info">
                            <h3 class="poem-title" id="poemTitle">静夜思</h3>
                            <p class="poem-author" id="poemAuthor">李白</p>
                        </div>
                        
                        <div class="poem-content" id="poemContent">
                            <!-- 诗句将通过JavaScript动态生成 -->
                        </div>
                    </div>

                    <div class="options-container" id="optionsContainer">
                        <!-- 选项将通过JavaScript动态生成 -->
                    </div>

                    <div class="game-controls">
                        <button class="submit-btn" id="submitBtn" disabled>提交答案</button>
                        <button class="next-btn" id="nextBtn" style="display: none;">下一题</button>
                    </div>
                `;
            }
        }
        
        console.log('🚀 开始进入当前关卡');
        this.startCurrentLevel();
        console.log('📊 更新分数显示');
        this.updateScore();
    }

    // 更新分数显示
    updateScore() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = `得分: ${this.score}`;
        }
    }

    // 重置游戏
    resetGame() {
        this.currentPoem = null;
        this.selectedOption = null;
        this.score = 0;
        this.currentLevel = 1;
        this.completedLevels = 0;
        this.levelPoems = [];
        this.gameStats = {
            correct: 0,
            total: 0,
            startTime: null
        };
        this.updateScore();
    }

}

// DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，初始化应用...');
    window.app = new PoemLearningApp();
    window.PoemApp = window.app;
});

// 全局错误处理
window.addEventListener('error', (event) => {
    console.error('应用错误:', event.error);
});
