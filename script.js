// Tarjeta 3D — drag con mouse/touch + flip por botón
// No frameworks, no dependencias. Pointer Events API (mouse + touch unificado).

(() => {
  const card = document.getElementById('card');
  const floater = document.querySelector('.floater');
  const flipBtn = document.getElementById('flipBtn');

  // Pose de reposo de la tarjeta. baseY = 0 (frente) o 180 (reverso).
  // Los ángulos iniciales del CSS dan una pose "isométrica" que invitan a girar.
  const REST_X = 6;
  const REST_Y_FRONT = -12;
  const REST_Y_BACK = -12 + 180;

  let baseY = REST_Y_FRONT;   // pose actual al soltar
  let liveY = REST_Y_FRONT;   // pose mientras se arrastra
  let liveX = REST_X;
  let dragging = false;
  let startPx = 0;
  let startPy = 0;

  const SMOOTH = 'transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)';
  const SLOW = 'transform 0.95s cubic-bezier(0.2, 0.8, 0.2, 1)';

  function setTransform(y, x, transition) {
    card.style.transition = transition || 'none';
    card.style.transform = `rotateY(${y}deg) rotateX(${x}deg)`;
  }

  function settleToBase(transition) {
    setTransform(baseY, REST_X, transition);
    liveY = baseY;
    liveX = REST_X;
  }

  card.addEventListener('pointerdown', (ev) => {
    // Si el click cae en un link o botón, dejá que el browser maneje el evento.
    if (ev.target.closest('a, button')) return;
    ev.preventDefault();
    dragging = true;
    startPx = ev.clientX;
    startPy = ev.clientY;
    card.classList.add('dragging');
    floater.style.animationPlayState = 'paused';
    try {
      card.setPointerCapture(ev.pointerId);
    } catch (_) {
      /* ignore */
    }
  });

  card.addEventListener('pointermove', (ev) => {
    if (!dragging) return;
    const dx = ev.clientX - startPx;
    const dy = ev.clientY - startPy;
    liveY = baseY + dx * 0.5;
    liveX = REST_X - dy * 0.4;
    if (liveX > 55) liveX = 55;
    if (liveX < -55) liveX = -55;
    setTransform(liveY, liveX);
  });

  function endDrag(ev) {
    if (!dragging) return;
    dragging = false;
    card.classList.remove('dragging');
    floater.style.animationPlayState = 'running';

    // Snap a la cara más cercana (frente o reverso).
    const norm = ((liveY % 360) + 360) % 360;
    const isBack = norm > 90 && norm < 270;
    baseY = isBack ? REST_Y_BACK : REST_Y_FRONT;
    settleToBase(SMOOTH);

    if (ev && ev.pointerId !== undefined) {
      try {
        card.releasePointerCapture(ev.pointerId);
      } catch (_) {
        /* ignore */
      }
    }
  }

  card.addEventListener('pointerup', endDrag);
  card.addEventListener('pointercancel', endDrag);
  card.addEventListener('pointerleave', (ev) => {
    if (dragging) endDrag(ev);
  });

  // Botón Voltear: alterna frente↔reverso con animación
  flipBtn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    baseY = baseY === REST_Y_FRONT ? REST_Y_BACK : REST_Y_FRONT;
    settleToBase(SLOW);
  });

  // Atajo de teclado: F voltea la tarjeta
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'f' || ev.key === 'F') {
      baseY = baseY === REST_Y_FRONT ? REST_Y_BACK : REST_Y_FRONT;
      settleToBase(SLOW);
    }
  });

  // Pose inicial
  settleToBase('none');
})();
