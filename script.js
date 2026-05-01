let gameTimer, startTime, currentNumber, totalNumbers, gameMode, currentLevel;
let penaltyCount = 0;
let isPenaltyEffectActive = false;
const commonCounts = [0, 16, 20, 25, 30, 36, 42, 49, 56, 64, 72];

// --- 音響システム ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

const sounds = {
    click: () => playTone(523.25, 'sine', 0.08), 
    clear: () => {
        playTone(523.25, 'sine', 0.2); 
        setTimeout(() => playTone(659.25, 'sine', 0.2), 100);
        setTimeout(() => playTone(783.99, 'sine', 0.4), 200);
    },
    select: () => playTone(440, 'triangle', 0.05)
};

// --- 言語切り替えロジック ---
function toggleLanguage() {
    const ja = document.getElementById('info-ja');
    const en = document.getElementById('info-en');
    if (ja.style.display === 'none') {
        ja.style.display = 'block';
        en.style.display = 'none';
    } else {
        ja.style.display = 'none';
        en.style.display = 'block';
    }
    sounds.select();
}

// --- ゲームロジック ---
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function toTitle() {
    sounds.select();
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-title').classList.add('active');
    clearInterval(gameTimer);
    isPenaltyEffectActive = false;
}

function showLevels(mode) {
    sounds.select();
    gameMode = mode;
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-level').classList.add('active');
    document.getElementById('level-mode-title').textContent = mode + " MODE";
    
    const container = document.getElementById('lv-buttons');
    container.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
        const btn = document.createElement('button');
        btn.className = 'lv-btn';
        
        let best = null;
        try {
            best = localStorage.getItem(`best_${gameMode}_${i}`);
        } catch (e) { console.warn("Storage unavailable"); }
        
        const bestDisplay = best ? `<br><span style="font-size:10px; color:#ffcc00;">Best: ${best}s</span>` : "";
        btn.innerHTML = `Lv ${i}${bestDisplay}`;
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
    isPenaltyEffectActive = false;
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-game').classList.add('active');
    document.getElementById('timer').textContent = '0.00';
    document.getElementById('timer').style.color = '#ffcc00';
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

    let nums = shuffle(Array.from({length: numbers}, (_, i) => i + 1));

    nums.forEach(num => {
        const btn = document.createElement('div');
        btn.className = 'number-btn';
        btn.style.width = finalSize + 'px';
        btn.style.height = finalSize + 'px';
        btn.style.fontSize = (finalSize * 0.45) + 'px';
        if ([6, 9, 66, 69].includes(num)) btn.style.textDecoration = 'underline';
        btn.textContent = num;

        if (gameMode === 'HARD') {
            const rot = Math.floor(Math.random() * 4) * 90;
            const maxOffset = (finalSize * 0.3) + (currentLevel * 2);
            const offX = Math.random() * maxOffset * 2 - maxOffset;
            const offY = Math.random() * maxOffset * 2 - maxOffset;
            btn.style.transform = `rotate(${rot}deg) translate(${offX}px, ${offY}px)`;
            btn.style.zIndex = totalNumbers - num;
        }

        btn.onpointerdown = (e) => {
            if (num === currentNumber) {
                sounds.click();
                if (currentNumber === 1) { startTime = Date.now(); startTimer(); }
                btn.classList.add('clicked');
                if (currentNumber++ >= totalNumbers) endGame();
            } else if (!btn.classList.contains('clicked') && gameMode === 'HARD') {
                penaltyCount++;
                showPenaltyEffect();
            }
        };
        board.appendChild(btn);
    });
}

function showPenaltyEffect() {
    if (isPenaltyEffectActive) return;
    isPenaltyEffectActive = true;
    const timerEl = document.getElementById('timer');
    timerEl.style.color = 'red';
    setTimeout(() => {
        timerEl.style.color = '#ffcc00';
        isPenaltyEffectActive = false;
    }, 300);
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
    const finalTime = document.getElementById('timer').textContent;
    
    try {
        const key = `best_${gameMode}_${currentLevel}`;
        const prevBest = localStorage.getItem(key);
        if (!prevBest || parseFloat(finalTime) < parseFloat(prevBest)) {
            localStorage.setItem(key, finalTime);
        }
    } catch (e) { console.warn("Storage failed"); }

    document.getElementById('res-time').textContent = finalTime;
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