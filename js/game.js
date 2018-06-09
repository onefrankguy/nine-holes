// How do you make a video game?
//
// When I created [Prolix][], I didn't know what I was doing. I had a basic
// understanding of web design, but I didn't know JavaScript. What I wanted was
// a video game built on open web standards. Something where I could read the
// code and understand it and change the rules and make it my own.
//
// This is that game.
//
//
// [Prolix]: http://prolix-app.com/ "Prolix is a word search game for the iPhone and iPod touch which lets you tweet your scores so your friends can play with you."
//
// ---
//
// **Nine Holes** is an old two-player game. It's played on a 3 x 3 board and
// is reminiscent of tic-tac-toe. Players have three pieces each. They take
// turns putting them on the board, and the winner is first to get three in
// a row. Unlike tic-tac-toe, diagonals don't count for a win, and pieces can be
// moved after they're played.
//
// So how do we make that into a video game? Well, let's start with a board.
let Board = {};

// <style>
// td {
//   font: 1rem/1 sans-serif;
//   width: 1.8rem;
//   height: 1.8rem;
//   border: 1px solid gray;
//   text-align: center;
// }
// td.label {
//   border: none;
// }
// </style>


// When talking about board games, it's useful to be able to describe both the
// players and the moves they make in shorthand. Chess notation used numbers for
// ranks (rows) and letters for files (columns). So we can draw a 3 x 3 board
// like this:
//
// <table>
// <tr><td class="label">3</td><td></td><td></td><td></td></tr>
// <tr><td class="label">2</td><td></td><td></td><td></td></tr>
// <tr><td class="label">1</td><td></td><td></td><td></td></tr>
// <tr><td class="label"></td><td class="label">a</td><td class="label">b</td><td class="label">c</td></tr>
// </table>
//
// We can reference any space on our board as a letter and number. So "a1" is
// the space in the lower left corner, and "c3" is the space in the upper right
// corner.
//
// Since we used "a" and "b" as column labels, so we'll use X and Y for the
// players. In our game, players don't start with pieces on the board. But in
// other games, like Checkers, they do. Let's extend our board slightly so it
// has starting spaces for the pieces.
//
// <table>
// <tr><td class="label">5</td><td>y</td><td>y</td><td>y</td></tr>
// <tr><td class="label">4</td><td></td><td></td><td></td></tr>
// <tr><td class="label">3</td><td></td><td></td><td></td></tr>
// <tr><td class="label">2</td><td></td><td></td><td></td></tr>
// <tr><td class="label">1</td><td>x</td><td>x</td><td>x</td></tr>
// <tr><td class="label"></td><td class="label">a</td><td class="label">b</td><td class="label">c</td></tr>
// </table>
//
// Every time we start a new game, that's what we want the board to look like.
// So let's give ourselves a way to create new game boards.

Board.create = () => {
  const files = ['a', 'b', 'c'];
  const ranks = ['1', '2', '3', '4', '5'];

  const layout = {};

  files.forEach((file) => {
    ranks.forEach((rank) => {
      layout[file + rank] = '';
    });
  });

  files.forEach((file) => {
    layout[`${file}1`] = 'x';
    layout[`${file}5`] = 'y';
  });

  return {
    files,
    ranks,
    layout,
  };
};

// The `Board.create` function returns everything we need to draw a picture of
// the game. The board shouldn't know or care how it's rendered. For all it
// knows, we could be playing this game on a terminal and drawing it out in
// ASCII text.

// Now that we can draw the board, we need a way to move pieces around it. If X
// starts by moving from a1 to c4, we can write that as "a1-c4". If Y responds
// by moving b5 to b4, we can write that as "b5-a4". We can keep both those
// moves in a list, `["a1-c4", "b5-a4"]`, and give ourselves a way to make them.

Board.move = (board, moves) => {
  const copy = JSON.parse(JSON.stringify(board));

  moves.forEach((move) => {
    const [start, end] = move.split('-');
    copy.layout[end] = copy.layout[start];
    copy.layout[start] = '';
  });

  return copy;
};

// The `Board.move` function uses `JSON.stringify` and `JSON.parse` to make a
// deep copy of a boad before updating it. This keeps the function pure. The
// same board and the same moves always give the same output. Pure functions
// are easier to debug than functions that mutate state, so we'll try to write
// as many of them as we can.
//
// We now have enough code to run a tiny test. We'll create a new board, make
// two moves on it, and see how the board changes.
//
// ```
// const starting = Board.create();
// console.log(starting.layout);
// const playing = Board.move(starting, ['a1-c4', 'b5-a4']);
// console.log(playing.layout);
// ```
//
// Here's the board after those two moves:
//
// <table>
// <tr><td class="label">5</td><td>y</td><td></td><td>y</td></tr>
// <tr><td class="label">4</td><td>y</td><td></td><td>x</td></tr>
// <tr><td class="label">3</td><td></td><td></td><td></td></tr>
// <tr><td class="label">2</td><td></td><td></td><td></td></tr>
// <tr><td class="label">1</td><td></td><td>x</td><td>x</td></tr>
// <tr><td class="label"></td><td class="label">a</td><td class="label">b</td><td class="label">c</td></tr>
// </table>
//
// What's the next move? X could play "b1-b4" and try to stack pieces on top of
// each other. That would be illegal, but the `Board.move` function doesn't know
// the rules of the game. Just like how we don't want the board to know or care
// how it's displayed, we also don't want it to know or care about rules. We'll
// figure those out next.
//
// ---
//
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

Board = (function board() {
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
  // You can only move your own pieces.
  function pickable(player, board) {
    return Object.keys(board.layout).filter((position) => {
      return board.layout[position] === player;
    });
  }

  // You have to move to an empty space that's not the starting row.
  function playable(player, board) {
    return Object.keys(board.layout).filter((position) => {
      return board.layout[position] === '' && position.charAt(0) !== 'p';
    });
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

    // Moves from a starting row must be played first.
    const drops = possible.filter(move => move[0].charAt(0) === 'p');
    if (drops.length > 0) {
      return drops;
    }

    return possible;
  }

  function winner(board) {
    const rows = [];
    const cols = [];

    for (let i = 0; i < board.rows; i += 1) {
      rows.push(String.fromCharCode(97 + i));
    }

    for (let i = 0; i < board.cols; i += 1) {
      cols.push(`${i + 1}`);
    }

    let result;

    rows.forEach((row) => {
      if (!result) {
        const players = [];

        cols.forEach((col) => {
          players.push(board.layout[row + col]);
        });

        if (new Set(players).size === 1 && players[0] !== '') {
          [result] = players;
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
          [result] = players;
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
  let picked;

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
    const { layout } = Board.get();

    Object.keys(layout).forEach((id) => {
      const element = $(`#${id}`);
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
    const { layout } = Board.get();
    const picked = Stage.get();

    Object.keys(layout).forEach((id) => {
      $(`#${id}`).remove('picked');
    });

    if (picked) {
      $(`#${picked}`).add('picked');
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
  function onPick(element) {
    element.add('picked');
  }

  function onPlay(element) {
    Stage.next(element.unwrap().id);
    Renderer.invalidate();
  }

  function onReset(element) {
    element.add('picked');
  }

  function offReset(element) {
    element.remove('picked');
    Board.reset();
    Stage.reset();
    Renderer.invalidate();
  }

  function play() {
    const $ = window.jQuery;
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

    $('#reset').touch(onReset, offReset);

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
