let gameTimer, startTime, currentNumber, totalNumbers, gameMode, currentLevel;
let penaltyCount = 0;
const commonCounts = [0, 16, 20, 25, 30, 36, 42, 49, 56, 64, 72];

// --- 音響システム（AudioContext） ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    // 指数減衰させて「ポフッ」とした柔らかい余韻を作る
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

const sounds = {
    // 【調整】柔らかく耳に馴染む「ド」の音
    click: () => playTone(523.25, 'sine', 0.08), 
    // クリア時のファンファーレ
    clear: () => {
        playTone(523.25, 'sine', 0.2); 
        setTimeout(() => playTone(659.25, 'sine', 0.2), 100);
        setTimeout(() => playTone(783.99, 'sine', 0.4), 200);
    },
    // ボタン選択時の軽い音
    select: () => playTone(440, 'triangle', 0.05)
};

function toTitle() {
    sounds.select();
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-title').classList.add('active');
    clearInterval(gameTimer);
}

function showLevels(mode) {
    sounds.select();
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
    sounds.select();
    gameMode = mode;
    totalNumbers = commonCounts[level];
    currentNumber = 1;
    penaltyCount = 0;
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
            // 若い数字を常に一番手前に表示
            btn.style.zIndex = totalNumbers - num;
        }

        btn.onpointerdown = (e) => {
            if (num === currentNumber) {
                sounds.click();
                if (currentNumber === 1) { startTime = Date.now(); startTimer(); }
                btn.classList.add('clicked');
                if (currentNumber++ >= totalNumbers) endGame();
            } else if (!btn.classList.contains('clicked')) {
                // HARDモード：音は鳴らさず、ペナルティとタイマー文字色変化のみ
                if (gameMode === 'HARD') {
                    penaltyCount++;
                    showPenaltyEffect();
                }
            }
        };
        board.appendChild(btn);
    });
}

function showPenaltyEffect() {
    const timerEl = document.getElementById('timer');
    timerEl.style.color = 'red';
    setTimeout(() => { timerEl.style.color = '#ffcc00'; }, 200);
}

function startTimer() {
    clearInterval(gameTimer);
    gameTimer = setInterval(() => {
        let elapsed = (Date.now() - startTime) / 1000;
        let totalTime = elapsed + (penaltyCount * 0.5);
        document.getElementById('timer').textContent = totalTime.toFixed(2);
    }, 10);
}

function endGame() {
    clearInterval(gameTimer);
    sounds.clear();
    document.getElementById('res-time').textContent = document.getElementById('timer').textContent;
    document.getElementById('res-lv').textContent = currentLevel;
    document.getElementById('screen-result').classList.add('active');
}

function resNext() {
    sounds.select();
    document.getElementById('screen-result').classList.remove('active');
    if (currentLevel < 10) startLevel(gameMode, ++currentLevel);
    else toTitle();
}

function resRetry() {
    sounds.select();
    document.getElementById('screen-result').classList.remove('active');
    startLevel(gameMode, currentLevel);
}

toTitle();