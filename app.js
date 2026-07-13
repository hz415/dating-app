/**
 * VibeCoding Dating App - 交互逻辑
 * 所有页面共享的状态管理和交互功能
 */

// ── 全局状态 ──
const AppState = {
  currentPage: 'invite',
  selectedFood: '',
  selectedDate: '',
  selectedTime: '',
  calYear: 2026,
  calMonth: 7, // 1-12
};

// ── 页面导航 ──
function navigateTo(pageName) {
  const pages = document.querySelectorAll('.app-page');
  pages.forEach(p => {
    p.style.display = 'none';
    p.classList.remove('active');
  });
  const target = document.getElementById('page-' + pageName);
  if (target) {
    target.style.display = 'flex';
    target.classList.add('active');
  }
  AppState.currentPage = pageName;
  window.scrollTo(0, 0);

  // 进入日期页面时更新日历图标
  if (pageName === 'date-pick') {
    updateCalendarIcon();
  }
  // 进入确认页面时更新信息
  if (pageName === 'confirm') {
    updateConfirmPage();
  }
}

// ── 日期相关工具 ──
function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month - 1, 1).getDay();
}

function formatDate(year, month, day) {
  return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
}

function formatDisplayDate(dateStr) {
  const parts = dateStr.split('/');
  return `${parseInt(parts[1])}月${parseInt(parts[2])}日`;
}

function formatDisplayTime(timeStr) {
  return timeStr;
}

// ── 日历功能 ──
function renderCalendar() {
  const grid = document.getElementById('cal-grid');
  if (!grid) return;

  const year = AppState.calYear;
  const month = AppState.calMonth;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // 更新月份标题
  const monthLabel = document.getElementById('cal-month-label');
  if (monthLabel) {
    monthLabel.textContent = `${year}年 ${month}月`;
  }

  // 清空网格（保留表头）
  const headers = grid.querySelectorAll('.cal-day-header');
  grid.innerHTML = '';
  headers.forEach(h => grid.appendChild(h));

  // 空白填充
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-day empty';
    grid.appendChild(empty);
  }

  // 日期格子
  const today = new Date();
  const todayStr = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;

  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('div');
    const dateStr = formatDate(year, month, d);
    cell.className = 'cal-day';
    cell.textContent = d;

    if (dateStr === AppState.selectedDate) {
      cell.classList.add('selected');
    }
    if (dateStr === todayStr) {
      cell.classList.add('today');
    }

    cell.addEventListener('click', () => selectDate(dateStr, d));
    grid.appendChild(cell);
  }
}

function selectDate(dateStr, day) {
  AppState.selectedDate = dateStr;
  localStorage.setItem('dating_selectedDate', dateStr);

  // 更新输入框
  const dateInput = document.getElementById('date-input');
  if (dateInput) dateInput.value = dateStr;

  // 更新日历图标
  updateCalendarIcon(day);

  // 自动收起日历面板
  const calPicker = document.getElementById('calendar-picker');
  if (calPicker) calPicker.style.display = 'none';

  // 更新日历选中状态
  const cells = document.querySelectorAll('.cal-day');
  cells.forEach(c => c.classList.remove('selected'));
  const allCells = document.querySelectorAll('.cal-day:not(.cal-day-header)');
  allCells.forEach(c => {
    if (c.textContent == day && !c.classList.contains('empty') && !c.classList.contains('other-month')) {
      c.classList.add('selected');
    }
  });
}

function updateCalendarIcon(day) {
  const icon = document.querySelector('.calendar-icon');
  if (!icon) return;

  if (day !== undefined) {
    icon.textContent = day;
  } else if (AppState.selectedDate) {
    const parts = AppState.selectedDate.split('/');
    icon.textContent = parseInt(parts[2]);
  }
}

function prevMonth() {
  if (AppState.calMonth === 1) {
    AppState.calMonth = 12;
    AppState.calYear--;
  } else {
    AppState.calMonth--;
  }
  renderCalendar();
}

function nextMonth() {
  if (AppState.calMonth === 12) {
    AppState.calMonth = 1;
    AppState.calYear++;
  } else {
    AppState.calMonth++;
  }
  renderCalendar();
}

function goToday() {
  const today = new Date();
  AppState.calYear = today.getFullYear();
  AppState.calMonth = today.getMonth() + 1;
  const dateStr = formatDate(AppState.calYear, AppState.calMonth, today.getDate());
  selectDate(dateStr, today.getDate());
  renderCalendar();
}

function clearDate() {
  AppState.selectedDate = '';
  const dateInput = document.getElementById('date-input');
  if (dateInput) dateInput.value = '';
  const icon = document.querySelector('.calendar-icon');
  if (icon) icon.textContent = '？';

  const cells = document.querySelectorAll('.cal-day');
  cells.forEach(c => c.classList.remove('selected'));
}

// ── 时间选择 ──
function generateTimeSlots() {
  const container = document.querySelector('.time-slots');
  if (!container || container.children.length > 0) return;
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const slot = document.createElement('div');
      slot.className = 'time-slot';
      slot.textContent = timeStr;
      slot.addEventListener('click', () => selectTime(timeStr, slot));
      container.appendChild(slot);
    }
  }
}

