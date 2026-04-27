let gameTimer, startTime, currentNumber, totalNumbers, gameMode, currentLevel;
const commonCounts = [0, 16, 20, 25, 30, 36, 42, 49, 56, 64, 72];

function toTitle() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-title').classList.add('active');
    clearInterval(gameTimer);
}

function showLevels(mode) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-level').classList.add('active');
    document.getElementById('level-mode-title').textContent = mode + " MODE";
    
    const container = document.getElementById('lv-buttons');
    container.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
        const btn = document.createElement('button');
        btn.className = 'lv-btn';
        btn.textContent = 'Lv ' + i;
        btn.onclick = () => { currentLevel = i; startLevel(mode, i); };
        container.appendChild(btn);
    }
}

function startLevel(mode, level) {
    gameMode = mode;
    totalNumbers = commonCounts[level];
    currentNumber = 1;
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-game').classList.add('active');
    document.getElementById('timer').textContent = '0.00';
    setupBoard(totalNumbers);
}

function setupBoard(numbers) {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    const cols = Math.ceil(Math.sqrt(numbers));
    
    const boardWidth = Math.min(window.innerWidth - 60, 500);
    const btnSize = Math.floor((boardWidth - (cols * 12)) / cols);
    const finalSize = Math.max(Math.min(btnSize, 60), 40);

    board.style.display = 'grid';
    board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    board.style.gap = '10px';
    board.style.width = 'fit-content';
    board.style.margin = '0 auto';

    const nums = Array.from({length: numbers}, (_, i) => i + 1).sort(() => Math.random() - 0.5);

    nums.forEach(num => {
        const btn = document.createElement('div');
        btn.className = 'number-btn';
        btn.style.width = finalSize + 'px';
        btn.style.height = finalSize + 'px';
        btn.style.fontSize = (finalSize * 0.45) + 'px';
        btn.style.position = 'relative';

        if ([6, 9, 66, 69].includes(num)) {
            btn.style.textDecoration = 'underline';
            btn.style.textUnderlineOffset = '3px';
        }
        btn.textContent = num;

        if (gameMode === 'HARD') {
            const rot = Math.floor(Math.random() * 4) * 90;
            const off = finalSize * 0.5; 
            const offX = Math.random() * off * 2 - off;
            const offY = Math.random() * off * 2 - off;
            
            btn.style.transform = `rotate(${rot}deg) translate(${offX}px, ${offY}px)`;
            
            // --- 重なり順のロジック修正 ---
            // zIndex を「最大数 - 自分の数字」にすることで、
            // 若い数字（1, 2, 3...）ほど手前に、大きい数字ほど奥になります。
            btn.style.zIndex = totalNumbers - num;
        }

        btn.onclick = () => {
            if (num === currentNumber) {
                if (currentNumber === 1) { startTime = Date.now(); startTimer(); }
                btn.classList.add('clicked');
                if (currentNumber++ >= totalNumbers) endGame();
            }
        };
        board.appendChild(btn);
    });
}

function startTimer() {
    clearInterval(gameTimer);
    gameTimer = setInterval(() => {
        document.getElementById('timer').textContent = ((Date.now() - startTime) / 1000).toFixed(2);
    }, 10);
}

function endGame() {
    clearInterval(gameTimer);
    document.getElementById('res-time').textContent = document.getElementById('timer').textContent;
    document.getElementById('res-lv').textContent = currentLevel;
    document.getElementById('screen-result').classList.add('active');
}

function resNext() {
    document.getElementById('screen-result').classList.remove('active');
    if (currentLevel < 10) startLevel(gameMode, ++currentLevel);
    else toTitle();
}

function resRetry() {
    document.getElementById('screen-result').classList.remove('active');
    startLevel(gameMode, currentLevel);
}

toTitle();