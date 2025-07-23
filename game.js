// --- 初期化 ---
document.addEventListener('DOMContentLoaded', () => {
    const game = new NekoAtsumeGame();
    game.init();
});

// --- ゲームクラス ---
class NekoAtsumeGame {
    constructor() {
        // DOM要素のキャッシュ
        this.dom = {
            screens: document.querySelectorAll('.screen'),
            homeScreen: document.getElementById('home-screen'),
            quizScreen: document.getElementById('quiz-screen'),
            gardenScreen: document.getElementById('garden-screen'),
            encyclopediaScreen: document.getElementById('encyclopedia-screen'),
            fieldButtons: document.getElementById('field-buttons'),
            startQuizBtn: document.getElementById('start-quiz-btn'),
            navButtons: document.querySelectorAll('.nav-btn'),
            quizProgress: document.getElementById('quiz-progress'),
            questionDiv: document.getElementById('question'),
            answerChoicesDiv: document.getElementById('answer-choices'),
            gardenArea: document.getElementById('garden-area'),
            inventoryArea: document.getElementById('inventory-area'),
            catGrid: document.getElementById('cat-grid'),
            resultModal: document.getElementById('result-modal'),
            resultMessage: document.getElementById('result-message'),
            resultItemArea: document.getElementById('result-item-area'),
            closeResultBtn: document.getElementById('close-result-btn'),
        };

        // サウンドの読み込み
        this.sounds = {
            correct: new Audio('sounds/correct.mp3'),
            wrong: new Audio('sounds/wrong.mp3'),
            getCoin: new Audio('sounds/get_coin.mp3'), // ※今回はアイテム獲得に使用
            getItem: new Audio('sounds/get_item.mp3'),
            meow: [new Audio('sounds/cat_meow1.mp3'), new Audio('sounds/cat_meow2.mp3'), new Audio('sounds/cat_meow3.mp3')],
            bgm: new Audio('sounds/thinking.mp3'),
            bgm_sp: new Audio('sounds/thinkingtime_sp.mp3')
        };
        this.sounds.bgm.loop = true;
        this.sounds.bgm_sp.loop = true;

        // ゲームの状態
        this.state = {};
        this.quizState = {};
    }

    init() {
        this.loadState();
        this.setupEventListeners();
        this.navigateTo('home-screen');
    }

    loadState() {
        const savedState = localStorage.getItem('nekoAtsumeGameState');
        if (savedState) {
            this.state = JSON.parse(savedState);
        } else {
            this.state = {
                inventory: { "item001": 1 }, // 初期アイテム
                placedItems: { "0": null, "1": null },
                discoveredCats: {},
            };
        }
    }

    saveState() {
        localStorage.setItem('nekoAtsumeGameState', JSON.stringify(this.state));
    }

    setupEventListeners() {
        this.dom.navButtons.forEach(btn => {
            btn.addEventListener('click', () => this.navigateTo(btn.dataset.target));
        });
        this.dom.startQuizBtn.addEventListener('click', () => this.startQuiz());
        this.dom.closeResultBtn.addEventListener('click', () => {
            this.dom.resultModal.style.display = 'none';
            this.navigateTo('home-screen');
        });
        this.dom.fieldButtons.addEventListener('click', e => {
            if(e.target.classList.contains('field-btn')){
                this.dom.fieldButtons.querySelector('.selected').classList.remove('selected');
                e.target.classList.add('selected');
            }
        });
    }

    navigateTo(screenId) {
        this.sounds.bgm.pause();
        this.sounds.bgm_sp.pause();

        this.dom.screens.forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');

        if (screenId === 'home-screen') this.sounds.bgm.play().catch(()=>{});
        if (screenId === 'quiz-screen') this.sounds.bgm_sp.play().catch(()=>{});
        if (screenId === 'garden-screen') {
            this.sounds.bgm.play().catch(()=>{});
            this.checkCatArrival();
            this.renderGarden();
            this.renderInventory();
        }
        if (screenId === 'encyclopedia-screen') {
            this.renderEncyclopedia();
        }
    }

    // --- クイズ関連 ---
    startQuiz() {
        const field = this.dom.fieldButtons.querySelector('.selected').dataset.field;
        let problemSet = [];
        if (field === 'all') {
            problemSet = Object.values(allProblemSets.science.data).flat();
        } else {
            problemSet = allProblemSets.science.data[field];
        }
        this.quizState = {
            problems: problemSet.sort(() => 0.5 - Math.random()).slice(0, 10),
            currentIndex: 0,
            correctCount: 0,
        };
        this.navigateTo('quiz-screen');
        this.displayQuestion();
    }

