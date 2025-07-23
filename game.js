// --- DOM要素の取得 ---
const homeScreen = document.getElementById('home-screen');
const quizScreen = document.getElementById('quiz-screen');
const fieldButtons = document.getElementById('field-buttons');
const qCountButtons = document.getElementById('q-count-buttons');
const startQuizBtn = document.getElementById('start-quiz-btn');
const startReviewBtn = document.getElementById('start-review-btn');
const coinTotal = document.getElementById('coin-total');
const achievementDisplay = document.getElementById('achievement-display');
const quizProgress = document.getElementById('quiz-progress');
const hintBtn = document.getElementById('hint-btn');
const questionDiv = document.getElementById('question');
const answerChoicesDiv = document.getElementById('answer-choices');
const quitQuizBtn = document.getElementById('quit-quiz-btn');
const resultModal = document.getElementById('result-modal');
const resultMessage = document.getElementById('result-message');
const resultCoins = document.getElementById('result-coins');
const newAchievementArea = document.getElementById('new-achievement-area');
const closeResultBtn = document.getElementById('close-result-btn');

// --- ゲームの状態 ---
let playerState = {
    coins: 0,
    scores: {},
    mistakes: [],
    achievements: {}
};
let quizState = {
    problems: [],
    currentProblemIndex: 0,
    questionCount: 20,
    correctCount: 0,
    field: 'all',
    isReviewMode: false
};
const achievementList = {
    firstStep: { title: "はじめの一歩", description: "最初のクイズを完了！" },
    coinBeginner: { title: "コインビギナー", description: "合計100コイン獲得！" },
    perfect10: { title: "パーフェクト10", description: "10問クイズで全問正解！" },
    biologyChallenger: { title: "生物チャレンジャー", description: "生物クイズに初挑戦！" },
    biologyMaster: { title: "生物博士", description: "生物で合計50問正解！" },
    thrifty: { title: "倹約家", description: "1000コイン貯金達成！" },
    scienceMaster: { title: "理科マスター", description: "全分野で100問正解！" },
};

// --- データ管理 ---
function saveData() {
    localStorage.setItem('playerState', JSON.stringify(playerState));
}
function loadData() {
    const savedData = localStorage.getItem('playerState');
    if (savedData) {
        playerState = JSON.parse(savedData);
    } else {
        // 新規プレイヤーの初期化
        playerState.scores = { biology: { c: 0, t: 0 }, geology: { c: 0, t: 0 }, physics: { c: 0, t: 0 }, chemistry: { c: 0, t: 0 }, all: {c: 0, t: 0} };
        playerState.achievements = {};
    }
}

// --- UI更新 ---
function updateUI() {
    coinTotal.textContent = playerState.coins;
    // 復習ボタン
    if (playerState.mistakes.length > 0) {
        startReviewBtn.disabled = false;
        startReviewBtn.textContent = `❌ 間違えた問題に挑戦 (${playerState.mistakes.length}問)`;
    } else {
        startReviewBtn.disabled = true;
        startReviewBtn.textContent = '❌ 間違えた問題はありません';
    }
    // 称号
    achievementDisplay.innerHTML = '';
    const unlockedAchievements = Object.keys(playerState.achievements);
    if (unlockedAchievements.length > 0) {
        unlockedAchievements.forEach(key => {
            const badge = document.createElement('span');
            badge.className = 'achievement-badge';
            badge.textContent = achievementList[key].title;
            achievementDisplay.appendChild(badge);
        });
    } else {
        achievementDisplay.innerHTML = '<p>まだ称号はありません</p>';
    }
}

// --- クイズロジック ---
function startQuiz() {
    const scienceData = allProblemSets.science.data;
    let problemSet = [];
    
    if (quizState.isReviewMode) {
        problemSet = [...playerState.mistakes];
        quizState.questionCount = problemSet.length;
    } else if (quizState.field === 'all') {
        problemSet = [...scienceData.biology, ...scienceData.geology, ...scienceData.physics, ...scienceData.chemistry];
    } else {
        problemSet = [...scienceData[quizState.field]];
    }

    quizState.problems = problemSet.sort(() => 0.5 - Math.random()).slice(0, quizState.questionCount);
    if (quizState.problems.length === 0) {
        alert("出題できる問題がありません。");
        return;
    }
    
    quizState.currentProblemIndex = 0;
    quizState.correctCount = 0;
    
    homeScreen.classList.remove('active');
    quizScreen.classList.add('active');
    displayQuestion();
}

function displayQuestion() {
    const problem = quizState.problems[quizState.currentProblemIndex];
    quizProgress.textContent = `問題 ${quizState.currentProblemIndex + 1} / ${quizState.problems.length}`;
    questionDiv.textContent = problem.q;
    hintBtn.disabled = playerState.coins < 30;
    
    answerChoicesDiv.innerHTML = '';
    const choices = [problem.a, ...problem.d].sort(() => 0.5 - Math.random());
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = choice;
        button.onclick = () => selectAnswer(button, choice === problem.a);
        answerChoicesDiv.appendChild(button);
    });
}

