const exhibitionFrames = Array.from(document.querySelectorAll<HTMLElement>('.exhibition-frame'));
const previous = document.querySelector<HTMLButtonElement>('#previousFrame');
const next = document.querySelector<HTMLButtonElement>('#nextFrame');
const currentLabel = document.querySelector<HTMLElement>('#frameNumber');
const totalLabel = document.querySelector<HTMLElement>('#frameTotal');
const frameStatus = document.querySelector<HTMLElement>('#frameStatus');
const indexToggle = document.querySelector<HTMLButtonElement>('#indexToggle');
const indexPanel = document.querySelector<HTMLDialogElement>('#exhibitionIndex');
const indexClose = document.querySelector<HTMLButtonElement>('#indexClose');
const indexList = document.querySelector<HTMLOListElement>('#frameIndex');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const indexButtons: HTMLButtonElement[] = [];
let current = 0;
let lastNavigationAt = 0;
let wheelDelta = 0;
let wheelTimer: number | undefined;
let touchStart: { x: number; y: number } | null = null;

const transitionMs = () => (prefersReducedMotion.matches ? 20 : 760);
const titleFor = (frame: HTMLElement) => frame.dataset.title || 'Untitled';
const toneFor = (frame: HTMLElement) => frame.dataset.tone || 'light';

function setChromeTone(frame: HTMLElement) {
  document.body.dataset.exhibitionTone = toneFor(frame);
}

