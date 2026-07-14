/**
 * VibeCoding Dating App - 交互逻辑
 * 所有页面共享的状态管理和交互功能
 */

// ── 全局状态 ──
const AppState = {
  currentPage: 'welcome',
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

// ── 返回修改 ──
function goBackEdit() {
  navigateTo('date-pick');
}

// ── 确认发送 ──
async function confirmSend() {
  const dateStr = AppState.selectedDate || localStorage.getItem('dating_selectedDate') || '';
  const timeStr = AppState.selectedTime || localStorage.getItem('dating_selectedTime') || '';
  const foodStr = AppState.selectedFood || localStorage.getItem('dating_selectedFood') || '';

  if (!dateStr || !timeStr || !foodStr) {
    showToast('请先完成所有选择');
    return;
  }

  // 禁用按钮防止重复点击
  const btn = document.getElementById('btn-confirm-send');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '发送中...';
    btn.style.opacity = '0.6';
  }

  await saveToDatabase();

  // 显示发送成功页
  const dateText = dateStr ? formatDisplayDate(dateStr) : '未选择';
  const sentSummary = document.getElementById('sent-summary');
  if (sentSummary) {
    sentSummary.innerHTML = '<div style="font-size: 0.85rem; color: #666; line-height: 2;">'
      + '🍽 想吃：<span style="font-weight: bold; color: #FF6B8A;">' + foodStr + '</span><br>'
      + '📅 日期：<span style="font-weight: bold; color: #FF6B8A;">' + dateText + '</span><br>'
      + '⏰ 时间：<span style="font-weight: bold; color: #FF6B8A;">' + timeStr + '</span>'
      + '</div>';
  }
  navigateTo('sent');

  // 标记已发送
  localStorage.setItem('dating_guestSent', 'true');
}

// ── 创建房间（弹窗方式）──
function createRoom() {
  const room = Math.random().toString(36).substring(2, 6);
  AppState.room = room;

  const baseUrl = window.location.origin + window.location.pathname;
  const fullLink = baseUrl + '?room=' + room;

  document.getElementById('modal-room-id').textContent = '房间号：' + room;
  document.getElementById('modal-link-display').textContent = fullLink;
  document.getElementById('room-modal').style.display = 'flex';
}

function copyModalLink() {
  const link = document.getElementById('modal-link-display').textContent;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(link).then(function() {
      showToast('链接已复制，快发给TA吧~');
    });
  } else {
    const ta = document.createElement('textarea');
    ta.value = link;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('链接已复制，快发给TA吧~');
  }
}

function closeRoomModal() {
  document.getElementById('room-modal').style.display = 'none';
}

// ── 查看回复（弹窗方式）──
function showReplyDialog() {
  document.getElementById('reply-modal').style.display = 'flex';
  document.getElementById('reply-modal-result').style.display = 'none';
}

function closeReplyModal() {
  document.getElementById('reply-modal').style.display = 'none';
}

async function submitReplyRoom() {
  const input = document.getElementById('reply-room-input');
  if (!input || !input.value.trim()) {
    input.style.borderColor = '#FF4444';
    input.placeholder = '请输入房间号';
    return;
  }
  const room = input.value.trim();
  AppState.room = room;

  const resultDiv = document.getElementById('reply-modal-result');
  resultDiv.style.display = 'block';
  resultDiv.innerHTML = '<p style="color:#999;text-align:center;padding:10px;">加载中...</p>';

  try {
    const res = await fetch(`${API_BASE}/list?room=${encodeURIComponent(room)}`);
    const json = await res.json();
    const data = json.data || [];

    if (data.length === 0) {
      resultDiv.innerHTML = '<p style="color:#ccc;text-align:center;padding:10px;font-size:0.9rem;">还没有人回复哦~</p>';
      return;
    }

    const item = data[0];
    const dateDisplay = item.date ? formatDisplayDate(item.date) : '未选择';
    const timeDisplay = item.time || '未选择';
    const foodDisplay = item.food || '未选择';

    resultDiv.innerHTML = '<div style="background: #FFF0F3; border: 2px solid #FFD1DC; border-radius: 12px; padding: 16px; box-shadow: 2px 2px 0 0 #FFE0E6; text-align: left;">'
      + '<div style="font-size: 0.85rem; color: #666; line-height: 2;">'
      + '🍽 想吃：<span style="font-weight: bold; color: #FF6B8A;">' + foodDisplay + '</span><br>'
      + '📅 日期：<span style="font-weight: bold; color: #FF6B8A;">' + dateDisplay + '</span><br>'
      + '⏰ 时间：<span style="font-weight: bold; color: #FF6B8A;">' + timeDisplay + '</span>'
      + '</div>'
      + (item.created_at ? '<div style="font-size: 0.75rem; color: #bbb; margin-top: 8px; text-align: right;">' + new Date(item.created_at).toLocaleString('zh-CN') + '</div>' : '')
      + '</div>';
  } catch (e) {
    resultDiv.innerHTML = '<p style="color:#999;text-align:center;padding:10px;font-size:0.85rem;">加载失败</p><p style="color:#ccc;text-align:center;font-size:0.75rem;">' + e.message + '</p>';
  }
}