function selectAnswer(button, isCorrect) {
    const buttons = answerChoicesDiv.querySelectorAll('.choice-btn');
    buttons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === quizState.problems[quizState.currentProblemIndex].a) {
            btn.classList.add('correct');
        }
    });

    if (isCorrect) {
        quizState.correctCount++;
    } else {
        button.classList.add('wrong');
        // 間違えた問題をリストに追加
        const problem = quizState.problems[quizState.currentProblemIndex];
        if (!playerState.mistakes.some(p => p.q === problem.q)) {
            playerState.mistakes.push(problem);
        }
    }
    
    // スコアを更新 (復習モード以外)
    if (!quizState.isReviewMode) {
        const field = quizState.problems[quizState.currentProblemIndex].field;
        playerState.scores[field].t++;
        playerState.scores.all.t++;
        if (isCorrect) {
            playerState.scores[field].c++;
            playerState.scores.all.c++;
        }
    }
    
    setTimeout(() => {
        quizState.currentProblemIndex++;
        if (quizState.currentProblemIndex < quizState.problems.length) {
            displayQuestion();
        } else {
            showResults();
        }
    }, 1200);
}

function showResults() {
    const earnedCoins = quizState.correctCount * 10;
    let bonusCoins = 0;
    let resultTitle = "おつかれさま！";

    if (quizState.correctCount === quizState.problems.length) {
        bonusCoins = 100;
        resultTitle = "素晴らしい！全問正解！";
    }
    const totalCoins = earnedCoins + bonusCoins;
    playerState.coins += totalCoins;

    resultMessage.textContent = `${quizState.problems.length}問中 ${quizState.correctCount}問 正解でした！`;
    resultCoins.textContent = `🪙 ${earnedCoins}コイン ＋ ボーナス ${bonusCoins}コイン = 合計 ${totalCoins}コイン獲得！`;

    checkAndUnlockAchievements();
    saveData();
    
    quizScreen.classList.remove('active');
    resultModal.style.display = 'flex';
}

function handleHint() {
    if (playerState.coins < 30) return;
    playerState.coins -= 30;
    hintBtn.disabled = true;
    updateUI();
    saveData();

    const correctAnswer = quizState.problems[quizState.currentProblemIndex].a;
    const choiceButtons = Array.from(answerChoicesDiv.querySelectorAll('.choice-btn'));
    const wrongChoices = choiceButtons.filter(btn => btn.textContent !== correctAnswer);

    if (wrongChoices.length > 1) {
        wrongChoices[0].disabled = true;
        wrongChoices[0].style.opacity = '0.2';
    }
}

function checkAndUnlockAchievements() {
    newAchievementArea.innerHTML = '';
    let newAchievementUnlocked = false;

    const unlock = (key) => {
        if (!playerState.achievements[key]) {
            playerState.achievements[key] = true;
            newAchievementUnlocked = true;
            const el = document.createElement('p');
            el.textContent = `✨称号獲得: ${achievementList[key].title}`;
            newAchievementArea.appendChild(el);
        }
    };

    unlock('firstStep');
    if (playerState.coins >= 100) unlock('coinBeginner');
    if (playerState.coins >= 1000) unlock('thrifty');
    if (quizState.questionCount === 10 && quizState.correctCount === 10) unlock('perfect10');
    if (!quizState.isReviewMode) unlock(`${quizState.field}Challenger`);
    if (playerState.scores.biology.c >= 50) unlock('biologyMaster');
    if (playerState.scores.all.c >= 100) unlock('scienceMaster');
}

// --- イベントリスナー ---
fieldButtons.addEventListener('click', (e) => {
    if (e.target.classList.contains('field-btn')) {
        document.querySelectorAll('.field-btn').forEach(btn => btn.classList.remove('selected'));
        e.target.classList.add('selected');
        quizState.field = e.target.dataset.field;
    }
});
qCountButtons.addEventListener('click', (e) => {
    if (e.target.classList.contains('q-count-btn')) {
        document.querySelectorAll('.q-count-btn').forEach(btn => btn.classList.remove('selected'));
        e.target.classList.add('selected');
        quizState.questionCount = parseInt(e.target.dataset.count);
    }
});

startQuizBtn.addEventListener('click', () => {
    quizState.isReviewMode = false;
    startQuiz();
});
startReviewBtn.addEventListener('click', () => {
    quizState.isReviewMode = true;
    startQuiz();
});
hintBtn.addEventListener('click', handleHint);
quitQuizBtn.addEventListener('click', () => {
    if (confirm("クイズを中断してホームに戻りますか？")) {
        quizScreen.classList.remove('active');
        homeScreen.classList.add('active');
        updateUI(); // ホームに戻るときにUIを更新
    }
});
closeResultBtn.addEventListener('click', () => {
    resultModal.style.display = 'none';
    homeScreen.classList.add('active');
    updateUI();
});


// --- 初期化 ---
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    // 初期選択状態を設定
    document.querySelector('.q-count-btn[data-count="20"]').classList.add('selected');
    document.querySelector('.field-btn[data-field="all"]').classList.add('selected');
    updateUI();
    init();
});