function updateIndexState() {
  indexButtons.forEach((button, index) => {
    if (index === current) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
}

function updateStatus() {
  const frame = exhibitionFrames[current];
  if (!frame) return;
  if (currentLabel) currentLabel.textContent = String(current + 1).padStart(2, '0');
  if (frameStatus) frameStatus.textContent = `Frame ${current + 1} of ${exhibitionFrames.length}: ${titleFor(frame)}`;
  setChromeTone(frame);
  updateIndexState();
}

if (totalLabel) totalLabel.textContent = String(exhibitionFrames.length).padStart(2, '0');

exhibitionFrames.forEach((frame, index) => {
  const isActive = index === current;
  frame.inert = !isActive;
  frame.setAttribute('aria-hidden', String(!isActive));

  const item = document.createElement('li');
  const button = document.createElement('button');
  const route = frame.dataset.route || '/';
  const title = titleFor(frame);
  button.type = 'button';
  button.setAttribute('aria-label', `Go to frame ${index + 1}: ${title}`);
  button.innerHTML = `<small>${String(index + 1).padStart(2, '0')}</small><strong>${title}</strong><span>${route}</span>`;
  button.addEventListener('click', () => {
    go(index);
    closeIndex();
  });
  item.append(button);
  indexList?.append(item);
  indexButtons.push(button);
});

function go(target: number) {
  const normalized = (target + exhibitionFrames.length) % exhibitionFrames.length;
  const now = Date.now();
  if (now - lastNavigationAt < transitionMs() || normalized === current) return;

  lastNavigationAt = now;
  const outgoing = exhibitionFrames[current];
  const incoming = exhibitionFrames[normalized];
  if (!outgoing || !incoming) return;
  const hadFocus = outgoing.contains(document.activeElement);

  outgoing.classList.add('is-leaving');
  outgoing.classList.remove('is-active');
  outgoing.inert = true;
  outgoing.setAttribute('aria-hidden', 'true');

  incoming.inert = false;
  incoming.setAttribute('aria-hidden', 'false');
  incoming.classList.add('is-active');
  // The control that was used has just gone inert: keep keyboard focus in the sequence.
  if (hadFocus) {
    incoming.tabIndex = -1;
    incoming.focus({ preventScroll: true });
  }
  current = normalized;
  wheelDelta = 0;
  updateStatus();

  window.setTimeout(() => {
    outgoing.classList.remove('is-leaving');
  }, transitionMs());
}

// A frame taller than a very small window scrolls inside itself. Reports whether it still has
// content to show in that direction, and with `reveal` scrolls to it.
function frameHasMore(direction: 1 | -1, reveal = false) {
  const inner = exhibitionFrames[current]?.querySelector<HTMLElement>('.frame-inner');
  if (!inner || getComputedStyle(inner).overflowY !== 'auto') return false;
  const remaining = direction > 0 ? inner.scrollHeight - inner.clientHeight - inner.scrollTop : inner.scrollTop;
  if (remaining <= 1) return false;
  if (reveal) {
    inner.scrollBy({ top: direction * inner.clientHeight * 0.8, behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
  }
  return true;
}

function openIndex() {
  if (!indexPanel || indexPanel.open) return;
  document.body.classList.add('index-open');
  indexPanel.showModal();
  window.requestAnimationFrame(() => indexPanel.classList.add('is-open'));
  indexToggle?.setAttribute('aria-expanded', 'true');
  indexClose?.focus();
}

function closeIndex() {
  if (!indexPanel?.open) return;
  indexPanel.classList.remove('is-open');
  indexToggle?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('index-open');
  const currentFrame = exhibitionFrames[current];
  if (currentFrame) setChromeTone(currentFrame);
  window.setTimeout(() => {
    if (indexPanel.open) indexPanel.close();
    indexToggle?.focus();
  }, prefersReducedMotion.matches ? 0 : 260);
}

previous?.addEventListener('click', () => go(current - 1));
next?.addEventListener('click', () => go(current + 1));
indexToggle?.addEventListener('click', openIndex);
indexClose?.addEventListener('click', closeIndex);
indexPanel?.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeIndex();
});
document.querySelectorAll<HTMLElement>('[data-next]').forEach((item) => item.addEventListener('click', () => go(current + 1)));
// A control can name the frame it leads to by that frame's id.
document.querySelectorAll<HTMLElement>('[data-goto]').forEach((item) => item.addEventListener('click', () => {
  const target = exhibitionFrames.findIndex((frame) => frame.id === item.dataset.goto);
  if (target >= 0) go(target);
}));

document.addEventListener('keydown', (event) => {
  if (indexPanel?.open) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeIndex();
    }
    return;
  }
  // Browser shortcuts such as Alt+Left keep working, and Space still presses a focused control.
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  const onControl = event.target instanceof Element && event.target.closest('a, button, input, select, textarea') !== null;
  if (event.key === ' ' && onControl) return;

  if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(event.key)) {
    event.preventDefault();
    if (event.key !== 'ArrowRight' && frameHasMore(1, true)) return;
    go(current + 1);
  }
  if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) {
    event.preventDefault();
    if (event.key !== 'ArrowLeft' && frameHasMore(-1, true)) return;
    go(current - 1);
  }
  if (event.key.toLowerCase() === 'i') openIndex();
});

document.addEventListener('wheel', (event) => {
  if (indexPanel?.open || Date.now() - lastNavigationAt < transitionMs() || event.ctrlKey) return;
  // The wheel scrolls such a frame natively; it changes frame only once there is nothing left.
  if (frameHasMore(event.deltaY > 0 ? 1 : -1)) {
    wheelDelta = 0;
    return;
  }
  window.clearTimeout(wheelTimer);
  wheelDelta += event.deltaY + event.deltaX;
  if (Math.abs(wheelDelta) >= 100) go(current + (wheelDelta > 0 ? 1 : -1));
  wheelTimer = window.setTimeout(() => {
    wheelDelta = 0;
  }, 180);
}, { passive: true });

document.addEventListener('touchstart', (event) => {
  const touch = event.changedTouches[0];
  touchStart = touch ? { x: touch.clientX, y: touch.clientY } : null;
}, { passive: true });

document.addEventListener('touchend', (event) => {
  const touch = event.changedTouches[0];
  if (!touchStart || !touch) return;
  const deltaX = touch.clientX - touchStart.x;
  const deltaY = touch.clientY - touchStart.y;
  if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) go(current + (deltaX < 0 ? 1 : -1));
  touchStart = null;
}, { passive: true });

updateStatus();
