// ==================== PLAYER POOL ====================
const firebaseConfig = {
  apiKey: "AIzaSyCFMwNU52pc30EsqsN-t4gW2cAeAjWrVDM",
  authDomain: "dbd-drafts.firebaseapp.com",
  databaseURL: "https://dbd-drafts-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "dbd-drafts",
  storageBucket: "dbd-drafts.firebasestorage.app",
  messagingSenderId: "144117345718",
  appId: "1:144117345718:web:b1483715d5ae67a491e517"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

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
  "monroe","Арима","dabba","Romeo","aewame","GB","FoKus",
  "Moof","Murrk","axitamy","gryyst","Medilian","Kain1az","Opkafance","Zaka","Pedro","Spitzz",
  "Knightlight","RocketDBD","Dan","Kekso","Xeno","ivn","Kayy","tec","peps","Wispy",
  "Angelz","Jah","Zafis","note","jayden","julian","kenshii","acid","momoseventh","weejason",
  "bucky","gustavo","delof","B4NDIT","mircht","vobbo","tylion","Outer","noah","Ward",
  "V1","PedroHZ","Obii","silhey","Mad05","MX","ratz","freeze","haze",
  "moon","madeira","leonidas","kure","voidz","ruediger","yujiro","kobj","cartney",
  "ruyn","neppe","fingerguns","reflection","lonut","aki",
  "sinter","uselma","raider","bueay","mirtex","fasti","ptrl","jiggy",
  "palle_loop","ultra","1lmarco","overdose","zynox","daimao",
  "whoyasha", "Куплинов плей", "DmitriyBale", "Kuplinov", "drxkich", "DogeRox"
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

// ==================== MULTIPLAYER VARS ====================
let currentRoomCode = null;
let isHost = false;
let myPlayerNumber = 1;

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
  for (let i = 0; i < (state.maxRounds || 10); i++) {
    html += `<div class="round-dot ${i < (state.round || 0) ? 'filled' : ''}"></div>`;
  }
  container.innerHTML = html;
}

function renderTeam(containerId, team) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!Array.isArray(team)) team = [];

  let html = '';
  for (let i = 0; i < 5; i++) {
    if (team[i]) {
      const p = team[i];
      html += `<div class="team-player">
        <span>${p.name || '?'}</span>
        <span class="cost">$${p.cost ?? 0}</span>
      </div>`;
    } else {
      html += `<div class="empty-slot">Слот ${i + 1}</div>`;
    }
  }
  el.innerHTML = html;
}

function updateUI() {
  if (!state.team1) state.team1 = [];
  if (!state.team2) state.team2 = [];
  if (!state.pool) state.pool = [];

  document.getElementById('p1-name').textContent = state.name1 || 'Игрок 1';
  document.getElementById('p2-name').textContent = state.name2 || 'Игрок 2';
  document.getElementById('p1-money').textContent = state.money1 ?? 20;
  document.getElementById('p2-money').textContent = state.money2 ?? 20;
  document.getElementById('p1-count').textContent = state.team1.length;
  document.getElementById('p2-count').textContent = state.team2.length;
  document.getElementById('team1-title').textContent = state.name1 || 'Команда 1';
  document.getElementById('team2-title').textContent = state.name2 || 'Команда 2';
  document.getElementById('progress').style.width = `${((state.round || 0) / (state.maxRounds || 10)) * 100}%`;

  if (state.avatar1) document.getElementById('p1-avatar').src = state.avatar1;
  if (state.avatar2) document.getElementById('p2-avatar').src = state.avatar2;

  const isP1Active = state.phase === 'nominate' ? state.currentNominator === 1 : state.currentBidder === 1;
  const isP2Active = state.phase === 'nominate' ? state.currentNominator === 2 : state.currentBidder === 2;

  document.getElementById('panel1').classList.toggle('active', !!isP1Active);
  document.getElementById('panel2').classList.toggle('active', !!isP2Active);

  renderTeam('team1-players', state.team1);
  renderTeam('team2-players', state.team2);
  updateRoundDots();
}

