(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !Element.prototype.animate || !window.IntersectionObserver) return;

  const running = new Set();
  const seen = new WeakSet();
  const profile = document.querySelector('.profile');
  const descriptions = document.querySelectorAll('.project__description');

  function reveal(container) {
    if (seen.has(container)) return;
    seen.add(container);
    if (motion.matches) return;

    // Leave links intact so their hover animation and accessible names keep working.
    const blocks = container.querySelectorAll('h1, h2, p');
    blocks.forEach((block, blockIndex) => {
      const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          return node.parentElement.closest('a') || !node.textContent.trim()
            ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        }
      });
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      const words = [];
      nodes.forEach((node) => {
        const fragment = document.createDocumentFragment();
        node.textContent.split(/([ \t\r\n]+)/).forEach((part) => {
          if (!part) return;
          if (/^[ \t\r\n]+$/.test(part)) {
            fragment.append(document.createTextNode(part));
          } else {
            const word = document.createElement('span');
            word.className = 'reveal-word';
            word.textContent = part;
            words.push(word);
            fragment.append(word);
          }
        });
        node.replaceWith(fragment);
      });

      words.forEach((word, index) => {
        const animation = word.animate([
          { opacity: 0, transform: 'translateY(10px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], {
          duration: 480,
          delay: Math.min(blockIndex * 65, 325) + Math.min(index * 20, 280),
          easing: 'cubic-bezier(.22, 1, .36, 1)',
          fill: 'backwards'
        });
        running.add(animation);
        animation.finished.then(() => running.delete(animation)).catch(() => {});
      });
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      reveal(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });

  if (profile) reveal(profile);
  descriptions.forEach((description) => observer.observe(description));
  motion.addEventListener('change', () => {
    if (!motion.matches) return;
    running.forEach((animation) => animation.cancel());
    running.clear();
    observer.disconnect();
  });
})();
