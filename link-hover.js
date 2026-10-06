(() => {
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const sound = new Audio('assets/link-hover.mp3');
  sound.preload = 'auto';
  sound.volume = 0.46;
  const voices = [sound];
  let lastX = NaN;
  let lastY = NaN;

  // A moving link must not retrigger the sound under a stationary pointer.
  document.addEventListener('pointermove', (event) => {
    lastX = event.clientX;
    lastY = event.clientY;
  }, { capture: true, passive: true });

  document.querySelectorAll('a:has(.link-arrow)').forEach((link) => {
    link.addEventListener('pointerenter', (event) => {
      if (!pointer.matches || event.pointerType !== 'mouse') return;
      if (event.clientX === lastX && event.clientY === lastY) return;
      let voice = voices.find((item) => item.paused);
      if (!voice && voices.length < 4) {
        voice = sound.cloneNode();
        voice.volume = sound.volume;
        voices.push(voice);
      }
      if (!voice) return;
      voice.currentTime = 0;
      // Browsers may block hover audio until the visitor interacts with the page.
      voice.play().catch(() => {});
    });
  });
})();
