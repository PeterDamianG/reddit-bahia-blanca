// Tarjeta 3D — drag con Pointer Events sobre auto-rotación CSS + flip manual
// Drag threshold permite que clicks en links pasen sin interferencia.

(() => {
  const card = document.getElementById('card');
  const floater = document.querySelector('.floater');
  const spinner = document.getElementById('spinner');
  const flipBtn = document.getElementById('flipBtn');

  const DRAG_THRESHOLD = 6; // px — umbral antes de iniciar drag
  let isPossibleDrag = false;
  let isDragging = false;
  let startPx = 0;
  let startPy = 0;
  let liveY = 0;
  let liveX = 0;

  // Estados de la cara mostrada manualmente:
  //   'auto'   — auto-rotación CSS continua corriendo
  //   'back'   — bloqueado mostrando reverso
  //   'front'  — bloqueado mostrando frente
  let lockState = 'auto';

  function pauseAnimations() {
    spinner.style.animationPlayState = 'paused';
    floater.style.animationPlayState = 'paused';
  }
  function resumeAnimations() {
    spinner.style.animationPlayState = 'running';
    floater.style.animationPlayState = 'running';
  }

  function applyLock() {
    spinner.classList.remove('flipped', 'front-locked');
    if (lockState === 'back') spinner.classList.add('flipped');
    else if (lockState === 'front') spinner.classList.add('front-locked');
    // 'auto' → ninguna clase, animación corre normal
  }

  // ─── Drag interactivo (rotateY/X libre con mouse) ───────────────
  card.addEventListener('pointerdown', (ev) => {
    isPossibleDrag = true;
    startPx = ev.clientX;
    startPy = ev.clientY;
  });

  card.addEventListener('pointermove', (ev) => {
    if (!isPossibleDrag) return;
    const dx = ev.clientX - startPx;
    const dy = ev.clientY - startPy;

    if (!isDragging) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      isDragging = true;
      card.classList.add('dragging');
      pauseAnimations();
      try {
        card.setPointerCapture(ev.pointerId);
      } catch (_) {
        /* ignore */
      }
    }

    liveY = dx * 0.5;
    liveX = -dy * 0.4;
    if (liveX > 50) liveX = 50;
    if (liveX < -50) liveX = -50;
    card.style.transition = 'none';
    card.style.transform = `rotateY(${liveY}deg) rotateX(${liveX}deg)`;
  });

  function endInteraction(ev) {
    isPossibleDrag = false;
    if (!isDragging) return;
    isDragging = false;
    card.classList.remove('dragging');

    // Animar la tarjeta de vuelta a transform identidad
    card.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
    card.style.transform = 'rotateY(0deg) rotateX(0deg)';

    // Reanudar animaciones según el estado de lock
    setTimeout(() => {
      if (lockState === 'auto') resumeAnimations();
    }, 600);

    if (ev && ev.pointerId !== undefined) {
      try {
        card.releasePointerCapture(ev.pointerId);
      } catch (_) {
        /* ignore */
      }
    }
  }

  card.addEventListener('pointerup', endInteraction);
  card.addEventListener('pointercancel', endInteraction);
  document.addEventListener('pointerup', endInteraction);

  // ─── Botón Voltear: ciclo auto → back-locked → front-locked → auto ───
  flipBtn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    if (lockState === 'auto') {
      lockState = 'back';
      pauseAnimations();
    } else if (lockState === 'back') {
      lockState = 'front';
    } else {
      lockState = 'auto';
      resumeAnimations();
    }
    applyLock();
  });

  // Atajo de teclado F = voltear (mismo ciclo)
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'f' || ev.key === 'F') {
      flipBtn.click();
    }
  });
})();
