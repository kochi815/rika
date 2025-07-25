// game.js の全体コード（改善提案を反映した最新版）
document.addEventListener('DOMContentLoaded', () => {
    new NekoAtsumeGame().init();
});

class NekoAtsumeGame {
    constructor() {
        this.dom = {
            screens: document.querySelectorAll('.screen'),
            homeScreen: document.getElementById('home-screen'),
            quizScreen: document.getElementById('quiz-screen'),
            gardenScreen: document.getElementById('garden-screen'),
            encyclopediaScreen: document.getElementById('encyclopedia-screen'),
            shopScreen: document.getElementById('shop-screen'),
            fieldButtonsContainer: document.getElementById('field-buttons'),
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
            shopItemGrid: document.getElementById('shop-item-grid'),
            coinTotal: document.getElementById('coin-total')
        };

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
        const defaultState = {
            coins: 0,
            inventory: { "item001": 1 },
            placedItems: { "0": null, "1": null },
            discoveredCats: {},
            visitingCats: {},
            selectedField: 'all'
        };
        this.state = savedState ? Object.assign({}, defaultState, JSON.parse(savedState)) : defaultState;
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

        this.dom.fieldButtonsContainer.addEventListener('click', e => {
            const target = e.target.closest('.field-btn');
            if (target) {
                this.state.selectedField = target.dataset.field;
                this.updateFieldButtonsUI();
            }
        });

        this.dom.gardenArea.addEventListener('click', e => {
            const slot = e.target.closest('.garden-slot');
            if (slot) this.removeItemFromGarden(slot.dataset.slot);
        });

        this.dom.inventoryArea.addEventListener('click', e => {
            const target = e.target.closest('.inventory-item');
            if (target?.dataset.itemId) this.placeItem(target.dataset.itemId);
        });

        this.dom.quitQuizBtn.addEventListener('click', () => {
            if (confirm("クイズを中断してホームに戻りますか？")) {
                this.navigateTo('home-screen');
            }
        });
    }

    // --- UI更新用の関数 ---
    updatePlayerStatus() {
        this.dom.coinTotal.textContent = this.state.coins;
        // 今後、経験値など他の表示が増えたらここに追加できる
    }

