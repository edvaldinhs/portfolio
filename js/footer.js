ScrollTrigger.config({ ignoreMobileResize: true });

const part2 = document.querySelector(".part-2");

if (part2) {
    const revealTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".scroll-container",
            start: "bottom bottom",
            end: () => `+=${part2.offsetHeight}`,
            scrub: true,
            pin: true,
            invalidateOnRefresh: true
        }
    });

    revealTl.to(".part-1", {
        y: () => -part2.offsetHeight,
        ease: "none"
    });
}
window.addEventListener("load", () => {
    ScrollTrigger.refresh();
});