// ==================== LOCAL START ====================
function startGame() {
  currentRoomCode = null;
  isHost = false;
  myPlayerNumber = 1;

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
  if (currentRoomCode && !isHost) {
    toast('Монетку подбрасывает хост');
    return;
  }

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
    showCoinResult(first);

    if (currentRoomCode && isHost) {
      db.ref('rooms/' + currentRoomCode + '/state').update({
        firstPlayer: first,
        currentNominator: first,
        coinFlipped: true
      });
    }
  }, 1400);
}

function showCoinResult(first) {
  const resultEl = document.getElementById('coin-result');
  const btn = document.getElementById('btn-flip');

  const winnerName = first === 1 ? state.name1 : state.name2;
  const winnerAvatar = first === 1 ? state.avatar1 : state.avatar2;

  document.querySelector('.coin-front').textContent = first === 1 ? '1' : '2';
  document.querySelector('.coin-back').textContent = first === 1 ? '1' : '2';

  resultEl.innerHTML = `
    <img src="${winnerAvatar}" class="coin-result-avatar show" alt="">
    <span>Первым ходит <strong>${winnerName}</strong></span>
  `;

  btn.style.display = 'none';

  if (!currentRoomCode || isHost) {
    document.getElementById('btn-start-draft').style.display = 'inline-flex';
  }
}

// ==================== DRAFT ====================
function startDraft() {
  if (currentRoomCode && !isHost) {
    toast('Хост начинает драфт');
    return;
  }

  if (currentRoomCode && isHost) {
    db.ref('rooms/' + currentRoomCode).update({ status: 'draft' });
  }

  goToDraftScreen();
}

function goToDraftScreen() {
  showScreen('draft');
  updateUI();
  const who = state.currentNominator === 1 ? state.name1 : state.name2;
  setStatus(`${who} — вытягивай игрока`);
  document.getElementById('bid-controls').style.display = 'none';
  document.getElementById('nomination-controls').style.display = 'block';
  document.getElementById('nominated').innerHTML = '<div class="empty">Нажми «Вытянуть игрока»</div>';
}

function setStatus(msg, isWarning = false) {
  const el = document.getElementById('status-msg');
  if (el) {
    el.textContent = msg;
    el.classList.toggle('warning', isWarning);
  }
}

function nominatePlayer() {
  if (currentRoomCode && myPlayerNumber !== state.currentNominator) {
    toast('Сейчас ходит соперник');
    return;
  }

  if (state.phase !== 'nominate') return;
  if (!state.pool || state.pool.length === 0) {
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

  const showReveal = Math.random() < 0.18;
  state.showReveal = showReveal;

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

  syncState();
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

  if (getTeam(bidder).length >= 5) {
    if (getTeam(other).length < 5) {
      state.currentBidder = other;
      setStatus(`${getName(other)} — забрать себе или отдать сопернику?`);
      showBrokeButtons();
    } else {
      setTimeout(() => endDraft(), 600);
    }
    syncState();
    return;
  }

  if (getMoney(bidder) < 1) {
    if (getTeam(other).length < 5) {
      state.currentBidder = other;
      setStatus(`${getName(other)} — забрать себе или отдать сопернику?`);
      showBrokeButtons();
    } else {
      setTimeout(() => endDraft(), 600);
    }
    syncState();
    return;
  }

  setStatus(`${getName(bidder)} — сделай ставку`);
  setTimeout(() => placeBidAmount(1), 350);
  syncState();
}

function getName(p) { return p === 1 ? state.name1 : state.name2; }
function getMoney(p) { return p === 1 ? state.money1 : state.money2; }
function getTeam(p) { return p === 1 ? state.team1 : state.team2; }

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
  if (currentRoomCode && myPlayerNumber !== state.currentBidder) {
    toast('Сейчас ходит соперник');
    return;
  }
  if (state.phase !== 'bidding') return;

  if (state.team1.length >= 5 && state.team2.length >= 5) {
    setTimeout(() => endDraft(), 400);
    return;
  }

  const bidder = state.currentBidder;
  const money = getMoney(bidder);
  const team = getTeam(bidder);

  if (amount < 1) { toast('Минимальная ставка $1'); return; }
  if (amount <= state.currentBid) { toast(`Ставка должна быть выше текущей ($${state.currentBid})`); return; }
  if (amount > money) { toast(`Недостаточно денег (у тебя $${money})`); return; }
  if (team.length >= 5) { toast('У тебя уже 5 игроков'); return; }

  state.currentBid = amount;
  state.bidOwner = bidder;
  document.getElementById('current-bid').textContent = `$${amount}`;

  const other = bidder === 1 ? 2 : 1;
  const otherMoney = getMoney(other);
  const otherTeam = getTeam(other);

  if (otherTeam.length >= 5) {
    resolveBid();
    return;
  }

  if (otherMoney < 1 || state.currentBid >= otherMoney) {
    setStatus(`${getName(bidder)} — соперник не может ответить. Забрать себе или отдать?`);
    showBrokeButtons();
    updateUI();
    syncState();
    return;
  }

  state.currentBidder = other;
  setStatus(`${getName(other)} — перебей ставку или нажми «Отдаю»`);
  updateUI();
  syncState();
}

