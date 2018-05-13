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

  // The PRNG provides an in-place shuffle for use with arrays. It's based on
  // the [Fisher-Yates shuffle describe by Mike Bostock][fys].
  //
  // [fys]: https://bost.ocks.org/mike/shuffle/ "Mike Bostock: Fisher-Yates Shuffle"
  function shuffle(array) {
    let m = array.length;
    let t;
    let i;

    while (m > 0) {
      i = Math.floor(random() * m);
      m -= 1;
      t = array[m];
      array[m] = array[i]; // eslint-disable-line no-param-reassign
      array[i] = t; // eslint-disable-line no-param-reassign
    }
  }

  // Randomly picking items out of arrays is usefull too, so the PRNG provies a
  // function to do that. `Math.floor()` is used instead of `Math.round()` to
  // avoid a non-uniform distribution of random numbers.
  function pick(array) {
    const index = Math.floor(random() * array.length);
    return array[index];
  }

  return {
    random,
    shuffle,
    pick,
  };
}());

const Board = (function board() {
  let layout = {};

  function get() {
    return Object.assign({}, layout);
  }

  function canPick(position) {
    return 'whilte' === layout[position] || 'black' === layout[position];
  }

  function canPlay(position) {
    return '' === layout[position] && 'p' !== layout[position][0];
  }

  function valid(start, end) {
    return canPick(start) && canPlay(end);
  }

  function move(start, end) {
    if (valid(start, end)) {
      layout[end] = layout[start];
      layout[start] = '';
    }
  }

  function reset() {
    layout = {};

    layout['p21'] = 'black';
    layout['p22'] = 'black';
    layout['p23'] = 'black';

    layout['a3'] = '';
    layout['b3'] = '';
    layout['c3'] = '';
    layout['a2'] = '';
    layout['b2'] = '';
    layout['c2'] = '';
    layout['a1'] = '';
    layout['b1'] = '';
    layout['c1'] = '';

    layout['p11'] = 'white';
    layout['p12'] = 'white';
    layout['p13'] = 'white';
  }

  return {
    get,
    valid,
    move,
    reset,
  }
}());

const Stage = (function stage() {
  let state = 'unknown';

  function get() {
    return state;
  }

  function reset() {
    state = 'unknown';
  }

  function onUnknown(message) {
  }

  function next(message) {
    if ('unknown' === state) {
      return onUnknown(message);
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
    const layout = Board.get();

    Object.keys(layout).forEach((id) => {
      if ('' === layout[id]) {
        $(id).add('hole').remove('piece').remove('white').remove('black');
      }
      if ('white' === layout[id]) {
        $(id).add('white').add('piece').remove('hole').remove('black');
      }
      if ('black' === layout[id]) {
        $(id).add('black').add('piece').remove('hole').remove('white');
      }
    });
  }

  function render() {
    if (dirty) {
      renderBoard();
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
    Renderer.invalidate();
  }

  function onPlay(element) {
    Renderer.invalidate();
  }

  function play() {
    const $ = window.jQuery;

    $('#a3').touch(onPick, onPlay);
    $('#b3').touch(onPick, onPlay);
    $('#c3').touch(onPick, onPlay);

    $('#a2').touch(onPick, onPlay);
    $('#b2').touch(onPIck, onPlay);
    $('#c2').touch(onPick, onPlay);

    $('#a1').touch(onPick, onPlay);
    $('#b1').touch(onPick, onPlay);
    $('#c1').touch(onPick, onPlay);

    $('#p1').touch(onPick, onPlay);
    $('#p2').touch(onPick, onPlay);
    $('#p3').touch(onPick, onPlay);

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

  function root(selector) {
    return new Fn(selector);
  }

  window.jQuery = root;
}());

Game.play();
