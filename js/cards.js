document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll('[class^="reflection-container-"]');

    cards.forEach(card => {
        const content = card.querySelector('.reflection-content');
        if (!content) return;
        
        card.addEventListener('mousemove', (e) => {
            if (window.innerWidth < 1300) return;
            
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -20; 
            const rotateY = ((x - centerX) / centerX) * 20;
            
            content.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            content.style.transform = `rotateX(0deg) rotateY(0deg)`;
        });
    });

    window.addEventListener('deviceorientation', (e) => {
        if (window.innerWidth >= 1300) return;

        const beta = e.beta;
        const gamma = e.gamma;

        if (beta !== null && gamma !== null) {
            let rotateX = (beta - 45) * 0.5; 
            let rotateY = gamma * 0.6;

            rotateX = Math.max(-20, Math.min(20, rotateX));
            rotateY = Math.max(-20, Math.min(20, rotateY));

            cards.forEach(card => {
                const content = card.querySelector('.reflection-content');
                if (content) {
                    content.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                }
            });
        }
    });
});