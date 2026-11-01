// ==================== PLAYER POOL ====================
const AVATARS = [
  'avatar1.png','avatar2.png','avatar3.png','avatar4.png','avatar5.png',
  'avatar6.png','avatar7.png','avatar8.png','avatar9.png','avatar10.png',
  'avatar11.png','avatar12.png','avatar13.png','avatar14.png','avatar15.png',
  'avatar16.png','avatar17.png','avatar18.png','avatar19.png','avatar20.png',
  'avatar21.png','avatar22.png','avatar23.png','avatar24.png','avatar25.png'
];

const NICKNAMES = [
  "exize","VoLGa","24min","seva20022","fuerok","killjet","californication","qullan","6yaka","шампунь mysticl",
  "METEOR","RafRaider","SelfKnowLedge","HELLHOUND","DEFAYLT","GLOW3R","zeyld","samurik","art","DislanD",
  "TheFallenArt","hxrdwell","hoken","lemag1c","grenout","Swatter","ipic","bubbozavr","xstep","VLT",
  "deikun","kifx","minxrka","snovvy","pestxr","zox","nightfury","wydeka","nymeza","XEJLOVARO",
  "qwazare","F5 MANNSER","hope","константин прекрашев","urushi","mulder","H6","elio","sparky","MEYDIX",
  "ХАНТЕР","ХЕРМИТ","nertox","BIGRUS9","vadimus","helldosh","KoZeL","haron","denamo",
  "Look At Me","mettaton ex 25","yumiko","detishkabtw","nepsosqua","GoodKann","LEGASi","RoGoG","looni4","dice_SPB",
  "sasuha","sir","cuk","renhe","nokk","joinger","nice2meetyou","wizzle","besplatny_ponchick","rxw",
  "dr.rock","acez","predator3500","krxde","saint","bermooda","mraziidroga","karl franz","dvoch","spiker",
  "4SVDragon","bxrdxrk","morff","LEGIONER","smoker","vekkgg1337","halfmoon","sweet nothing","abadead","honeymaker",
  "La1ron1337","nildon","agur","sayaora","killerax","STIKS","Voytek","NURICK","undead","VKD",
  "alanyan","rese1ve","felix","NIGALOK","Delsiz","sweetplant","DianaDunaeva","qelia","kimi","NON4ME",
  "derice","DOCK","7sec","santajack","METOX","MILLSTON","terrifero3o","mccormick","seth","lyapota",
  "blaze","DW","improove","kodi","noobasi4","whoam4ik","puperdok","rain4all","formond","ЕЛИСЕЙ",
  "nightfreddygames","tom tryhard","fairythea","nothing","bor34ka","ishidaharuko","ton1uck","resolution","leoneed","supster",
  "staleks","zlody","difference","kacua72","kexit","ANONIW","t4jit","VShtamm","spiro","aiden",
  "k1rzep","Alkxli","Тритрик","Wenord","Faraday","Ferz","Vexor","haorami","ju","Skipach",
  "monroe","Goodkan","Арима","Spiro","dabba","Romeo","aewame","GB","FoKus",
  "Moof","Murrk","axitamy","gryyst","Medilian","Kain1az","Opkafance","Zaka","Pedro","Spitzz",
  "Knightlight","RocketDBD","Dan","Kekso","Xeno","ivn","Kayy","tec","peps","Wispy",
  "Angelz","Jah","Zafis","note","jayden","julian","kenshi","acid","momoseventh","weejason",
  "bucky","gustavo","delof","B4NDIT","mircht","vobbo","tylion","Outer","noah","Ward",
  "V1","PedroHZ","Obii","silhey","Mad05","MX","ratz","freeze","haze",
  "moon","madeira","leonidas","kure","voidz","ruediger"
];

function generatePlayers() {
  const arr = [...NICKNAMES];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.map((name, i) => ({ id: i, name }));
}

