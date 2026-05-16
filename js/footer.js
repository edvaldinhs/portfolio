let mm = gsap.matchMedia();

mm.add("(min-width: 768px)", () => {
    const part2 = document.querySelector(".part-2");

    const revealTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".scroll-container",
            start: "bottom bottom",
            end: () => `+=${part2.offsetHeight}`,
            scrub: true,
            pin: true,
            invalidateOnRefresh: true,
        }
    });

    revealTl.to(".part-1", {
        y: () => -part2.offsetHeight,
        ease: "none"
    });

    return () => {
        gsap.set(".part-1", { clearProps: "all" });
    };
});

window.addEventListener("load", () => {
    ScrollTrigger.refresh();
});