// ── 数据库 API ──
const API_BASE = 'https://dating-52f0glmfp-hz5.vercel.app/api';

async function saveToDatabase() {
  if (!AppState.room) return;
  try {
    await fetch(`${API_BASE}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room: AppState.room,
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
      list.innerHTML = '<p style="color:#ccc;text-align:center;padding:20px;">还没有人回复哦，把链接发给TA吧~</p>';
      return;
    }

    // 只显示最新一条
    const item = data[0];
    const dateDisplay = item.date ? formatDisplayDate(item.date) : '未选择';
    const timeDisplay = item.time || '未选择';
    const foodDisplay = item.food || '未选择';

    list.innerHTML = '<div style="background: #FFF0F3; border: 2px solid #FFD1DC; border-radius: 12px; padding: 20px 16px; box-shadow: 2px 2px 0 0 #FFE0E6;">'
      + '<div style="font-size: 0.85rem; color: #666; line-height: 2;">'
      + '🍽 想吃：<span style="font-weight: bold; color: #FF6B8A;">' + foodDisplay + '</span><br>'
      + '📅 日期：<span style="font-weight: bold; color: #FF6B8A;">' + dateDisplay + '</span><br>'
      + '⏰ 时间：<span style="font-weight: bold; color: #FF6B8A;">' + timeDisplay + '</span>'
      + '</div>'
      + (item.created_at ? '<div style="font-size: 0.75rem; color: #bbb; margin-top: 8px; text-align: right;">' + new Date(item.created_at).toLocaleString('zh-CN') + '</div>' : '')
      + '</div>';
  } catch (e) {
    list.innerHTML = '<p style="color:#999;text-align:center;padding:20px;">加载失败，请检查网络后重试</p><p style="color:#ccc;text-align:center;font-size:0.75rem;">' + e.message + '</p>';
    console.warn('Load replies failed:', e);
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

// ── 初始化 ──
(function() {
  const params = new URLSearchParams(window.location.search);
  const urlRoom = params.get('room');

  if (urlRoom && localStorage.getItem('dating_guestSent') === 'true') {
    // B 本地有发送记录，直接到已发送页
    AppState.room = urlRoom;
    const goSent = function() {
      AppState.selectedFood = localStorage.getItem('dating_selectedFood') || '';
      AppState.selectedDate = localStorage.getItem('dating_selectedDate') || '';
      AppState.selectedTime = localStorage.getItem('dating_selectedTime') || '';
      const dateText = AppState.selectedDate ? formatDisplayDate(AppState.selectedDate) : '未选择';
      const sentSummary = document.getElementById('sent-summary');
      if (sentSummary) {
        sentSummary.innerHTML = '<div style="font-size: 0.85rem; color: #666; line-height: 2;">'
          + '🍽 想吃：<span style="font-weight: bold; color: #FF6B8A;">' + (AppState.selectedFood || '未选择') + '</span><br>'
          + '📅 日期：<span style="font-weight: bold; color: #FF6B8A;">' + dateText + '</span><br>'
          + '⏰ 时间：<span style="font-weight: bold; color: #FF6B8A;">' + (AppState.selectedTime || '未选择') + '</span>'
          + '</div>';
      }
      navigateTo('sent');
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(goSent, 50);
      });
    } else {
      setTimeout(goSent, 50);
    }
  } else if (urlRoom) {
    // B 打开链接：先查数据库是否已有回复
    AppState.room = urlRoom;
    const checkExisting = function() {
      fetch(API_BASE + '/list?room=' + encodeURIComponent(urlRoom))
        .then(function(r) { return r.json(); })
        .then(function(json) {
          var data = json.data || [];
          if (data.length > 0) {
            // 数据库已有回复，显示结果页
            var item = data[0];
            localStorage.setItem('dating_guestSent', 'true');
            localStorage.setItem('dating_selectedFood', item.food || '');
            localStorage.setItem('dating_selectedDate', item.date || '');
            localStorage.setItem('dating_selectedTime', item.time || '');
            var dateText = item.date ? formatDisplayDate(item.date) : '未选择';
            var sentSummary = document.getElementById('sent-summary');
            if (sentSummary) {
              sentSummary.innerHTML = '<div style="font-size: 0.85rem; color: #666; line-height: 2;">'
                + '🍽 想吃：<span style="font-weight: bold; color: #FF6B8A;">' + (item.food || '未选择') + '</span><br>'
                + '📅 日期：<span style="font-weight: bold; color: #FF6B8A;">' + dateText + '</span><br>'
                + '⏰ 时间：<span style="font-weight: bold; color: #FF6B8A;">' + (item.time || '未选择') + '</span>'
                + '</div>';
            }
            navigateTo('sent');
          } else {
            // 没有回复，正常走流程
            navigateTo('invite');
          }
        })
        .catch(function() {
          // 查询失败，正常走流程
          navigateTo('invite');
        });
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkExisting);
    } else {
      checkExisting();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderCalendar);
  }
})();
