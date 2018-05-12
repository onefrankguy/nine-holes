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
