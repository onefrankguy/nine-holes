// Random number generators are useful in games. Dice and decks of cards are
// common in physical games, but video games use mathematical functions. This
// one is described in the paper, _A New Class of Invertible Mappings_,
// by Alexander Klimov and Adi Shamer.
const PRNG = (function prng() {
  const max = 2 ** 32;
  let state = Math.floor(Math.random() * max);

  function random() {
    state += (state * state) | 5;
    return (state >>> 32) / max;
  }

  // Randomly picking items out of arrays is common, so the PRNG provies a
  // function to do that. `Math.floor()` is used instead of `Math.round()` to
  // avoid a non-uniform distribution of random numbers.
  function pick(array) {
    const index = Math.floor(random() * array.length);
    return array[index];
  }

  return {
    random,
    pick,
  };
}());

const Board = (function board() {
  let layout = {};

  function get() {
    return JSON.parse(JSON.stringify({ rows: 3, cols: 3, layout }));
  }

  function move(start, end) {
    layout[end] = layout[start];
    layout[start] = '';
  }

  function reset() {
    layout = {
      p21: 'black',
      p22: 'black',
      p23: 'black',
      a3: '',
      b3: '',
      c3: '',
      a2: '',
      b2: '',
      c2: '',
      a1: '',
      b1: '',
      c1: '',
      p11: 'white',
      p12: 'white',
      p13: 'white',
    };
  }

  return {
    get,
    move,
    reset,
  };
}());

const Rules = (function rules() {
  function pickable(player, board) {
    const results = [];

    Object.keys(board.layout).forEach((position) => {
      if (player === board.layout[position]) {
        results.push(position);
      }
    });

    return results;
  }

  function playable(player, board) {
    const results = [];

    Object.keys(board.layout).forEach((position) => {
      if (board.layout[position] === '') {
        results.push(position);
      }
    });

    return results;
  }

  function moves(player, board) {
    const starting = pickable(player, board);
    const ending = playable(player, board);
    const possible = [];

    starting.forEach((start) => {
      ending.forEach((end) => {
        possible.push([start, end]);
      });
    });

    // Moves where you return a piece to a starting row are invalid.
    const valid = possible.filter(move => move[1].charAt(0) !== 'p');

    // Moves from a starting row must be played first.
    const drops = valid.filter(move => move[0].charAt(0) === 'p');
    if (drops.length > 0) {
      return drops;
    }

    return valid;
  }

  function winner(board) {
    const rows = [];
    const cols = [];

    for (let i = 0; i < board.rows; i += 1) {
      rows.push(String.fromCharCode(97 + i));
    }

    for (let i = 0; i < board.cols; i += 1) {
      cols.push('' + (i + 1));
    }

    let result = undefined;

    rows.forEach((row) => {
      if (!result) {
        const players = [];

        cols.forEach((col) => {
          players.push(board.layout[row + col]);
        });

        if (new Set(players).size === 1 && players[0] !== '') {
          result = players[0];
        }
      }
    });

    cols.forEach((col) => {
      if (!result) {
        const players = [];

        rows.forEach((row) => {
          players.push(board.layout[row + col]);
        });

        if (new Set(players).size === 1 && players[0] !== '') {
          result = players[0];
        }
      }
    });

    return result;
  }

  function winning(player, board) {
    const results = [];

    moves(player, board).forEach((move) => {
      const test = JSON.parse(JSON.stringify(board));
      test.layout[move[1]] = test.layout[move[0]];
      test.layout[move[0]] = '';
      if (player === winner(test)) {
        results.push(move);
      }
    });

    return results;
  }

  return {
    pickable,
    playable,
    moves,
    winner,
    winning,
  };
}());

const AI = (function ai() {
  function players(board) {
    const results = new Set(Object.values(board.layout));
    results.delete('');
    return results;
  }

  function difference(a, b) {
    const result = new Set(a);
    b.forEach((item) => {
      result.delete(item);
    });
    return result;
  }

  function move(player, board) {
    // Figure out who we're playing against.
    const player1 = player;
    const player2 = [...difference(players(board), [player])][0];

    // Figure out what moves we can play.
    const p1moves = Rules.moves(player1, board);

    // Play a winning move if we have one.
    const p1wins = Rules.winning(player1, board);
    if (p1wins.length > 0) {
      return PRNG.pick(p1wins);
    }

    // Play a blocking move if we have one.
    const p2wins = Rules.winning(player2, board);
    if (p2wins.length > 0) {
      const p1blocks = [];

      p2wins.forEach((p2move) => {
        p1moves.forEach((p1move) => {
          if (p2move[1] === p1move[1]) {
            p1blocks.push(p1move);
          }
        });
      });

      if (p1blocks.length > 0) {
        return PRNG.pick(p1blocks);
      }
    }

    // Play a random move.
    return PRNG.pick(p1moves);
  }

  return {
    move,
  };
}());

