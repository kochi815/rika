// --- 初期化 ---
document.addEventListener('DOMContentLoaded', () => {
    // ゲームのインスタンスを作成して初期化
    new NekoAtsumeGame().init();
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
            shopScreen: document.getElementById('shop-screen'), // ショップ画面を追加
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
            quitQuizBtn: document.getElementById('quit-quiz-btn'),
            shopItemGrid: document.getElementById('shop-item-grid'), // ショップのアイテムグリッド
            coinTotal: document.getElementById('coin-total') // コイン表示エリア
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
            this.state.visitingCats = {}; // visitingCatsは保存しないので、毎回リセット
        } else {
            // 新規プレイヤーの初期状態
            this.state = {
                coins: 0, // コインを追加
                inventory: { "item001": 1 },
                placedItems: { "0": null, "1": null },
                discoveredCats: {},
                visitingCats: {}
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
            if (e.target.classList.contains('field-btn')) {
                if (this.dom.fieldButtons.querySelector('.selected')) {
                    this.dom.fieldButtons.querySelector('.selected').classList.remove('selected');
                }
                e.target.classList.add('selected');
            }
        });
        // ★アイテム撤去のロジックを改善
        this.dom.gardenArea.addEventListener('click', e => {
            const slot = e.target.closest('.garden-slot'); // クリックした場所から一番近いスロットを探す
            if (slot) {
                this.removeItemFromGarden(slot.dataset.slot);
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
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }

        if (screenId === 'home-screen') {
            this.sounds.bgm.play().catch(() => {});
            this.dom.coinTotal.textContent = this.state.coins; // コイン数を更新
        }
        if (screenId === 'quiz-screen') this.sounds.bgm_sp.play().catch(() => {});
        if (screenId === 'garden-screen') {
            this.sounds.bgm.play().catch(() => {});
            this.checkCatArrival();
            this.renderGarden();
            this.renderInventory();
        }
        if (screenId === 'encyclopedia-screen') {
            this.renderEncyclopedia();
        }
        if (screenId === 'shop-screen') {
            this.renderShop(); // ショップ画面に遷移した時にショップを描画
        }
    }

    // --- クイズ関連 ---
    startQuiz() {
        const selectedFieldBtn = this.dom.fieldButtons.querySelector('.selected');
        if (!selectedFieldBtn) {
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
        if (this.quizState.currentIndex >= this.quizState.problems.length) return;
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
        // ★新しいコイン獲得ルールに変更
        let earnedCoins = 0;
        if (this.quizState.correctCount === 10) earnedCoins = 6;
        else if (this.quizState.correctCount === 9) earnedCoins = 3;
        else if (this.quizState.correctCount === 8) earnedCoins = 1;

        this.dom.resultMessage.textContent = `${this.quizState.problems.length}問中 ${this.quizState.correctCount}問 正解！`;

        if (earnedCoins > 0) {
            this.sounds.getCoin.play();
            this.state.coins += earnedCoins;
            this.dom.resultItemArea.innerHTML = `<p>ごほうび：<strong>${earnedCoins}コイン</strong> を手に入れた！</p>`;
        } else {
            this.dom.resultItemArea.innerHTML = `<p>ごほうびゲットならず…！(8問以上の正解でゲット)</p>`;
        }
        
        this.saveState();
        this.dom.resultModal.style.display = 'flex';
    }

    // --- ショップ関連 (新設) ---
    renderShop() {
        this.dom.shopItemGrid.innerHTML = '';
        for (const itemId in ITEM_DATA) {
            const item = ITEM_DATA[itemId];
            const card = document.createElement('div');
            card.className = 'shop-item';
            card.innerHTML = `
                <div class="shop-item-img" style="background-image: url('images/${itemId}.png')"></div>
                <div class="shop-item-name">${item.name}</div>
                <p class="shop-item-desc">${item.description}</p>
                <div class="shop-item-price">${item.price} 🪙</div>
                <button class="buy-btn" data-item-id="${itemId}" ${this.state.coins < item.price ? 'disabled' : ''}>買う</button>
            `;
            this.dom.shopItemGrid.appendChild(card);
        }
        this.dom.shopItemGrid.querySelectorAll('.buy-btn').forEach(btn => {
            btn.onclick = () => this.buyItem(btn.dataset.itemId);
        });
    }

    buyItem(itemId) {
        const itemPrice = ITEM_DATA[itemId].price;
        if (this.state.coins >= itemPrice) {
            this.state.coins -= itemPrice;
            this.state.inventory[itemId] = (this.state.inventory[itemId] || 0) + 1;
            this.sounds.getItem.play();
            alert(`${ITEM_DATA[itemId].name} を購入しました！`);
            this.saveState();
            this.renderShop(); // ボタンの状態を更新
            this.dom.coinTotal.textContent = this.state.coins;
        } else {
            alert("コインが足りません！");
        }
    }

    // --- お庭・図鑑関連 ---
    renderGarden() {
        this.dom.gardenArea.querySelectorAll('.garden-slot').forEach(slot => {
            const slotIndex = slot.dataset.slot;
            const itemId = this.state.placedItems[slotIndex];
            slot.innerHTML = '';

            const visitingCatId = this.state.visitingCats[slotIndex];
            if (visitingCatId) {
                const catImg = document.createElement('img');
                catImg.src = `images/${visitingCatId}.png`;
                catImg.className = 'cat-in-slot';
                catImg.title = CAT_DATA[visitingCatId].name;
                slot.appendChild(catImg);
            }

            if (itemId) {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'item-in-slot';
                itemDiv.style.backgroundImage = `url(images/${itemId}.png)`;
                itemDiv.title = ITEM_DATA[itemId].name + ' (クリックで片付ける)';
                slot.appendChild(itemDiv);
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
                itemDiv.textContent = `x${this.state.inventory[itemId]}`;
                itemDiv.style.backgroundImage = `url(images/${itemId}.png)`;
                itemDiv.title = ITEM_DATA[itemId].name;
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
            this.state.visitingCats[slotIndex] = null;
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
                const chance = (ITEM_DATA[itemId].attract_level / 10) * 0.5;
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