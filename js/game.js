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
// [Prolix]: https://prolix-app.com/ "Prolix is a word search game for the iPhone and iPod touch which lets you tweet your scores so your friends can play with you."
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
const Board = {};

// <style>
// .board {
//   display: inline-grid;
//   grid-template-areas:
//     ". . ."
//     ". . ."
//     ". . ."
//     ". . ."
//     ". . ."
//     ;
//   border-top: 1px solid gray;
//   border-left: 1px solid gray;
// }
// .board > * {
//   border-bottom: 1px solid gray;
//   border-right: 1px solid gray;
// }
// .board > *,
// .ranks > *,
// .files > * {
//   font: 1rem/1 sans-serif;
//   width: 1.8rem;
//   height: 1.8rem;
//   display: flex;
//   justify-content: center;
//   align-items: center;
// }
// .layout {
//   display: inline-grid;
//   grid-template-areas:
//     ". ."
//     ". ."
//     ;
// }
// .files {
//   display: flex;
//   flex-direction: row;
// }
// .x:after {
//   content: 'x';
// }
// .y:after {
//   content: 'y';
// }
// .picked {
//   background: pink;
// }
// </style>
//
// When talking about board games, it's useful to be able to describe the
// players and the moves they make in shorthand. Chess notation used numbers for
// ranks (rows) and letters for files (columns). So we can draw a 3 x 3 board
// like this:
//
// <div class="layout">
// <div class="ranks">
//   <div>3</div>
//   <div>2</div>
//   <div>1</div>
// </div>
// <div class="board">
//   <div></div>
//   <div></div>
//   <div></div>
//   <div></div>
//   <div></div>
//   <div></div>
//   <div></div>
//   <div></div>
//   <div></div>
// </div>
// <div></div>
// <div class="files">
//   <div>a</div>
//   <div>b</div>
//   <div>c</div>
// </div>
// </div>
//
// We can reference any space on our board as a letter and number. So "a1" is
// the space in the lower left corner, and "c3" is the space in the upper right
// corner.
//
// Since we used "a" and "b" as column labels, we'll use X and Y for the
// players. In our game, players don't start with pieces on the board. But in
// other games, like Checkers, they do. Let's extend our board slightly so it
// has starting spaces for the pieces.
//
// <div class="layout">
// <div class="ranks">
//   <div>5</div>
//   <div>4</div>
//   <div>3</div>
//   <div>2</div>
//   <div>1</div>
// </div>
// <div class="board">
//   <div class="y"></div>
//   <div class="y"></div>
//   <div class="y"></div>
//   <div></div>
//   <div></div>
//   <div></div>
//   <div></div>
//   <div></div>
//   <div></div>
//   <div></div>
//   <div></div>
//   <div></div>
//   <div class="x"></div>
//   <div class="x"></div>
//   <div class="x"></div>
// </div>
// <div></div>
// <div class="files">
//   <div>a</div>
//   <div>b</div>
//   <div>c</div>
// </div>
// </div>
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
// the game. The board shouldn't care how it's rendered. For all it knows, we
// could be playing this game on a terminal and drawing it with ASCII text.
//
// Now that we can draw the board, we need a way to move pieces around it. If X
// starts by moving from a1 to c4, we can write that as "a1-c4". If Y responds
// by moving b5 to a4, we can write that as "b5-a4". We can keep both those
// moves in a list, `["a1-c4", "b5-a4"]`, and give ourselves a way to make them.

Board.clone = board => JSON.parse(JSON.stringify(board));