const Stage = (function stage() {
  let picked = undefined;

  function get() {
    return picked;
  }

  function reset() {
    picked = undefined;
  }

  function next(message) {
    const board = Board.get();

    if (Rules.winner(board)) {
      return;
    }

    const pickable = Rules.pickable('white', board).indexOf(message) > -1;

    if (!picked) {
      if (pickable) {
        picked = message;
      }
      return;
    }

    const playable = Rules.playable('white', board).indexOf(message) > -1;

    if (!playable) {
      if (pickable) {
        picked = message;
      }
      return;
    }

    Board.move(picked, message);
    picked = undefined;

    if (Rules.winner(Board.get()) === 'white') {
      return;
    }

    const move = AI.move('black', Board.get());
    if (move) {
      Board.move(move[0], move[1]);
    }
  }

  return {
    get,
    next,
    reset,
  };
}());

const Renderer = (function renderer() {
  let dirty = true;

  function renderBoard() {
    const $ = window.jQuery;
    const layout = Board.get().layout;

    Object.keys(layout).forEach((id) => {
      const element = $('#' + id);
      if (layout[id] === '') {
        element.remove('white').remove('black');
      }
      if (layout[id] === 'white') {
        element.add('white').remove('black');
      }
      if (layout[id] === 'black') {
        element.add('black').remove('white');
      }
    });
  }

  function renderPicked() {
    const $ = window.jQuery;
    const layout = Board.get().layout;
    const picked = Stage.get();

    Object.keys(layout).forEach((id) => {
      $('#' + id).remove('picked');
    });

    if (picked) {
      $('#' + picked).add('picked');
    }
  }

  function render() {
    if (dirty) {
      renderBoard();
      renderPicked();
      dirty = false;
    }

    requestAnimationFrame(render);
  }

  function invalidate() {
    dirty = true;
  }

  return {
    render,
    invalidate,
  };
}());

const Game = (function game() {
  function onPick() {
    Renderer.invalidate();
  }

  function onPlay(element) {
    Stage.next(element.unwrap().id);
    Renderer.invalidate();
  }

  function onReset() {
    Board.reset();
    Stage.reset();
    Renderer.invalidate();
  }

  function play() {
    const $ = window.jQuery;
    $('#p21').touch(onPick, onPlay);
    $('#p22').touch(onPick, onPlay);
    $('#p23').touch(onPick, onPlay);

    $('#a3').touch(onPick, onPlay);
    $('#b3').touch(onPick, onPlay);
    $('#c3').touch(onPick, onPlay);

    $('#a2').touch(onPick, onPlay);
    $('#b2').touch(onPick, onPlay);
    $('#c2').touch(onPick, onPlay);

    $('#a1').touch(onPick, onPlay);
    $('#b1').touch(onPick, onPlay);
    $('#c1').touch(onPick, onPlay);

    $('#p11').touch(onPick, onPlay);
    $('#p12').touch(onPick, onPlay);
    $('#p13').touch(onPick, onPlay);

    $('#reset').touch(undefined, onReset);

    Board.reset();
    Stage.reset();
    Renderer.invalidate();
    Renderer.render();
  }

  return {
    play,
  };
}());

(function $() {
  function Fn(selector) {
    if (selector instanceof Fn) {
      return selector;
    }

    this.element = selector;

    if (typeof selector === 'string') {
      if (selector.indexOf('#') === 0) {
        this.element = document.getElementById(selector.slice(1));
      }
    }

    return this;
  }

  Fn.prototype.add = function add(klass) {
    if (this.element && this.element.classList) {
      this.element.classList.add(klass);
    }

    return this;
  };

  Fn.prototype.remove = function remove(klass) {
    if (this.element && this.element.classList) {
      this.element.classList.remove(klass);
    }

    return this;
  };

  Fn.prototype.touch = function touch(start, end) {
    const self = this;

    if (this.element) {
      if ('ontouchstart' in document.documentElement === false) {
        this.element.onmousedown = function onmousedown(mouseDownEvent) {
          if (start) {
            start(self, mouseDownEvent);
          }
          document.onmousemove = function onmousemove(e) {
            e.preventDefault();
          };
          document.onmouseup = function onmouseup(e) {
            if (end) {
              end(self, e);
            }
            document.onmousemove = undefined;
            document.onmouseup = undefined;
          };
        };
      } else {
        this.element.ontouchstart = function ontouchstart(touchStartEvent) {
          if (start) {
            start(self, touchStartEvent);
          }
          document.ontouchmove = function ontouchmove(e) {
            e.preventDefault();
          };
          document.ontouchend = function ontouchend(e) {
            if (end) {
              end(self, e);
            }
            document.ontouchmove = undefined;
            document.ontouchend = undefined;
          };
        };
      }
    }

    return this;
  };

  Fn.prototype.unwrap = function unwrap() {
    return this.element;
  };

  function root(selector) {
    return new Fn(selector);
  }

  window.jQuery = root;
}());

Game.play();
