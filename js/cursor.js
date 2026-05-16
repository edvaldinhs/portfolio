document.addEventListener('DOMContentLoaded', () => {

    const cursor = document.getElementById('custom-cursor');
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
        cursor.style.display = 'none';
        document.body.style.cursor = 'auto';

        document.querySelectorAll('a, button').forEach(el => {
            el.style.cursor = 'pointer';
        });
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

    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const newTheme = btn.getAttribute('data-set-theme');
            htmlEl.setAttribute('data-theme', newTheme);
        });
    });
});

window.lenis = new Lenis();

function raf(time) {
    window.lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

function travarScrollLenis() {
    const lenisInstance = window.lenis;

    if (lenisInstance) {
        lenisInstance.stop();
        document.documentElement.classList.add('scroll-travado');
        console.log("Scroll bloqueado com sucesso.");

        setTimeout(() => {
            lenisInstance.start();
            document.documentElement.classList.remove('scroll-travado');
            console.log("Scroll liberado.");
        }, 3000)

    } else {
        setTimeout(travarScrollLenis, 100);
    }
}

window.addEventListener('DOMContentLoaded', travarScrollLenis);