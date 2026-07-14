/**
 * VibeCoding Dating App - 交互逻辑
 * 所有页面共享的状态管理和交互功能
 */

// ── 全局状态 ──
const AppState = {
  currentPage: 'welcome',
  nickname: '',
  room: '',
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

let _calNavLock = false;
function prevMonth() {
  if (_calNavLock) return;
  _calNavLock = true;
  setTimeout(() => { _calNavLock = false; }, 300);
  if (AppState.calMonth === 1) {
    AppState.calMonth = 12;
    AppState.calYear--;
  } else {
    AppState.calMonth--;
  }
  renderCalendar();
}

function nextMonth() {
  if (_calNavLock) return;
  _calNavLock = true;
  setTimeout(() => { _calNavLock = false; }, 300);
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
    // Save to database
    saveToDatabase();
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
  const firstPage = document.getElementById('page-welcome');
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

// ── 昵称提交 ──
function submitNickname() {
  const input = document.getElementById('nickname-input');
  if (!input || !input.value.trim()) {
    input.style.borderColor = '#FF4444';
    input.placeholder = '请输入昵称哦~';
    return;
  }
  AppState.nickname = input.value.trim();

  // 处理房间号
  const roomInput = document.getElementById('room-input');
  let room = roomInput ? roomInput.value.trim() : '';
  if (!room) {
    // 自动生成4位房间号
    room = Math.random().toString(36).substring(2, 6);
    const hint = document.getElementById('room-hint');
    if (hint) hint.textContent = '你的房间号是：' + room + '（已自动创建，请发给对方）';
    if (roomInput) roomInput.value = room;
  }
  AppState.room = room;

  // 把房间号写入URL（方便分享）
  const url = new URL(window.location);
  url.searchParams.set('room', room);
  window.history.replaceState({}, '', url);

  navigateTo('invite');
}

// ── 数据库 API ──
const API_BASE = 'https://dating-52f0glmfp-hz5.vercel.app/api';

async function saveToDatabase() {
  if (!AppState.nickname) return;
  try {
    await fetch(`${API_BASE}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room: AppState.room,
        nickname: AppState.nickname,
        food: AppState.selectedFood,
        date: AppState.selectedDate,
        time: AppState.selectedTime,
      })
    });
  } catch (e) {
    console.warn('Save failed:', e);
  }
}

async function loadReplies() {
  const list = document.getElementById('replies-list');
  if (!list) return;
  list.innerHTML = '<p style="color:#999;text-align:center;padding:20px;">加载中...</p>';

  try {
    const res = await fetch(`${API_BASE}/list?room=${encodeURIComponent(AppState.room || '')}`);
    const json = await res.json();
    const data = json.data || [];

    if (data.length === 0) {
      list.innerHTML = '<p style="color:#ccc;text-align:center;padding:20px;">还没有人回复哦，快去邀请吧~</p>';
      return;
    }

    let html = '';
    data.forEach((item, i) => {
      const dateDisplay = item.date ? formatDisplayDate(item.date) : '未选择';
      const timeDisplay = item.time || '未选择';
      const foodDisplay = item.food || '未选择';
      const nickname = item.nickname || '匿名';
      const createdAt = item.created_at ? new Date(item.created_at).toLocaleString('zh-CN') : '';

      html += '<div style="background: ' + (i % 2 === 0 ? '#FFF0F3' : '#FFF8FA') + '; border: 2px solid #FFD1DC; border-radius: 12px; padding: 14px 16px; margin-bottom: 10px; box-shadow: 2px 2px 0 0 #FFE0E6;">'
        + '<div style="font-size: 1rem; font-weight: bold; color: #FF6B8A; margin-bottom: 8px;">' + nickname + '</div>'
        + '<div style="font-size: 0.85rem; color: #666; line-height: 1.6;">🍽 ' + foodDisplay + ' &nbsp; 📅 ' + dateDisplay + ' &nbsp; ⏰ ' + timeDisplay + '</div>'
        + (createdAt ? '<div style="font-size: 0.75rem; color: #bbb; margin-top: 4px;">' + createdAt + '</div>' : '')
        + '</div>';
    });
    list.innerHTML = html;
  } catch (e) {
    list.innerHTML = '<p style="color:#999;text-align:center;padding:20px;">加载失败，请检查网络后重试</p>';
    console.warn('Load replies failed:', e);
  }
}

// ── 复制结果 ──
function copyResult() {
  const dateDisplay = AppState.selectedDate ? formatDisplayDate(AppState.selectedDate) : '';
  const text = '约会回复：' + dateDisplay + ' ' + (AppState.selectedTime || '') + '，一起去吃' + (AppState.selectedFood || '') + '！';
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function() {
      showToast('已复制到剪贴板，快发给TA吧~');
    });
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('已复制到剪贴板，快发给TA吧~');
  }
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.textContent = msg;
  toast.style.cssText = 'position:fixed;bottom:60px;left:50%;transform:translateX(-50%);background:#FF6B8A;color:#fff;padding:10px 20px;border-radius:20px;font-size:0.9rem;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,0.15);';
  document.body.appendChild(toast);
  setTimeout(function() { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; }, 2000);
  setTimeout(function() { toast.remove(); }, 2500);
}

function restartApp() {
  AppState.selectedFood = '';
  AppState.selectedDate = '';
  AppState.selectedTime = '';
  AppState.currentPage = 'invite';
  localStorage.removeItem('dating_selectedDate');
  localStorage.removeItem('dating_selectedTime');
  localStorage.removeItem('dating_selectedFood');
  navigateTo('invite');
}

// ── 初始化 ──
(function() {
  // 从URL读取房间号
  const params = new URLSearchParams(window.location.search);
  const urlRoom = params.get('room');
  if (urlRoom) {
    AppState.room = urlRoom;
    // B通过带房间号链接打开时，自动给匿名昵称，直接跳到邀请页
    AppState.nickname = '匿名';
    const skipWelcome = function() {
      navigateTo('invite');
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', skipWelcome);
    } else {
      skipWelcome();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderCalendar);
  }
})();
