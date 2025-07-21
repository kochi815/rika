// --- DOM要素の取得 ---
const modeSelectScreen = document.getElementById('mode-select-screen');
const battleScreen = document.getElementById('battle-screen');
const startScienceBtn = document.getElementById('start-science-btn');

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

// --- ゲームの状態を管理する変数 ---
let currentProblems = [];
let currentProblemIndex = 0;
let playerMaxHP = 100;
let currentPlayerHP = playerMaxHP;
let currentEnemy;
let currentEnemyMaxHP;
let currentEnemyHP;
let currentStage = 0;

// --- 初期化処理 ---
function init() {
    startScienceBtn.addEventListener('click', () => {
        // "science"の問題セットと敵データを使ってゲームを開始
        startGame(allProblemSets.science.data, enemyData);
    });
    nextBattleBtn.addEventListener('click', () => {
        currentStage++;
        if (currentStage >= enemyData.length) {
            // 全クリした場合
            showResult("🎉 全ステージクリア！おめでとう！ 🎉");
        } else {
            setupBattle();
        }
    });
}

// --- ゲーム開始 ---
function startGame(problemSet, enemies) {
    currentProblems = [...problemSet].sort(() => Math.random() - 0.5); // 問題をシャッフル
    currentStage = 0;
    modeSelectScreen.classList.remove('active');
    battleScreen.classList.add('active');
    setupBattle();
}

// --- バトル準備 ---
function setupBattle() {
    // プレイヤーHPリセット
    currentPlayerHP = playerMaxHP;
    
    // 敵を設定
    currentEnemy = enemyData[currentStage];
    currentEnemyMaxHP = currentEnemy.hp;
    currentEnemyHP = currentEnemyMaxHP;
    
    // 問題インデックスをリセット
    currentProblemIndex = 0;
    
    // UIを更新
    updateUI();
    
    // 最初の問題を表示
    nextQuestion();
    
    // ボタンの状態をリセット
    nextBattleBtn.style.display = 'none';
    battleLog.textContent = `${currentEnemy.name} があらわれた！`;
}


// --- 次の問題を表示 ---
function nextQuestion() {
    if (currentProblemIndex >= currentProblems.length) {
        // 問題を使い切ったら最初の問題に戻る (ループ)
        currentProblemIndex = 0;
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

// --- 回答処理 ---
function handleAnswer(selectedAnswer, correctAnswer) {
    // ボタンを無効化
    const buttons = answerChoicesDiv.querySelectorAll('.choice-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    if (selectedAnswer === correctAnswer) {
        // 正解の場合
        const damage = Math.floor(Math.random() * 10) + 15; // 15〜24のダメージ
        currentEnemyHP -= damage;
        battleLog.textContent = `✅ 正解！ ${currentEnemy.name}に ${damage} のダメージ！`;
    } else {
        // 不正解の場合
        const damage = Math.floor(Math.random() * 5) + 10; // 10〜14のダメージ
        currentPlayerHP -= damage;
        battleLog.textContent = `❌ 不正解... 自分に ${damage} のダメージ... 正解は「${correctAnswer}」`;
    }
    
    updateUI();
    currentProblemIndex++;
    
    // 勝敗判定
    setTimeout(() => {
        if (currentEnemyHP <= 0) {
            battleLog.textContent = `🎉 ${currentEnemy.name} をたおした！ 🎉`;
            nextBattleBtn.style.display = 'inline-block';
        } else if (currentPlayerHP <= 0) {
            showResult("😭 やられてしまった... 😭");
        } else {
            // 次の問題へ
            nextQuestion();
        }
    }, 1800); // 1.8秒後に次のアクションへ
}

// --- UI更新 ---
function updateUI() {
    // プレイヤーHP
    playerHP.textContent = Math.max(0, currentPlayerHP);
    playerHPBar.style.width = `${(Math.max(0, currentPlayerHP) / playerMaxHP) * 100}%`;
    
    // 敵HP
    enemyName.textContent = `${currentEnemy.name} (Lv.${currentStage + 1})`;
    enemyCharacter.textContent = currentEnemy.emoji;
    enemyHP.textContent = Math.max(0, currentEnemyHP);
    enemyHPBar.style.width = `${(Math.max(0, currentEnemyHP) / currentEnemyMaxHP) * 100}%`;
}

// --- 結果表示 ---
function showResult(message) {
    battleScreen.classList.remove('active');
    modeSelectScreen.classList.add('active');
    alert(message); // 簡単なポップアップで結果表示
}


// --- ゲームの実行開始 ---
init();