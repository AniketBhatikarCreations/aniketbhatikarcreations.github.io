document.addEventListener('DOMContentLoaded', function () {
  const liftDoors = document.getElementById('lift-doors');
  const doors = document.querySelectorAll('.door');
  const menu = document.getElementById('menu-content'); // keep if you use it
  let doorsOpened = false;

  // ensure images fade in when loaded (handles cached images too)
  document.querySelectorAll('.door img').forEach(img => {
    if (img.complete && img.naturalWidth !== 0) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
      img.addEventListener('error', () => img.classList.add('loaded'), { once: true });
    }
  });

  // openDoors: animate doors and then remove overlay so clicks work
  function openDoors() {
    if (!liftDoors || doorsOpened) return;
    doorsOpened = true;

    // Ensure overlay is visible & intercepting clicks during animation
    liftDoors.classList.remove('hidden');
    liftDoors.style.pointerEvents = 'auto';

    // add the open class to start CSS transform
    doors.forEach(d => d.classList.add('open'));

    // After the first door's transition ends, remove overlay so clicks pass through.
    // Using transitionend ensures we wait for the CSS animation to finish.
    const onTransitionEnd = (e) => {
      // Only act on transform end events
      if (e.propertyName && e.propertyName.indexOf('transform') === -1) return;
      // hide overlay so underlying links/buttons work
      liftDoors.classList.add('hidden');
      liftDoors.style.pointerEvents = 'none';
      // cleanup listener
      doors.forEach(d => d.removeEventListener('transitionend', onTransitionEnd));
    };

    // attach to each door; the first to finish will run and then cleanup
    doors.forEach(d => d.addEventListener('transitionend', onTransitionEnd));
  }

  // auto open on desktop widths (keeps your original logic)
  if (window.innerWidth > 600) {
    // small delay helps browsers paint images before transform in some edge cases
    // (optional, tweak or remove)
    setTimeout(openDoors, 60);
  }

  // Optional: open on clicking #menu-content (if you want that behaviour)
  if (menu) {
    menu.addEventListener('click', openDoors, { once: true });
  }
});