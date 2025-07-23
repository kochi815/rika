// --- DOM要素の取得 ---
const modeSelectScreen = document.getElementById('mode-select-screen');
const battleScreen = document.getElementById('battle-screen');
const startBiologyBtn = document.getElementById('start-biology-btn');
const startGeologyBtn = document.getElementById('start-geology-btn');
const startPhysicsBtn = document.getElementById('start-physics-btn');
const startChemistryBtn = document.getElementById('start-chemistry-btn');
const startAllBtn = document.getElementById('start-all-btn');
const startReviewBtn = document.getElementById('start-review-btn');
const scoreDisplay = document.getElementById('score-display');
const enemyName = document.getElementById('enemy-name');
const enemyHP = document.getElementById('enemy-hp');
const enemyHPBar = document.getElementById('enemy-hp-bar');
const enemyCharacter = document.getElementById('enemy-character');
const playerHP = document.getElementById('player-hp');
const playerHPBar = document.getElementById('player-hp-bar');
const questionDiv = document.getElementById('question');
const answerChoicesDiv = document.getElementById('answer-choices');
const battleLog = document.getElementById('battle-log');
const nextBattleBtn = document.getElementById('next-battle-btn');


// --- 音声ファイルの読み込み ---
const sounds = {
    bgm: new Audio('sounds/bgm.mp3'),
    correct: new Audio('sounds/correct.mp3'),
    wrong: new Audio('sounds/wrong.mp3'),
    victory: new Audio('sounds/victory.mp3')
};
sounds.bgm.loop = true;
sounds.bgm.volume = 0.3;


// --- ゲームの状態を管理する変数 ---
let currentMode = '';
let mistakeReviewList = [];
let scores = {};
let currentProblems = [];
let currentProblemIndex = 0;
let playerMaxHP = 100;
let currentPlayerHP = playerMaxHP;
let currentEnemy;
let currentEnemyMaxHP;
let currentEnemyHP;
let currentStage = 0;


// --- 新機能の関数 ---

// ローカルストレージからデータを読み込む
function loadData() {
    const savedMistakes = localStorage.getItem('mistakeReviewList');
    if (savedMistakes) {
        mistakeReviewList = JSON.parse(savedMistakes);
    }
    const savedScores = localStorage.getItem('scores');
    if (savedScores) {
        scores = JSON.parse(savedScores);
    } else {
        scores = {
            biology: { correct: 0, total: 0 },
            geology: { correct: 0, total: 0 },
            physics: { correct: 0, total: 0 },
            chemistry: { correct: 0, total: 0 }
        };
    }
}

// 間違えた問題リストを保存
function saveMistakes() {
    localStorage.setItem('mistakeReviewList', JSON.stringify(mistakeReviewList));
}

// スコアを保存
function saveScores() {
    localStorage.setItem('scores', JSON.stringify(scores));
}

// 復習ボタンの状態を更新
function updateReviewButtonState() {
    if (mistakeReviewList.length > 0) {
        startReviewBtn.disabled = false;
        startReviewBtn.textContent = `❌ 間違えた問題に挑戦 (${mistakeReviewList.length}問)`;
    } else {
        startReviewBtn.disabled = true;
        startReviewBtn.textContent = '❌ 間違えた問題はありません';
    }
}

// スコア表示を更新
function updateScoreDisplay() {
    scoreDisplay.innerHTML = '';
    const fields = { biology: '🌱生物', geology: '🌍地学', physics: '💡物理', chemistry: '⚗️化学' };
    for (const field in scores) {
        const score = scores[field];
        const percentage = score.total > 0 ? ((score.correct / score.total) * 100).toFixed(0) : 0;
        const scoreEl = document.createElement('div');
        scoreEl.className = 'score-item';
        scoreEl.innerHTML = `
            <span class="field-name">${fields[field]}</span>
            <span class="score-data">${score.correct} / ${score.total} (正解率: ${percentage}%)</span>
        `;
        scoreDisplay.appendChild(scoreEl);
    }
}


// --- ゲームのメイン関数 ---

// 初期化処理
function init() {
    loadData();
    updateReviewButtonState();
    updateScoreDisplay();

    const scienceData = allProblemSets.science.data;

    startBiologyBtn.addEventListener('click', () => startGame('biology', scienceData.biology, enemyData));
    startGeologyBtn.addEventListener('click', () => startGame('geology', scienceData.geology, enemyData));
    startPhysicsBtn.addEventListener('click', () => startGame('physics', scienceData.physics, enemyData));
    startChemistryBtn.addEventListener('click', () => startGame('chemistry', scienceData.chemistry, enemyData));
    
    startAllBtn.addEventListener('click', () => {
        const allProblems = [...scienceData.biology, ...scienceData.geology, ...scienceData.physics, ...scienceData.chemistry];
        startGame('all', allProblems, enemyData);
    });
    
    startReviewBtn.addEventListener('click', () => {
        if (mistakeReviewList.length > 0) {
            startGame('review', mistakeReviewList, enemyData);
        }
    });

    nextBattleBtn.addEventListener('click', () => {
        currentStage++;
        if (currentStage >= enemyData.length) {
            showResult("🎉 全ステージクリア！おめでとう！ 🎉");
        } else {
            sounds.bgm.play().catch(e => console.log("BGMの再生にユーザー操作が必要です。"));
            setupBattle();
        }
    });
}

