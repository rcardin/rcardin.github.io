(function() {
  var tabs = document.querySelectorAll('.filter-tab');
  var cards = document.querySelectorAll('.post-card');

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      var filter = this.getAttribute('data-filter');

      tabs.forEach(function(t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');

      cards.forEach(function(card) {
        if (filter === 'all' || card.getAttribute('data-type') === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
})();
