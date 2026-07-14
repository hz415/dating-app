document.addEventListener('DOMContentLoaded', function() {
  var dateStr = localStorage.getItem('dating_selectedDate') || '';
  var timeStr = localStorage.getItem('dating_selectedTime') || '';
  var foodStr = localStorage.getItem('dating_selectedFood') || '';

  // Format date: 2026/07/11 → 7月11日
  var dateDisplay = '--';
  if (dateStr) {
    var parts = dateStr.split('/');
    if (parts.length === 3) {
      dateDisplay = parseInt(parts[1]) + '月' + parseInt(parts[2]) + '日';
    }
  }

  var timeDisplay = timeStr || '--';
  var foodDisplay = foodStr || '--';

  // Fill cards
  var dateEl = document.getElementById('confirmDate');
  var timeEl = document.getElementById('confirmTime');
  var foodEl = document.getElementById('confirmFood');
  var summaryEl = document.getElementById('confirmSummary');

  if (dateEl) dateEl.textContent = dateDisplay;
  if (timeEl) timeEl.textContent = timeDisplay;
  if (foodEl) foodEl.textContent = foodDisplay;

  // Summary sentence
  if (summaryEl) {
    if (dateStr && timeStr && foodStr) {
      summaryEl.textContent = dateDisplay + ' ' + timeDisplay + '，我们去吃' + foodStr + '。你带好胃口，我带好路线。';
    } else {
      summaryEl.textContent = '信息加载中，请稍候...';
    }
  }
});