// ==================== GAME STATE ====================
let state = {
  avatar1: '',
  avatar2: '',
  name1: '',
  name2: '',
  money1: 20,
  money2: 20,
  team1: [],
  team2: [],
  pool: [],
  firstPlayer: 1,
  currentNominator: 1,
  currentBidder: null,
  nominated: null,
  currentBid: 0,
  bidOwner: null,
  round: 0,
  maxRounds: 10,
  phase: 'nominate'
};

// ==================== UI HELPERS ====================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

function updateRoundDots() {
  const container = document.getElementById('round-dots');
  if (!container) return;
  
  let html = '';
  for (let i = 0; i < state.maxRounds; i++) {
    html += `<div class="round-dot ${i < state.round ? 'filled' : ''}"></div>`;
  }
  container.innerHTML = html;
}

function updateUI() {
  document.getElementById('p1-name').textContent = state.name1;
  document.getElementById('p2-name').textContent = state.name2;
  document.getElementById('p1-money').textContent = state.money1;
  document.getElementById('p2-money').textContent = state.money2;
  document.getElementById('p1-count').textContent = state.team1.length;
  document.getElementById('p2-count').textContent = state.team2.length;
  document.getElementById('team1-title').textContent = state.name1;
  document.getElementById('team2-title').textContent = state.name2;
  document.getElementById('progress').style.width = `${(state.round / state.maxRounds) * 100}%`;

  if (state.avatar1) document.getElementById('p1-avatar').src = state.avatar1;
  if (state.avatar2) document.getElementById('p2-avatar').src = state.avatar2;

  document.getElementById('panel1').classList.toggle('active', state.phase === 'nominate' ? state.currentNominator === 1 : state.currentBidder === 1);
  document.getElementById('panel2').classList.toggle('active', state.phase === 'nominate' ? state.currentNominator === 2 : state.currentBidder === 2);

  renderTeam('team1-players', state.team1);
  renderTeam('team2-players', state.team2);
  updateRoundDots();
}

function renderTeam(containerId, team) {
  const el = document.getElementById(containerId);
  let html = '';
  for (let i = 0; i < 5; i++) {
    if (team[i]) {
      const p = team[i];
      html += `<div class="team-player">
        <span>${p.name}</span>
        <span class="cost">$${p.cost}</span>
      </div>`;
    } else {
      html += `<div class="empty-slot">Слот ${i + 1}</div>`;
    }
  }
  el.innerHTML = html;
}

// ==================== START ====================
function startGame() {
  const n1 = document.getElementById('name1').value.trim() || 'Коуч А';
  const n2 = document.getElementById('name2').value.trim() || 'Коуч Б';
  if (n1 === n2) {
    toast('Имена должны отличаться');
    return;
  }

  const shuffled = [...AVATARS].sort(() => Math.random() - 0.5);
  
  state = {
    avatar1: shuffled[0],
    avatar2: shuffled[1],
    name1: n1,
    name2: n2,
    money1: 20,
    money2: 20,
    team1: [],
    team2: [],
    pool: generatePlayers(),
    firstPlayer: 1,
    currentNominator: 1,
    currentBidder: null,
    nominated: null,
    currentBid: 0,
    bidOwner: null,
    round: 0,
    maxRounds: 10,
    phase: 'nominate'
  };

  const coin = document.getElementById('coin');
  coin.classList.remove('flipping');
  document.querySelector('.coin-front').textContent = '?';
  document.querySelector('.coin-back').textContent = '?';
  
  document.getElementById('coin-result').innerHTML = '<span>Нажми кнопку, чтобы подбросить монетку</span>';
  document.getElementById('btn-flip').style.display = 'inline-flex';
  document.getElementById('btn-flip').disabled = false;
  document.getElementById('btn-start-draft').style.display = 'none';
  
  showScreen('coin');
}

