// --- DOM要素の取得 ---
const modeSelectScreen = document.getElementById('mode-select-screen');
const battleScreen = document.getElementById('battle-screen');
// 新しいボタンを取得
const startBiologyBtn = document.getElementById('start-biology-btn');
const startGeologyBtn = document.getElementById('start-geology-btn');
const startPhysicsBtn = document.getElementById('start-physics-btn');
const startChemistryBtn = document.getElementById('start-chemistry-btn');
const startAllBtn = document.getElementById('start-all-btn');
const startReviewBtn = document.getElementById('start-review-btn');
const scoreDisplay = document.getElementById('score-display');
// (以下のDOM要素は変更なし)
const enemyName = document.getElementById('enemy-name');
const enemyHP = document.getElementById('enemy-hp');
// ... (その他のDOM要素取得は省略)

// --- ゲームの状態を管理する変数 ---
let currentMode = ''; // 現在のゲームモード（'biology', 'review'など）
let mistakeReviewList = [];
let scores = {};
// (その他の変数は変更なし)
let currentProblems = [];
let currentProblemIndex = 0;
// ...

// --- ✨ここから新機能の関数✨ ---

// ローカルストレージからデータを読み込む
function loadData() {
    const savedMistakes = localStorage.getItem('mistakeReviewList');
    if (savedMistakes) {
        mistakeReviewList = JSON.parse(savedMistakes);
    }

    const savedScores = localStorage.getItem('scores');
    // scoresがなければ初期化
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

// --- ✨ここまで新機能の関数✨ ---


// --- 初期化処理 ---
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
        // ... (変更なし)
    });
}


// --- ゲーム開始 ---
function startGame(mode, problemSet, enemies) {
    currentMode = mode; // ✨現在のモードを記録
    // ... (以下のロジックはほぼ変更なし)
    currentProblems = [...problemSet].sort(() => Math.random() - 0.5);
    // ... (画面切り替えなど)
    setupBattle();
}


// --- 回答処理 ---
function handleAnswer(selectedAnswer, correctAnswer) {
    const problem = currentProblems[currentProblemIndex]; // ✨現在の問題オブジェクトを取得
    
    if (selectedAnswer === correctAnswer) {
        // 正解の場合
        // ... (効果音、ダメージ計算など)

        // 復習リストから削除 (もしあれば)
        const mistakeIndex = mistakeReviewList.findIndex(p => p.q === problem.q);
        if (mistakeIndex > -1) {
            mistakeReviewList.splice(mistakeIndex, 1);
            saveMistakes();
            updateReviewButtonState();
        }
    } else {
        // 不正解の場合
        // ... (効果音、ダメージ計算など)
        
        // 復習リストに追加 (重複しないように)
        if (!mistakeReviewList.some(p => p.q === problem.q)) {
            mistakeReviewList.push(problem);
            saveMistakes();
            updateReviewButtonState();
        }
    }
    
    // ✨スコアを更新
    if (currentMode !== 'review' && currentMode !== 'all') { // 全分野と復習モードでは集計しない
        scores[problem.field].total++;
        if (selectedAnswer === correctAnswer) {
            scores[problem.field].correct++;
        }
        saveScores();
        updateScoreDisplay();
    }
    
    // ... (残りの処理は変更なし)
}

// --- (その他の関数は大きな変更なし) ---

// --- ゲームの実行開始 ---
init();