function acceptBid() {
  if (currentRoomCode && myPlayerNumber !== state.currentBidder) {
    toast('Сейчас ходит соперник');
    return;
  }
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

  if (state.team1.length >= 5 && state.team2.length >= 5) {
    syncState();
    setTimeout(() => endDraft(), 700);
    return;
  }

  nextRound();
}

function takeForMyself() {
  if (currentRoomCode && myPlayerNumber !== state.currentBidder) {
    toast('Сейчас ходит соперник');
    return;
  }
  if (getTeam(state.currentBidder).length >= 5) {
    toast('У тебя уже 5 игроков!');
    return;
  }
  state.bidOwner = state.currentBidder;
  state.currentBid = Math.max(state.currentBid, 1);
  resolveBid();
}

function giveToOpponent() {
  if (currentRoomCode && myPlayerNumber !== state.currentBidder) {
    toast('Сейчас ходит соперник');
    return;
  }
  const receiver = state.currentBidder === 1 ? 2 : 1;
  if (getTeam(receiver).length >= 5) {
    toast('У соперника уже 5 игроков!');
    return;
  }

  const player = { ...state.nominated, cost: 0 };
  if (receiver === 1) state.team1.push(player);
  else state.team2.push(player);

  toast(`${getName(receiver)} получает ${player.name} бесплатно`);
  hideBrokeButtons();

  if (state.team1.length >= 5 && state.team2.length >= 5) {
    syncState();
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
  state.showReveal = false;

  state.currentNominator = state.currentNominator === 1 ? 2 : 1;

  if (state.team1.length >= 5 && state.team2.length >= 5) {
    syncState();
    setTimeout(() => endDraft(), 900);
    return;
  }

  if (!state.pool || state.pool.length === 0) {
    syncState();
    setTimeout(() => endDraft(), 900);
    return;
  }

  if (getTeam(state.currentNominator).length >= 5) {
    state.currentNominator = state.currentNominator === 1 ? 2 : 1;
  }

  if (getTeam(state.currentNominator).length >= 5) {
    syncState();
    setTimeout(() => endDraft(), 900);
    return;
  }

  document.getElementById('bid-controls').style.display = 'none';
  document.getElementById('nomination-controls').style.display = 'block';
  document.getElementById('nominated').innerHTML = '<div class="empty">Нажми «Вытянуть игрока»</div>';
  setStatus(`${getName(state.currentNominator)} — вытягивай игрока`);
  updateUI();
  syncState();
}

function endDraft() {
  document.getElementById('btn-winner1').textContent = `Победил ${state.name1}`;
  document.getElementById('btn-winner2').textContent = `Победил ${state.name2}`;
  document.getElementById('win-p1').textContent = state.name1;
  document.getElementById('win-p2').textContent = state.name2;
  
  document.getElementById('win-team1').innerHTML = (state.team1 || []).map(p => 
    `<div class="team-player"><span>${p.name}</span><span class="cost">$${p.cost}</span></div>`
  ).join('') || '<div class="text-muted">Пусто</div>';
  
  document.getElementById('win-team2').innerHTML = (state.team2 || []).map(p => 
    `<div class="team-player"><span>${p.name}</span><span class="cost">$${p.cost}</span></div>`
  ).join('') || '<div class="text-muted">Пусто</div>';

  // Кнопки выбора победителя только у хоста (или в локальной игре)
  const winnerButtons = document.querySelector('.winner-buttons');
  if (winnerButtons) {
    winnerButtons.style.display = (!currentRoomCode || isHost) ? 'flex' : 'none';
  }

  // Гостю пишем, что ждём выбора
  const titleEl = document.querySelector('.winner-box h2');
  if (titleEl) {
    titleEl.textContent = (currentRoomCode && !isHost) 
      ? 'Ожидаем, пока хост выберет победителя...' 
      : 'Определяем победителя';
  }

  document.getElementById('winner-overlay').classList.add('show');

  if (currentRoomCode) {
    db.ref('rooms/' + currentRoomCode).update({ status: 'finished' });
  }
}

function chooseWinner(winnerSide) {
  // Только хост может выбирать
  if (currentRoomCode && !isHost) {
    toast('Победителя выбирает хост');
    return;
  }

  let winnerName = winnerSide === 0 ? 'Ничья' : (winnerSide === 1 ? state.name1 : state.name2);

  if (currentRoomCode) {
    db.ref('rooms/' + currentRoomCode).update({
      status: 'results',
      winnerSide: winnerSide,
      winnerName: winnerName
    });
  }

  showResults(winnerSide, winnerName);
}

function showResults(winnerSide, winnerName) {
  const entry = {
    date: new Date().toLocaleString('ru-RU'),
    p1: state.name1,
    p2: state.name2,
    winner: winnerName,
    team1: (state.team1 || []).map(p => p.name),
    team2: (state.team2 || []).map(p => p.name)
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
  if (victoryTitle) victoryTitle.textContent = winnerSide === 0 ? 'НИЧЬЯ' : 'ПОБЕДА!';
  
  document.getElementById('victory-name').textContent = winnerName;

  const gifs = ['win1.gif', 'win2.gif', 'win3.gif', 'win4.gif', 'win5.gif', 'win6.gif'];
  document.getElementById('victory-gif').src = gifs[Math.floor(Math.random() * gifs.length)];
  document.getElementById('victory-overlay').classList.add('show');
}

function closeVictory() {
  document.getElementById('victory-overlay').classList.remove('show');

  if (currentRoomCode) {
    // Возвращаем в лобби этой же комнаты
    db.ref('rooms/' + currentRoomCode).update({
      status: 'waiting',
      state: null,
      winnerSide: null,
      winnerName: null
    });

    document.getElementById('lobby-status').textContent = isHost 
      ? 'Можешь начать новую игру' 
      : 'Ожидаем, пока хост начнёт новую игру...';
    
    document.getElementById('btn-start-game').style.display = isHost ? 'inline-flex' : 'none';
    showScreen('lobby');
  } else {
    showScreen('results');
  }
}

// ==================== HISTORY ====================
function saveAndRestart() {
  currentRoomCode = null;
  isHost = false;
  myPlayerNumber = 1;
  showScreen('start');
  hideAllForms();
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
          <div class="history-winner ${h.winner === 'Ничья' ? 'draw' : ''}">
            ${h.winner === 'Ничья' ? 'Ничья' : 'Победил: ' + h.winner}
          </div>
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
  document.getElementById('hd-winner').textContent = h.winner === 'Ничья' ? 'Ничья' : `Победил: ${h.winner}`;
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

// ==================== MULTIPLAYER ====================
function showLocalForm() {
  document.getElementById('local-form').style.display = 'block';
  document.getElementById('online-form').style.display = 'none';
}

function showOnlineForm() {
  document.getElementById('online-form').style.display = 'block';
  document.getElementById('local-form').style.display = 'none';
}

function hideAllForms() {
  document.getElementById('local-form').style.display = 'none';
  document.getElementById('online-form').style.display = 'none';
  document.getElementById('join-form').style.display = 'none';
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function showJoinForm() {
  document.getElementById('join-form').style.display = 'block';
}

function hideJoinForm() {
  document.getElementById('join-form').style.display = 'none';
}

function createRoom() {
  const name = document.getElementById('player-name').value.trim() || 'Коуч';
  currentRoomCode = generateCode();
  isHost = true;
  myPlayerNumber = 1;

  db.ref('rooms/' + currentRoomCode).set({
    host: name,
    guest: null,
    status: 'waiting',
    createdAt: Date.now()
  }).then(() => {
    document.getElementById('lobby-code').textContent = currentRoomCode;
    document.getElementById('lobby-status').textContent = 'Ожидаем второго игрока...';
    document.getElementById('lobby-players').textContent = `Хост: ${name}`;
    document.getElementById('btn-start-game').style.display = 'none';
    showScreen('lobby');
    listenToRoom(currentRoomCode);
  }).catch(err => {
    console.error(err);
    toast('Ошибка создания комнаты');
  });
}

function joinRoom() {
  const name = document.getElementById('player-name').value.trim() || 'Коуч';
  const code = document.getElementById('room-code').value.trim().toUpperCase();

  if (!code || code.length < 4) {
    toast('Введи код комнаты');
    return;
  }

  const roomRef = db.ref('rooms/' + code);
  roomRef.once('value').then(snapshot => {
    const data = snapshot.val();
    if (!data) { toast('Комната не найдена'); return; }
    if (data.guest) { toast('Комната уже заполнена'); return; }
    if (data.status !== 'waiting') { toast('Игра уже началась'); return; }

    roomRef.update({ guest: name }).then(() => {
      currentRoomCode = code;
      isHost = false;
      myPlayerNumber = 2;
      document.getElementById('lobby-code').textContent = code;
      showScreen('lobby');
      listenToRoom(code);
    });
  }).catch(err => {
    console.error(err);
    toast('Ошибка входа');
  });
}

function listenToRoom(code) {
  const roomRef = db.ref('rooms/' + code);

  roomRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      toast('Комната была удалена');
      leaveRoom();
      return;
    }

    // ЛОББИ
    if (data.status === 'waiting') {
      let playersText = `Хост: ${data.host}`;
      if (data.guest) playersText += `  •  Гость: ${data.guest}`;
      document.getElementById('lobby-players').textContent = playersText;

      if (data.guest) {
        if (isHost) {
          document.getElementById('lobby-status').textContent = 'Оба игрока в лобби! Можно начинать.';
          document.getElementById('btn-start-game').style.display = 'inline-flex';
        } else {
          document.getElementById('lobby-status').textContent = 'Ожидаем, пока хост начнёт игру...';
          document.getElementById('btn-start-game').style.display = 'none';
        }
      } else {
        document.getElementById('lobby-status').textContent = 'Ожидаем второго игрока...';
        document.getElementById('btn-start-game').style.display = 'none';
      }
    }

    // ЖЕРЕБЬЁВКА
    if (data.status === 'playing' && data.state) {
      if (!document.getElementById('screen-coin').classList.contains('active') &&
          !document.getElementById('screen-draft').classList.contains('active')) {
        
        state = data.state;
        const coin = document.getElementById('coin');
        coin.classList.remove('flipping');
        document.querySelector('.coin-front').textContent = '?';
        document.querySelector('.coin-back').textContent = '?';
        document.getElementById('coin-result').innerHTML = '<span>Нажми кнопку, чтобы подбросить монетку</span>';
        document.getElementById('btn-flip').style.display = isHost ? 'inline-flex' : 'none';
        document.getElementById('btn-flip').disabled = false;
        document.getElementById('btn-start-draft').style.display = 'none';
        showScreen('coin');
      }

      if (data.state.coinFlipped && data.state.firstPlayer) {
        state.firstPlayer = data.state.firstPlayer;
        state.currentNominator = data.state.currentNominator;
        showCoinResult(data.state.firstPlayer);
      }
    }

    // ДРАФТ
    if (data.status === 'draft' && data.state) {
      const prevNominated = state.nominated ? state.nominated.name : null;
      state = data.state;

      if (!document.getElementById('screen-draft').classList.contains('active')) {
        goToDraftScreen();
      } else {
        updateUI();

        if (state.nominated && state.nominated.name !== prevNominated) {
          if (state.showReveal) {
            const overlay = document.getElementById('reveal-overlay');
            const nameEl = document.getElementById('reveal-name');
            nameEl.textContent = state.nominated.name;
            overlay.classList.add('show');

            setTimeout(() => {
              overlay.classList.remove('show');
              document.getElementById('nominated').innerHTML = `<div class="player-card-name">${state.nominated.name}</div>`;
              document.getElementById('nomination-controls').style.display = 'none';
              document.getElementById('bid-controls').style.display = 'flex';
              document.getElementById('current-bid').textContent = `$${state.currentBid || 0}`;
            }, 2600);
          } else {
            document.getElementById('nominated').innerHTML = `<div class="player-card-name">${state.nominated.name}</div>`;
            document.getElementById('nomination-controls').style.display = 'none';
            document.getElementById('bid-controls').style.display = 'flex';
            document.getElementById('current-bid').textContent = `$${state.currentBid || 0}`;
          }
        } else if (!state.nominated) {
          document.getElementById('bid-controls').style.display = 'none';
          document.getElementById('nomination-controls').style.display = 'block';
          document.getElementById('nominated').innerHTML = '<div class="empty">Нажми «Вытянуть игрока»</div>';
          setStatus(`${getName(state.currentNominator)} — вытягивай игрока`);
        } else {
          document.getElementById('current-bid').textContent = `$${state.currentBid || 0}`;
          if (state.phase === 'bidding') {
            setStatus(`${getName(state.currentBidder)} — твой ход`);
          }
        }
      }
    }

    // ИГРА ЗАКОНЧЕНА
    if (data.status === 'finished') {
      if (!document.getElementById('winner-overlay').classList.contains('show')) {
        endDraft();
      }
    }

    // РЕЗУЛЬТАТЫ
    if (data.status === 'results') {
      if (!document.getElementById('victory-overlay').classList.contains('show')) {
        showResults(data.winnerSide, data.winnerName);
      }
    }
  });
}

function leaveRoom() {
  if (currentRoomCode) {
    db.ref('rooms/' + currentRoomCode).off();
    if (isHost) {
      db.ref('rooms/' + currentRoomCode).remove();
    } else {
      db.ref('rooms/' + currentRoomCode).update({ guest: null });
    }
  }
  currentRoomCode = null;
  isHost = false;
  myPlayerNumber = 1;
  showScreen('start');
  hideAllForms();
}

function syncState() {
  if (!currentRoomCode) return;
  db.ref('rooms/' + currentRoomCode + '/state').set(state);
}

function startMultiplayerGame() {
  if (!isHost || !currentRoomCode) return;

  const roomRef = db.ref('rooms/' + currentRoomCode);
  roomRef.once('value').then(snapshot => {
    const data = snapshot.val();
    if (!data || !data.guest) {
      toast('Второй игрок ещё не подключился');
      return;
    }

    const shuffled = [...AVATARS].sort(() => Math.random() - 0.5);

    const newState = {
      avatar1: shuffled[0],
      avatar2: shuffled[1],
      name1: data.host,
      name2: data.guest,
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
      phase: 'nominate',
      coinFlipped: false,
      showReveal: false
    };

    roomRef.update({
      status: 'playing',
      state: newState
    }).then(() => {
      state = newState;
    }).catch(err => {
      console.error(err);
      toast('Ошибка запуска игры');
    });
  });
}

// Защита от случайной перезагрузки
window.addEventListener('beforeunload', (e) => {
  if (currentRoomCode && 
     (document.getElementById('screen-draft')?.classList.contains('active') || 
      document.getElementById('screen-coin')?.classList.contains('active'))) {
    e.preventDefault();
    e.returnValue = '';
  }
});