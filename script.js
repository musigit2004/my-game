/*
  =====================================
   Tic Tac Toe Game - JavaScript
   Made By Musfik(090)
  =====================================
*/

(function () {
  // All 8 ways to win (rows, columns, diagonals)
  var LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  var boardEl = document.getElementById('board');
  var statusEl = document.getElementById('status');

  var board, turn, over;
  var starter = 'X';
  var mode = 'hard';      // 'easy' | 'hard' | 'two'
  var locked = false;     // true while the computer is "thinking"
  var scores = { X: 0, O: 0, D: 0 };
  var cells = [];

  // X and O drawings
  var X_SVG = '<svg viewBox="0 0 100 100" aria-hidden="true"><path class="mark x-mark" pathLength="100" d="M16 16 L84 84 M84 16 L16 84"/></svg>';
  var O_SVG = '<svg viewBox="0 0 100 100" aria-hidden="true"><circle class="mark o-mark" pathLength="100" cx="50" cy="50" r="34"/></svg>';

  // Create the 9 cells
  for (var i = 0; i < 9; i++) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'cell';
    b.dataset.i = i;
    b.setAttribute('role', 'gridcell');
    boardEl.appendChild(b);
    cells.push(b);
  }

  boardEl.addEventListener('click', function (e) {
    var c = e.target.closest('.cell');
    if (!c || locked || over) return;
    play(+c.dataset.i);
  });

  // Returns { p: 'X' or 'O', line: [a,b,c] } if someone has won, else null
  function winnerOf(bd) {
    for (var k = 0; k < LINES.length; k++) {
      var l = LINES[k];
      if (bd[l[0]] && bd[l[0]] === bd[l[1]] && bd[l[0]] === bd[l[2]]) {
        return { p: bd[l[0]], line: l };
      }
    }
    return null;
  }

  function names() {
    return mode === 'two'
      ? { X: 'Player X', O: 'Player O' }
      : { X: 'You (X)', O: 'Computer (O)' };
  }

  // Draw the current state on the screen
  function render() {
    var n = names();
    document.getElementById('lx').textContent = n.X;
    document.getElementById('lo').textContent = n.O;
    document.getElementById('vx').textContent = scores.X;
    document.getElementById('vo').textContent = scores.O;
    document.getElementById('vd').textContent = scores.D;
    document.getElementById('sx').classList.toggle('active', !over && turn === 'X');
    document.getElementById('so').classList.toggle('active', !over && turn === 'O');

    var w = winnerOf(board);
    for (var i = 0; i < 9; i++) {
      var c = cells[i];
      var v = board[i];
      var html = v === 'X' ? X_SVG : v === 'O' ? O_SVG : '';
      if (c.dataset.v !== (v || '')) {
        c.innerHTML = html;
        c.dataset.v = v || '';
      }
      c.disabled = !!v || over;
      c.classList.toggle('win', !!(w && w.line.indexOf(i) > -1));
      c.setAttribute('aria-label', 'Row ' + (Math.floor(i / 3) + 1) + ', column ' + (i % 3 + 1) + ': ' + (v || 'empty'));
    }
  }

  function setStatus(t) { statusEl.textContent = t; }

  // Start a new round (the starting player alternates)
  function newRound(keepStarter) {
    board = Array(9).fill(null);
    over = false;
    locked = false;
    if (!keepStarter) starter = starter === 'X' ? 'O' : 'X';
    turn = starter;
    cells.forEach(function (c) { c.dataset.v = ''; c.innerHTML = ''; });
    render();
    afterMove();
  }

  // Update the message and let the computer move if it is its turn
  function afterMove() {
    var n = names();
    if (over) return;
    setStatus(n[turn] + (mode === 'two' || turn === 'X' ? ' to move' : ' is thinking...'));

    if (mode !== 'two' && turn === 'O') {
      locked = true;
      setTimeout(function () {
        var m = mode === 'easy' ? randomMove() : bestMove();
        locked = false;
        play(m);
      }, 380);
    }
  }

  // Place a mark on cell i for the current player
  function play(i) {
    if (board[i] || over) return;
    board[i] = turn;

    var w = winnerOf(board);
    var n = names();

    if (w) {
      over = true;
      scores[w.p]++;
      setStatus(n[w.p] + ' wins this round!');
    } else if (board.every(Boolean)) {
      over = true;
      scores.D++;
      setStatus('Draw. Nobody wins this round.');
    } else {
      turn = turn === 'X' ? 'O' : 'X';
    }

    render();
    afterMove();
  }

  // ---------- Computer player ----------

  // Easy: picks any empty cell
  function randomMove() {
    var free = [];
    board.forEach(function (v, i) { if (!v) free.push(i); });
    return free[Math.floor(Math.random() * free.length)];
  }

  // Hard: minimax, looks at every possible future move so it never loses
  function minimax(bd, player, depth) {
    var w = winnerOf(bd);
    if (w) return w.p === 'O' ? 10 - depth : depth - 10;
    if (bd.every(Boolean)) return 0;

    var best = player === 'O' ? -Infinity : Infinity;
    for (var i = 0; i < 9; i++) {
      if (bd[i]) continue;
      bd[i] = player;
      var s = minimax(bd, player === 'O' ? 'X' : 'O', depth + 1);
      bd[i] = null;
      best = player === 'O' ? Math.max(best, s) : Math.min(best, s);
    }
    return best;
  }

  function bestMove() {
    var best = -Infinity;
    var moves = [];
    for (var i = 0; i < 9; i++) {
      if (board[i]) continue;
      board[i] = 'O';
      var s = minimax(board, 'X', 1);
      board[i] = null;
      if (s > best) { best = s; moves = [i]; }
      else if (s === best) moves.push(i);
    }
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // ---------- Buttons ----------

  function setMode(m) {
    mode = m;
    ['easy', 'hard', 'two'].forEach(function (k) {
      document.getElementById('m-' + k).setAttribute('aria-pressed', String(k === m));
    });
    scores = { X: 0, O: 0, D: 0 };
    starter = 'X';
    newRound(true);
  }

  document.getElementById('m-easy').addEventListener('click', function () { setMode('easy'); });
  document.getElementById('m-hard').addEventListener('click', function () { setMode('hard'); });
  document.getElementById('m-two').addEventListener('click', function () { setMode('two'); });
  document.getElementById('again').addEventListener('click', function () { newRound(false); });

  // Start the game
  newRound(true);
})();