// ==================== COIN FLIP ====================
function flipCoin() {
  const coin = document.getElementById('coin');
  const btn = document.getElementById('btn-flip');
  const resultEl = document.getElementById('coin-result');
  
  btn.disabled = true;
  resultEl.innerHTML = '<span>Крутим...</span>';
  
  coin.classList.remove('flipping');
  void coin.offsetWidth;
  coin.classList.add('flipping');
  
  setTimeout(() => {
    const first = Math.random() < 0.5 ? 1 : 2;
    state.firstPlayer = first;
    state.currentNominator = first;
    
    const winnerName = first === 1 ? state.name1 : state.name2;
    const winnerAvatar = first === 1 ? state.avatar1 : state.avatar2;
    
    document.querySelector('.coin-front').textContent = first === 1 ? '1' : '2';
    document.querySelector('.coin-back').textContent = first === 1 ? '1' : '2';
    
    resultEl.innerHTML = `
      <img src="${winnerAvatar}" class="coin-result-avatar" id="coin-avatar" alt="">
      <span>Первым ходит <strong>${winnerName}</strong></span>
    `;
    
    setTimeout(() => {
      const av = document.getElementById('coin-avatar');
      if (av) av.classList.add('show');
    }, 50);
    
    btn.style.display = 'none';
    document.getElementById('btn-start-draft').style.display = 'inline-flex';
  }, 1400);
}

// ==================== DRAFT ====================
function startDraft() {
  showScreen('draft');
  updateUI();
  setStatus(`${state.currentNominator === 1 ? state.name1 : state.name2} — вытягивай игрока`);
  document.getElementById('bid-controls').style.display = 'none';
  document.getElementById('nomination-controls').style.display = 'block';
  document.getElementById('nominated').innerHTML = '<div class="empty">Нажми «Вытянуть игрока»</div>';
}

function setStatus(msg, isWarning = false) {
  const el = document.getElementById('status-msg');
  el.textContent = msg;
  el.classList.toggle('warning', isWarning);
}

function nominatePlayer() {
  if (state.phase !== 'nominate') return;
  if (state.pool.length === 0) {
    toast('Пул игроков закончился!');
    setTimeout(() => endDraft(), 800);
    return;
  }

  if (state.team1.length >= 5 && state.team2.length >= 5) {
    setTimeout(() => endDraft(), 800);
    return;
  }

  state.nominated = state.pool.shift();
  state.currentBid = 0;
  state.bidOwner = null;
  state.phase = 'bidding';
  state.currentBidder = state.currentNominator;

  const showReveal = Math.random() < 0.15;

  if (showReveal) {
    const overlay = document.getElementById('reveal-overlay');
    const nameEl = document.getElementById('reveal-name');
    nameEl.textContent = state.nominated.name;
    overlay.classList.add('show');

    setTimeout(() => {
      overlay.classList.remove('show');
      showNominatedCard();
    }, 2600);
  } else {
    showNominatedCard();
  }
}

function showNominatedCard() {
  hideBrokeButtons();

  document.getElementById('nominated').innerHTML = `
    <div class="player-card-name">${state.nominated.name}</div>
  `;

  document.getElementById('nomination-controls').style.display = 'none';
  document.getElementById('bid-controls').style.display = 'flex';
  document.getElementById('current-bid').textContent = '$0';

  updateUI();

  const bidder = state.currentBidder;
  const other = bidder === 1 ? 2 : 1;

  // Если у текущего уже 5 игроков
  if (getTeam(bidder).length >= 5) {
    if (getTeam(other).length < 5) {
      state.currentBidder = other;
      setStatus(`${getName(other)} — забрать себе или отдать сопернику?`);
      showBrokeButtons();
    } else {
      setTimeout(() => endDraft(), 600);
    }
    return;
  }

  // Если у текущего нет денег
  if (getMoney(bidder) < 1) {
    if (getTeam(other).length < 5) {
      state.currentBidder = other;
      setStatus(`${getName(other)} — забрать себе или отдать сопернику?`);
      showBrokeButtons();
    } else {
      setTimeout(() => endDraft(), 600);
    }
    return;
  }

  // Обычный случай — автоставка $1
  setStatus(`${getName(bidder)} — сделай ставку`);
  setTimeout(() => {
    placeBidAmount(1);
  }, 350);
}

