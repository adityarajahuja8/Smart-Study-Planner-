// Smart Study Planner - one page, basic JS

function id() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function escape(s) {
  if (s == null) return '';
  var div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function timeMinutes(str) {
  var p = (str || '').split(':');
  return (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0);
}

function formatDate(d) {
  return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
}

function getSubjects() { return getStorage('studyPlanner_subjects', []); }
function setSubjects(arr) { setStorage('studyPlanner_subjects', arr); }
function getSchedule() { return getStorage('studyPlanner_schedule', []); }
function setSchedule(arr) { setStorage('studyPlanner_schedule', arr); }
function getTasks() { return getStorage('studyPlanner_tasks', []); }
function setTasks(arr) { setStorage('studyPlanner_tasks', arr); }
function getSettings() {
  var s = getStorage('studyPlanner_settings', {});
  return { theme: s.theme || 'light' };
}
function setSettings(obj) {
  var s = getStorage('studyPlanner_settings', {});
  setStorage('studyPlanner_settings', { ...s, ...obj });
}

function subjectName(id) {
  var s = getSubjects().find(function(x) { return x.id === id; });
  return s ? s.name : '?';
}

// Fill subject dropdowns
function fillSubjectSelects() {
  var subs = getSubjects();
  var opts = subs.map(function(s) { return '<option value="' + escape(s.id) + '">' + escape(s.name) + '</option>'; }).join('');
  var blockSel = document.getElementById('blockSubject');
  var taskSel = document.getElementById('taskSubject');
  if (blockSel) blockSel.innerHTML = opts;
  if (taskSel) taskSel.innerHTML = opts;
}

// Subjects
function renderSubjects() {
  var list = document.getElementById('subjectsList');
  if (!list) return;
  var subs = getSubjects();
  list.innerHTML = subs.map(function(s) {
    return '<li><span>' + escape(s.name) + '</span> <span class="priority ' + (s.priority || 'medium') + '">' + (s.priority || 'medium') + '</span> ' +
      '<button type="button" class="del delSub" data-id="' + escape(s.id) + '">Delete</button></li>';
  }).join('');

  list.querySelectorAll('.delSub').forEach(function(btn) {
    btn.onclick = function() {
      var id = btn.getAttribute('data-id');
      setSubjects(subs.filter(function(x) { return x.id !== id; }));
      setSchedule(getSchedule().filter(function(b) { return b.subjectId !== id; }));
      var t = getTasks();
      t.forEach(function(x) { if (x.subjectId === id) x.subjectId = ''; });
      setTasks(t);
      renderAll();
    };
  });
}

// Schedule
function conflict(block, skipId) {
  var blocks = getSchedule().filter(function(b) { return Number(b.day) === Number(block.day) && b.id !== skipId; });
  var start = timeMinutes(block.start), end = timeMinutes(block.end);
  if (start >= end) return true;
  for (var i = 0; i < blocks.length; i++) {
    var b = blocks[i];
    if (start < timeMinutes(b.end) && end > timeMinutes(b.start)) return true;
  }
  return false;
}

function renderSchedule() {
  var list = document.getElementById('scheduleList');
  if (!list) return;
  var blocks = getSchedule().slice().sort(function(a, b) {
    if (Number(a.day) !== Number(b.day)) return Number(a.day) - Number(b.day);
    return timeMinutes(a.start) - timeMinutes(b.start);
  });
  var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  list.innerHTML = blocks.map(function(b) {
    return '<li><span>' + days[Number(b.day)] + ' ' + b.start + '–' + b.end + ' ' + escape(subjectName(b.subjectId)) + '</span> ' +
      '<button type="button" class="del" data-id="' + escape(b.id) + '">Remove</button></li>';
  }).join('');
  list.querySelectorAll('.del').forEach(function(btn) {
    btn.onclick = function() {
      setSchedule(getSchedule().filter(function(b) { return b.id !== btn.getAttribute('data-id'); }));
      renderAll();
    };
  });
}

function saveBlock() {
  var sub = document.getElementById('blockSubject').value;
  var start = document.getElementById('blockStart').value;
  var end = document.getElementById('blockEnd').value;
  var day = parseInt(document.getElementById('blockDay').value, 10);
  if (!sub || !start || !end) { alert('Fill subject, start and end time.'); return; }
  var block = { id: id(), subjectId: sub, start: start, end: end, day: day };
  if (conflict(block)) { alert('This time overlaps another block on the same day.'); return; }
  setSchedule(getSchedule().concat([block]));
  document.getElementById('blockStart').value = '';
  document.getElementById('blockEnd').value = '';
  renderAll();
}

// Tasks
function renderTasks() {
  var list = document.getElementById('tasksList');
  if (!list) return;
  var tasks = getTasks();
  list.innerHTML = tasks.map(function(t) {
    var cls = t.status === 'completed' ? ' class="done"' : '';
    return '<li' + cls + '><span>' + escape(t.title) + '</span> <span class="muted">' + escape(subjectName(t.subjectId)) + ' ' + (t.deadline ? formatDate(t.deadline) : '') + '</span> ' +
      (t.status !== 'completed' ? '<button type="button" data-id="' + escape(t.id) + '">Complete</button> ' : '') +
      '<button type="button" class="del" data-id="' + escape(t.id) + '">Delete</button></li>';
  }).join('');
  list.querySelectorAll('button:not(.del)').forEach(function(btn) {
    btn.onclick = function() {
      var arr = getTasks().map(function(t) {
        return t.id === btn.getAttribute('data-id') ? { ...t, status: 'completed' } : t;
      });
      setTasks(arr);
      renderAll();
    };
  });
  list.querySelectorAll('button.del').forEach(function(btn) {
    btn.onclick = function() {
      setTasks(getTasks().filter(function(t) { return t.id !== btn.getAttribute('data-id'); }));
      renderAll();
    };
  });
}

function addTask() {
  var title = (document.getElementById('taskTitle').value || '').trim();
  if (!title) return;
  var task = {
    id: id(),
    title: title,
    subjectId: document.getElementById('taskSubject').value || '',
    type: document.getElementById('taskType').value || 'task',
    deadline: document.getElementById('taskDeadline').value ? new Date(document.getElementById('taskDeadline').value).toISOString() : null,
    status: 'pending'
  };
  setTasks(getTasks().concat([task]));
  document.getElementById('taskTitle').value = '';
  document.getElementById('taskDeadline').value = '';
  renderAll();
}

// Export / Reset
function doExport() {
  var data = {
    exportedAt: new Date().toISOString(),
    subjects: getSubjects(),
    schedule: getSchedule(),
    tasks: getTasks(),
    settings: getSettings()
  };
  var a = document.createElement('a');
  a.href = 'data:application/json,' + encodeURIComponent(JSON.stringify(data, null, 2));
  a.download = 'study-planner.json';
  a.click();
}

// Theme
function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark');
    var btn = document.getElementById('themeBtn');
    if (btn) btn.textContent = 'Switch to Light';
  } else {
    document.body.classList.remove('dark');
    var btn = document.getElementById('themeBtn');
    if (btn) btn.textContent = 'Switch to Dark';
  }
}



