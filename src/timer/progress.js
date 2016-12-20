'use strict';

const ProgressBar = require('progress');

const INTERVAL = 1000;

const s = 1000;
const m = s * 60;
const h = m * 60;
const d = h * 24;

function floorms(time) {
  if (time >= d) {
    return `${Math.floor(time / d)}d`;
  }
  if (time >= h) {
    return `${Math.floor(time / h)}h`;
  }
  if (time >= m) {
    return `${Math.floor(time / m)}m`;
  }
  return `${Math.floor(time / s)}s`;
}

function now() {
  return new Date().getTime();
}

module.exports = (zeit, done) => {
  const end = zeit.pause ? now() + (zeit.duration - (zeit.pause - zeit.start)) : zeit.end;

  function getOffset() {
    return now() - (end - zeit.duration);
  }

  const bar = new ProgressBar(' :ctime / :ttime (:percent):paused :bar', {
    total: Math.round(zeit.duration / INTERVAL),
    complete: '█',
    incomplete: '-',
  });

  function start() {
    const startOffset = getOffset();

    bar.tick(Math.round(startOffset / INTERVAL), {
      ctime: startOffset < 1000 ? '0s' : floorms(startOffset),
      ttime: floorms(zeit.duration),
      paused: '',
    });

    const timer = setInterval(() => {
      bar.tick({
        ctime: floorms(getOffset()),
        ttime: floorms(zeit.duration),
        paused: '',
      });
      if (bar.complete) {
        clearInterval(timer);
        if (typeof done === 'function') {
          done();
        }
      }
    }, INTERVAL);

    return () => {
      clearInterval(timer);
    };
  }

  const stop = start();

  const prog = {
    terminate() {
      bar.clear = true;
      stop();
      bar.terminate();
    },
    pause() {
      bar.tick(0, {
        ctime: floorms(getOffset()),
        ttime: floorms(zeit.duration),
        paused: ' ❚❚ PAUSED',
      });
      stop();
    },
  };

  if (zeit.pause) {
    prog.pause();
  }

  return prog;
};
