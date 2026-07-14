var noBtnStep = 0;
var noBtnTexts = ['不要 🦶', '求求你了~', '点不到吧🤭', '再想想呗😔'];
// All Y values are negative (upward only)
var dodgeMoves = [
  [110, -80],
  [-100, -90],
  [-80, -70],
  [0, 0]
];

function dodgeNoBtn() {
  var btn = document.getElementById('btnNo');
  if (!btn) return;

  var move = dodgeMoves[noBtnStep];
  var nextText = noBtnTexts[(noBtnStep + 1) % noBtnTexts.length];

  btn.style.transition = 'transform 0.15s ease-out';
  btn.style.transform = 'translate(' + move[0] + 'px, ' + move[1] + 'px)';

  btn.textContent = nextText;

  noBtnStep++;
  if (noBtnStep >= dodgeMoves.length) {
    setTimeout(function() {
      noBtnStep = 0;
      btn.style.transition = 'transform 0.25s ease-out';
      btn.style.transform = 'translate(0, 0)';
      btn.textContent = noBtnTexts[0];
    }, 500);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  var btn = document.getElementById('btnNo');
  if (btn) btn.addEventListener('click', dodgeNoBtn);
});
