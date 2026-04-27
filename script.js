let gameTimer;
let startTime;
let currentNumber;
let totalNumbers;
let gameMode;
let currentLevel;

function toTitle() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-title').classList.add('active');
    clearInterval(gameTimer);
    document.getElementById('timer').textContent = '0.00';
}

function showLevels(mode) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-level').classList.add('active');
    const titleEl = document.getElementById('level-mode-title');
    titleEl.textContent = mode + " MODE";
    
    titleEl.classList.remove('mode-normal', 'mode-hard');
    titleEl.classList.add(mode === 'NORMAL' ? 'mode-normal' : 'mode-hard');

    const container = document.getElementById('lv-buttons');
    container.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
        const btn = document.createElement('button');
        btn.className = 'lv-btn';
        btn.textContent = 'Lv ' + i;
        btn.onclick = function() {
            currentLevel = i;
            mode === 'NORMAL' ? startNormal(i) : startHard(i);
        };
        container.appendChild(btn);
    }
}

/* --- NORMAL: 16枚(4x4)から着実に --- */
function startNormal(level) { 
    currentLevel = level;
    // Lv1:16, Lv2:20, Lv3:25, Lv4:30, Lv5:36, Lv6:42, Lv7:49, Lv8:56, Lv9:64, Lv10:72
    const counts = [0, 16, 20, 25, 30, 36, 42, 49, 56, 64, 72];
    initGame('NORMAL', counts[level]); 
}

/* --- HARD: 25枚(5x5)から一気に難化 --- */
function startHard(level) { 
    currentLevel = level;
    // Lv1:25, Lv2:36, Lv3:49, Lv4:64, Lv5:81, Lv6:100, Lv7:121, Lv8:144, Lv9:169, Lv10:196
    // レベルごとに1辺が1ずつ増える「真の正方形」の増やし方にしました
    const side = level + 4; 
    const counts = side * side;
    initGame('HARD', counts); 
}

function initGame(mode, numbers) {
    gameMode = mode;
    totalNumbers = numbers;
    currentNumber = 1;
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-game').classList.add('active');
    document.getElementById('timer').textContent = '0.00';
    setupBoard(numbers);
}

function setupBoard(numbers) {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    const cols = Math.ceil(Math.sqrt(numbers));
    board.style.display = 'grid';
    board.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
    board.style.gap = '10px';
    board.style.padding = '20px';
    board.style.width = 'fit-content';
    board.style.margin = '0 auto';

    const nums = [];
    for (let i = 1; i <= numbers; i++) nums.push(i);
    for (let i = nums.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = nums[i];
        nums[i] = nums[j];
        nums[j] = temp;
    }

    nums.forEach(num => {
        const btn = document.createElement('div');
        btn.className = 'number-btn';
        btn.style.width = '55px';
        btn.style.height = '55px';
        btn.style.fontSize = '18px';
        btn.textContent = num;
        btn.onclick = function() {
            if (num === currentNumber) {
                if (currentNumber === 1) startTimer();
                btn.classList.add('clicked');
                currentNumber++;
                if (currentNumber > totalNumbers) endGame();
            }
        };
        board.appendChild(btn);
    });
}

function startTimer() {
    startTime = Date.now();
    gameTimer = setInterval(function() {
        const elapsedTime = (Date.now() - startTime) / 1000;
        document.getElementById('timer').textContent = elapsedTime.toFixed(2);
    }, 10);
}

function endGame() {
    clearInterval(gameTimer);
    const finalTime = document.getElementById('timer').textContent;
    
    setTimeout(function() {
        const msg = "クリア！\nタイム: " + finalTime + "秒\n\n次のレベルに進みますか？";
        if (confirm(msg)) {
            if (currentLevel < 10) {
                const nextLv = currentLevel + 1;
                gameMode === 'NORMAL' ? startNormal(nextLv) : startHard(nextLv);
            } else {
                alert("全レベルクリアです！タイトルに戻ります。");
                toTitle();
            }
        } else {
            toTitle();
        }
    }, 300);
}

toTitle();