function getName(p) {
  return p === 1 ? state.name1 : state.name2;
}
function getMoney(p) {
  return p === 1 ? state.money1 : state.money2;
}
function getTeam(p) {
  return p === 1 ? state.team1 : state.team2;
}

function quickBid(amount) {
  placeBidAmount(state.currentBid + amount);
}

function customBid() {
  document.getElementById('custom-bid-current').textContent = state.currentBid;
  const input = document.getElementById('custom-bid-input');
  input.value = state.currentBid + 1;
  document.getElementById('custom-bid-modal').classList.add('show');
  setTimeout(() => input.focus(), 50);
}

function closeCustomBid() {
  document.getElementById('custom-bid-modal').classList.remove('show');
}

function confirmCustomBid() {
  const amount = parseInt(document.getElementById('custom-bid-input').value, 10);
  closeCustomBid();

  if (isNaN(amount) || amount < 1) {
    toast('Введи корректную сумму');
    return;
  }
  placeBidAmount(amount);
}

function placeBidAmount(amount) {
  if (state.phase !== 'bidding') return;

  // Если оба уже имеют по 5 — сразу конец
  if (state.team1.length >= 5 && state.team2.length >= 5) {
    setTimeout(() => endDraft(), 400);
    return;
  }

  const bidder = state.currentBidder;
  const money = getMoney(bidder);
  const team = getTeam(bidder);

  if (amount < 1) {
    toast('Минимальная ставка $1');
    return;
  }
  if (amount <= state.currentBid) {
    toast(`Ставка должна быть выше текущей ($${state.currentBid})`);
    return;
  }
  if (amount > money) {
    toast(`Недостаточно денег (у тебя $${money})`);
    return;
  }
  if (team.length >= 5) {
    toast('У тебя уже 5 игроков');
    return;
  }

  state.currentBid = amount;
  state.bidOwner = bidder;
  document.getElementById('current-bid').textContent = `$${amount}`;

  const other = bidder === 1 ? 2 : 1;
  const otherMoney = getMoney(other);
  const otherTeam = getTeam(other);

  // У соперника уже 5 → сразу отдаём
  if (otherTeam.length >= 5) {
    resolveBid();
    return;
  }

  // У соперника нет денег ИЛИ он не может перебить
  if (otherMoney < 1 || state.currentBid >= otherMoney) {
    setStatus(`${getName(bidder)} — соперник не может ответить. Забрать себе или отдать?`);
    showBrokeButtons();
    updateUI();
    return;
  }

  // Обычный случай
  state.currentBidder = other;
  setStatus(`${getName(other)} — перебей ставку или нажми «Отдаю»`);
  updateUI();
}

function acceptBid() {
  if (state.phase !== 'bidding') return;
  if (state.currentBid === 0 || state.bidOwner === null) {
    toast('Сначала нужна ставка');
    return;
  }
  resolveBid();
}

function resolveBid() {
  const winner = state.bidOwner;
  const cost = state.currentBid;
  const player = { ...state.nominated, cost };

  if (winner === 1) {
    state.team1.push(player);
    state.money1 -= cost;
  } else {
    state.team2.push(player);
    state.money2 -= cost;
  }

  toast(`${getName(winner)} получает ${player.name} за $${cost}`);
  hideBrokeButtons();

  // Проверка сразу после добавления
  if (state.team1.length >= 5 && state.team2.length >= 5) {
    setTimeout(() => endDraft(), 700);
    return;
  }

  nextRound();
}

function takeForMyself() {
  if (getTeam(state.currentBidder).length >= 5) {
    toast('У тебя уже 5 игроков!');
    return;
  }

  state.bidOwner = state.currentBidder;
  state.currentBid = Math.max(state.currentBid, 1);
  resolveBid();
}