function toggleTimePicker() {
  const dropdown = document.getElementById('time-dropdown');
  if (!dropdown) return;

  if (dropdown.style.display === 'none' || !dropdown.style.display) {
    generateTimeSlots();
    dropdown.style.display = 'block';
  } else {
    dropdown.style.display = 'none';
  }
}

function selectTime(time, el) {
  AppState.selectedTime = time;
  localStorage.setItem('dating_selectedTime', time);

  // 自动收起时间面板
  const dropdown = document.getElementById('time-dropdown');
  if (dropdown) dropdown.style.display = 'none';

  const timeInput = document.getElementById('time-input');
  if (timeInput) timeInput.value = time;

  // 更新选中状态
  const slots = document.querySelectorAll('.time-slot');
  slots.forEach(s => s.classList.remove('selected'));
  if (el) el.classList.add('selected');
}

// ── 食物选择 ──
function selectFood(name, el) {
  AppState.selectedFood = name;
  localStorage.setItem('dating_selectedFood', name);

  // 更新选中状态
  const cards = document.querySelectorAll('.food-card');
  cards.forEach(c => c.classList.remove('selected-food'));
  if (el) el.classList.add('selected-food');

  // 短暂延迟后跳转（给用户看到选中效果）
  setTimeout(() => navigateTo('date-pick'), 400);
}

// ── 确认页面更新 ──
function updateConfirmPage() {
  const dateDisplay = document.getElementById('confirm-date');
  const timeDisplay = document.getElementById('confirm-time');
  const foodDisplay = document.getElementById('confirm-food');
  const summaryText = document.getElementById('confirm-summary');

  // 优先从 localStorage 读取（兼容内联 JS 写入的数据）
  const savedDate = localStorage.getItem('dating_selectedDate');
  const savedTime = localStorage.getItem('dating_selectedTime');
  const savedFood = localStorage.getItem('dating_selectedFood');

  const dateStr = savedDate || AppState.selectedDate || '';
  const timeStr = savedTime || AppState.selectedTime || '';
  const foodStr = savedFood || AppState.selectedFood || '';

  const dateText = dateStr ? formatDisplayDate(dateStr) : '未选择';
  const timeText = timeStr || '未选择';
  const foodText = foodStr || '未选择';

  if (dateDisplay) dateDisplay.textContent = dateText;
  if (timeDisplay) timeDisplay.textContent = timeText;
  if (foodDisplay) foodDisplay.textContent = foodText;

  if (summaryText && dateStr && timeStr && foodStr) {
    summaryText.textContent = `${dateText} ${timeText}，我们去吃${foodText}。你带好胃口，我带好路线。`;
  } else {
    summaryText.textContent = '请完成所有选择后提交。';
  }
}

// ── "不要"按钮的趣味交互 ──
let noBtnStep = 0;
const noBtnTexts = ['不要 🦶', '求求你了~', '点不到吧🤭', '再想想呗😔'];
// All Y values are negative (upward only)
const noDodgeMoves = [
  [110, -80],
  [-100, -90],
  [-80, -70],
  [0, 0]
];

function handleNoClick(btn) {
  if (!btn) return;

  const move = noDodgeMoves[noBtnStep];
  const nextText = noBtnTexts[(noBtnStep + 1) % noBtnTexts.length];

  btn.style.transition = 'transform 0.15s ease-out';
  btn.style.transform = `translate(${move[0]}px, ${move[1]}px)`;

  btn.textContent = nextText;

  noBtnStep++;
  if (noBtnStep >= noDodgeMoves.length) {
    setTimeout(() => {
      noBtnStep = 0;
      btn.style.transition = 'transform 0.25s ease-out';
      btn.style.transform = 'translate(0, 0)';
      btn.textContent = noBtnTexts[0];
    }, 500);
  }
}

// ── 初始化 ──
function initApp() {
  // 默认显示第一页
  const pages = document.querySelectorAll('.app-page');
  pages.forEach(p => {
    p.style.display = 'none';
    p.classList.remove('active');
  });
  const firstPage = document.getElementById('page-invite');
  if (firstPage) {
    firstPage.style.display = 'flex';
    firstPage.classList.add('active');
  }

  // 初始化日历
  renderCalendar();

  // 绑定日历导航
  const prevBtn = document.getElementById('cal-prev');
  const nextBtn = document.getElementById('cal-next');
  const todayBtn = document.getElementById('cal-today');
  const clearBtn = document.getElementById('cal-clear');
  if (prevBtn) prevBtn.addEventListener('click', prevMonth);
  if (nextBtn) nextBtn.addEventListener('click', nextMonth);
  if (todayBtn) todayBtn.addEventListener('click', goToday);
  if (clearBtn) clearBtn.addEventListener('click', clearDate);

  // 绑定时间输入 — 不在这里绑定，HTML onclick 已处理
}

document.addEventListener('DOMContentLoaded', initApp);
