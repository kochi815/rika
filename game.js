// --- DOM要素の取得 (変更なし) ---
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


// --- ✨ここから追加✨: 音声ファイルの読み込み ---
const sounds = {
    bgm: new Audio('sounds/bgm.mp3'),
    correct: new Audio('sounds/correct.mp3'),
    wrong: new Audio('sounds/wrong.mp3'),
    victory: new Audio('sounds/victory.mp3')
};
// BGMがループ再生するように設定
sounds.bgm.loop = true;
sounds.bgm.volume = 0.3; // BGMの音量を少し下げる (0.0 ~ 1.0)
// --- ✨ここまで追加✨ ---


// --- ゲームの状態を管理する変数 (変更なし) ---
let currentProblems = [];
let currentProblemIndex = 0;
let playerMaxHP = 100;
let currentPlayerHP = playerMaxHP;
let currentEnemy;
let currentEnemyMaxHP;
let currentEnemyHP;
let currentStage = 0;


// --- 初期化処理 (変更なし) ---
function init() {
    startScienceBtn.addEventListener('click', () => {
        startGame(allProblemSets.science.data, enemyData);
    });
    nextBattleBtn.addEventListener('click', () => {
        currentStage++;
        if (currentStage >= enemyData.length) {
            showResult("🎉 全ステージクリア！おめでとう！ 🎉");
        } else {
            setupBattle();
        }
    });
}


// --- ゲーム開始 (BGM再生を追加) ---
function startGame(problemSet, enemies) {
    // ✨BGM再生開始
    sounds.bgm.play().catch(e => console.log("BGMの再生にユーザー操作が必要です。"));
    
    currentProblems = [...problemSet].sort(() => Math.random() - 0.5);
    currentStage = 0;
    modeSelectScreen.classList.remove('active');
    battleScreen.classList.add('active');
    setupBattle();
}


// --- バトル準備 (変更なし) ---
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


// --- 次の問題を表示 (変更なし) ---
function nextQuestion() {
    if (currentProblemIndex >= currentProblems.length) {
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


// --- ✨ここから修正✨: 回答処理 (効果音再生を追加) ---
function handleAnswer(selectedAnswer, correctAnswer) {
    const buttons = answerChoicesDiv.querySelectorAll('.choice-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    if (selectedAnswer === correctAnswer) {
        // 正解の場合
        sounds.correct.currentTime = 0;
        sounds.correct.play(); // ✨正解音を再生
        
        const damage = Math.floor(Math.random() * 10) + 15;
        currentEnemyHP -= damage;
        battleLog.textContent = `✅ 正解！ ${currentEnemy.name}に ${damage} のダメージ！`;
    } else {
        // 不正解の場合
        sounds.wrong.currentTime = 0;
        sounds.wrong.play(); // ✨不正解音を再生
        
        const damage = Math.floor(Math.random() * 5) + 10;
        currentPlayerHP -= damage;
        battleLog.textContent = `❌ 不正解... 自分に ${damage} のダメージ... 正解は「${correctAnswer}」`;
    }
    
    updateUI();
    currentProblemIndex++;
    
    // 勝敗判定
    setTimeout(() => {
        if (currentEnemyHP <= 0) {
            sounds.victory.currentTime = 0;
            sounds.victory.play(); // ✨勝利音を再生
            
            battleLog.textContent = `🎉 ${currentEnemy.name} をたおした！ 🎉`;
            nextBattleBtn.style.display = 'inline-block';
        } else if (currentPlayerHP <= 0) {
            showResult("😭 やられてしまった... 😭");
        } else {
            nextQuestion();
        }
    }, 1800);
}
// --- ✨ここまで修正✨ ---


// --- UI更新 (変更なし) ---
function updateUI() {
    playerHP.textContent = Math.max(0, currentPlayerHP);
    playerHPBar.style.width = `${(Math.max(0, currentPlayerHP) / playerMaxHP) * 100}%`;
    
    enemyName.textContent = `${currentEnemy.name} (Lv.${currentStage + 1})`;
    enemyCharacter.textContent = currentEnemy.emoji;
    enemyHP.textContent = Math.max(0, currentEnemyHP);
    enemyHPBar.style.width = `${(Math.max(0, currentEnemyHP) / currentEnemyMaxHP) * 100}%`;
}


// --- 結果表示 (BGM停止を追加) ---
function showResult(message) {
    // ✨BGMを停止
    sounds.bgm.pause();
    sounds.bgm.currentTime = 0;
    
    battleScreen.classList.remove('active');
    modeSelectScreen.classList.add('active');
    alert(message);
}

// --- ゲームの実行開始 (変更なし) ---
init();