Board.move = (board, moves) => {
  const copy = Board.clone(board);

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
// (function testImmutableBoard() {
//   const starting = Board.create();
//   const playing = Board.move(starting, ['a1-c4', 'b5-a4']);
//
//   assert(starting['a1'] === 'x');
//   assert(starting['c4'] === '');
//   assert(starting['b5'] === 'y');
//   assert(starting['a4'] === '');
//
//   assert(playing['a1'] === '');
//   assert(playing['c4'] === 'x');
//   assert(playing['b5'] === '');
//   assert(playing['a4'] === 'y');
// }());
// ```
//
// Our board looks like it's working, so let's put it on the screen.
//
// ---
//
// [Canvas][] and [WebGL][] are often used to render video games in the browser.
// But for a game like ours, where the action isn't fast, HTML and CSS are quick
// enough.
//
// We can draw our board using HTML `<div>` elements. Using `<div>`, instead of
// a more semantic element like `<p>`, means we avoid browser quirks with
// default CSS rules. Each space on the board  will have its own `<div>`
// element. To make our board easy to reference and manipulate, we'll give each
// `<div>` an `id` attributes of the file and rank for that board space.
//
// [Canvas]: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API "Various (MDN): Canvas API"
// [WebGL]: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API "Various (MDN): WebGL API: 2D and 3D graphics for the web"
//
// ```
// <div class="board">
//   <div id="a5"></div>
//   <div id="b5"></div>
//   <div id="c5"></div>
//   <div id="a4"></div>
//   <div id="b4"></div>
//   <div id="c4"></div>
//   <div id="a3"></div>
//   <div id="b3"></div>
//   <div id="c3"></div>
//   <div id="a2"></div>
//   <div id="b2"></div>
//   <div id="c2"></div>
//   <div id="a1"></div>
//   <div id="b1"></div>
//   <div id="c1"></div>
// </div>
// ```
//
// We can use [CSS Grid][] to position the board spaces and [CSS Flexbox][] to
// keep the content in them centered. A border around the board spaces makes
// them visible.
//
// [CSS Grid]: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout "Various (MDN): CSS Grid Layout"
// [CSS Flexbox]: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout "Various (MDN): CSS Flexible Box Layout"
//
// ```
// <style>
// .board {
//   display: inline-grid;
//   grid-template-areas:
//     ". . ."
//     ". . ."
//     ". . ."
//     ". . ."
//     ". . ."
//     ;
//   border-top: 1px solid gray;
//   border-left: 1px solid gray;
// }
//
// .board > * {
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   border-bottom: 1px solid gray;
//   border-right: 1px solid gray;
// }
// </style>
// ```
//
// With those rules in place, our board looks like this.
//
// <div class="board">
//   <div></div>
//   <div></div>
//   <div></div>
//   <div></div>
//   <div></div>
//   <div></div>
//   <div></div>
//   <div></div>
//   <div></div>
//   <div></div>
//   <div></div>
//   <div></div>
//   <div></div>
//   <div></div>
//   <div></div>
// </div>
//
// It's tempting to use something like [jQuery's `.html()` function][html] to
// update the HTML and place "x" and "y" text elements for the pieces.
//
// ```
// (function testHtmlRendering() {
//   window.jQuery('#a1').html('x');
//   window.jQuery('#c5').html('y');
// }());
// ```
//
// But that kind of direct manipulation couples the display of the pieces to the
// JavaScript code. Instead, we'll use CSS classes to render "x" and "y"
// characters as pseudo elements. That way we can change the pieces later to
// look like squares and circles by changing the CSS.
//
// [html]: https://api.jquery.com/html/ "Various (jQuery): jQuery API Documentation - .html()"
//
// ```
// <style>
// .x:after {
//   content: 'x';
// }
//
// .y:after {
//   content: 'y';
// }
// </style>
// ```
//
// Instead of `.html()` we can use [jQuery's `.addClass()` function][addClass]
// to render pieces.
//
// [addClass]: https://api.jquery.com/addClass/ "Various (jQuery): jQuery API Documentation - .addClass()"
//
// ```
// (function testCssRendering() {
//   window.jQuery('#a1').addClass('x');
//   window.jQuery('#c5').addClass('y');
// }());
// ```
//
// The other thing we need to figure out is user feedback. We can set a `picked`
// class on board spaces when the user selects them, and change the background
// color to show they've been picked.
//
// ```
// <style>
// .picked {
//   background: pink;
// }
// </style>
// ```
//
// So how do we render a board with pieces on It?
//
// The keys in our `board.layout` object match the `id` elements of our board
// HTML. And the values in our `board.layout` object match the classes we use
// for styling board spaces. So we can render a board by iterating through its
// layout.

const Renderer = {};

Renderer.render = (board, picked) => {
  const $ = window.jQuery;

  Object.keys(board.layout).forEach((id) => {
    const element = $(`#${id}`);
    element.removeClass('picked');
    element.removeClass('x');
    element.removeClass('y');
    element.addClass(board.layout[id]);
  });

  $(`#${picked}`).addClass('picked');
};

// We use the `removeClass` function to clear any `x`, `y`, or `picked` classes
// that might have been previously set. That way the board renders cleanly each
// time. We also add the `picked` class to any picked element. It's okay if
// there's no picked element. An `$('#undefined')` call won't find anything, so
// nothing gets picked.
//
// To keep the rendered board up to date, we could use a loop and redraw it
// periodically. However, we only really need to redraw the board when something
// changes. So we'll give ourselves a way to invalidate the rendering and
// trigger a redraw.

Renderer.invalidate = (board, picked) => {
  requestAnimationFrame(() => Renderer.render(board, picked));
};

// Using [`requestAnimationFrame`][raf] lets the browser queue all our style
// changes and apply them before the next repaint. With more time sensitive
// animations, this helps avoid flickering.
//
// [raf]: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame "Various (MDN): window.requestAnimationFrame"
//
// Let's run the same test as before, but this time we'll render the board.
//
// ```
// (function testRenderer() {
//   const starting = Board.create();
//   Renderer.invalidate(starting);
//
//   const playing = Board.move(starting, ['a1-c4', 'b5-a4']);
//   Renderer.invalidate(playing, 'b1');
// }());
// ```
//
// Here's what that looks like.
//
// <div class="board">
//   <div class="y"></div>
//   <div></div>
//   <div class="y"></div>
//   <div class="y"></div>
//   <div></div>
//   <div class="x"></div>
//   <div></div>
//   <div></div>
//   <div></div>
//   <div></div>
//   <div></div>
//   <div></div>
//   <div></div>
//   <div class="x picked"></div>
//   <div class="x"></div>
// </div>
//
// So what's the next move?
//
// X could play "b1-c4" and try to stack pieces on top of each other. That would
// be illegal, but the `Board.move` function doesn't know the rules of the game.
// Just like how we don't want the board to know or care how it's displayed, we
// also don't want it to know or care about rules. We'll figure those out next.
//
// ---
//
// Let's write some rules.

const Rules = {};

// You can move your own pieces.

Rules.pickable = (board, player) => {
  const spaces = Object.keys(board.layout);
  return spaces.filter(space => board.layout[space] === player);
};

// You can move a piece to an empty non-starting space.

Rules.starting = (board) => {
  const spaces = Object.keys(board.layout);
  return spaces.filter(space => space.charAt(1) === '1' || space.charAt(1) === '5');
};

Rules.playable = (board) => {
  const spaces = Object.keys(board.layout);
  const empty = spaces.filter(space => !board.layout[space]);

  const starting = Rules.starting(board);
  return empty.filter(space => starting.indexOf(space) < 0);
};

// So every combination of a piece you can pick up and a space you can play
// into, is an allowed move.

Rules.moves = (board, player) => {
  const pickable = Rules.pickable(board, player);
  const playable = Rules.playable(board);
  const moves = [];

  pickable.forEach((start) => {
    playable.forEach((end) => {
      moves.push(`${start}-${end}`);
    });
  });

  return moves;
};

// That's enough to write a tiny test. Continuing the game above, X has three
// pieces, and there are seven empty spaces to play into. So that's twenty-one
// allowed moves.
//
// ```
// (function testMovementRules() {
//   const starting = Board.create();
//   const playing = Board.move(starting, ['a1-c4', 'b5-a4']);
//   const moves = Rules.moves(playing, 'x');
//
//   assert(moves.length === 21);
// }());
// ```
//
// The game is over when either player wins by getting three of their pieces in
// a row. Diagonals don't count though, and we don't want to include pieces in
// starting spaces.

Rules.winner = (board) => {
  const files = board.files.slice();
  const ranks = board.ranks.slice(1, -1);

  let winner;

  ranks.forEach((rank) => {
    if (!winner) {
      const players = [];

      files.forEach((file) => {
        players.push(board.layout[file + rank]);
      });

      if (new Set(players).size === 1 && players[0]) {
        [winner] = players;
      }
    }
  });

  files.forEach((file) => {
    if (!winner) {
      const players = [];

      ranks.forEach((rank) => {
        players.push(board.layout[file + rank]);
      });

      if (new Set(players).size === 1 && players[0]) {
        [winner] = players;
      }
    }
  });

  return winner;
};

// The decision to test for file wins first (vertical) instead of rank wins
// (horizontal) is totally arbitrary. The `slice()` function is used to get
// copies of the ranks and files from the board without changing it.
//
// We'll write a test to cover all four cases:
//
// 1. Starting space don't count.
// 2. Three in a row horizontally wins.
// 3. Three in a row vertically wins.
// 4. Three in a row diagonally doesn't count.
//
// ```
// (function testWinnerRules() {
//   const starting = Board.create();
//   assert(Rules.winner(starting) === undefined);
//
//   const horizontal = Board.move(starting, ['a1-a2', 'b1-b2', 'c1-c2']);
//   assert(Rules.winner(horizontal) === 'x');
//
//   const vertical = Board.move(starting, ['a5-a4', 'b5-a3', 'c5-a2']);
//   assert(Rules.winner(vertical) === 'y');
//
//   const diagonal = Board.move(starting, ['a1-a2', 'b1-b3', 'c1-c4']);
//   assert(Rules.winner(diagonal) === undefined);
// }());
// ```
//
// There are other edge cases we could cover, like three in a row vertically
// where one of the pieces is in a starting space. But the goal here isn't
// exhaustive test coverage. Often the best way to test a game is to start
// playing it. To do that, we'll need an oppontent.
//
// ---
//
// Let's write an AI.

const AI = {};

// Our AI can use the rules to find all the winning moves available to it.

AI.winning = (board, player) => {
  const moves = Rules.moves(board, player);
  return moves.filter((move) => {
    const test = Board.move(board, [move]);
    return Rules.winner(test) === player;
  });
};

// Our AI can also use the rules to find all the blocking moves available to it.
// Assume it's the other player's turn. What move would they make to win? If the
// AI can find a move it can make that puts its piece in the same space, that's
// a blocking move.

AI.opponent = player => (player === 'x' ? 'y' : 'x');

AI.blocking = (board, player) => {
  const opponent = AI.opponent(player);
  const winning = AI.winning(board, opponent).map(move => move.slice(3));
  const blocking = Rules.moves(board, player);
  return blocking.filter(move => winning.indexOf(move.slice(3)) > -1);
};

// Our AI wants to get all its pieces on the board. So it can use the rules to
// find moves that originate from a starting space.

AI.starting = (board, player) => {
  const moves = Rules.moves(board, player);
  const starting = Rules.starting(board);
  return moves.filter(move => starting.indexOf(move.slice(0, 2)) > 0);
};

// Our AI is simple. It plays a winning move if it sees one. Otherwise it plays
// a blocking move. If it doesn't see any winning or blocking moves, it plays a
// legal move. It prefers to play starting moves first.

AI.moves = (board, player) => {
  const winning = AI.winning(board, player);
  if (winning.length > 0) {
    return winning;
  }

  const blocking = AI.blocking(board, player);
  if (blocking.length > 0) {
    return blocking;
  }

  const starting = AI.starting(board, player);
  if (starting.length > 0) {
    return starting;
  }

  return Rules.moves(board, player);
};

AI.move = (board, player) => {
  const moves = AI.moves(board, player);
  const index = Math.floor(Math.random() * moves.length);
  return moves[index];
};

// Because our AI is stateless, and all its functions take a `player` argument,
// it can play our game against itself.
//
// ```
// (function testAI() {
//   let board = Board.create();
//   let winner;
//
//   while (!winner) {
//     const xmove = AI.move(board, 'x');
//     board = Board.move(board, [xmove]);
//     console.log(`x plays ${xmove} resulting in`, JSON.stringify(board.layout));
//
//     const ymove = AI.move(board, 'y');
//     board = Board.move(board, [ymove]);
//     console.log(`y plays ${ymove} resulting in`, JSON.stringify(board.layout));
//
//     winner = Rules.winner(board);
//   }
//
//   console.log(`${winner} wins!`);
// }());
// ```
//
// It looks like our AI works, but we won't really know until we play a game
// against it. Let's combine our board, rules, and AI into something that can
// drive our renderer.
//
// ---
//
// Let's write a game engine.

const Engine = {};

// A fixed unit of time in video games is often called a tick. With every tick
// the game state changes, and the board needs to be rendered. For our game, a
// move by the player and response from the AI is a tick.

Engine.tick = (board, player, start, end) => {
  if (Rules.winner(board)) {
    return [Board.clone(board), undefined];
  }

  let move = `${start}-${end}`;
  if (Rules.moves(board, player).indexOf(move) > -1) {
    let next = Board.move(board, [move]);

    if (Rules.winner(next) !== player) {
      move = AI.move(next, AI.opponent(player));
      next = Board.move(next, [move]);
    }

    return [next, undefined];
  }

  const pickable = Rules.pickable(board, player);
  const picked = [end, start].filter(space => pickable.indexOf(space) > -1);
  return [Board.clone(board), ...picked];
};

// The `Engine.tick` function takes a board, a player, and a move. It returns
// a board and a picked piece. That response matches the input to the
// `Renderer.render` function, so we can draw the board with every tick.
//
// If either the player or AI has won, we return the board unchanged with
// nothing picked.
//
// If the player is allowed to make their move, they take it. If the player
// didn't make a winning move, the AI gets a turn. Either way, we return the
// updated board with nothing picked.
//
// If the player tried to make an illegal move, we return the board unchanged.
// But we also need to figure out what space to leave picked. We know the player
// picked `start` and then picked `end`, so we return the _last_ valid space
// they chose. This lets the player pick a piece and then change their mind and
// pick a different piece.
//
// Let's write a test to check illegal moves.
//
// ```
// (function testIllegalMoves() {
//   const board = Board.create();
//   const empty = 'a2';
//   const ai = 'a5';
//   const player1 = 'a1';
//   const player2 = 'b1';
//
//   assert(Engine.tick(board, 'x', ai, empty)[1] === undefined);
//   assert(Engine.tick(board, 'x', ai, ai)[1] === undefined);
//   assert(Engine.tick(board, 'x', ai, player1)[1] === player1);
//
//   assert(Engine.tick(board, 'x', empty, empty)[1] === undefined);
//   assert(Engine.tick(board, 'x', empty, ai)[1] === undefined);
//   assert(Engine.tick(board, 'x', empty, player1)[1] === player1);
//
//   // `player1` to `empty` is a valid move, so we don't need to test it.
//   assert(Engine.tick(board, 'x', player1, ai)[1] === player1);
//   assert(Engine.tick(board, 'x', player1, player2)[1] === player2);
// }());
// ```
//
// Because our engine is stateless, we can use the AI to play our game against
// the engine. With each tick, the board updates with moves from both players.
//
// ```
// (function testEngine() {
//   let board = Board.create();
//   let winner;
//
//   while (!winner) {
//     const xmove = AI.move(board, 'x');
//     [board] = Engine.tick(board, 'x', ...xmove.split('-'));
//     console.log(`x plays ${xmove} resulting in`, JSON.stringify(board.layout));
//
//     winner = Rules.winner(board);
//   }
//
//   console.log(`${winner} wins!`);
// }());
// ```
//
// It looks like our engine works. Let's wire it up to our renderer so we can
// play against the AI.
//
// ---
//
// Let's write a game.

(function game() {
  // Our game keeps track of three things. There's a `board` for the game state,
  // an `input` list of spaces on the board the player has selected, and a `picked`
  // space that tracks the currently selected space.
  let board = Board.create();
  let input = [];
  let picked;

  // When the player selects a space we add the `picked` class to it, add the
  // selected space to the `input` list, tick the game engine, and render the
  // board. If this was a real time video game, we'd run that same loop (respond
  // to player input, tick the game engine, render the world) forever. Since
  // this is a turn based game, we only need to run it when the player does
  // something.
  function onBoard(element) {
    element.addClass('picked');
  }

  function offBoard(element) {
    input.push(element.unwrap().id);
    [board, picked] = Engine.tick(board, 'x', ...input);
    input = picked ? [picked] : [];
    Renderer.invalidate(board, picked);
  }

  // We also include a reset button that clears everything out and starts the
  // game over.
  function reset() {
    board = Board.create();
    input = [];
    picked = undefined;
  }

  function onReset(element) {
    element.addClass('picked');
  }

  function offReset(element) {
    element.removeClass('picked');
    reset();
    Renderer.invalidate(board, picked);
  }

  // Finally, we wire up click handlers for the board spaces and the reset
  // button. Then we initialize the game and render the starting board.
  function play() {
    const $ = window.jQuery;

    $('#reset').click(onReset, offReset);
    Object.keys(board.layout).forEach(id => $(`#${id}`).click(onBoard, offBoard));

    reset();
    Renderer.invalidate(board, picked);
  }

  window.onload = play;

// Because our game has state, it's not just pure functions any more, we're
// using an [IIFE][] (Immediately Invoked Function Expression) to avoid
// exposing that state to the outside world.
//
// [IIFE]: https://developer.mozilla.org/en-US/docs/Glossary/IIFE "Various (MDN): IIFE"
}());

// And that's how you make a video game.

// <h2 id="appendix">Appendix: A Tiny jQuery Clone</h2>

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

  Fn.prototype.addClass = function addClass(klass) {
    if (this.element && this.element.classList && klass) {
      this.element.classList.add(klass);
    }

    return this;
  };

  Fn.prototype.removeClass = function removeClass(klass) {
    if (this.element && this.element.classList) {
      this.element.classList.remove(klass);
    }

    return this;
  };

  Fn.prototype.click = function click(start, end) {
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
