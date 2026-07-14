document.addEventListener('DOMContentLoaded', function() {
  var cards = document.querySelectorAll('.food-card');
  cards.forEach(function(card) {
    card.addEventListener('click', function(e) {
      e.preventDefault();
      var label = card.querySelector('.label');
      if (label) {
        localStorage.setItem('dating_selectedFood', label.textContent);
      }
    });
  });
});
