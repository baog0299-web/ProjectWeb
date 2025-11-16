// Header and footer are loaded by header-loader.js
<<<<<<< HEAD
// Add any page-specific JavaScript here
=======
// Add any page-specific JavaScript here

// Smooth expand/collapse for <details class="faq-item">
(function faqExpand(){
  function setClosedHeight(bodyEl){
    bodyEl.style.maxHeight = '0px';
  }
  function setOpenHeight(bodyEl){
    // set to scrollHeight to animate then clear to 'none' after transition so content can grow
    bodyEl.style.maxHeight = bodyEl.scrollHeight + 'px';
  }

  function initDetail(d){
    const summary = d.querySelector('summary');
    const body = d.querySelector('.faq-body');
    if (!summary || !body) return;

    // initial state
    if (d.hasAttribute('open')) {
      // allow initial open to size correctly
      body.style.maxHeight = body.scrollHeight + 'px';
    } else {
      setClosedHeight(body);
    }

    // click on summary — control toggle to animate
    summary.addEventListener('click', (ev) => {
      ev.preventDefault(); // prevent default instant toggle
      const isOpen = d.hasAttribute('open');
      if (isOpen) {
        // close
        // set fixed height first to enable transition
        body.style.maxHeight = body.scrollHeight + 'px';
        // next frame set to 0 => animate
        requestAnimationFrame(() => {
          body.style.maxHeight = '0px';
        });
        d.removeAttribute('open');
      } else {
        // open: set open attribute immediately so CSS [open] rules apply (padding, chevron)
        d.setAttribute('open', '');
        // start from 0 then to scrollHeight to animate
        body.style.maxHeight = '0px';
        requestAnimationFrame(() => {
          setOpenHeight(body);
        });
      }
    });

    // ensure after transition, if open, allow auto height (clear maxHeight)
    body.addEventListener('transitionend', (e) => {
      if (e.propertyName !== 'max-height') return;
      if (d.hasAttribute('open')) {
        body.style.maxHeight = 'none';
      }
    });

    // keyboard accessibility: open/close on Enter/Space
    summary.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        summary.click();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.faq-item').forEach(initDetail);
  });
})();

>>>>>>> 9294b00256b2e8357c8056166bffc828fbc03138