function giveToOpponent() {
  const receiver = state.currentBidder === 1 ? 2 : 1;

  if (getTeam(receiver).length >= 5) {
    toast('У соперника уже 5 игроков!');
    return;
  }

  const player = { ...state.nominated, cost: 0 };

  if (receiver === 1) {
    state.team1.push(player);
  } else {
    state.team2.push(player);
  }

  toast(`${getName(receiver)} получает ${player.name} бесплатно`);
  hideBrokeButtons();

  // Проверка сразу после добавления
  if (state.team1.length >= 5 && state.team2.length >= 5) {
    setTimeout(() => endDraft(), 700);
    return;
  }

  nextRound();
}

function showBrokeButtons() {
  document.getElementById('normal-bid-buttons').style.display = 'none';
  document.getElementById('normal-custom').style.display = 'none';
  document.getElementById('normal-accept').style.display = 'none';
  document.getElementById('broke-buttons').style.display = 'flex';
}

function hideBrokeButtons() {
  document.getElementById('normal-bid-buttons').style.display = 'flex';
  document.getElementById('normal-custom').style.display = 'flex';
  document.getElementById('normal-accept').style.display = 'flex';
  document.getElementById('broke-buttons').style.display = 'none';
}

function nextRound() {
  state.round++;
  state.nominated = null;
  state.currentBid = 0;
  state.bidOwner = null;
  state.phase = 'nominate';

  // Меняем номинирующего
  state.currentNominator = state.currentNominator === 1 ? 2 : 1;

  // Заканчиваем ТОЛЬКО когда оба имеют по 5
  if (state.team1.length >= 5 && state.team2.length >= 5) {
    setTimeout(() => endDraft(), 900);
    return;
  }

  // Пул закончился
  if (state.pool.length === 0) {
    setTimeout(() => endDraft(), 900);
    return;
  }

  // Если текущий уже имеет 5 — передаём ход другому
  if (getTeam(state.currentNominator).length >= 5) {
    state.currentNominator = state.currentNominator === 1 ? 2 : 1;
  }

  // Если и второй тоже полный — конец
  if (getTeam(state.currentNominator).length >= 5) {
    setTimeout(() => endDraft(), 900);
    return;
  }

  document.getElementById('bid-controls').style.display = 'none';
  document.getElementById('nomination-controls').style.display = 'block';
  document.getElementById('nominated').innerHTML = '<div class="empty">Нажми «Вытянуть игрока»</div>';
  setStatus(`${getName(state.currentNominator)} — вытягивай игрока`);
  updateUI();
}

function endDraft() {
  document.getElementById('btn-winner1').textContent = `Победил ${state.name1}`;
  document.getElementById('btn-winner2').textContent = `Победил ${state.name2}`;
  
  document.getElementById('win-p1').textContent = state.name1;
  document.getElementById('win-p2').textContent = state.name2;
  
  document.getElementById('win-team1').innerHTML = state.team1.map(p => 
    `<div class="team-player"><span>${p.name}</span><span class="cost">$${p.cost}</span></div>`
  ).join('') || '<div class="text-muted">Пусто</div>';
  
  document.getElementById('win-team2').innerHTML = state.team2.map(p => 
    `<div class="team-player"><span>${p.name}</span><span class="cost">$${p.cost}</span></div>`
  ).join('') || '<div class="text-muted">Пусто</div>';

  document.getElementById('winner-overlay').classList.add('show');
}

