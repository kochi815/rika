// --- 初期化 ---
document.addEventListener('DOMContentLoaded', () => {
    // グローバルにアクセスできるよう、gameインスタンスをwindowに格納
    window.game = new NekoAtsumeGame();
    window.game.init();
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
            quitQuizBtn: document.getElementById('quit-quiz-btn') // quitQuizBtnもキャッシュする
        };

        // サウンドの読み込み
        this.sounds = {
            correct: new Audio('sounds/correct.mp3'),
            wrong: new Audio('sounds/wrong.mp3'),
            getCoin: new Audio('sounds/get_coin.mp3'),
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
            // visitingCatsは保存しないので、毎回リセット
            this.state.visitingCats = {}; 
        } else {
            this.state = {
                inventory: { "item001": 1 }, // 初期アイテム
                placedItems: { "0": null, "1": null },
                discoveredCats: {},
                visitingCats: {} // 庭に来ている猫の状態
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
                if(this.dom.fieldButtons.querySelector('.selected')) {
                    this.dom.fieldButtons.querySelector('.selected').classList.remove('selected');
                }
                e.target.classList.add('selected');
            }
        });
        this.dom.gardenArea.addEventListener('click', e => {
            if(e.target.classList.contains('garden-slot')){
                this.removeItemFromGarden(e.target.dataset.slot);
            }
        });
         this.dom.quitQuizBtn.addEventListener('click', () => {
             if (confirm("クイズを中断してホームに戻りますか？")) {
                this.navigateTo('home-screen');
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
        const selectedFieldBtn = this.dom.fieldButtons.querySelector('.selected');
        if(!selectedFieldBtn) {
            alert('分野を選択してください。');
            return;
        }
        const field = selectedFieldBtn.dataset.field;
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
        if(this.quizState.currentIndex >= this.quizState.problems.length) return;
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
        
        let gotItem = null;
        if (this.quizState.correctCount >= 5) {
            this.sounds.getItem.play();
            const itemIds = Object.keys(ITEM_DATA);
            gotItem = itemIds[Math.floor(Math.random() * itemIds.length)];
            this.state.inventory[gotItem] = (this.state.inventory[gotItem] || 0) + 1;
            this.dom.resultItemArea.innerHTML = `<p>ごほうび：<strong>${ITEM_DATA[gotItem].name}</strong> を手に入れた！</p>`;
        } else {
            this.dom.resultItemArea.innerHTML = `<p>ごほうびゲットならず…！(5問以上の正解でゲット)</p>`;
        }
        
        this.saveState();
        this.dom.resultModal.style.display = 'flex';
    }

    // --- お庭・図鑑関連 ---
    renderGarden() {
        this.dom.gardenArea.querySelectorAll('.garden-slot').forEach(slot => {
            const slotIndex = slot.dataset.slot;
            const itemId = this.state.placedItems[slotIndex];
            slot.innerHTML = '';
            slot.style.backgroundImage = '';

            const visitingCatId = this.state.visitingCats[slotIndex];
            if (visitingCatId) {
                const catImg = document.createElement('img');
                catImg.src = `images/${visitingCatId}.png`;
                catImg.className = 'cat-in-slot';
                catImg.title = CAT_DATA[visitingCatId].name;
                slot.appendChild(catImg);
            }

            if (itemId) {
                const itemImg = document.createElement('div');
                itemImg.style.backgroundImage = `url(images/${itemId}.png)`;
                itemImg.style.width = '60%';
                itemImg.style.height = '60%';
                itemImg.style.backgroundSize = 'contain';
                itemImg.style.backgroundRepeat = 'no-repeat';
                itemImg.style.backgroundPosition = 'center';
                itemImg.title = ITEM_DATA[itemId].name + ' (クリックで片付ける)';
                slot.appendChild(itemImg);
            } else if (!visitingCatId) {
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
                itemDiv.style.backgroundImage = `url(images/${itemId}.png)`;
                itemDiv.onclick = () => this.placeItem(itemId);
                this.dom.inventoryArea.appendChild(itemDiv);
            }
        }
    }
    
    placeItem(itemId) {
        const emptySlotIndex = Object.keys(this.state.placedItems).find(slot => this.state.placedItems[slot] === null);
        if (emptySlotIndex !== undefined) {
            this.state.inventory[itemId]--;
            this.state.placedItems[emptySlotIndex] = itemId;
            this.sounds.getCoin.play();
            this.checkCatArrival();
            this.renderGarden();
            this.renderInventory();
            this.saveState();
        } else {
            alert("お庭にアイテムを置くスペースがありません。");
        }
    }

    removeItemFromGarden(slotIndex) {
        const itemId = this.state.placedItems[slotIndex];
        if (itemId) {
            this.state.placedItems[slotIndex] = null;
            this.state.inventory[itemId]++;
            this.state.visitingCats[slotIndex] = null; // 猫も一緒にいなくなる
            this.renderGarden();
            this.renderInventory();
            this.saveState();
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
        this.state.visitingCats = {};
        const placedItemIds = Object.values(this.state.placedItems).filter(id => id);
        
        if (placedItemIds.length === 0) return;

        Object.keys(this.state.placedItems).forEach(slotIndex => {
            const itemId = this.state.placedItems[slotIndex];
            if (!itemId) return;

            const potentialCats = Object.keys(CAT_DATA).filter(catId => {
                const cat = CAT_DATA[catId];
                return cat.needs.length === 0 || cat.needs.includes(itemId);
            });
            
            if (potentialCats.length > 0) {
                const chance = (ITEM_DATA[itemId].attract_level / 10) * 0.5; // 出現率を調整
                if (Math.random() < chance) {
                    const catId = potentialCats[Math.floor(Math.random() * potentialCats.length)];
                    this.state.visitingCats[slotIndex] = catId;
                    if (!this.state.discoveredCats[catId]) {
                        this.sounds.meow[Math.floor(Math.random() * this.sounds.meow.length)].play();
                        this.state.discoveredCats[catId] = true;
                        setTimeout(() => alert(`新しいねこ「${CAT_DATA[catId].name}」が遊びに来ました！`), 500);
                    }
                }
            }
        });
        this.saveState();
    }
}