// ゲーム開始
function startGame(mode, problemSet, enemies) {
    currentMode = mode;
    sounds.bgm.play().catch(e => console.log("BGMの再生にユーザー操作が必要です。"));
    
    currentProblems = [...problemSet].sort(() => Math.random() - 0.5);
    currentStage = 0;
    
    modeSelectScreen.classList.remove('active');
    battleScreen.classList.add('active');
    
    setupBattle();
}

// バトル準備
function setupBattle() {
    currentPlayerHP = playerMaxHP;
    currentEnemy = enemyData[currentStage];
    currentEnemyMaxHP = currentEnemy.hp;
    currentEnemyHP = currentEnemyMaxHP;
    
    updateUI();
    nextQuestion();
    
    nextBattleBtn.style.display = 'none';
    battleLog.textContent = `${currentEnemy.name} があらわれた！`;
}

// 次の問題を表示
function nextQuestion() {
    if (currentProblemIndex >= currentProblems.length) {
        currentProblemIndex = 0; // 問題をループさせる
    }
    
    const problem = currentProblems[currentProblemIndex];
    questionDiv.textContent = problem.q;
    
    answerChoicesDiv.innerHTML = '';
    const choices = [problem.a, ...problem.d].sort(() => Math.random() - 0.5);
    
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice;
        button.className = 'choice-btn';
        button.onclick = () => handleAnswer(choice, problem.a);
        answerChoicesDiv.appendChild(button);
    });
}

// 回答処理
function handleAnswer(selectedAnswer, correctAnswer) {
    const buttons = answerChoicesDiv.querySelectorAll('.choice-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    const problem = currentProblems[currentProblemIndex];
    
    if (selectedAnswer === correctAnswer) {
        sounds.correct.currentTime = 0;
        sounds.correct.play();
        const damage = Math.floor(Math.random() * 10) + 15;
        currentEnemyHP -= damage;
        battleLog.textContent = `✅ 正解！ ${currentEnemy.name}に ${damage} のダメージ！`;

        const mistakeIndex = mistakeReviewList.findIndex(p => p.q === problem.q);
        if (mistakeIndex > -1) {
            mistakeReviewList.splice(mistakeIndex, 1);
            saveMistakes();
            updateReviewButtonState();
        }
    } else {
        sounds.wrong.currentTime = 0;
        sounds.wrong.play();
        const damage = Math.floor(Math.random() * 5) + 10;
        currentPlayerHP -= damage;
        battleLog.textContent = `❌ 不正解... 自分に ${damage} のダメージ... 正解は「${correctAnswer}」`;
        
        if (!mistakeReviewList.some(p => p.q === problem.q)) {
            mistakeReviewList.push(problem);
            saveMistakes();
            updateReviewButtonState();
        }
    }
    
    if (currentMode !== 'review' && problem.field) {
        if (!scores[problem.field]) { // 念の為、スコアオブジェクトに存在しない分野の場合の初期化
            scores[problem.field] = { correct: 0, total: 0 };
        }
        scores[problem.field].total++;
        if (selectedAnswer === correctAnswer) {
            scores[problem.field].correct++;
        }
        saveScores();
        updateScoreDisplay();
    }
    
    updateUI();
    currentProblemIndex++;
    
    setTimeout(() => {
        if (currentEnemyHP <= 0) {
            sounds.victory.currentTime = 0;
            sounds.victory.play();
            battleLog.textContent = `🎉 ${currentEnemy.name} をたおした！ 🎉`;
            nextBattleBtn.style.display = 'inline-block';
            sounds.bgm.pause();
        } else if (currentPlayerHP <= 0) {
            showResult("😭 やられてしまった... 😭");
        } else {
            nextQuestion();
        }
    }, 1800);
}

// UI更新
function updateUI() {
    playerHP.textContent = Math.max(0, currentPlayerHP);
    playerHPBar.style.width = `${(Math.max(0, currentPlayerHP) / playerMaxHP) * 100}%`;
    
    enemyName.textContent = `${currentEnemy.name} (Lv.${currentStage + 1})`;
    enemyCharacter.textContent = currentEnemy.emoji;
    enemyHP.textContent = Math.max(0, currentEnemyHP);
    enemyHPBar.style.width = `${(Math.max(0, currentEnemyHP) / currentEnemyMaxHP) * 100}%`;
}

// 結果表示
function showResult(message) {
    sounds.bgm.pause();
    sounds.bgm.currentTime = 0;
    
    battleScreen.classList.remove('active');
    modeSelectScreen.classList.add('active');
    alert(message);
}

// --- ゲームの実行開始 ---
init();