function doReset() {
  if (!confirm('Delete all subjects, schedule and tasks? Cannot be undone.')) return;
  setStorage('studyPlanner_subjects', []);
  setStorage('studyPlanner_schedule', []);
  setStorage('studyPlanner_tasks', []);
  setStorage('studyPlanner_settings', { theme: 'light' });
  applyTheme('light');
  renderAll();
}

function renderAll() {
  fillSubjectSelects();
  renderSubjects();
  renderSchedule();
  renderTasks();
}

// Init
function init() {
  applyTheme(getSettings().theme);
  document.getElementById('blockDay').value = String(new Date().getDay());
  renderAll();

  document.getElementById('addSubject').onclick = function() {
    var name = (document.getElementById('subjectName').value || '').trim();
    if (!name) { alert('Enter subject name.'); return; }
    var subs = getSubjects();
    if (subs.some(function(s) { return s.name.toLowerCase() === name.toLowerCase(); })) { alert('Subject already exists.'); return; }
    subs.push({ id: id(), name: name, priority: document.getElementById('subjectPriority').value || 'medium' });
    setSubjects(subs);
    document.getElementById('subjectName').value = '';
    renderAll();
  };

  document.getElementById('saveBlock').onclick = saveBlock;
  document.getElementById('addTask').onclick = addTask;
  // document.getElementById('exportBtn').onclick = doExport;
  document.getElementById('resetBtn').onclick = doReset;
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
