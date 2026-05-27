const countObj = { value: 0 };

const timerId = setTimeout(() => {
    if (countObj.value < 100) window.dispatchEvent(new Event('simulation-loaded'));
}, 10000);

const progressTl = gsap.timeline();

progressTl.to('.header-bar', {
    yPercent: -100,
    duration: 0,
    ease: "power4.out"
});

progressTl.to(countObj, {
    value: 90,
    duration: 3, 
    ease: "power2.out",
    onUpdate: () => document.querySelector('.counter').textContent = Math.floor(countObj.value)
}, 0);

progressTl.to('.bar-fill', {
    width: '90%',
    duration: 3,
    ease: "power2.out"
}, 0);

window.addEventListener('simulation-loaded', () => {
    clearTimeout(timerId);
    
    progressTl.kill(); 

    gsap.to(countObj, {
        value: 100,
        duration: 0.8,
        ease: "power2.out",
        onUpdate: () => document.querySelector('.counter').textContent = Math.floor(countObj.value),
        onComplete: playExitAnimation 
    });
    
    gsap.to('.bar-fill', { 
        width: '100%', 
        duration: 0.8, 
        ease: "power2.out" 
    });
});

function playExitAnimation() {
    const exitTl = gsap.timeline();

    exitTl.to('.counter, .bar-bg, .loader-gif', {
        opacity: 0,
        y: -30,
        duration: 0.4,
        ease: "power2.in"
    });

    exitTl.to('#loader', {
        yPercent: -100,
        duration: 1.4,
        ease: "power4.out"
    });

    exitTl.set('body', { overflow: 'auto' }, "<");
    
    exitTl.call(() => {
        if(window.lenis) {
            window.lenis.start();
            document.documentElement.classList.remove('scroll-travado');
        }
    }, null, "<");

    exitTl.to('#content', {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power4.out"
    }, "-=0.4");

    exitTl.from(".hero-svg path", {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: { each: 0.12, from: "random" },
        ease: "power3.out"
    }, "-=1.85");

    exitTl.to('.line-divider', {
        width: '100%',
        duration: 2.2,
        ease: "power3.out"
    }, "-=1.8");

    exitTl.to('.header-bar', {
        yPercent: 0,
        duration: 2.2,
        ease: "power4.out"
    }, "-=2");

    exitTl.fromTo('.fade-up', 
        { y: 60, opacity: '0%' }, 
        { y: 0, opacity: '100%' }, 
    "-=2");

    exitTl.fromTo('.fade-up-2', 
        { opacity: '0%' }, 
        { opacity: '100%' }, 
    "-=1.5");
}