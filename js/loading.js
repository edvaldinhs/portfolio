const tl = gsap.timeline();
const countObj = { value: 0 };

const timerId = setTimeout(() => {
    document.body.style.overflow = 'auto';
}, 6000);

tl.to('.header-bar', {
    yPercent: -100,
    duration: 0,
    ease: "power4.out"
});

tl.to(countObj, {
    value: 100,
    duration: 2.5,
    ease: "power3.out",
    onUpdate: function () {
        document.querySelector('.counter').textContent = Math.floor(countObj.value);
    }
});

tl.to('.bar-fill', {
    width: '100%',
    duration: 2.5,
    ease: "power3.out"
}, "<");

tl.to('.counter, .bar-bg, .loader-gif', {
    opacity: 0,
    y: -30,
    duration: 0.4,
    ease: "power2.in"
}, "+=0.2");

tl.to('#loader', {
    yPercent: -100,
    duration: 1.4,
    ease: "power4.out"
});

tl.set('body', { overflow: 'auto' }, "<");

tl.to('#content', {
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: "power4.out"
}, "-=0.4");

tl.from(".hero-svg path", {
    y: 60,
    opacity: 0,
    duration: 0.8,
    stagger: {
        each: 0.12,
        from: "random"
    },
    ease: "power3.out"
}, "-=1.85");

tl.to('.line-divider', {
    width: '100%',
    duration: 2.2,
    ease: "power3.out"
}, "-=1.8");

tl.to('.header-bar', {
    yPercent: 0,
    duration: 2.2,
    ease: "power4.out"
}, "-=2");

tl.fromTo('.fade-up', {
    y: 60,
    opacity: '0%',
}, {
    y:0,
    opacity: '100%'
}, "-=2")

tl.fromTo('.fade-up-2', {
    opacity: '0%',
}, {
    opacity: '100%'
}, "-=1.5")