function chooseWinner(winnerSide) {
  let winnerName;

  if (winnerSide === 0) {
    winnerName = 'Ничья';
  } else {
    winnerName = winnerSide === 1 ? state.name1 : state.name2;
  }

  const entry = {
    date: new Date().toLocaleString('ru-RU'),
    p1: state.name1,
    p2: state.name2,
    winner: winnerName,
    team1: state.team1.map(p => p.name),
    team2: state.team2.map(p => p.name)
  };

  let history = JSON.parse(localStorage.getItem('draftHistory') || '[]');
  history.unshift(entry);
  if (history.length > 50) history = history.slice(0, 50);
  localStorage.setItem('draftHistory', JSON.stringify(history));

  document.getElementById('winner-overlay').classList.remove('show');

  document.getElementById('res1-name').textContent = state.name1;
  document.getElementById('res2-name').textContent = state.name2;
  document.getElementById('res1-avatar').src = state.avatar1;
  document.getElementById('res2-avatar').src = state.avatar2;

  document.getElementById('res1-money').textContent = `Остаток: $${state.money1}`;
  document.getElementById('res2-money').textContent = `Остаток: $${state.money2}`;

  const r1 = document.getElementById('result1');
  const r2 = document.getElementById('result2');
  
  r1.classList.remove('winner');
  r2.classList.remove('winner');
  document.getElementById('badge1').style.display = 'none';
  document.getElementById('badge2').style.display = 'none';

  if (winnerSide === 1) {
    r1.classList.add('winner');
    document.getElementById('badge1').style.display = 'inline-block';
    document.getElementById('results-subtitle').textContent = `Победил ${winnerName}`;
  } else if (winnerSide === 2) {
    r2.classList.add('winner');
    document.getElementById('badge2').style.display = 'inline-block';
    document.getElementById('results-subtitle').textContent = `Победил ${winnerName}`;
  } else {
    document.getElementById('results-subtitle').textContent = 'Ничья';
  }

  renderTeam('res1-team', state.team1);
  renderTeam('res2-team', state.team2);

  const victoryTitle = document.querySelector('.victory-title');
  if (winnerSide === 0) {
    victoryTitle.textContent = 'НИЧЬЯ';
  } else {
    victoryTitle.textContent = 'ПОБЕДА!';
  }

  document.getElementById('victory-name').textContent = winnerName;
  const gifs = ['win1.gif', 'win2.gif', 'win3.gif', 'win4.gif', 'win5.gif', 'win6.gif'];
  document.getElementById('victory-gif').src = gifs[Math.floor(Math.random() * gifs.length)];
  document.getElementById('victory-overlay').classList.add('show');
}

function closeVictory() {
  document.getElementById('victory-overlay').classList.remove('show');
  showScreen('results');
}

// ==================== HISTORY ====================
function saveAndRestart() {
  showScreen('start');
}

function showHistory() {
  const list = document.getElementById('history-list');
  const history = JSON.parse(localStorage.getItem('draftHistory') || '[]');
  
  if (history.length === 0) {
    list.innerHTML = '<div class="text-muted text-center">Пока пусто</div>';
  } else {
    list.innerHTML = history.map((h, index) => `
      <div class="history-item" style="cursor:pointer" onclick="openHistoryDetail(${index})">
        <div>
          <strong>${h.p1}</strong> <span class="vs">vs</span> <strong>${h.p2}</strong>
          <div class="date">${h.date}</div>
        </div>
        <div style="text-align:right">
          <div class="history-winner">Победил: ${h.winner}</div>
        </div>
      </div>
    `).join('');
  }
  showScreen('history');
}

function openHistoryDetail(index) {
  const history = JSON.parse(localStorage.getItem('draftHistory') || '[]');
  const h = history[index];
  if (!h) return;

  document.getElementById('hd-title').textContent = `${h.p1} vs ${h.p2}`;
  document.getElementById('hd-date').textContent = h.date;
  document.getElementById('hd-winner').textContent = `Победил: ${h.winner}`;
  document.getElementById('hd-p1').textContent = h.p1;
  document.getElementById('hd-p2').textContent = h.p2;

  document.getElementById('hd-team1').innerHTML = (h.team1 || []).map(n => 
    `<div class="team-player"><span>${n}</span></div>`
  ).join('') || '<div class="text-muted">Пусто</div>';

  document.getElementById('hd-team2').innerHTML = (h.team2 || []).map(n => 
    `<div class="team-player"><span>${n}</span></div>`
  ).join('') || '<div class="text-muted">Пусто</div>';

  document.getElementById('history-detail').classList.add('show');
}

function closeHistoryDetail() {
  document.getElementById('history-detail').classList.remove('show');
}

function clearHistory() {
  if (confirm('Очистить всю историю?')) {
    localStorage.removeItem('draftHistory');
    showHistory();
    toast('История очищена');
  }
}