    displayQuestion() {
        const q = this.quizState.problems[this.quizState.currentIndex];
        this.dom.quizProgress.textContent = `問題 ${this.quizState.currentIndex + 1} / ${this.quizState.problems.length}`;
        this.dom.questionDiv.textContent = q.q;
        this.dom.answerChoicesDiv.innerHTML = '';
        [q.a, ...q.d].sort(() => 0.5 - Math.random()).forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = choice;
            btn.onclick = () => this.selectAnswer(btn, choice === q.a);
            this.dom.answerChoicesDiv.appendChild(btn);
        });
    }

    selectAnswer(button, isCorrect) {
        this.dom.answerChoicesDiv.querySelectorAll('.choice-btn').forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === this.quizState.problems[this.quizState.currentIndex].a) {
                btn.classList.add('correct');
            }
        });
        if (isCorrect) {
            this.sounds.correct.play();
            this.quizState.correctCount++;
        } else {
            this.sounds.wrong.play();
            button.classList.add('wrong');
        }
        setTimeout(() => {
            this.quizState.currentIndex++;
            if (this.quizState.currentIndex < this.quizState.problems.length) {
                this.displayQuestion();
            } else {
                this.showResults();
            }
        }, 1200);
    }
    
    showResults() {
        this.dom.resultMessage.textContent = `${this.quizState.problems.length}問中 ${this.quizState.correctCount}問 正解！`;
        
        // アイテム獲得ロジック
        let gotItem = null;
        if (this.quizState.correctCount >= 5) {
            this.sounds.getItem.play();
            const itemIds = Object.keys(ITEM_DATA);
            gotItem = itemIds[Math.floor(Math.random() * itemIds.length)];
            this.state.inventory[gotItem] = (this.state.inventory[gotItem] || 0) + 1;
            this.dom.resultItemArea.innerHTML = `<p>ごほうび：<strong>${ITEM_DATA[gotItem].name}</strong> を手に入れた！</p>`;
        } else {
            this.dom.resultItemArea.innerHTML = `<p>ごほうびゲットならず…！</p>`;
        }
        
        this.saveState();
        this.dom.resultModal.style.display = 'flex';
    }

    // --- お庭・図鑑関連 ---
    renderGarden() {
        this.dom.gardenArea.querySelectorAll('.garden-slot').forEach(slot => {
            const slotIndex = slot.dataset.slot;
            const itemId = this.state.placedItems[slotIndex];
            slot.innerHTML = ''; // クリア
            if (itemId) {
                const itemImg = document.createElement('img');
                // 仮の画像パス。後で実際の画像に差し替える
                itemImg.src = `images/${itemId}.png`; 
                itemImg.style.width = '60%';
                slot.appendChild(itemImg);
                
                // 猫の表示
                const visitingCatId = this.state.visitingCats[slotIndex];
                if(visitingCatId){
                    const catImg = document.createElement('img');
                    catImg.src = `images/${visitingCatId}.png`;
                    catImg.className = 'cat-in-slot';
                    slot.appendChild(catImg);
                }

            } else {
                slot.innerHTML = '<span class="slot-text">アイテムを置く</span>';
            }
        });
    }

    renderInventory() {
        this.dom.inventoryArea.innerHTML = '';
        for (const itemId in this.state.inventory) {
            if (this.state.inventory[itemId] > 0) {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'inventory-item';
                itemDiv.textContent = `${ITEM_DATA[itemId].name} x${this.state.inventory[itemId]}`;
                // TODO: ドラッグ＆ドロップでアイテムを設置する機能を追加
                this.dom.inventoryArea.appendChild(itemDiv);
            }
        }
    }
    
    renderEncyclopedia() {
        this.dom.catGrid.innerHTML = '';
        for (const catId in CAT_DATA) {
            const cat = CAT_DATA[catId];
            const card = document.createElement('div');
            card.className = 'cat-card';
            const discovered = this.state.discoveredCats[catId];
            if (discovered) {
                card.innerHTML = `
                    <div class="cat-card-img"><img src="images/${catId}.png" style="width:100%;"></div>
                    <div class="cat-card-name">${cat.name}</div>
                `;
            } else {
                card.classList.add('locked');
                card.innerHTML = `
                    <div class="cat-card-img">？</div>
                    <div class="cat-card-name">？？？？</div>
                `;
            }
            this.dom.catGrid.appendChild(card);
        }
    }

    checkCatArrival() {
        this.state.visitingCats = {}; // 来ている猫をリセット
        const placedItemIds = Object.values(this.state.placedItems).filter(id => id);
        
        if (placedItemIds.length === 0) return;

        for (const catId in CAT_DATA) {
            const cat = CAT_DATA[catId];
            const canAppear = cat.needs.length === 0 || cat.needs.some(neededItem => placedItemIds.includes(neededItem));
            
            if (canAppear) {
                // 各アイテムの魅力度に基づいて出現確率を計算
                const attractSum = placedItemIds.reduce((sum, itemId) => sum + ITEM_DATA[itemId].attract_level, 0);
                const chance = (attractSum / (cat.rarity * 10)) * 0.1; // 出現率を調整
                
                if (Math.random() < chance) {
                    // 猫が出現！
                    const emptySlot = Object.keys(this.state.placedItems).find(slot => this.state.placedItems[slot] && !this.state.visitingCats[slot]);
                    if(emptySlot){
                        this.state.visitingCats[emptySlot] = catId;
                        if (!this.state.discoveredCats[catId]) {
                            this.sounds.meow[Math.floor(Math.random() * this.sounds.meow.length)].play();
                            this.state.discoveredCats[catId] = true;
                            // TODO: 「新しい猫が来ました！」という通知を出す
                        }
                    }
                }
            }
        }
        this.saveState();
    }
}