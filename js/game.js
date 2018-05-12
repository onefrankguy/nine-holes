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

const Renderer = (function renderer() {
  let dirty = true;

  function render() {
    if (dirty) {
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
  function play() {
    Renderer.invalidate();
    Renderer.render();
  }

  return {
    play,
  };
}());

Game.play();
