document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.getElementById('custom-cursor');
    let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
        cursor.style.display = 'none';
        document.body.style.cursor = 'auto';
        document.querySelectorAll('a, button').forEach(el => el.style.cursor = 'pointer');
    } else {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        function animateCursor() {
            cursorX += (mouseX - cursorX) * 0.15;
            cursorY += (mouseY - cursorY) * 0.15;
            cursor.style.transform = `translate3d(calc(${cursorX}px - 50%), calc(${cursorY}px - 50%), 0)`;
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        const interactables = document.querySelectorAll('a, button, .tag, .btn-signing, .btn-get-started');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('hovering-link'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('hovering-link'));
        });
    }

    const themeButtons = document.querySelectorAll('.theme-btn');
    const htmlEl = document.documentElement;
    const themes = ['dark', 'light', 'pink'];
    htmlEl.setAttribute('data-theme', themes[Math.floor(Math.random() * themes.length)]);

    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => htmlEl.setAttribute('data-theme', btn.getAttribute('data-set-theme')));
    });
});

window.lenis = new Lenis();

window.lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  window.lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

function travarScrollLenis() {
    if (window.lenis) {
        window.lenis.stop();
        document.documentElement.classList.add('scroll-travado');
    } else {
        setTimeout(travarScrollLenis, 100);
    }
}

window.addEventListener('DOMContentLoaded', travarScrollLenis);