    updateFieldButtonsUI() {
        this.dom.fieldButtonsContainer.querySelectorAll('.field-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.field === this.state.selectedField);
        });
    }

    // --- 画面遷移 ---
    navigateTo(screenId) {
        this.sounds.bgm.pause();
        this.sounds.bgm_sp.pause();

        this.dom.screens.forEach(s => s.classList.remove('active'));
        document.getElementById(screenId)?.classList.add('active');

        this.updatePlayerStatus(); // UI更新用の共通関数を呼ぶ

        switch (screenId) {
            case 'home-screen':
                this.sounds.bgm.play().catch(() => {});
                this.updateFieldButtonsUI();
                break;
            case 'quiz-screen':
                this.sounds.bgm_sp.play().catch(() => {});
                break;
            case 'garden-screen':
                this.sounds.bgm.play().catch(() => {});
                this.checkCatArrival();
                this.renderGarden();
                this.renderInventory();
                break;
            case 'encyclopedia-screen':
                this.renderEncyclopedia();
                break;
            case 'shop-screen':
                this.renderShop();
                break;
        }
    }

    // --- クイズ関連 ---
    startQuiz() {
        const field = this.state.selectedField;
        if (!field) {
            alert('分野を選択してください。');
            return;
        }
        const problemSet = (field === 'all')
            ? Object.values(allProblemSets.science.data).flat()
            : allProblemSets.science.data[field];

        if (!problemSet || problemSet.length === 0) {
            alert('この分野の問題はまだ準備中です！');
            return;
        }

        this.quizState = {
            problems: [...problemSet].sort(() => 0.5 - Math.random()).slice(0, 10),
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
        let earnedCoins = 0;
        if (this.quizState.correctCount === 10) earnedCoins = 6;
        else if (this.quizState.correctCount >= 8) earnedCoins = 3;
        else if (this.quizState.correctCount >= 6) earnedCoins = 1;

        this.dom.resultMessage.textContent = `${this.quizState.problems.length}問中 ${this.quizState.correctCount}問 正解！`;

        if (earnedCoins > 0) {
            this.sounds.getCoin.play();
            this.state.coins += earnedCoins;
            this.dom.resultItemArea.innerHTML = `<p>ごほうび：<strong>${earnedCoins}コイン</strong> を手に入れた！</p>`;
        } else {
            this.dom.resultItemArea.innerHTML = `<p>ごほうびゲットならず…！(6問以上の正解でゲット)</p>`;
        }
        
        this.updatePlayerStatus(); // コインが増えたのでUIを更新
        this.saveState();
        this.dom.resultModal.style.display = 'flex';
    }

    // --- ショップ関連 ---
    renderShop() {
        this.dom.shopItemGrid.innerHTML = '';
        for (const [itemId, item] of Object.entries(ITEM_DATA)) {
            const card = document.createElement('div');
            card.className = 'shop-item';
            card.innerHTML = `
                <div class="shop-item-img" style="background-image: url('images/${itemId}.png')"></div>
                <div class="shop-item-name">${item.name}</div>
                <p class="shop-item-desc">${item.description}</p>
                <div class="shop-item-price">${item.price} 🪙</div>
                <button class="buy-btn" data-item-id="${itemId}" ${this.state.coins < item.price ? 'disabled' : ''}>買う</button>
            `;
            card.querySelector('.buy-btn').onclick = () => this.buyItem(itemId);
            this.dom.shopItemGrid.appendChild(card);
        }
    }

    buyItem(itemId) {
        const itemPrice = ITEM_DATA[itemId].price;
        if (this.state.coins >= itemPrice) {
            this.state.coins -= itemPrice;
            this.state.inventory[itemId] = (this.state.inventory[itemId] || 0) + 1;
            this.sounds.getItem.play();
            alert(`${ITEM_DATA[itemId].name} を購入しました！`);
            this.updatePlayerStatus(); // コインが減ったのでUIを更新
            this.saveState();
            this.renderShop();
        } else {
            alert("コインが足りません！");
        }
    }

    // --- お庭・図鑑関連 ---
    renderGarden() {
        this.dom.gardenArea.querySelectorAll('.garden-slot').forEach(slot => {
            const slotIndex = slot.dataset.slot;
            const itemId = this.state.placedItems[slotIndex];
            const visitingCatId = this.state.visitingCats[slotIndex];
            slot.innerHTML = '';

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
                itemDiv.title = `${ITEM_DATA[itemId].name} (クリックで片付ける)`;
                slot.appendChild(itemDiv);
            } else if (!visitingCatId) {
                slot.innerHTML = '<span class="slot-text">アイテムを置く</span>';
            }
        });
    }

    renderInventory() {
        this.dom.inventoryArea.innerHTML = '';
        for (const [itemId, count] of Object.entries(this.state.inventory)) {
            if (count > 0) {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'inventory-item';
                itemDiv.textContent = `x${count}`;
                itemDiv.style.backgroundImage = `url(images/${itemId}.png)`;
                itemDiv.title = ITEM_DATA[itemId].name;
                itemDiv.dataset.itemId = itemId;
                this.dom.inventoryArea.appendChild(itemDiv);
            }
        }
    }
    
    placeItem(itemId) {
        const emptySlotIndex = Object.keys(this.state.placedItems).find(slot => this.state.placedItems[slot] === null);
        if (emptySlotIndex === undefined) {
            alert("お庭にアイテムを置くスペースがありません。");
            return;
        }

        this.state.inventory[itemId]--;
        this.state.placedItems[emptySlotIndex] = itemId;
        this.sounds.getCoin.play();
        this.checkCatArrival();
        this.renderGarden();
        this.renderInventory();
        this.saveState();
    }

    removeItemFromGarden(slotIndex) {
        const itemId = this.state.placedItems[slotIndex];
        if (itemId) {
            this.state.placedItems[slotIndex] = null;
            this.state.inventory[itemId]++;
            this.checkCatArrival();
            this.renderGarden();
            this.renderInventory();
            this.saveState();
        }
    }

    renderEncyclopedia() {
        this.dom.catGrid.innerHTML = '';
        for (const [catId, cat] of Object.entries(CAT_DATA)) {
            const card = document.createElement('div');
            card.className = 'cat-card';
            const discovered = this.state.discoveredCats[catId];
            card.classList.toggle('locked', !discovered);

            if (discovered) {
                card.innerHTML = `
                    <div class="cat-card-img"><img src="images/${catId}.png" style="width:100%;"></div>
                    <div class="cat-card-name">${cat.name}</div>
                `;
            } else {
                card.innerHTML = `
                    <div class="cat-card-img">？</div>
                    <div class.cat-card-name>？？？？</div>
                `;
            }
            this.dom.catGrid.appendChild(card);
        }
    }

    checkCatArrival() {
        // アイテムが置かれていないスロットにいる猫は帰る
        for (const slotIndex in this.state.visitingCats) {
            const catId = this.state.visitingCats[slotIndex];
            if (!catId) continue;
            
            const placedItemId = this.state.placedItems[slotIndex];
            const catNeeds = CAT_DATA[catId].needs;
            if (!placedItemId || (catNeeds.length > 0 && !catNeeds.includes(placedItemId))) {
                this.state.visitingCats[slotIndex] = null;
            }
        }

        // アイテムが置かれている空きスロットに、新しい猫が来るか判定
        Object.keys(this.state.placedItems).forEach(slotIndex => {
            const itemId = this.state.placedItems[slotIndex];
            if (itemId && !this.state.visitingCats[slotIndex]) {
                const potentialCats = Object.keys(CAT_DATA).filter(catId => {
                    const cat = CAT_DATA[catId];
                    return cat.needs.length === 0 || cat.needs.includes(itemId);
                });
                
                if (potentialCats.length > 0 && Math.random() < (ITEM_DATA[itemId].attract_level / 10) * 0.5) {
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