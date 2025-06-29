let lazyImages = document.querySelectorAll('.lazy');

let options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
};

let lazyImageObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, index) {
        let lazyImage = entry.target;

        if (entry.isIntersecting) {
            lazyImage.src = lazyImage.dataset.src;
            lazyImage.classList.remove('lazy');

            setTimeout(() => {
                lazyImage.classList.add('show');
            }, index * 200);
        } else {
            lazyImage.classList.remove('show');
        }
    });
}, options);

lazyImages.forEach(function (lazyImage) {
    lazyImageObserver.observe(lazyImage);
});