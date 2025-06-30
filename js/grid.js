function filterItems(category) {
      const cards = document.querySelectorAll('.card');
      const buttons = document.querySelectorAll('.filter-buttons button');

      buttons.forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');

      cards.forEach(card => {
        if (category === 'all') {
          card.classList.remove('hidden');
        } else {
          card.classList.toggle('hidden', !card.classList.contains(category));
        }
      });
    }