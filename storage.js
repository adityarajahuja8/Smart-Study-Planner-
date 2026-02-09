/**
 * Smart Study Planner - LocalStorage module
 * Handles all persistent data: subjects, schedule blocks, tasks, and preferences.
 */

const STORAGE_KEYS = {
  SUBJECTS: 'studyPlanner_subjects',
  SCHEDULE: 'studyPlanner_schedule',
  TASKS: 'studyPlanner_tasks',
  SETTINGS: 'studyPlanner_settings',
};

const DEFAULT_SETTINGS = {
  theme: 'light', // 'light' | 'dark'
};

/**
 * Get item from LocalStorage with safe JSON parse
 * @param {string} key
 * @param {*} fallback - value if missing or invalid
 * @returns {*}
 */
function getStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * Set item in LocalStorage
 * @param {string} key
 * @param {*} value - will be JSON stringified
 */
function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage set failed:', e);
  }
}

/**
 * Get all subjects
 * @returns {Array<{id: string, name: string, priority: string}>}
 */
function getSubjects() {
  return getStorage(STORAGE_KEYS.SUBJECTS, []);
}

/**
 * Save subjects array
 * @param {Array} subjects
 */
function saveSubjects(subjects) {
  setStorage(STORAGE_KEYS.SUBJECTS, subjects);
}

/**
 * Get all schedule blocks
 * @returns {Array<{id: string, subjectId: string, day: number, start: string, end: string}>}
 */
function getSchedule() {
  return getStorage(STORAGE_KEYS.SCHEDULE, []);
}

/**
 * Save schedule blocks
 * @param {Array} blocks
 */
function saveSchedule(blocks) {
  setStorage(STORAGE_KEYS.SCHEDULE, blocks);
}

/**
 * Get all tasks
 * @returns {Array<{id: string, title: string, subjectId: string, type: string, deadline: string|null, status: string}>}
 */
function getTasks() {
  return getStorage(STORAGE_KEYS.TASKS, []);
}

/**
 * Save tasks array
 * @param {Array} tasks
 */
function saveTasks(tasks) {
  setStorage(STORAGE_KEYS.TASKS, tasks);
}

/**
 * Get settings (theme, etc.)
 * @returns {{ theme: string }}
 */
function getSettings() {
  return { ...DEFAULT_SETTINGS, ...getStorage(STORAGE_KEYS.SETTINGS, {}) };
}

/**
 * Save settings
 * @param {Object} settings
 */
function saveSettings(settings) {
  setStorage(STORAGE_KEYS.SETTINGS, { ...getSettings(), ...settings });
}

/**
 * Clear all planner data (subjects, schedule, tasks); keeps settings unless full reset
 * @param {boolean} includeSettings - if true, also reset theme etc.
 */
function resetAllData(includeSettings = false) {
  setStorage(STORAGE_KEYS.SUBJECTS, []);
  setStorage(STORAGE_KEYS.SCHEDULE, []);
  setStorage(STORAGE_KEYS.TASKS, []);
  if (includeSettings) {
    setStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }
}

/**
 * Export all planner data as JSON object (for download)
 * @returns {Object}
 */
function exportData() {
  return {
    exportedAt: new Date().toISOString(),
    subjects: getSubjects(),
    schedule: getSchedule(),
    tasks: getTasks(),
    settings: getSettings(),
  };
}
