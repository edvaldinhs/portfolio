document.addEventListener('DOMContentLoaded', function () {
    let header = document.querySelector('.header-container');
    header.classList.add("show-header");

    const textElement = document.querySelector('.sec-text');
    const words = ['Edvaldo', 'Edinho', 'Eddy', 'Ed'];

    let wordIndex = 0;
    let isReversed = false;
    let charIndex = 0;

    function updateText() {
        const currentWord = words[wordIndex];
        textElement.textContent = currentWord.substring(0, charIndex);

        if (!isReversed) {
            charIndex++;

            if (charIndex > currentWord.length) {
                isReversed = true;
                setTimeout(updateText, 1000);
            } else {
                setTimeout(updateText, 100);
            }
        } else {
            charIndex--;

            if (charIndex === 0) {
                isReversed = false;
                wordIndex = (wordIndex + 1) % words.length;
                setTimeout(updateText, 1000);
            } else {
                setTimeout(updateText, 100);
            }
        }
    }

    let headerWrapper = document.querySelector('.header-wrapper');
    let sticky = header.offsetTop;
    let scrollThreshold = 500;

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > scrollThreshold) {
        header.classList.add('sticky');
        headerWrapper.style.height = '80px';
        } else {
        header.classList.remove('sticky');
        headerWrapper.style.height = '0';
        }
    });

    updateText();

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

const list = document.querySelector('.horizontal-carousel ul');
const items = document.querySelectorAll('.horizontal-carousel li');

function handleItemClick(selectedItem) {
    items.forEach(item => {
        item.classList.remove('selected');
        item.style.filter = 'grayscale(100%)';
    });

    selectedItem.parentElement.classList.add('selected');
    selectedItem.parentElement.style.filter = 'none';

    const selectedIndex = Array.from(items).indexOf(selectedItem.parentElement);

    const translateValue = -selectedIndex * selectedItem.parentElement.offsetWidth + (list.offsetWidth / 2 - selectedItem.parentElement.offsetWidth / 2);

    list.style.transform = `translateX(${translateValue}px)`;
}

handleItemClick(items[0].querySelector('.item'));

items.forEach(item => {
    const itemDiv = item.querySelector('.item');
    itemDiv.addEventListener('click', function() {
        handleItemClick(this);
    });
});


});