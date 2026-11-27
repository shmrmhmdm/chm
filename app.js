// Kerala PSC Tradesman - Computer Hardware Maintenance
// Main Application Logic (app.js)

const DEFAULT_API_URL = "https://script.google.com/macros/s/AKfycbzHzi5PAfwKoqcrBI6OoTiY63fEVa6T_0zM3ik2BhDvZxbIafWhz52dpBW9OStKYBUvYA/exec";
const DEFAULT_GEMINI_KEY = (typeof atob !== 'undefined') ? atob("QVEuQWI4Uk42SzQzQUhSa21WakotWDNDZ2w5QVVYVUd1LWZEdVl6bkZRNWRieXBhX3lPWmc=") : "";

let state = {
  questions: [],
  activeSession: null,
  mistakes: JSON.parse(localStorage.getItem('chm_mistakes') || '[]'),
  bookmarks: JSON.parse(localStorage.getItem('chm_bookmarks') || '[]'),
  stats: JSON.parse(localStorage.getItem('chm_stats') || '{"attempted": 0, "correct": 0, "wrong": 0}'),
  moduleStats: JSON.parse(localStorage.getItem('chm_module_stats') || '{}'),
  attemptedIds: JSON.parse(localStorage.getItem('chm_attempted_ids') || '[]'),
  studyLog: JSON.parse(localStorage.getItem('chm_study_log') || '{}'),
  dailyGoal: parseInt(localStorage.getItem('chm_daily_goal') || '25', 10),
  examHistory: JSON.parse(localStorage.getItem('chm_exam_history') || '[]'),
  answerHistory: JSON.parse(localStorage.getItem('chm_answer_history') || '{}'),
  practicePrefs: JSON.parse(localStorage.getItem('chm_practice_prefs') || '{"order":"shuffle","unattemptedOnly":false}'),
  apiUrl: localStorage.getItem('chm_api_url') || DEFAULT_API_URL,
  geminiKey: localStorage.getItem('chm_gemini_key') || DEFAULT_GEMINI_KEY
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  loadQuestions();
  loadPracticePreferencesUI();
  renderDashboard();
  updateMistakeBadge();
  if (state.apiUrl) {
    document.getElementById('sheet-api-url').value = state.apiUrl;
  }
  // Auto-sync from your Google Sheet on first load if never synced before
  if (!localStorage.getItem('chm_last_synced') && state.apiUrl) {
    syncWithGoogleSheet(true);
  }
});

const CURRENT_DATA_VERSION = "2026_11_27_SYLLABUS_EXTRA_V3";

function getAllBuiltinQuestions() {
  const list = (typeof SAMPLE_QUESTIONS !== 'undefined' && Array.isArray(SAMPLE_QUESTIONS)) ? [...SAMPLE_QUESTIONS] : [];
  const existingIds = new Set(list.map(q => q.id));

  // Merge Junior Instructor 147/2023 questions
  if (typeof PSC_PREVIOUS_QUESTIONS !== 'undefined' && Array.isArray(PSC_PREVIOUS_QUESTIONS)) {
    PSC_PREVIOUS_QUESTIONS.forEach(q => {
      if (!existingIds.has(q.id)) {
        list.push(q);
        existingIds.add(q.id);
      }
    });
  }

  // Merge Tradesman CHM 191/2015 questions
  if (typeof PSC_TRADESMAN_191_QUESTIONS !== 'undefined' && Array.isArray(PSC_TRADESMAN_191_QUESTIONS)) {
    PSC_TRADESMAN_191_QUESTIONS.forEach(q => {
      if (!existingIds.has(q.id)) {
        list.push(q);
        existingIds.add(q.id);
      }
    });
  }

  // Merge Tradesman CHM 170/2014 questions
  if (typeof PSC_TRADESMAN_170_QUESTIONS !== 'undefined' && Array.isArray(PSC_TRADESMAN_170_QUESTIONS)) {
    PSC_TRADESMAN_170_QUESTIONS.forEach(q => {
      if (!existingIds.has(q.id)) {
        list.push(q);
        existingIds.add(q.id);
      }
    });
  }

  // Merge Syllabus Gap Extra Questions
  if (typeof SYLLABUS_EXTRA_QUESTIONS !== 'undefined' && Array.isArray(SYLLABUS_EXTRA_QUESTIONS)) {
    SYLLABUS_EXTRA_QUESTIONS.forEach(q => {
      if (!existingIds.has(q.id)) {
        list.push(q);
        existingIds.add(q.id);
      }
    });
  }

  return list;
}

// Load Questions from LocalStorage or Fallback to Sample Data
function loadQuestions() {
  const version = localStorage.getItem('chm_data_version');
  const cached = localStorage.getItem('chm_cached_questions');

  if (version !== CURRENT_DATA_VERSION || !cached) {
    state.questions = getAllBuiltinQuestions();
    localStorage.setItem('chm_cached_questions', JSON.stringify(state.questions));
    localStorage.setItem('chm_data_version', CURRENT_DATA_VERSION);
  } else {
    try {
      state.questions = JSON.parse(cached);
      let addedNew = false;
      const existingIds = new Set(state.questions.map(q => q.id));

      if (typeof PSC_PREVIOUS_QUESTIONS !== 'undefined' && Array.isArray(PSC_PREVIOUS_QUESTIONS)) {
        PSC_PREVIOUS_QUESTIONS.forEach(q => {
          if (!existingIds.has(q.id)) {
            state.questions.push(q);
            existingIds.add(q.id);
            addedNew = true;
          }
        });
      }

      if (typeof PSC_TRADESMAN_191_QUESTIONS !== 'undefined' && Array.isArray(PSC_TRADESMAN_191_QUESTIONS)) {
        PSC_TRADESMAN_191_QUESTIONS.forEach(q => {
          if (!existingIds.has(q.id)) {
            state.questions.push(q);
            existingIds.add(q.id);
            addedNew = true;
          }
        });
      }

      if (typeof PSC_TRADESMAN_170_QUESTIONS !== 'undefined' && Array.isArray(PSC_TRADESMAN_170_QUESTIONS)) {
        PSC_TRADESMAN_170_QUESTIONS.forEach(q => {
          if (!existingIds.has(q.id)) {
            state.questions.push(q);
            existingIds.add(q.id);
            addedNew = true;
          }
        });
      }

      if (typeof SYLLABUS_EXTRA_QUESTIONS !== 'undefined' && Array.isArray(SYLLABUS_EXTRA_QUESTIONS)) {
        SYLLABUS_EXTRA_QUESTIONS.forEach(q => {
          if (!existingIds.has(q.id)) {
            state.questions.push(q);
            existingIds.add(q.id);
            addedNew = true;
          }
        });
      }

      if (addedNew) {
        localStorage.setItem('chm_cached_questions', JSON.stringify(state.questions));
      }
    } catch (e) {
      state.questions = getAllBuiltinQuestions();
    }
  }
}

// Navigation Router
function navigate(viewName) {
  ['home', 'quiz', 'results', 'mistakes', 'revision', 'syllabus', 'bookmarks', 'tools', 'history'].forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) el.classList.add('hidden');
  });

  const target = document.getElementById(`view-${viewName}`);
  if (target) target.classList.remove('hidden');

  if (viewName === 'home') {
    renderDashboard();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (viewName === 'revision') {
    renderRevisionContent();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (viewName === 'syllabus') {
    renderSyllabusView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (viewName === 'tools') {
    switchToolTab('resistor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Render Dashboard
function renderDashboard() {
  // Update stats
  document.getElementById('stat-total-questions').innerText = state.questions.length;
  
  const total = state.stats.attempted || 0;
  const correct = state.stats.correct || 0;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  document.getElementById('stat-accuracy').innerText = `${accuracy}%`;
  
  document.getElementById('stat-mistakes').innerText = state.mistakes.length;
  document.getElementById('home-mistakes-count').innerText = state.mistakes.length;
  document.getElementById('stat-bookmarks').innerText = state.bookmarks.length;

  // Render Countdown, Streak & Exam History
  updateExamCountdown();
  renderDailyStreak();
  renderExamHistory();

  // Render Module Analytics
  renderModuleAnalytics();

  // Render Module Cards
  const container = document.getElementById('modules-container');
  container.innerHTML = '';

  MODULE_DEFINITIONS.forEach(mod => {
    const modQuestions = state.questions.filter(q => q.sheetName === mod.id);
    const count = modQuestions.length;

    const card = document.createElement('div');
    card.className = "bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:border-indigo-400 hover:shadow-md transition flex flex-col justify-between";
    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md">
            ${mod.marks} Marks
          </span>
          <span class="text-xs text-slate-500 font-medium">
            <i class="fa-solid fa-list-check text-slate-400 mr-1"></i> ${count} Questions
          </span>
        </div>
        <h4 class="font-bold text-slate-800 text-base mb-1">${mod.name}</h4>
        <p class="text-xs text-slate-500 mb-4">Syllabus weightage: ${mod.marks}% of total exam</p>
      </div>
      <div class="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
        <button onclick="startModulePractice('${mod.id}')" class="flex-1 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold text-xs py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5">
          <i class="fa-solid fa-book-open"></i> Practice
        </button>
        <button onclick="openSyllabusView('${mod.id}')" class="bg-amber-50 hover:bg-amber-500 hover:text-slate-950 text-amber-800 font-bold text-xs py-2 px-2.5 rounded-xl transition border border-amber-200" title="View Detailed Syllabus Topics & Copy for AI">
          <i class="fa-solid fa-list-check"></i> Topics
        </button>
        <button onclick="openAiGeneratorModal('${mod.id}')" class="bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-bold text-xs py-2 px-2.5 rounded-xl transition" title="Generate New AI Questions for this Module">
          <i class="fa-solid fa-wand-magic-sparkles"></i> AI
        </button>
        <button onclick="startModuleExam('${mod.id}')" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 px-2.5 rounded-xl transition" title="Timed Test">
          <i class="fa-solid fa-stopwatch"></i> Test
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Render Module Analytics, Coverage % & Neglected Modules Spotlight
function renderModuleAnalytics() {
  const container = document.getElementById('module-analytics-container');
  const banner = document.getElementById('neglected-modules-banner');
  if (!container) return;
  container.innerHTML = '';

  const attemptedSet = new Set(state.attemptedIds || []);
  const coverageList = [];

  MODULE_DEFINITIONS.forEach(mod => {
    const modQuestions = state.questions.filter(q => q.sheetName === mod.id);
    const totalInMod = modQuestions.length;
    const uniqueCovered = modQuestions.filter(q => attemptedSet.has(q.id)).length;
    const coveragePct = totalInMod > 0 ? Math.round((uniqueCovered / totalInMod) * 100) : 0;

    // Find most recent attempt timestamp in this module
    let lastTs = null;
    modQuestions.forEach(q => {
      const rec = state.answerHistory && state.answerHistory[q.id];
      if (rec && rec.timestamp) {
        const t = new Date(rec.timestamp).getTime();
        if (!lastTs || t > lastTs) lastTs = t;
      }
    });

    const stats = state.moduleStats[mod.id] || { attempted: 0, correct: 0, wrong: 0 };
    const attempted = stats.attempted || 0;
    const correct = stats.correct || 0;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

    coverageList.push({
      id: mod.id,
      name: mod.name,
      marks: mod.marks,
      totalInMod,
      uniqueCovered,
      coveragePct,
      attempted,
      lastTs
    });

    let badgeClass = "bg-slate-100 text-slate-600";
    let badgeText = "പരിശീലിച്ചിട്ടില്ല";
    let barColor = "bg-slate-300";

    if (attempted > 0) {
      if (accuracy >= 75) {
        badgeClass = "bg-emerald-100 text-emerald-800 border border-emerald-300";
        badgeText = `🟢 Strong (${accuracy}%)`;
        barColor = "bg-emerald-500";
      } else if (accuracy >= 50) {
        badgeClass = "bg-amber-100 text-amber-800 border border-amber-300";
        badgeText = `🟡 Average (${accuracy}%)`;
        barColor = "bg-amber-500";
      } else {
        badgeClass = "bg-rose-100 text-rose-800 border border-rose-300";
        badgeText = `🔴 Weak Area (${accuracy}%)`;
        barColor = "bg-rose-500";
      }
    }

    const lastText = lastTs
      ? new Date(lastTs).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
      : 'ഇതുവരെ ഇല്ല';

    const item = document.createElement('div');
    item.className = "p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition flex flex-col justify-between";
    item.innerHTML = `
      <div>
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <div class="font-bold text-xs sm:text-sm text-slate-800 truncate" title="${mod.name}">
            ${mod.name}
          </div>
          <span class="text-[11px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${badgeClass}">
            ${badgeText}
          </span>
        </div>
        <div class="flex items-center justify-between text-[11px] text-slate-500 mb-1">
          <span>Coverage: <strong class="text-slate-800">${uniqueCovered}/${totalInMod} (${coveragePct}%)</strong></span>
          <span class="font-bold text-indigo-700">${mod.marks} Marks • Last: ${lastText}</span>
        </div>
        <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
          <div class="${barColor} h-full transition-all duration-500" style="width: ${attempted > 0 ? accuracy : 0}%"></div>
        </div>
      </div>
      <div class="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/50">
        <span class="text-[10px] text-slate-400">Attempts: ${attempted} (${correct} ശരി)</span>
        <button onclick="startModulePractice('${mod.id}')" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline">
          <i class="fa-solid fa-play text-[10px]"></i> പരിശീലിക്കുക
        </button>
      </div>
    `;
    container.appendChild(item);
  });

  // Render Neglected / Least Covered Modules Banner
  if (banner && coverageList.length > 0) {
    const sorted = [...coverageList].sort((a, b) => a.coveragePct - b.coveragePct || a.attempted - b.attempted);
    const topNeglected = sorted.slice(0, 3);
    const pills = topNeglected.map(m => `
      <button onclick="startModulePractice('${m.id}')" class="px-2.5 py-1 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-[11px] font-bold text-amber-950 transition flex items-center gap-1">
        <span>${m.name.split(':')[0]}</span>
        <span class="text-rose-600">(${m.coveragePct}%)</span>
      </button>
    `).join('');

    banner.innerHTML = `
      <div class="space-y-1.5">
        <div class="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
          <i class="fa-solid fa-triangle-exclamation text-amber-600"></i>
          <span>കുറവ് നോക്കിയ / തീരെ നോക്കാത്ത മൊഡ്യൂളുകൾ (Least Covered):</span>
        </div>
        <div class="flex flex-wrap gap-1.5">${pills}</div>
      </div>
      <button onclick="startModulePractice('${sorted[0].id}')" class="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-sm transition whitespace-nowrap flex items-center gap-1.5 shrink-0">
        <i class="fa-solid fa-bullseye"></i>
        <span>Practice Least Covered (${sorted[0].name.split(':')[0]})</span>
      </button>
    `;
  }
}

// Record Result for Module
function recordModuleResult(moduleId, isCorrect) {
  if (!moduleId) return;
  if (!state.moduleStats[moduleId]) {
    state.moduleStats[moduleId] = { attempted: 0, correct: 0, wrong: 0 };
  }
  state.moduleStats[moduleId].attempted++;
  if (isCorrect) {
    state.moduleStats[moduleId].correct++;
  } else {
    state.moduleStats[moduleId].wrong++;
  }
  saveUserData();
}

// Start Module Practice Mode (Respects Order & Unattempted Only preferences)
function startModulePractice(moduleId) {
  const modDef = MODULE_DEFINITIONS.find(m => m.id === moduleId);
  let questions = state.questions.filter(q => q.sheetName === moduleId);
  
  if (questions.length === 0) {
    alert(`No questions found in ${modDef ? modDef.name : moduleId}. Please add questions in your Google Sheet or use Sync!`);
    return;
  }

  // Apply Unattempted Only filter if enabled
  if (state.practicePrefs && state.practicePrefs.unattemptedOnly) {
    const attemptedSet = new Set(state.attemptedIds || []);
    const unattempted = questions.filter(q => !attemptedSet.has(q.id));
    if (unattempted.length === 0) {
      if (confirm(`ഈ മൊഡ്യൂളിലെ മുഴുവൻ ${questions.length} ചോദ്യങ്ങളും നിങ്ങൾ ഇതിനകം പരിശീലിച്ചു കഴിഞ്ഞു! എല്ലാ ചോദ്യങ്ങളും വീണ്ടും പരിശീലിക്കണോ?`)) {
        // proceed with all questions
      } else {
        return;
      }
    } else {
      questions = unattempted;
    }
  }

  // Apply Order preference (Shuffle vs Sequential)
  if (!state.practicePrefs || state.practicePrefs.order !== 'sequential') {
    questions = [...questions].sort(() => Math.random() - 0.5);
  } else {
    questions = [...questions];
  }

  state.activeSession = {
    mode: 'practice',
    title: modDef ? modDef.name : moduleId,
    questions: questions,
    currentIndex: 0,
    userAnswers: {},
    isSubmitted: false
  };

  initQuizUI();
}

// Start Official Syllabus Weighted PSC Mock Exam (100 Questions proportional to Syllabus Marks)
function startWeightedMockExam() {
  if (state.questions.length === 0) {
    alert("No questions available! Please connect Google Sheet or load sample questions.");
    return;
  }

  let selected = [];
  const usedIds = new Set();

  // Pick questions per module strictly matching mod.marks (M1:12, M2:8, M3-10:10)
  MODULE_DEFINITIONS.forEach(mod => {
    const modPool = state.questions.filter(q => q.sheetName === mod.id);
    const shuffled = [...modPool].sort(() => Math.random() - 0.5);
    const take = shuffled.slice(0, mod.marks);
    take.forEach(q => {
      selected.push(q);
      usedIds.add(q.id);
    });
  });

  // If total < 100 (e.g. a module has fewer than 10 questions), top up from remaining syllabus questions
  if (selected.length < 100) {
    const remainingPool = state.questions
      .filter(q => !usedIds.has(q.id) && q.sheetName && q.sheetName.startsWith('Module_'))
      .sort(() => Math.random() - 0.5);
    const needed = 100 - selected.length;
    remainingPool.slice(0, needed).forEach(q => {
      selected.push(q);
      usedIds.add(q.id);
    });
  }

  state.activeSession = {
    mode: 'exam',
    title: 'Weighted PSC Mock Exam (Official Syllabus Pattern)',
    questions: selected,
    currentIndex: 0,
    userAnswers: {},
    timeRemaining: Math.max(selected.length * 45, 300), // 45 sec per question (75 mins for 100 Qs)
    timerInterval: null,
    isSubmitted: false
  };

  initQuizUI();
  startExamTimer();
}

// Start Full PSC Mock Exam Mode (100 Questions, 75 Minutes, -0.33 negative)
function startFullMockExam() {
  if (state.questions.length === 0) {
    alert("No questions available! Please connect Google Sheet or load sample questions.");
    return;
  }

  let examQuestions = [...state.questions].sort(() => Math.random() - 0.5);
  // Cap at 100 or total available
  if (examQuestions.length > 100) {
    examQuestions = examQuestions.slice(0, 100);
  }

  state.activeSession = {
    mode: 'exam',
    title: 'PSC CHM Random 100Q Mock Exam (Cat: 884/2025)',
    questions: examQuestions,
    currentIndex: 0,
    userAnswers: {},
    timeRemaining: 75 * 60, // 75 minutes in seconds
    timerInterval: null,
    isSubmitted: false
  };

  initQuizUI();
  startExamTimer();
}

// Start 5-Minute Quick Sprint (10 High-Yield Technical Questions)
function startQuickSprint() {
  const techPool = state.questions.filter(q => {
    if (q.sheetName === 'PSC_Tradesman_170_2014' || q.sheetName === 'PSC_Tradesman_191_2015') {
      const num = parseInt(String(q.id || '').split('_').pop(), 10);
      return isNaN(num) || num <= 80;
    }
    return true;
  });

  if (techPool.length === 0) {
    alert("No questions available for Quick Sprint!");
    return;
  }

  const sprintQs = [...techPool].sort(() => Math.random() - 0.5).slice(0, 10);

  state.activeSession = {
    mode: 'exam',
    title: '⚡ 5-Minute Quick Sprint (10 Qs)',
    questions: sprintQs,
    currentIndex: 0,
    userAnswers: {},
    timeRemaining: 5 * 60, // 5 minutes
    timerInterval: null,
    isSubmitted: false
  };

  initQuizUI();
  startExamTimer();
}

// Start PSC Previous Exam (100 Questions, 75 Minutes, -0.33 negative marking)
function startPscPreviousExam() {
  const pscQuestions = (typeof PSC_PREVIOUS_QUESTIONS !== 'undefined' && PSC_PREVIOUS_QUESTIONS.length > 0)
    ? PSC_PREVIOUS_QUESTIONS
    : state.questions.filter(q => q.sheetName === "PSC_Previous_Exam");

  if (!pscQuestions || pscQuestions.length === 0) {
    alert("PSC Previous Exam questions not found! Please check psc_previous_data.js or sync with Google Sheets.");
    return;
  }

  state.activeSession = {
    mode: 'exam',
    title: 'PSC Previous Exam: Junior Instructor COPA (147/2023)',
    questions: [...pscQuestions],
    currentIndex: 0,
    userAnswers: {},
    timeRemaining: 75 * 60, // 75 minutes in seconds
    timerInterval: null,
    isSubmitted: false
  };

  initQuizUI();
  startExamTimer();
}

// Start PSC Previous Exam Practice Mode (Instant answers, Malayalam explanations, jump palette)
function startPscPreviousPractice() {
  const pscQuestions = (typeof PSC_PREVIOUS_QUESTIONS !== 'undefined' && PSC_PREVIOUS_QUESTIONS.length > 0)
    ? PSC_PREVIOUS_QUESTIONS
    : state.questions.filter(q => q.sheetName === "PSC_Previous_Exam");

  if (!pscQuestions || pscQuestions.length === 0) {
    alert("PSC Previous Exam questions not found! Please check psc_previous_data.js or sync with Google Sheets.");
    return;
  }

  state.activeSession = {
    mode: 'practice',
    title: 'PSC Previous Exam (147/2023) - Practice Mode',
    questions: [...pscQuestions],
    currentIndex: 0,
    userAnswers: {},
    isSubmitted: false
  };

  initQuizUI();
}

function filterTechnicalOnly(questions, checkboxId) {
  const cb = document.getElementById(checkboxId);
  if (!cb || !cb.checked) return [...questions];
  return questions.filter(q => {
    const num = parseInt(String(q.id || '').split('_').pop(), 10);
    return isNaN(num) || num <= 80;
  });
}

// Start Tradesman CHM 191/2015 Practice Mode (Instant answers, Malayalam explanations, jump palette)
function startTradesman191Practice() {
  const base = (typeof PSC_TRADESMAN_191_QUESTIONS !== 'undefined' && PSC_TRADESMAN_191_QUESTIONS.length > 0)
    ? PSC_TRADESMAN_191_QUESTIONS
    : state.questions.filter(q => q.sheetName === "PSC_Tradesman_191_2015");

  const questions = filterTechnicalOnly(base, 'tech-only-191');
  if (!questions || questions.length === 0) {
    alert("Tradesman 191/2015 questions not found! Please check psc_tradesman_191_2015.js or sync with Google Sheets.");
    return;
  }

  const isTech = document.getElementById('tech-only-191')?.checked;
  state.activeSession = {
    mode: 'practice',
    title: `Tradesman CHM (191/2015)${isTech ? ' - Technical Only' : ''} - Practice`,
    questions: questions,
    currentIndex: 0,
    userAnswers: {},
    isSubmitted: false
  };

  initQuizUI();
}

// Start Tradesman CHM 191/2015 Timed Exam Mode (-0.33 mark)
function startTradesman191Exam() {
  const base = (typeof PSC_TRADESMAN_191_QUESTIONS !== 'undefined' && PSC_TRADESMAN_191_QUESTIONS.length > 0)
    ? PSC_TRADESMAN_191_QUESTIONS
    : state.questions.filter(q => q.sheetName === "PSC_Tradesman_191_2015");

  const questions = filterTechnicalOnly(base, 'tech-only-191');
  if (!questions || questions.length === 0) {
    alert("Tradesman 191/2015 questions not found! Please check psc_tradesman_191_2015.js or sync with Google Sheets.");
    return;
  }

  const isTech = document.getElementById('tech-only-191')?.checked;
  state.activeSession = {
    mode: 'exam',
    title: `Tradesman CHM Exam (191/2015)${isTech ? ' - Technical Only' : ''}`,
    questions: questions,
    currentIndex: 0,
    userAnswers: {},
    timeRemaining: Math.round(questions.length * 45),
    timerInterval: null,
    isSubmitted: false
  };

  initQuizUI();
  startExamTimer();
}

// Start Tradesman CHM 170/2014 Practice Mode (Instant answers, Malayalam explanations, jump palette)
function startTradesman170Practice() {
  const base = (typeof PSC_TRADESMAN_170_QUESTIONS !== 'undefined' && PSC_TRADESMAN_170_QUESTIONS.length > 0)
    ? PSC_TRADESMAN_170_QUESTIONS
    : state.questions.filter(q => q.sheetName === "PSC_Tradesman_170_2014");

  const questions = filterTechnicalOnly(base, 'tech-only-170');
  if (!questions || questions.length === 0) {
    alert("Tradesman 170/2014 questions not found! Please check psc_tradesman_170_2014.js or sync with Google Sheets.");
    return;
  }

  const isTech = document.getElementById('tech-only-170')?.checked;
  state.activeSession = {
    mode: 'practice',
    title: `Tradesman CHM (170/2014)${isTech ? ' - Technical Only' : ''} - Practice`,
    questions: questions,
    currentIndex: 0,
    userAnswers: {},
    isSubmitted: false
  };

  initQuizUI();
}

// Start Tradesman CHM 170/2014 Full Exam Mode (-0.33 mark)
function startTradesman170Exam() {
  const base = (typeof PSC_TRADESMAN_170_QUESTIONS !== 'undefined' && PSC_TRADESMAN_170_QUESTIONS.length > 0)
    ? PSC_TRADESMAN_170_QUESTIONS
    : state.questions.filter(q => q.sheetName === "PSC_Tradesman_170_2014");

  const questions = filterTechnicalOnly(base, 'tech-only-170');
  if (!questions || questions.length === 0) {
    alert("Tradesman 170/2014 questions not found! Please check psc_tradesman_170_2014.js or sync with Google Sheets.");
    return;
  }

  const isTech = document.getElementById('tech-only-170')?.checked;
  state.activeSession = {
    mode: 'exam',
    title: `Tradesman CHM Exam (170/2014)${isTech ? ' - Technical Only (80 Qs)' : ' - 100 Qs'}`,
    questions: questions,
    currentIndex: 0,
    userAnswers: {},
    timeRemaining: Math.round(questions.length * 45),
    timerInterval: null,
    isSubmitted: false
  };

  initQuizUI();
  startExamTimer();
}

// Start Timed Test for a Specific Module
function startModuleExam(moduleId) {
  const modDef = MODULE_DEFINITIONS.find(m => m.id === moduleId);
  let questions = state.questions.filter(q => q.sheetName === moduleId);
  
  if (questions.length === 0) {
    alert("No questions found for this module!");
    return;
  }

  questions = [...questions].sort(() => Math.random() - 0.5);

  state.activeSession = {
    mode: 'exam',
    title: `${modDef ? modDef.name : moduleId} (Timed Test)`,
    questions: questions,
    currentIndex: 0,
    userAnswers: {},
    timeRemaining: Math.max(questions.length * 60, 300), // 1 min per question or min 5 min
    timerInterval: null,
    isSubmitted: false
  };

  initQuizUI();
  startExamTimer();
}

// Initialize Quiz UI
function initQuizUI() {
  const session = state.activeSession;
  navigate('quiz');

  document.getElementById('quiz-title').innerText = session.title;
  document.getElementById('total-q-count').innerText = session.questions.length;

  const modeBadge = document.getElementById('quiz-mode-badge');
  const timerContainer = document.getElementById('quiz-timer-container');
  const palette = document.getElementById('exam-palette');
  const submitBtn = document.getElementById('submit-exam-btn');
  const nextBtn = document.getElementById('next-btn');

  if (session.mode === 'exam') {
    modeBadge.innerText = 'PSC Exam Mode (-0.33 Mark)';
    modeBadge.className = 'text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded';
    timerContainer.classList.remove('hidden');
    palette.classList.remove('hidden');
    submitBtn.classList.remove('hidden');
  } else {
    modeBadge.innerText = session.mode === 'mistakes' ? 'Mistake Revision Mode' : 'Practice Mode';
    modeBadge.className = 'text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded';
    timerContainer.classList.add('hidden');
    palette.classList.remove('hidden'); // Visible in practice mode for easy question jumping
    submitBtn.classList.add('hidden');
  }

  renderQuestionPalette();

  renderCurrentQuestion();
}

// Format explanation with English and Malayalam sections
function formatExplanation(text, malayalamText = null) {
  let english = text || "";
  let malayalam = malayalamText || "";

  if (!malayalam) {
    if (english.includes("[മലയാളം]:")) {
      const parts = english.split("[മലയാളം]:");
      english = parts[0].trim();
      malayalam = parts[1].trim();
    } else if (english.includes("മലയാളം വിശദീകരണം:")) {
      const parts = english.split("മലയാളം വിശദീകരണം:");
      english = parts[0].trim();
      malayalam = parts[1].trim();
    }
  }

  const formattedEn = english.replace(/\n/g, '<br>');
  if (!malayalam) {
    return `<div class="text-slate-700 leading-relaxed">${formattedEn}</div>`;
  }

  const formattedMl = malayalam.replace(/\n/g, '<br>');
  return `
    <div class="space-y-3">
      <div class="text-slate-700 text-sm leading-relaxed">
        <span class="inline-block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">English</span>
        <div>${formattedEn}</div>
      </div>
      <div class="bg-white/90 border border-emerald-200/90 rounded-xl p-3.5 space-y-1 shadow-sm">
        <div class="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
          <i class="fa-solid fa-language text-emerald-600 text-base"></i>
          <span>മലയാളം വിശദീകരണം:</span>
        </div>
        <div class="text-slate-800 text-sm leading-relaxed font-medium">
          ${formattedMl}
        </div>
      </div>
    </div>
  `;
}

// Render Question on Screen
function renderCurrentQuestion() {
  const session = state.activeSession;
  const q = session.questions[session.currentIndex];
  const idx = session.currentIndex;

  document.getElementById('current-q-index').innerText = idx + 1;
  document.getElementById('question-subtopic').innerText = q.subtopic || q.sheetName || 'CHM';
  document.getElementById('question-text').innerText = q.question;

  // Last Attempt Badge
  const lastBadge = document.getElementById('last-attempt-badge');
  if (lastBadge) {
    const prev = state.answerHistory && state.answerHistory[q.id];
    if (prev && session.mode !== 'exam') {
      const dt = prev.timestamp ? new Date(prev.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '';
      lastBadge.classList.remove('hidden');
      lastBadge.className = prev.isCorrect
        ? "px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"
        : "px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200";
      lastBadge.innerText = `🕒 Last: Option (${prev.selectedOption}) ${prev.isCorrect ? '✓' : '✗'}${dt ? ' • ' + dt : ''}`;
    } else {
      lastBadge.classList.add('hidden');
    }
  }

  // Bookmark icon update
  const isBookmarked = state.bookmarks.includes(q.id);
  const bmBtn = document.getElementById('bookmark-btn');
  bmBtn.innerHTML = isBookmarked ? '<i class="fa-solid fa-star text-amber-500"></i>' : '<i class="fa-regular fa-star"></i>';

  // Options
  const container = document.getElementById('options-container');
  container.innerHTML = '';

  const options = [
    { key: 'A', text: q.option_a },
    { key: 'B', text: q.option_b },
    { key: 'C', text: q.option_c },
    { key: 'D', text: q.option_d }
  ];

  const userAnswer = session.userAnswers[idx];

  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = "w-full text-left p-4 rounded-2xl border-2 transition flex items-center justify-between text-sm sm:text-base font-medium ";

    if (session.mode === 'practice' || session.isSubmitted) {
      // In practice or after submission, show instant correct/wrong
      if (userAnswer) {
        if (opt.key === q.correct_answer) {
          btn.className += "border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold";
          btn.innerHTML = `<span><strong>(${opt.key})</strong> ${opt.text}</span> <i class="fa-solid fa-circle-check text-emerald-600 text-lg"></i>`;
        } else if (userAnswer.selected === opt.key) {
          btn.className += "border-rose-500 bg-rose-50 text-rose-950";
          btn.innerHTML = `<span><strong>(${opt.key})</strong> ${opt.text}</span> <i class="fa-solid fa-circle-xmark text-rose-600 text-lg"></i>`;
        } else {
          btn.className += "border-slate-200 bg-white text-slate-500 opacity-60";
          btn.innerHTML = `<span><strong>(${opt.key})</strong> ${opt.text}</span>`;
        }
      } else {
        btn.className += "border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/50 text-slate-800";
        btn.innerHTML = `<span><strong>(${opt.key})</strong> ${opt.text}</span>`;
        btn.onclick = () => selectOption(opt.key);
      }
    } else {
      // In Exam mode: just record choice without revealing correctness
      if (userAnswer && userAnswer.selected === opt.key) {
        btn.className += "border-indigo-600 bg-indigo-50 text-indigo-950 font-bold shadow-sm";
        btn.innerHTML = `<span><strong>(${opt.key})</strong> ${opt.text}</span> <i class="fa-solid fa-check text-indigo-600"></i>`;
      } else {
        btn.className += "border-slate-200 bg-white hover:border-indigo-300 text-slate-800";
        btn.innerHTML = `<span><strong>(${opt.key})</strong> ${opt.text}</span>`;
      }
      btn.onclick = () => selectOption(opt.key);
    }

    container.appendChild(btn);
  });

  // Explanation Box handling
  const explanationBox = document.getElementById('explanation-box');
  const explanationText = document.getElementById('explanation-text');
  if ((session.mode === 'practice' || session.isSubmitted) && userAnswer) {
    explanationBox.classList.remove('hidden');
    explanationText.innerHTML = formatExplanation(q.explanation, q.explanation_malayalam);
  } else {
    explanationBox.classList.add('hidden');
  }

  // Quick Action Button (Practice mode show explanation toggle)
  const quickActions = document.getElementById('practice-quick-actions');
  if (quickActions) {
    if (session.mode === 'practice' || session.isSubmitted) {
      quickActions.classList.remove('hidden');
    } else {
      quickActions.classList.add('hidden');
    }
  }

  // Prev / Next button states
  document.getElementById('prev-btn').disabled = idx === 0;
  document.getElementById('prev-btn').classList.toggle('opacity-40', idx === 0);

  renderQuestionPalette();
}

// Toggle Explanation Manually in Practice Mode
function toggleExplanation() {
  const session = state.activeSession;
  if (!session) return;
  const q = session.questions[session.currentIndex];
  const box = document.getElementById('explanation-box');
  const textEl = document.getElementById('explanation-text');
  if (!box || !textEl) return;

  if (box.classList.contains('hidden')) {
    box.classList.remove('hidden');
    textEl.innerHTML = formatExplanation(q.explanation, q.explanation_malayalam);
  } else {
    box.classList.add('hidden');
  }
}

// Select an Option
function selectOption(optKey) {
  const session = state.activeSession;
  const q = session.questions[session.currentIndex];
  const isCorrect = (optKey === q.correct_answer);

  session.userAnswers[session.currentIndex] = {
    selected: optKey,
    isCorrect: isCorrect
  };

  // Update Global Stats if practice mode
  if (session.mode === 'practice') {
    recordModuleResult(q.sheetName, isCorrect);
    recordQuestionAttempt(q, optKey, isCorrect, 'practice');
    state.stats.attempted++;
    if (isCorrect) {
      state.stats.correct++;
      // Remove from mistakes if it was there
      state.mistakes = state.mistakes.filter(m => m.id !== q.id);
    } else {
      state.stats.wrong++;
      // Add to mistakes
      if (!state.mistakes.some(m => m.id === q.id)) {
        state.mistakes.push(q);
      }
    }
    saveUserData();
  }

  renderCurrentQuestion();
}

function nextQuestion() {
  const session = state.activeSession;
  if (session.currentIndex < session.questions.length - 1) {
    session.currentIndex++;
    renderCurrentQuestion();
  }
}

function prevQuestion() {
  const session = state.activeSession;
  if (session.currentIndex > 0) {
    session.currentIndex--;
    renderCurrentQuestion();
  }
}

// Jump Directly to Question by Index
function jumpToQuestion(index) {
  const session = state.activeSession;
  if (!session) return;
  if (index >= 0 && index < session.questions.length) {
    session.currentIndex = index;
    renderCurrentQuestion();
  }
}

// Update Question Jump Dropdown
function updateJumpDropdown() {
  const dropdown = document.getElementById('question-jump-dropdown');
  const session = state.activeSession;
  if (!dropdown || !session) return;

  dropdown.innerHTML = '';
  session.questions.forEach((q, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    const ans = session.userAnswers[i];
    let icon = "⚪";
    if (session.mode === 'practice' || session.isSubmitted) {
      if (ans) {
        icon = ans.isCorrect ? "🟢" : "🔴";
      }
    } else {
      if (ans) icon = "🔵";
    }

    let qPreview = q.question.length > 28 ? q.question.substring(0, 28) + '...' : q.question;
    opt.text = `${icon} Q ${i + 1}: ${qPreview}`;
    if (i === session.currentIndex) {
      opt.selected = true;
    }
    dropdown.appendChild(opt);
  });
}

// Question Palette for fast jumping (Practice & Exam Mode)
function renderQuestionPalette() {
  const palette = document.getElementById('exam-palette');
  const session = state.activeSession;
  if (!palette || !session) return;
  palette.innerHTML = '';

  session.questions.forEach((q, i) => {
    const dot = document.createElement('button');
    dot.className = "min-w-[2.25rem] h-9 px-2.5 rounded-xl text-xs font-extrabold flex-shrink-0 transition-all flex items-center justify-center gap-1 shadow-sm ";
    
    const ans = session.userAnswers[i];
    const isCurrent = (i === session.currentIndex);

    if (isCurrent) {
      dot.className += "ring-2 ring-indigo-600 ring-offset-2 scale-105 font-black ";
    }

    if (session.mode === 'practice' || session.isSubmitted) {
      if (ans) {
        if (ans.isCorrect) {
          dot.className += "bg-emerald-600 text-white hover:bg-emerald-700";
          dot.innerHTML = `<span>${i + 1}</span><i class="fa-solid fa-check text-[9px]"></i>`;
        } else {
          dot.className += "bg-rose-500 text-white hover:bg-rose-600";
          dot.innerHTML = `<span>${i + 1}</span><i class="fa-solid fa-xmark text-[9px]"></i>`;
        }
      } else {
        dot.className += isCurrent 
          ? "bg-indigo-50 text-indigo-700 border border-indigo-300" 
          : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200";
        dot.innerHTML = `<span>${i + 1}</span>`;
      }
    } else {
      // Exam Mode
      if (ans) {
        dot.className += "bg-emerald-600 text-white";
      } else {
        dot.className += isCurrent 
          ? "bg-indigo-50 text-indigo-700 border border-indigo-300"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200";
      }
      dot.innerHTML = `<span>${i + 1}</span>`;
    }

    dot.title = `Question ${i + 1}${ans ? (ans.isCorrect ? ' (Correct)' : ' (Wrong)') : ''}`;
    dot.onclick = () => {
      session.currentIndex = i;
      renderCurrentQuestion();
    };
    palette.appendChild(dot);
  });

  // Smooth scroll active dot into view horizontally
  const activeDot = palette.children[session.currentIndex];
  if (activeDot) {
    activeDot.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  updateJumpDropdown();
}

// Exam Timer
function startExamTimer() {
  clearInterval(state.activeSession.timerInterval);
  state.activeSession.timerInterval = setInterval(() => {
    state.activeSession.timeRemaining--;
    const t = state.activeSession.timeRemaining;
    if (t <= 0) {
      clearInterval(state.activeSession.timerInterval);
      submitExam();
      return;
    }

    const mins = Math.floor(t / 60);
    const secs = t % 60;
    document.getElementById('quiz-timer').innerText = 
      `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, 1000);
}

// Submit Full Exam
function submitExam() {
  const session = state.activeSession;
  if (!session) return;
  clearInterval(session.timerInterval);
  session.isSubmitted = true;

  let correct = 0;
  let wrong = 0;
  let unattempted = 0;

  session.questions.forEach((q, i) => {
    const ans = session.userAnswers[i];
    if (!ans) {
      unattempted++;
    } else if (ans.isCorrect) {
      correct++;
      recordModuleResult(q.sheetName, true);
    } else {
      wrong++;
      recordModuleResult(q.sheetName, false);
      // Add wrong questions to mistake revision
      if (!state.mistakes.some(m => m.id === q.id)) {
        state.mistakes.push(q);
      }
    }
  });

  // Kerala PSC Marking: +1 for right, -0.33 for wrong
  const penalty = wrong * 0.33;
  const score = Math.max(0, (correct * 1.0) - penalty);

  // Update Lifetime Stats & Exam History
  const examItemsToSync = [];
  session.questions.forEach((q, i) => {
    const ans = session.userAnswers[i];
    if (ans) {
      const rec = recordQuestionAttempt(q, ans.selected, ans.isCorrect, 'exam', true);
      if (rec) examItemsToSync.push(rec);
    }
  });
  if (examItemsToSync.length > 0) {
    postProgressToSheet(examItemsToSync);
  }
  state.stats.attempted += (correct + wrong);
  state.stats.correct += correct;
  state.stats.wrong += wrong;

  // Save to Exam History
  state.examHistory.unshift({
    date: new Date().toISOString(),
    title: session.title,
    score: parseFloat(score.toFixed(2)),
    totalMarks: session.questions.length,
    correct: correct,
    wrong: wrong,
    unattempted: unattempted,
    pct: session.questions.length > 0 ? Math.round((score / session.questions.length) * 100) : 0
  });
  if (state.examHistory.length > 30) state.examHistory = state.examHistory.slice(0, 30);
  localStorage.setItem('chm_exam_history', JSON.stringify(state.examHistory));

  saveUserData();

  // Show Results
  document.getElementById('final-score').innerText = score.toFixed(2);
  document.getElementById('final-total-marks').innerText = session.questions.length;
  document.getElementById('final-correct').innerText = correct;
  document.getElementById('final-wrong').innerText = wrong;
  document.getElementById('final-unattempted').innerText = unattempted;

  // Detailed PSC Marking Breakdown & Rank Estimate
  const breakdownEl = document.getElementById('result-calc-breakdown');
  if (breakdownEl) {
    breakdownEl.innerText = `+${(correct * 1.0).toFixed(2)} (ശരി) - ${penalty.toFixed(2)} (നെഗറ്റീവ് പെനാൽറ്റി) = ${score.toFixed(2)} മാർക്ക്`;
  }

  const badgeEl = document.getElementById('result-rank-badge');
  if (badgeEl) {
    const totalQ = session.questions.length || 100;
    const pct = (score / totalQ) * 100;
    if (pct >= 70) {
      badgeEl.className = "mt-2 inline-block px-3.5 py-1 bg-emerald-100 text-emerald-900 rounded-full font-bold text-xs border border-emerald-300";
      badgeEl.innerHTML = '🏆 Rank 1 - 20 സാധ്യത (Outstanding Performance)';
    } else if (pct >= 50) {
      badgeEl.className = "mt-2 inline-block px-3.5 py-1 bg-amber-100 text-amber-900 rounded-full font-bold text-xs border border-amber-300";
      badgeEl.innerHTML = '🌟 Shortlist സാധ്യത (Competitive Zone)';
    } else if (pct >= 35) {
      badgeEl.className = "mt-2 inline-block px-3.5 py-1 bg-blue-100 text-blue-900 rounded-full font-bold text-xs border border-blue-300";
      badgeEl.innerHTML = '📈 ശരാശരി നിലവാരം (Needs More Practice)';
    } else {
      badgeEl.className = "mt-2 inline-block px-3.5 py-1 bg-rose-100 text-rose-900 rounded-full font-bold text-xs border border-rose-300";
      badgeEl.innerHTML = '⚠️ റിവിഷൻ ആവശ്യമാണ് (Focus on Weak Modules)';
    }
  }

  const negAlert = document.getElementById('negative-mark-text');
  if (negAlert) {
    if (wrong > 0) {
      negAlert.innerHTML = `തെറ്റായ <strong>${wrong}</strong> ഉത്തരങ്ങൾ കാരണം <strong>-${penalty.toFixed(2)}</strong> മാർക്ക് കുറഞ്ഞു! യഥാർത്ഥ PSC പരീക്ഷയിൽ ഉറപ്പില്ലാത്ത ചോദ്യങ്ങൾ ഒഴിവാക്കുന്നത് കൂടുതൽ ഉയർന്ന റാങ്ക് നേടാൻ സഹായിക്കും.`;
    } else {
      negAlert.innerHTML = `അഭിനന്ദനങ്ങൾ! നിങ്ങൾ നൽകിയ ഉത്തരങ്ങളിൽ ഒന്നുപോലും തെറ്റിയിട്ടില്ല (നെഗറ്റീവ് മാർക്ക് 0.00).`;
    }
  }

  navigate('results');
}

function reviewCurrentTest() {
  navigate('quiz');
  state.activeSession.currentIndex = 0;
  renderCurrentQuestion();
}

function confirmExitQuiz() {
  if (state.activeSession && state.activeSession.mode === 'exam' && !state.activeSession.isSubmitted) {
    if (confirm("Are you sure you want to quit the exam? Your progress will be lost.")) {
      clearInterval(state.activeSession.timerInterval);
      navigate('home');
    }
  } else {
    navigate('home');
  }
}

// Bookmark Toggle
function toggleCurrentBookmark() {
  const session = state.activeSession;
  if (!session) return;
  const q = session.questions[session.currentIndex];
  
  if (state.bookmarks.includes(q.id)) {
    state.bookmarks = state.bookmarks.filter(id => id !== q.id);
  } else {
    state.bookmarks.push(q.id);
  }
  saveUserData();
  renderCurrentQuestion();
}

// Mistake Notebook Feature
function openMistakeNotebook() {
  if (state.mistakes.length === 0) {
    alert("ഹർഷം! നിങ്ങളുടെ Mistake Notebook-ൽ ഇപ്പോൾ ചോദ്യങ്ങൾ ഒന്നുമില്ല. പ്രാക്ടീസ് ചെയ്യുമ്പോൾ തെറ്റുന്ന ചോദ്യങ്ങൾ ഇവിടെ തനിയെ എത്തിച്ചേരും!");
    return;
  }

  navigate('mistakes');
  const container = document.getElementById('mistake-list');
  container.innerHTML = '';

  state.mistakes.forEach((q, index) => {
    const card = document.createElement('div');
    card.className = "bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3";
    card.innerHTML = `
      <div class="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span class="bg-rose-50 text-rose-700 px-2 py-0.5 rounded">${q.sheetName || 'Module'}</span>
        <button onclick="removeMistake('${q.id}')" class="text-slate-400 hover:text-emerald-600 font-bold flex items-center gap-1">
          <i class="fa-solid fa-check"></i> Mark Solved
        </button>
      </div>
      <h4 class="font-bold text-slate-800 text-base">${index + 1}. ${q.question}</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div class="p-2 rounded-lg bg-slate-50"><strong>A:</strong> ${q.option_a}</div>
        <div class="p-2 rounded-lg bg-slate-50"><strong>B:</strong> ${q.option_b}</div>
        <div class="p-2 rounded-lg bg-slate-50"><strong>C:</strong> ${q.option_c}</div>
        <div class="p-2 rounded-lg bg-slate-50"><strong>D:</strong> ${q.option_d}</div>
      </div>
      <div class="p-3 bg-emerald-50 text-emerald-900 rounded-xl text-xs space-y-2">
        <div class="font-bold text-sm">Correct Answer: Option (${q.correct_answer})</div>
        <div>${formatExplanation(q.explanation, q.explanation_malayalam)}</div>
      </div>
    `;
    container.appendChild(card);
  });
}

function removeMistake(questionId) {
  state.mistakes = state.mistakes.filter(m => m.id !== questionId);
  saveUserData();
  openMistakeNotebook();
}

function clearMistakes() {
  if (confirm("Clear all questions from your mistake notebook?")) {
    state.mistakes = [];
    saveUserData();
    navigate('home');
  }
}

// Google Sheets Sync
function openSettingsModal() {
  document.getElementById('settings-modal').classList.remove('hidden');
}

function closeSettingsModal() {
  document.getElementById('settings-modal').classList.add('hidden');
}

async function syncWithGoogleSheet(isAutoSync = false) {
  const urlInput = document.getElementById('sheet-api-url').value.trim() || state.apiUrl;
  const statusEl = document.getElementById('sync-status');
  const syncBtn = document.getElementById('btn-sync-now');

  if (!urlInput) {
    if (!isAutoSync) alert("Please enter a valid Google Apps Script Web App URL!");
    return;
  }

  if (statusEl) {
    statusEl.className = "p-3 rounded-xl text-xs font-medium bg-amber-50 text-amber-800 block";
    statusEl.innerText = "Connecting to Google Sheet & fetching all module questions...";
  }
  if (syncBtn) syncBtn.disabled = true;

  try {
    const fetchUrl = urlInput.includes('?') ? `${urlInput}&module=all` : `${urlInput}?module=all`;
    const res = await fetch(fetchUrl);
    const data = await res.json();

    if (data.status === "success" && data.questions) {
      let merged = [...data.questions];
      // Keep built-in previous questions if not yet in synced Google Sheet
      const hasPsc147InSync = merged.some(q => q.sheetName === "PSC_Previous_Exam");
      if (!hasPsc147InSync && typeof PSC_PREVIOUS_QUESTIONS !== 'undefined') {
        merged = merged.concat(PSC_PREVIOUS_QUESTIONS);
      }
      const hasTradesmanInSync = merged.some(q => q.sheetName === "PSC_Tradesman_191_2015");
      if (!hasTradesmanInSync && typeof PSC_TRADESMAN_191_QUESTIONS !== 'undefined') {
        merged = merged.concat(PSC_TRADESMAN_191_QUESTIONS);
      }
      const hasTradesman170InSync = merged.some(q => q.sheetName === "PSC_Tradesman_170_2014");
      if (!hasTradesman170InSync && typeof PSC_TRADESMAN_170_QUESTIONS !== 'undefined') {
        merged = merged.concat(PSC_TRADESMAN_170_QUESTIONS);
      }
      if (typeof SYLLABUS_EXTRA_QUESTIONS !== 'undefined') {
        const syncedIds = new Set(merged.map(q => q.id));
        SYLLABUS_EXTRA_QUESTIONS.forEach(q => {
          if (!syncedIds.has(q.id)) merged.push(q);
        });
      }
      state.questions = merged;
      state.apiUrl = urlInput;
      localStorage.setItem('chm_cached_questions', JSON.stringify(merged));
      localStorage.setItem('chm_api_url', urlInput);
      localStorage.setItem('chm_last_synced', new Date().toISOString());

      if (statusEl) {
        statusEl.className = "p-3 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-800 block";
        statusEl.innerText = `Success! Fetched ${merged.length} questions across your Google Sheet modules.`;
      }
      renderDashboard();
      if (!isAutoSync) {
        setTimeout(closeSettingsModal, 1800);
      }
    } else {
      throw new Error(data.message || "Invalid response format from Apps Script");
    }
  } catch (err) {
    if (statusEl) {
      statusEl.className = "p-3 rounded-xl text-xs font-medium bg-rose-50 text-rose-800 block";
      statusEl.innerText = `Error syncing: ${err.message}. Make sure your script is deployed as 'Web app' with access 'Anyone'.`;
    }
  } finally {
    if (syncBtn) syncBtn.disabled = false;
  }
}

function resetToSampleQuestions() {
  localStorage.removeItem('chm_cached_questions');
  state.questions = getAllBuiltinQuestions();
  renderDashboard();
  alert("Reset to built-in sample and PSC previous exam questions.");
  closeSettingsModal();
}

function saveUserData() {
  localStorage.setItem('chm_mistakes', JSON.stringify(state.mistakes));
  localStorage.setItem('chm_bookmarks', JSON.stringify(state.bookmarks));
  localStorage.setItem('chm_stats', JSON.stringify(state.stats));
  localStorage.setItem('chm_module_stats', JSON.stringify(state.moduleStats));
  updateMistakeBadge();
}

function updateMistakeBadge() {
  const badge = document.getElementById('mistake-count-badge');
  if (badge) badge.innerText = state.mistakes.length;
}

// ============================================================================
// 🤖 INSTANT IN-APP AI MCQ GENERATOR (GEMINI API)
// ============================================================================

const MODULE_TOPIC_MAP = {
  "Module_1_Electronics": `Module 1: Basic Electronics (Marks: 12)
- Basic principles of electricity: Voltage, current, resistance, power, energy, ohm's law, Kirchhoff's law.
- Resistors: types, color coding, power rating, series/parallel combinations, applications.
- Capacitors: principles, dielectric materials, types, series/parallel circuits.
- Inductors & Transformers: inductance, mutual inductance, magnetic cores, inductive reactance, transformer action, turns ratio, and impedance matching.
- Semiconductor fundamentals: intrinsic and extrinsic semiconductors, p-type and n-type doping, majority/minority carriers, PN junction formation.
- PN junction diode: Forward and reverse bias characteristics, barrier potential, breakdown mechanisms, diode applications, specialized diodes.
- Power semiconductor devices: SCR: Structure, triggering methods, latching and holding current, phase control circuits. DIAC: Construction, bidirectional switching characteristics, triggering applications. TRIAC: Operations, power control.
- Transistor operation: NPN and PNP structures, biasing conditions. Configurations: BJT as a switch & amplifier, FET, JFET, MOSFET, Applications, amplifiers.
- Power Supplies & voltage regulation: Linear Regulators: Zener regulators, current limiting, and thermal protection. Fixed & adjustable 3-Pin IC Regulators, power fluctuation hazards and protection devices.
- Switched-Mode Power Supplies (SMPS): Linear, Switching regulation.
- Digital Electronics: Number systems, Logic gates.`,

  "Module_2_Comp_Fundamentals": `Module 2: Computer Fundamentals (Marks: 08)
- Computer Fundamentals: Characteristics of digital computers, generations, classification, applications.
- Hardware and software concepts, functional blocks, internal architecture, instruction cycle.
- Motherboard components, Cabinet form factors, motherboard form factors, expansion slots, bus architecture, add-on cards, chipset architecture, processor families, socket types.
- Memory hierarchy, memory units, primary memory, RAM, ROM, cache memory.`,

  "Module_3_Adv_Hardware_Storage": `Module 3: Advanced Hardware & Storage (Marks: 10)
- CPU Technology: Internal organization, Modern CPU architectures, multicore processing, thermal cooling mechanisms, over clocking.
- Storage Devices: Magnetic storage devices, hard disk drive (HDD), Internal architecture, hard drive controller electronics, solid state devices (SSD), storage interfaces (SATA, NVMe, PCIe), optical storage devices, redundant array of independent disks (RAID concepts and levels: RAID 0, 1, 5, 10), network attached storage (NAS).`,

  "Module_4_OS_Deployment": `Module 4: Operating Systems and deployment (Marks: 10)
- Software Classification: System software, application software, utility programs, high level language, low level language.
- OS Setup & Recovery: OS functions, open source and proprietary softwares, disk operating system (DOS), GUI environments, OS deployment methods, recovery partitions, system image creation, backup and restore, registry fundamentals, Linux OS features and structure, file system and process architecture, basic commands.
- Partition Schemes: Master boot record (MBR), partition tables, primary, extended, logical partitions.
- Boot Management: Boot loaders, windows boot manager and alternative boot managers, multi-boot configuration.`,

  "Module_5_System_Utilities": `Module 5: System Utilities & Maintenance (Marks: 10)
- System Files & Commands: Windows Explorer, file system properties, 32-bit, 64-bit architecture, critical system32 directory files, command-line operations and PowerShell basics, task manager, windows services, process priorities, event viewer, system monitor, safe mode functionality.
- User Account Security: Account types, user account control (UAC), user access levels, permissions, group policies, and time-based permission expiration.
- Malware & System Maintenance: Antivirus configuration, definitions update, port blocking, hosts file modification, junk file cleanup, defragmentation, and software licensing compliance.`,

  "Module_6_Office_Applications": `Module 6: Office Applications (Marks: 10)
- Word Processing & Spreadsheets: Document creation, editing, formatting, page setup, mail merge, spreadsheet creation, cell formulas, chart generation, data sorting/filtering.
- Presentations: Slide creation, themes, formatting, animation, and multimedia integration.`,

  "Module_7_IO_Devices": `Module 7: I/O Devices & Maintenance (Marks: 10)
- I/O Devices: Keyboards, mice, audio & visual input, biometric & commercial input output peripherals.
- Display technologies, video interfacing: audio i/o systems.
- Impact and non-impact printers (Dot Matrix, Inkjet, Laser printers), scanners & MFDs, other i/o devices.
- Peripheral bus standards (USB, HDMI, DisplayPort, VGA), installation, configuration, driver deployment, diagnostics, maintenance & repair.`,

  "Module_8_Networking": `Module 8: Networking Fundamentals (Marks: 10)
- Network Architectures & Topologies: Peer-to-Peer, Client-Server models, Topologies (Star, Mesh, Bus, Ring). LAN, MAN, PAN, WAN structures. IEEE standards, Wireless networking.
- Transmission Media & Standards: Twisted-pair, coaxial, and fiber-optic cables; RJ-45, RJ-11, and BNC connectors, CAT6 wiring conventions (T568A/T568B), simplex, half-duplex, and full-duplex data transmission.
- Reference Models: Layered architectures and functions of the OSI 7-Layer model and TCP/IP protocol suite.
- Hardware: Hubs, switches, routers, gateways, repeaters, transceivers, wireless access points, firewalls.
- IP Addressing & Network Services: IPv4, IPv6, sub netting, TCP/IP utilities (ping, traceroute, netstat, ipconfig/ifconfig).`,

  "Module_9_Protocols_Servers": `Module 9: Application Protocols and Server Administration (Marks: 10)
- Application Protocols: DHCP, DNS, FTP, Telnet, SSH, HTTP, HTTPS, SMTP. Virtual LAN (VLAN) concepts, packet simulators.
- Server Systems: Hardware, Windows and Linux Server deployment, network management utilities, remote administration (RDP, SSH).`,

  "Module_10_Security_Cloud_Law": `Module 10: Network Security, Cloud Computing & IT Law (Marks: 10)
- Network Security Fundamentals: Security concepts, types of network attacks (DoS, DDoS, Phishing, Man-in-the-Middle, Malware), identification and prevention strategies, cyber threats, data breaches, safe browsing practices, email security, cryptography & authentication.
- Virtualization & Cloud Computing: Server virtualization, virtual machine requirements, cloud infrastructure, models (IaaS, PaaS, SaaS, Public/Private/Hybrid cloud), public cloud services.
- The IT Act & Cyber Laws: Introduction to the Information Technology (IT) Act 2000, legal provisions regarding cybercrime (Section 66, etc.), digital signatures, legal frameworks for electronic governance, data privacy regulations.`
};

let latestGeneratedBatch = [];

function openAiGeneratorModal(moduleId = null) {
  const modal = document.getElementById('ai-generator-modal');
  if (!modal) return;
  modal.classList.remove('hidden');

  const select = document.getElementById('gen-module-select');
  if (select) {
    if (moduleId) {
      select.value = moduleId;
    }
    // Update syllabus topic pills whenever module changes
    select.onchange = () => updateAiTopicPills(select.value);
    updateAiTopicPills(select.value);
  }

  const keyInput = document.getElementById('gen-api-key');
  if (keyInput) {
    keyInput.value = state.geminiKey || "";
  }

  const statusBox = document.getElementById('gen-status-box');
  if (statusBox) {
    statusBox.className = "hidden p-3.5 rounded-xl text-xs font-medium";
    statusBox.innerHTML = "";
  }
}

function closeAiGeneratorModal() {
  const modal = document.getElementById('ai-generator-modal');
  if (modal) modal.classList.add('hidden');
}

async function runAiGenerationNow() {
  const modSelect = document.getElementById('gen-module-select').value;
  const count = parseInt(document.getElementById('gen-count-select').value, 10) || 10;
  const difficulty = document.getElementById('gen-difficulty-select').value;
  const customNotes = document.getElementById('gen-custom-notes').value.trim();
  const statusBox = document.getElementById('gen-status-box');
  const runBtn = document.getElementById('btn-run-generator');

  const keyInput = document.getElementById('gen-api-key');
  if (keyInput && keyInput.value.trim()) {
    state.geminiKey = keyInput.value.trim();
    localStorage.setItem('chm_gemini_key', state.geminiKey);
  }

  if (!state.geminiKey) {
    alert("ദയവായി നിങ്ങളുടെ Gemini API Key നൽകുക! Google AI Studio-ൽ നിന്ന് സൗജന്യമായി കീ എടുക്കാം.");
    if (keyInput) keyInput.focus();
    return;
  }

  // Update UI to loading state
  statusBox.className = "p-3.5 rounded-xl text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200 block space-y-1";
  statusBox.innerHTML = `
    <div class="flex items-center gap-2 font-bold text-amber-800">
      <i class="fa-solid fa-spinner fa-spin"></i> Gemini AI ചോദ്യങ്ങൾ തയ്യാറാക്കുന്നു...
    </div>
    <p class="text-amber-700">Kerala PSC Tradesman സിലബസ് അടിസ്ഥാനമാക്കി ${count} ചോദ്യങ്ങളും വിശദീകരണങ്ങളും നിർമ്മിക്കുന്നു. ദയവായി കുറച്ച് സെക്കൻഡുകൾ കാത്തിരിക്കുക.</p>
  `;
  runBtn.disabled = true;
  runBtn.classList.add('opacity-50', 'cursor-not-allowed');

  try {
    let topicDescription = "";
    let defaultModule = "Module_1_Electronics";

    if (modSelect === "ALL") {
      topicDescription = "A balanced mix across all 10 modules of the official Kerala PSC Tradesman Computer Hardware Maintenance syllabus:\n\n" +
        Object.values(MODULE_TOPIC_MAP).join("\n\n");
      defaultModule = "Module_1_Electronics";
    } else {
      topicDescription = MODULE_TOPIC_MAP[modSelect] || modSelect;
      defaultModule = modSelect;
    }

    let notesContext = "";
    if (customNotes) {
      notesContext = `\nCANDIDATE REFERENCE NOTES & PREVIOUS EXAM QUESTIONS FROM NOTEBOOK:
"""
${customNotes}
"""
Please strictly align the concepts, technical terms, difficulty level, and question patterns with the above candidate notes.\n`;
    }

    const promptText = `You are an expert Kerala PSC examiner creating authentic multiple choice questions for Kerala PSC Tradesman - Computer Hardware Maintenance (Cat. No. 884/2025).
Official Syllabus Topic & Subtopics:
${topicDescription}

Difficulty: ${difficulty}
Target Question Count: ${count}
${difficulty === 'hard' ? 'BONUS DEPTH (Official PSC Syllabus NOTE): Include rank-deciding numericals, ITI/VHSE/Diploma-level practical troubleshooting, and subtle distinction questions (e.g., SCR latching vs holding current, subnetting, RAID capacity, System32/PowerShell, IT Act sections).' : ''}
${notesContext}
REQUIREMENTS:
1. Each question must test practical and theoretical concepts according to the Kerala PSC Tradesman syllabus.
2. Provide exactly 4 options (option_a, option_b, option_c, option_d) in English.
3. Provide the correct answer (A, B, C, or D).
4. Provide a comprehensive explanation containing BOTH English and a clear, simple Malayalam explanation.
   Format the "explanation" field strictly as:
   "Concise technical explanation in English.\n\n[മലയാളം]: ലളിതമായ മലയാളം വിശദീകരണം."
5. In the "sheetName" field, provide one of the following exact module IDs:
["Module_1_Electronics", "Module_2_Comp_Fundamentals", "Module_3_Adv_Hardware_Storage", "Module_4_OS_Deployment", "Module_5_System_Utilities", "Module_6_Office_Applications", "Module_7_IO_Devices", "Module_8_Networking", "Module_9_Protocols_Servers", "Module_10_Security_Cloud_Law"]
(If a specific module was requested, set sheetName to "${defaultModule}").
6. Distribute questions specifically across the individual subtopics listed in the syllabus above (e.g., Color coding, SCR/TRIAC, Instruction Cycle, RAID, Linux commands, System32/PowerShell, Mail Merge, Laser printer fuser/drum, Cat6 wiring, DHCP/DNS, IT Act 2000 Section 66, etc.).
7. In the "subtopic" field, explicitly state the exact syllabus subtopic name being tested.
8. Output ONLY a valid RFC 8259 JSON array. All newlines inside strings MUST be properly escaped as \\n. Do NOT include raw unescaped control characters or unescaped newlines inside strings.
9. Output ONLY raw JSON array, with no Markdown ticks or wrapper text.

JSON FORMAT:
[
  {
    "question": "Question text here...",
    "option_a": "Option A text",
    "option_b": "Option B text",
    "option_c": "Option C text",
    "option_d": "Option D text",
    "correct_answer": "A",
    "explanation": "Concise technical explanation in English.\\n\\n[മലയാളം]: ലളിതമായ മലയാളം വിശദീകരണം.",
    "sheetName": "${defaultModule}",
    "subtopic": "Specific syllabus subtopic name"
  }
]`;

    // Call Gemini with dynamic model discovery and fallback
    const data = await callGeminiWithAutoModel(state.geminiKey, promptText);
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No response generated from Gemini API.");

    // Robust parsing that handles unescaped control characters and markdown fences
    const parsedQuestions = safeParseGeminiJson(text);
    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      throw new Error("Invalid question format received from AI.");
    }

    // Process & assign IDs
    const now = Date.now();
    const formatted = parsedQuestions.map((q, idx) => ({
      id: `AI_${now}_${idx + 1}`,
      sheetName: q.sheetName || defaultModule,
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: (q.correct_answer || 'A').toUpperCase(),
      explanation: q.explanation || "Correct answer as per standard computer hardware maintenance syllabus.",
      subtopic: q.subtopic || "AI Generated"
    }));

    // Prepend new questions to state
    latestGeneratedBatch = formatted;
    state.questions = [...formatted, ...state.questions];
    localStorage.setItem('chm_cached_questions', JSON.stringify(state.questions));

    // Update UI
    renderDashboard();

    // ഗൂഗിൾ ഷീറ്റിലേക്ക് ചോദ്യങ്ങൾ ഓട്ടോമാറ്റിക്കായി പുഷ് ചെയ്യുന്നു
    let sheetSyncMsg = "";
    if (state.apiUrl) {
      sheetSyncMsg = `<div id="sheet-sync-status-msg" class="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 p-2 rounded-lg flex items-center gap-2">
        <i class="fa-solid fa-spinner fa-spin"></i> ഗൂഗിൾ ഷീറ്റിലെ അതാത് മൊഡ്യൂളുകളിലേക്ക് ചോദ്യങ്ങൾ സേവ് ചെയ്യുന്നു...
      </div>`;
      pushQuestionsToGoogleSheet(formatted).then(success => {
        const syncEl = document.getElementById('sheet-sync-status-msg');
        if (syncEl) {
          if (success) {
            syncEl.className = "text-xs text-emerald-800 bg-emerald-100/80 border border-emerald-200 p-2 rounded-lg flex items-center gap-2 font-medium";
            syncEl.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-600"></i> ഗൂഗിൾ ഷീറ്റിലെ അതാത് മൊഡ്യൂളുകളിലേക്ക് ചോദ്യങ്ങൾ വിജയകരമായി ചേർത്തു!`;
          } else {
            syncEl.className = "text-xs text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded-lg flex items-center gap-2";
            syncEl.innerHTML = `<i class="fa-solid fa-circle-exclamation text-amber-600"></i> ഷീറ്റ് സിങ്ക് ചെയ്യാൻ കഴിഞ്ഞില്ല. ഗൂഗിൾ ഷീറ്റ് URL ശരിയാണെന്ന് ഉറപ്പാക്കുക.`;
          }
        }
      });
    }

    statusBox.className = "p-4 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-900 border border-emerald-200 block space-y-3";
    statusBox.innerHTML = `
      <div class="flex items-center gap-2 font-bold text-emerald-800 text-sm">
        <i class="fa-solid fa-circle-check text-emerald-600 text-base"></i>
        <span>🎉 ${formatted.length} പുതിയ PSC ചോദ്യങ്ങൾ വിജയകരമായി തയ്യാറാക്കി!</span>
      </div>
      <p class="text-emerald-700">ചോദ്യങ്ങൾ ആപ്പിലെ ചോദ്യശേഖരത്തിലേക്ക് തത്സമയം ചേർത്തിട്ടുണ്ട്. ആകെ ചോദ്യങ്ങൾ: <strong>${state.questions.length}</strong>.</p>
      ${sheetSyncMsg}
      <div class="flex flex-wrap gap-2 pt-1">
        <button onclick="startPracticeWithLatestBatch()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-lg text-xs shadow flex items-center gap-1.5 transition">
          <i class="fa-solid fa-play"></i> ഈ ചോദ്യങ്ങൾ ഇപ്പോൾ പരിശീലിക്കുക
        </button>
        <button onclick="pushLatestBatchToSheetManually()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-2 rounded-lg text-xs shadow flex items-center gap-1.5 transition">
          <i class="fa-solid fa-cloud-arrow-up"></i> ഷീറ്റിലേക്ക് വീണ്ടും സേവ് ചെയ്യുക
        </button>
        <button onclick="closeAiGeneratorModal()" class="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-3 py-2 rounded-lg text-xs transition">
          ഡാഷ്‌ബോർഡിലേക്ക് മടങ്ങുക
        </button>
      </div>
    `;

  } catch (err) {
    console.error("AI Generation failed:", err);
    statusBox.className = "p-3.5 rounded-xl text-xs font-medium bg-rose-50 text-rose-900 border border-rose-200 block";
    statusBox.innerHTML = `
      <div class="font-bold text-rose-800 mb-1">
        <i class="fa-solid fa-triangle-exclamation"></i> ചോദ്യങ്ങൾ ഉണ്ടാക്കുന്നതിൽ തടസ്സം നേരിട്ടു:
      </div>
      <p class="text-rose-700">${err.message}</p>
    `;
  } finally {
    runBtn.disabled = false;
    runBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  }
}

function startPracticeWithLatestBatch() {
  if (!latestGeneratedBatch || latestGeneratedBatch.length === 0) return;
  closeAiGeneratorModal();

  state.activeSession = {
    mode: 'practice',
    title: `⚡ AI Generated Set (${latestGeneratedBatch.length} Questions)`,
    questions: [...latestGeneratedBatch],
    currentIndex: 0,
    userAnswers: {},
    isSubmitted: false
  };

  navigate('quiz');
  renderCurrentQuestion();
}

/**
 * ചോദ്യങ്ങൾ ഗൂഗിൾ ഷീറ്റിലേക്ക് പുഷ് ചെയ്യുന്നു
 */
async function pushQuestionsToGoogleSheet(questions) {
  if (!state.apiUrl) {
    console.warn("No Google Sheet API URL configured.");
    return false;
  }
  try {
    const payload = JSON.stringify({ questions: questions });
    // Apps Script CORS preflight തടയാൻ text/plain ഉപയോഗിക്കുന്നു
    await fetch(state.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: payload,
      mode: "no-cors"
    });
    return true;
  } catch (err) {
    console.error("Failed to push to Google Sheet:", err);
    return false;
  }
}

async function pushLatestBatchToSheetManually() {
  if (!latestGeneratedBatch || latestGeneratedBatch.length === 0) {
    alert("പുതിയ ചോദ്യങ്ങൾ ഒന്നും കാണുന്നില്ല!");
    return;
  }
  if (!state.apiUrl) {
    alert("ദയവായി മുകളിലെ 'Google Sheet Sync' ബട്ടൺ ക്ലിക്ക് ചെയ്ത് നിങ്ങളുടെ Apps Script URL നൽകുക!");
    return;
  }
  
  const syncEl = document.getElementById('sheet-sync-status-msg');
  if (syncEl) {
    syncEl.className = "text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 p-2 rounded-lg flex items-center gap-2";
    syncEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ഗൂഗിൾ ഷീറ്റിലേക്ക് ചോദ്യങ്ങൾ സേവ് ചെയ്യുന്നു...`;
  }
  
  const ok = await pushQuestionsToGoogleSheet(latestGeneratedBatch);
  if (syncEl) {
    if (ok) {
      syncEl.className = "text-xs text-emerald-800 bg-emerald-100/80 border border-emerald-200 p-2 rounded-lg flex items-center gap-2 font-medium";
      syncEl.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-600"></i> ${latestGeneratedBatch.length} ചോദ്യങ്ങൾ ഗൂഗിൾ ഷീറ്റിലേക്ക് വിജയകരമായി അയച്ചു! ഷീറ്റ് റീഫ്രഷ് ചെയ്തു നോക്കൂ.`;
    } else {
      syncEl.className = "text-xs text-rose-800 bg-rose-50 border border-rose-200 p-2 rounded-lg flex items-center gap-2";
      syncEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-rose-600"></i> ഷീറ്റിലേക്ക് അയക്കാൻ കഴിഞ്ഞില്ല.`;
    }
  }
}

/**
 * Gemini API മോഡൽ ഓട്ടോമാറ്റിക്കായി കണ്ടുപിടിച്ച് കോൾ ചെയ്യുന്നു
 */
async function callGeminiWithAutoModel(apiKey, promptText) {
  let targetModels = [];

  // 1. ലൈവായി ലഭ്യമായ മോഡലുകളുടെ ലിസ്റ്റ് എടുക്കാൻ ശ്രമിക്കുന്നു
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (listRes.ok) {
      const listData = await listRes.json();
      if (listData.models && Array.isArray(listData.models)) {
        const supported = listData.models
          .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
          .map(m => m.name.replace(/^models\//, ''));
        
        // Flash മോഡലുകൾക്ക് മുൻഗണന നൽകുന്നു
        const flashModels = supported.filter(m => m.includes('flash'));
        const otherModels = supported.filter(m => !m.includes('flash'));
        targetModels = [...flashModels, ...otherModels].map(m => ({ version: 'v1beta', name: m }));
      }
    }
  } catch (e) {
    console.warn("Could not fetch models list:", e);
  }

  // 2. ലിസ്റ്റ് കിട്ടിയില്ലെങ്കിൽ സ്ഥിരസ്ഥിതിയായ മുൻഗണനാ ലിസ്റ്റ് ഉപയോഗിക്കുന്നു
  if (targetModels.length === 0) {
    targetModels = [
      { version: 'v1beta', name: 'gemini-2.0-flash' },
      { version: 'v1beta', name: 'gemini-2.5-flash' },
      { version: 'v1beta', name: 'gemini-1.5-flash-8b' },
      { version: 'v1beta', name: 'gemini-2.0-flash-exp' },
      { version: 'v1', name: 'gemini-1.5-flash' },
      { version: 'v1beta', name: 'gemini-1.5-pro' },
      { version: 'v1', name: 'gemini-pro' }
    ];
  }

  let lastError = null;

  for (const item of targetModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/${item.version}/models/${item.name}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          temperature: 0.35,
          responseMimeType: "application/json"
        }
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        return await res.json();
      } else {
        const errText = await res.text();
        lastError = new Error(`${item.name} (${res.status}): ${errText}`);
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to generate content with available Gemini models.");
}

/**
 * Robust JSON parser that handles markdown ticks, unescaped newlines/tabs, and control characters
 */
function safeParseGeminiJson(rawText) {
  if (!rawText) throw new Error("Empty response received from AI");
  let text = rawText.trim();

  // 1. Remove markdown code fences
  if (text.startsWith("```json")) {
    text = text.replace(/^```json/i, '').replace(/```$/, '').trim();
  } else if (text.startsWith("```")) {
    text = text.replace(/^```/i, '').replace(/```$/, '').trim();
  }

  // 2. Extract JSON array between [ and ]
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    text = text.substring(firstBracket, lastBracket + 1);
  }

  // 3. Remove trailing commas before } or ]
  text = text.replace(/,\s*([\]}])/g, '$1');

  // 4. Sanitize unescaped control characters inside string literals (e.g., literal newlines, tabs)
  text = sanitizeJsonString(text);

  // 5. Attempt JSON parse
  try {
    return JSON.parse(text);
  } catch (err) {
    console.warn("Standard JSON parse failed, executing regex fallback...", err);
    return extractQuestionsFallback(rawText);
  }
}

/**
 * Escapes raw control characters (ASCII < 32 like newlines and tabs) ONLY inside JSON string literals
 */
function sanitizeJsonString(raw) {
  let inString = false;
  let isEscaped = false;
  let result = '';

  for (let i = 0; i < raw.length; i++) {
    const char = raw[i];
    const code = raw.charCodeAt(i);

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
        result += char;
      } else if (char === '\\') {
        isEscaped = true;
        result += char;
      } else if (char === '"') {
        inString = false;
        result += char;
      } else if (code < 32) {
        if (char === '\n') result += '\\n';
        else if (char === '\r') result += '\\r';
        else if (char === '\t') result += '\\t';
        else result += '\\u' + ('000' + code.toString(16)).slice(-4);
      } else {
        result += char;
      }
    } else {
      if (char === '"') inString = true;
      result += char;
    }
  }
  return result;
}

/**
 * Regex-based fallback question extractor if JSON is severely malformed
 */
function extractQuestionsFallback(rawText) {
  const regex = /\{[\s\S]*?"question"[\s\S]*?\}/g;
  const matches = rawText.match(regex);
  if (!matches || matches.length === 0) {
    throw new Error("Could not parse AI response into questions. Please try again.");
  }

  const results = [];
  for (const block of matches) {
    try {
      const sanitized = sanitizeJsonString(block.replace(/,\s*}/g, '}'));
      const obj = JSON.parse(sanitized);
      if (obj.question && obj.option_a) {
        results.push(obj);
        continue;
      }
    } catch (e) {}

    // Field-by-field regex extraction
    const getField = (name) => {
      const m = block.match(new RegExp(`"${name}"\\s*:\\s*"([\\s\\S]*?)"(?=\\s*,|\\s*})`));
      return m ? m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').trim() : "";
    };

    const q = getField("question");
    const a = getField("option_a");
    if (q && a) {
      results.push({
        question: q,
        option_a: a,
        option_b: getField("option_b"),
        option_c: getField("option_c"),
        option_d: getField("option_d"),
        correct_answer: (getField("correct_answer") || "A").toUpperCase(),
        explanation: getField("explanation") || "",
        sheetName: getField("sheetName") || "",
        subtopic: getField("subtopic") || ""
      });
    }
  }

  if (results.length === 0) {
    throw new Error("Failed to extract valid questions from AI response.");
  }
  return results;
}

// ============================================================================
// 📲 PWA & OFFLINE SERVICE WORKER SUPPORT
// ============================================================================
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const installBtn = document.getElementById('btn-install-app');
  if (installBtn) {
    installBtn.classList.remove('hidden');
    installBtn.classList.add('flex');
  }
});

function installPwaApp() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then((choiceResult) => {
      deferredInstallPrompt = null;
      const installBtn = document.getElementById('btn-install-app');
      if (installBtn) installBtn.classList.add('hidden');
    });
  } else {
    alert("ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യാൻ നിങ്ങളുടെ ബ്രൗസർ മെനുവിൽ (മുകളിൽ വലതുവശത്തെ 3 ഡോട്ട്സ്) നിന്ന് 'Add to Home Screen' അല്ലെങ്കിൽ 'Install App' ക്ലിക്ക് ചെയ്യുക.");
  }
}

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('Service Worker Active:', reg.scope))
      .catch(err => console.log('Service Worker Error:', err));
  });
}

// ============================================================================
// ⚡ QUICK REVISION & FLASHCARDS CONTROLLER
// ============================================================================
let activeRevisionTab = 'ports';
let revisionSearchQuery = '';

function openRevisionView(tab = 'ports') {
  activeRevisionTab = tab;
  navigate('revision');
}

function switchRevisionTab(tabName) {
  activeRevisionTab = tabName;
  ['ports', 'resistors', 'cables', 'acronyms'].forEach(t => {
    const btn = document.getElementById(`rev-tab-${t}`);
    if (btn) {
      if (t === tabName) {
        btn.className = "px-4 py-2.5 rounded-xl bg-indigo-600 text-white shadow-sm flex items-center gap-2 whitespace-nowrap transition";
      } else {
        btn.className = "px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-2 whitespace-nowrap transition";
      }
    }
  });
  renderRevisionContent();
}

function filterRevisionContent() {
  const input = document.getElementById('revision-search-input');
  if (input) {
    revisionSearchQuery = input.value.trim().toLowerCase();
    renderRevisionContent();
  }
}

function renderRevisionContent() {
  const container = document.getElementById('revision-content-container');
  if (!container || typeof REVISION_DATA === 'undefined') return;

  const query = revisionSearchQuery;

  if (activeRevisionTab === 'ports') {
    let list = REVISION_DATA.ports || [];
    if (query) {
      list = list.filter(p => 
        String(p.port).includes(query) || 
        p.name.toLowerCase().includes(query) || 
        p.desc.toLowerCase().includes(query) ||
        (p.note_ml && p.note_ml.toLowerCase().includes(query))
      );
    }

    if (list.length === 0) {
      container.innerHTML = `<div class="p-8 text-center text-slate-400 text-xs">No matching ports found for "${query}"</div>`;
      return;
    }

    let html = `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
    `;
    list.forEach(item => {
      html += `
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="text-base font-black px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-900 font-mono">
                Port ${item.port}
              </span>
              <span class="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-mono">
                ${item.proto}
              </span>
            </div>
            <h4 class="font-extrabold text-slate-800 text-sm mb-1">${item.name}</h4>
            <p class="text-xs text-slate-500 mb-2 leading-relaxed">${item.desc}</p>
          </div>
          <div class="pt-2 border-t border-slate-200/60 text-xs text-indigo-950 font-medium bg-indigo-50/60 p-2 rounded-xl">
            💡 ${item.note_ml}
          </div>
        </div>
      `;
    });
    html += `</div>`;
    container.innerHTML = html;
  } else if (activeRevisionTab === 'resistors') {
    let list = REVISION_DATA.resistors || [];
    let html = `
      <div class="space-y-4">
        <div class="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl text-xs text-amber-950 space-y-1">
          <div class="font-bold flex items-center gap-1.5 text-sm text-amber-900">
            <i class="fa-solid fa-lightbulb text-amber-500"></i>
            <span>Memory Mnemonic (ഓർമ്മിക്കാൻ സൂത്രം):</span>
          </div>
          <p class="font-mono font-bold text-indigo-900">
            "B B R O Y of Great Britain had a Very Good Wife"
          </p>
          <p class="text-slate-600">
            Black(0), Brown(1), Red(2), Orange(3), Yellow(4), Green(5), Blue(6), Violet(7), Grey(8), White(9)
          </p>
        </div>

        <div class="overflow-x-auto border border-slate-200 rounded-2xl">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
              <tr>
                <th class="p-3">Color</th>
                <th class="p-3">Digit (1st & 2nd Band)</th>
                <th class="p-3">Multiplier (3rd Band)</th>
                <th class="p-3">Tolerance (4th Band)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
    `;
    list.forEach(r => {
      html += `
        <tr class="hover:bg-slate-50 transition">
          <td class="p-3 flex items-center gap-2.5 font-bold">
            <span class="w-4 h-4 rounded-full border border-slate-300 shadow-inner flex-shrink-0" style="background-color: ${r.hex};"></span>
            <span>${r.color}</span>
          </td>
          <td class="p-3 font-mono font-bold text-slate-800">${r.digit}</td>
          <td class="p-3 font-mono text-slate-600">${r.mult}</td>
          <td class="p-3 font-mono font-semibold ${r.tol !== '-' ? 'text-amber-700 font-bold' : 'text-slate-400'}">${r.tol}</td>
        </tr>
      `;
    });
    html += `
            </tbody>
          </table>
        </div>
      </div>
    `;
    container.innerHTML = html;
  } else if (activeRevisionTab === 'cables') {
    const data = REVISION_DATA.cablePinout;
    let html = `
      <div class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- T-568A Standard -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-sm text-slate-900">T-568A Wiring Scheme</h4>
              <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Green Starts</span>
            </div>
            <div class="space-y-1.5 font-mono text-xs">
    `;
    data.t568a.forEach(pin => {
      html += `
        <div class="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100">
          <span class="font-bold text-slate-600">Pin ${pin.pin}</span>
          <span class="flex items-center gap-2 font-semibold">
            <span class="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block shadow-sm" style="background-color: ${pin.hex};"></span>
            <span>${pin.color}</span>
          </span>
        </div>
      `;
    });
    html += `
            </div>
          </div>

          <!-- T-568B Standard -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-sm text-slate-900">T-568B Wiring Scheme</h4>
              <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">Orange Starts (Most Common)</span>
            </div>
            <div class="space-y-1.5 font-mono text-xs">
    `;
    data.t568b.forEach(pin => {
      html += `
        <div class="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100">
          <span class="font-bold text-slate-600">Pin ${pin.pin}</span>
          <span class="flex items-center gap-2 font-semibold">
            <span class="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block shadow-sm" style="background-color: ${pin.hex};"></span>
            <span>${pin.color}</span>
          </span>
        </div>
      `;
    });
    html += `
            </div>
          </div>
        </div>

        <!-- Cable Rules Box -->
        <div class="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-950 space-y-2">
          <div class="font-bold text-sm text-indigo-900 flex items-center gap-1.5">
            <i class="fa-solid fa-arrows-split-up-and-left"></i>
            <span>Straight-Through vs Crossover Cable Rules:</span>
          </div>
          <ul class="list-disc list-inside space-y-1.5 text-slate-700 leading-relaxed">
            <li><strong>Straight-Through Cable:</strong> രണ്ട് അറ്റത്തും ഒരേ സ്റ്റാൻഡേർഡ് (T-568B to T-568B അല്ലെങ്കിൽ T-568A to T-568A). വ്യത്യസ്ത ഉപകരണങ്ങൾ തമ്മിൽ ബന്ധിപ്പിക്കാൻ (PC to Switch, Switch to Router).</li>
            <li><strong>Crossover Cable:</strong> ഒരു അറ്റത്ത് T-568A, മറ്റേ അറ്റത്ത് T-568B. ഒരേ തരത്തിലുള്ള ഉപകരണങ്ങൾ തമ്മിൽ നേരിട്ട് ബന്ധിപ്പിക്കാൻ (PC to PC, Switch to Switch, Router to PC).</li>
          </ul>
        </div>
      </div>
    `;
    container.innerHTML = html;
  } else if (activeRevisionTab === 'acronyms') {
    let list = REVISION_DATA.acronyms || [];
    if (query) {
      list = list.filter(a => 
        a.abbr.toLowerCase().includes(query) || 
        a.full.toLowerCase().includes(query) || 
        a.desc.toLowerCase().includes(query)
      );
    }

    if (list.length === 0) {
      container.innerHTML = `<div class="p-8 text-center text-slate-400 text-xs">No matching acronyms found for "${query}"</div>`;
      return;
    }

    let html = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
    `;
    list.forEach(item => {
      html += `
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-2 mb-1.5">
              <span class="text-base font-black text-indigo-700 font-mono tracking-wide">
                ${item.abbr}
              </span>
              <span class="text-[10px] uppercase font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                Hardware Term
              </span>
            </div>
            <h4 class="font-bold text-slate-800 text-xs sm:text-sm mb-1">${item.full}</h4>
            <p class="text-xs text-slate-600 leading-relaxed">${item.desc}</p>
          </div>
        </div>
      `;
    });
    html += `</div>`;
    container.innerHTML = html;
  }
}

// ============================================================================
// 📚 DETAILED SYLLABUS & AI REFERENCE CONTROLLER
// ============================================================================
let activeSyllabusFilter = 'ALL';
let syllabusSearchQuery = '';

function openSyllabusView(filterModuleId = 'ALL') {
  activeSyllabusFilter = filterModuleId || 'ALL';
  navigate('syllabus');
}

function filterSyllabusView() {
  const input = document.getElementById('syllabus-search-input');
  if (input) {
    syllabusSearchQuery = input.value.trim().toLowerCase();
    renderSyllabusView();
  }
}

function setSyllabusModuleFilter(modId) {
  activeSyllabusFilter = modId;
  renderSyllabusView();
}

function renderSyllabusView() {
  const container = document.getElementById('syllabus-container');
  const tabsContainer = document.getElementById('syllabus-module-filter-buttons');
  if (!container || typeof SYLLABUS_DATA === 'undefined') return;

  // Render Filter Tabs
  if (tabsContainer) {
    let tabsHtml = `
      <button onclick="setSyllabusModuleFilter('ALL')" class="px-3.5 py-1.5 rounded-xl whitespace-nowrap transition ${activeSyllabusFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
        All 10 Modules (100 Marks)
      </button>
    `;
    SYLLABUS_DATA.forEach(mod => {
      const isAct = activeSyllabusFilter === mod.moduleId;
      const shortName = mod.moduleName.split(':')[0]; // e.g. "Module 1"
      tabsHtml += `
        <button onclick="setSyllabusModuleFilter('${mod.moduleId}')" class="px-3 py-1.5 rounded-xl whitespace-nowrap transition ${isAct ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
          ${shortName} (${mod.marks}M)
        </button>
      `;
    });
    tabsContainer.innerHTML = tabsHtml;
  }

  // Filter Modules
  let modulesToRender = SYLLABUS_DATA;
  if (activeSyllabusFilter !== 'ALL') {
    modulesToRender = modulesToRender.filter(m => m.moduleId === activeSyllabusFilter);
  }

  const query = syllabusSearchQuery;
  let html = '';

  modulesToRender.forEach((mod, mIdx) => {
    // Filter topics if search query is present
    let topics = mod.topics;
    if (query) {
      topics = topics.filter(t => 
        t.title.toLowerCase().includes(query) || 
        t.text.toLowerCase().includes(query) ||
        mod.moduleName.toLowerCase().includes(query)
      );
      if (topics.length === 0) return; // Skip module if no matching topics
    }

    const globalModIdx = SYLLABUS_DATA.findIndex(m => m.moduleId === mod.moduleId);

    html += `
      <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <!-- Module Header -->
        <div class="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
              <i class="fa-solid ${mod.icon || 'fa-book'}"></i>
            </div>
            <div>
              <h4 class="font-bold text-slate-900 text-base sm:text-lg leading-tight">${mod.moduleName}</h4>
              <span class="text-xs text-slate-500">${topics.length} Sections / Subtopics</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl">
              ${mod.marks} Marks
            </span>
            <button onclick="startModulePractice('${mod.moduleId}')" class="bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold text-xs py-1.5 px-3 rounded-xl transition flex items-center gap-1.5">
              <i class="fa-solid fa-play text-[10px]"></i> Practice
            </button>
          </div>
        </div>

        <!-- Topics Grid -->
        <div class="space-y-3">
    `;

    topics.forEach((t, tIdx) => {
      const globalTopicIdx = mod.topics.findIndex(x => x.title === t.title);

      html += `
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition space-y-2.5">
          <div class="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
            <div class="space-y-1 w-full">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-indigo-800 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
                  <span>${t.title}</span>
                </span>
                <span class="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Topic ${tIdx + 1}
                </span>
              </div>
              <p class="text-xs text-slate-700 leading-relaxed font-mono bg-white p-3 rounded-xl border border-slate-100/90 shadow-sm">
                ${t.text}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/50">
            <button onclick="copyTopicByIndex(${globalModIdx}, ${globalTopicIdx}, this)" class="bg-white hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-lg border border-slate-200 text-xs transition flex items-center gap-1.5 shadow-sm active:scale-95" title="Copy to clipboard">
              <i class="fa-regular fa-copy text-slate-400"></i>
              <span>Copy Topic</span>
            </button>
            <button onclick="useTopicByIndex(${globalModIdx}, ${globalTopicIdx})" class="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5 shadow-sm active:scale-95" title="Open AI Generator with this topic as reference">
              <i class="fa-solid fa-wand-magic-sparkles text-amber-300"></i>
              <span>AI Generate MCQ</span>
            </button>
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  if (!html) {
    container.innerHTML = `
      <div class="p-12 text-center text-slate-400 space-y-2">
        <i class="fa-solid fa-magnifying-glass text-3xl text-slate-300"></i>
        <p class="text-sm">No syllabus topics found matching "${query}"</p>
        <button onclick="document.getElementById('syllabus-search-input').value = ''; syllabusSearchQuery = ''; renderSyllabusView();" class="text-xs font-bold text-indigo-600 underline">Clear Search</button>
      </div>
    `;
  } else {
    container.innerHTML = html;
  }
}

// Copy Helper
function copyTopicByIndex(mIdx, tIdx, btn) {
  if (typeof SYLLABUS_DATA === 'undefined') return;
  const mod = SYLLABUS_DATA[mIdx];
  if (!mod || !mod.topics[tIdx]) return;
  copyTopicToClipboard(mod.topics[tIdx].text, btn);
}

function copyTopicToClipboard(text, btnElement) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showCopiedFeedback(btnElement);
    }).catch(() => fallbackCopy(text, btnElement));
  } else {
    fallbackCopy(text, btnElement);
  }
}

function showCopiedFeedback(btnElement) {
  if (!btnElement) return;
  const oldHtml = btnElement.innerHTML;
  btnElement.innerHTML = `<i class="fa-solid fa-check text-emerald-600"></i> <span class="text-emerald-700 font-bold">Copied!</span>`;
  btnElement.classList.add('bg-emerald-50', 'border-emerald-300');
  setTimeout(() => {
    btnElement.innerHTML = oldHtml;
    btnElement.classList.remove('bg-emerald-50', 'border-emerald-300');
  }, 2000);
}

function fallbackCopy(text, btnElement) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showCopiedFeedback(btnElement);
  } catch (e) {
    prompt("Copy topic text:", text);
  }
  document.body.removeChild(ta);
}

// Use Topic in AI Generator
function useTopicByIndex(mIdx, tIdx) {
  if (typeof SYLLABUS_DATA === 'undefined') return;
  const mod = SYLLABUS_DATA[mIdx];
  if (!mod || !mod.topics[tIdx]) return;
  useTopicInAiGenerator(mod.moduleId, mod.topics[tIdx].text);
}

function useTopicInAiGenerator(moduleId, topicText) {
  openAiGeneratorModal(moduleId);
  const notesEl = document.getElementById('gen-custom-notes');
  if (notesEl) {
    notesEl.value = topicText;
    notesEl.focus();
    notesEl.classList.add('ring-2', 'ring-emerald-500');
    setTimeout(() => notesEl.classList.remove('ring-2', 'ring-emerald-500'), 1500);
  }
}

// AI Generator Topic Pills
function updateAiTopicPills(selectedModuleId) {
  const container = document.getElementById('ai-quick-topic-pills');
  if (!container || typeof SYLLABUS_DATA === 'undefined') return;

  container.innerHTML = '';
  
  if (!selectedModuleId || selectedModuleId === 'ALL') {
    container.innerHTML = `<span class="text-[11px] text-slate-400 p-1">ഒരു പ്രത്യേക മൊഡ്യൂൾ തിരഞ്ഞെടുത്താൽ അതിലെ ടോപിക്കുകൾ ഇവിടെ തനിയെ വരും.</span>`;
    return;
  }

  const mod = SYLLABUS_DATA.find(m => m.moduleId === selectedModuleId);
  if (!mod || !mod.topics || mod.topics.length === 0) {
    container.innerHTML = `<span class="text-[11px] text-slate-400 p-1">ഈ മൊഡ്യൂളിൽ ടോപിക്കുകൾ കണ്ടെത്തിയില്ല.</span>`;
    return;
  }

  mod.topics.forEach((t, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = "px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-[11px] font-semibold text-slate-700 transition flex items-center gap-1 active:scale-95";
    btn.innerHTML = `<i class="fa-solid fa-plus text-emerald-600 text-[10px]"></i> <span>${t.title}</span>`;
    btn.onclick = () => insertAiTopicNote(t.text);
    container.appendChild(btn);
  });
}

function insertAiTopicNote(text) {
  const notesEl = document.getElementById('gen-custom-notes');
  if (notesEl) {
    notesEl.value = text;
    notesEl.focus();
    notesEl.classList.add('ring-2', 'ring-emerald-500');
    setTimeout(() => notesEl.classList.remove('ring-2', 'ring-emerald-500'), 1200);
  }
}

function clearAiReferenceNotes() {
  const notesEl = document.getElementById('gen-custom-notes');
  if (notesEl) {
    notesEl.value = "";
    notesEl.focus();
  }
}





// ============================================================================
// ⏳ EXAM COUNTDOWN & DAILY STUDY STREAK
// ============================================================================

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function updateExamCountdown() {
  const el = document.getElementById('exam-countdown-text');
  if (!el) return;
  const examDate = new Date('2026-12-17T00:00:00+05:30');
  const now = new Date();
  const diffMs = examDate - now;
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days > 0) {
    el.innerText = `${days} Days Left for Exam!`;
  } else if (days === 0) {
    el.innerText = `Exam is TODAY! All the Best!`;
  } else {
    el.innerText = `Exam Completed`;
  }
}

function recordQuestionAttempt(qOrId, selectedOption = '', isCorrect = false, mode = 'practice', skipAutoPost = false) {
  const isObj = qOrId && typeof qOrId === 'object';
  const questionId = isObj ? qOrId.id : qOrId;
  if (!questionId) return null;

  if (!state.attemptedIds.includes(questionId)) {
    state.attemptedIds.push(questionId);
    localStorage.setItem('chm_attempted_ids', JSON.stringify(state.attemptedIds));
  }
  const today = getTodayKey();
  state.studyLog[today] = (state.studyLog[today] || 0) + 1;
  localStorage.setItem('chm_study_log', JSON.stringify(state.studyLog));

  if (isObj && selectedOption) {
    const rec = {
      questionId: questionId,
      sheetName: qOrId.sheetName || '',
      selectedOption: String(selectedOption).toUpperCase(),
      correctOption: String(qOrId.correct_answer || '').toUpperCase(),
      isCorrect: !!isCorrect,
      mode: mode,
      timestamp: new Date().toISOString(),
      question: qOrId.question || ''
    };
    state.answerHistory[questionId] = rec;
    localStorage.setItem('chm_answer_history', JSON.stringify(state.answerHistory));

    if (!skipAutoPost) {
      postProgressToSheet([rec]);
    }
    return rec;
  }
  return null;
}

function postProgressToSheet(items) {
  if (!state.apiUrl || !items || items.length === 0) return;
  try {
    fetch(state.apiUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'saveProgress',
        items: items
      })
    }).catch(() => {});
  } catch (e) {}
}

function calculateStreak() {
  let streak = 0;
  const d = new Date();
  const todayKey = getTodayKey();
  if ((state.studyLog[todayKey] || 0) > 0) {
    streak++;
  }
  // Check previous days consecutively
  for (let i = 1; i <= 365; i++) {
    const prev = new Date(d);
    prev.setDate(d.getDate() - i);
    const key = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}-${String(prev.getDate()).padStart(2, '0')}`;
    if ((state.studyLog[key] || 0) > 0) {
      streak++;
    } else if (i === 1 && streak === 0) {
      break;
    } else {
      break;
    }
  }
  return streak;
}

function renderDailyStreak() {
  const today = getTodayKey();
  const todayCount = state.studyLog[today] || 0;
  const goal = state.dailyGoal || 25;
  const streak = calculateStreak();

  const countEl = document.getElementById('today-q-count');
  const targetEl = document.getElementById('daily-goal-target');
  const barEl = document.getElementById('daily-goal-bar');
  const badgeEl = document.getElementById('streak-badge');

  if (countEl) countEl.innerText = todayCount;
  if (targetEl) targetEl.innerText = goal;
  if (barEl) {
    const pct = Math.min(100, Math.round((todayCount / goal) * 100));
    barEl.style.width = `${pct}%`;
  }
  if (badgeEl) badgeEl.innerText = `🔥 ${streak} ${streak === 1 ? 'Day' : 'Days'}`;
}

function changeDailyGoal() {
  const val = prompt("ദിവസവും എത്ര ചോദ്യങ്ങൾ വീതം പഠിക്കാനാണ് ലക്ഷ്യമിടുന്നത്? (Daily Question Goal):", state.dailyGoal || 25);
  const num = parseInt(val, 10);
  if (num && num >= 5 && num <= 500) {
    state.dailyGoal = num;
    localStorage.setItem('chm_daily_goal', String(num));
    renderDailyStreak();
  }
}

// ============================================================================
// 🧠 SMART PRACTICE PREFERENCES (SHUFFLE / SEQUENTIAL & UNATTEMPTED)
// ============================================================================

function loadPracticePreferencesUI() {
  const orderEl = document.getElementById('practice-order-select');
  const unattemptedEl = document.getElementById('practice-unattempted-only');
  if (orderEl && state.practicePrefs) orderEl.value = state.practicePrefs.order || 'shuffle';
  if (unattemptedEl && state.practicePrefs) unattemptedEl.checked = !!state.practicePrefs.unattemptedOnly;
}

function savePracticePreferences() {
  const orderEl = document.getElementById('practice-order-select');
  const unattemptedEl = document.getElementById('practice-unattempted-only');
  state.practicePrefs = {
    order: orderEl ? orderEl.value : 'shuffle',
    unattemptedOnly: unattemptedEl ? unattemptedEl.checked : false
  };
  localStorage.setItem('chm_practice_prefs', JSON.stringify(state.practicePrefs));
}

// ============================================================================
// 🔍 GLOBAL QUESTION SEARCH
// ============================================================================

let lastSearchMatches = [];

function handleGlobalSearch() {
  const input = document.getElementById('home-search-input');
  const resultsEl = document.getElementById('home-search-results');
  const clearBtn = document.getElementById('btn-clear-search');
  if (!input || !resultsEl) return;

  const query = input.value.trim().toLowerCase();
  if (query.length < 2) {
    resultsEl.classList.add('hidden');
    if (clearBtn) clearBtn.classList.add('hidden');
    lastSearchMatches = [];
    return;
  }

  if (clearBtn) clearBtn.classList.remove('hidden');
  resultsEl.classList.remove('hidden');

  lastSearchMatches = state.questions.filter(q =>
    (q.question && q.question.toLowerCase().includes(query)) ||
    (q.subtopic && q.subtopic.toLowerCase().includes(query)) ||
    (q.explanation && q.explanation.toLowerCase().includes(query)) ||
    (q.option_a && q.option_a.toLowerCase().includes(query)) ||
    (q.option_b && q.option_b.toLowerCase().includes(query)) ||
    (q.option_c && q.option_c.toLowerCase().includes(query)) ||
    (q.option_d && q.option_d.toLowerCase().includes(query))
  );

  if (lastSearchMatches.length === 0) {
    resultsEl.innerHTML = `<div class="text-xs text-slate-500 p-3 text-center">"${query}" എന്നതുമായി ബന്ധപ്പെട്ട ചോദ്യങ്ങൾ കണ്ടെത്തിയില്ല.</div>`;
    return;
  }

  let html = `
    <div class="flex items-center justify-between px-1 pb-1">
      <span class="text-xs font-bold text-indigo-700">${lastSearchMatches.length} ചോദ്യങ്ങൾ കണ്ടെത്തി</span>
      <button onclick="practiceSearchResults()" class="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition">
        ▶️ ഇവ മാത്രം പ്രാക്ടീസ് ചെയ്യുക
      </button>
    </div>
  `;

  lastSearchMatches.slice(0, 15).forEach((q, idx) => {
    const ansText = q[`option_${(q.correct_answer || 'A').toLowerCase()}`] || '';
    html += `
      <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
        <div class="flex items-center justify-between text-[10px] font-bold text-slate-500">
          <span class="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">${q.sheetName || 'Module'}</span>
          <span>${q.subtopic || ''}</span>
        </div>
        <div class="font-bold text-slate-800">${idx + 1}. ${q.question}</div>
        <div class="text-emerald-700 font-semibold">✅ Answer (${q.correct_answer}): ${ansText}</div>
      </div>
    `;
  });

  if (lastSearchMatches.length > 15) {
    html += `<div class="text-[11px] text-center text-slate-500 pt-1">ആദ്യത്തെ 15 ചോദ്യങ്ങൾ കാണിക്കുന്നു. മുഴുവൻ (${lastSearchMatches.length}) പഠിക്കാൻ മുകളിലെ "പ്രാക്ടീസ് ചെയ്യുക" ബട്ടൺ ക്ലിക്ക് ചെയ്യുക.</div>`;
  }

  resultsEl.innerHTML = html;
}

function clearGlobalSearch() {
  const input = document.getElementById('home-search-input');
  const resultsEl = document.getElementById('home-search-results');
  const clearBtn = document.getElementById('btn-clear-search');
  if (input) input.value = '';
  if (resultsEl) resultsEl.classList.add('hidden');
  if (clearBtn) clearBtn.classList.add('hidden');
  lastSearchMatches = [];
}

function practiceSearchResults() {
  if (!lastSearchMatches || lastSearchMatches.length === 0) return;
  const query = document.getElementById('home-search-input')?.value.trim() || 'Search';
  state.activeSession = {
    mode: 'practice',
    title: `Search: "${query}" (${lastSearchMatches.length} Qs)`,
    questions: [...lastSearchMatches],
    currentIndex: 0,
    userAnswers: {},
    isSubmitted: false
  };
  initQuizUI();
}

// ============================================================================
// 📈 EXAM HISTORY & SCORE PROGRESS CHART
// ============================================================================

function renderExamHistory() {
  const container = document.getElementById('exam-history-container');
  if (!container) return;

  const history = state.examHistory || [];
  if (history.length === 0) {
    container.innerHTML = `
      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
        നിങ്ങൾ ഇതുവരെ മോക്ക് ടെസ്റ്റുകളൊന്നും എഴുതിയിട്ടില്ല. ഒരു ടെസ്റ്റ് പൂർത്തിയാക്കിയാൽ നിങ്ങളുടെ മാർക്ക് പുരോഗതി ഇവിടെ ഗ്രാഫായി കാണാം!
      </div>
    `;
    return;
  }

  // Last 10 exams in chronological order for chart
  const recent = [...history].slice(0, 10).reverse();
  const barsHtml = recent.map((h, i) => {
    const heightPct = Math.max(8, Math.min(100, h.pct || 0));
    const colorClass = h.pct >= 70 ? 'bg-emerald-500' : (h.pct >= 45 ? 'bg-indigo-500' : 'bg-rose-500');
    const shortDate = new Date(h.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    return `
      <div class="flex-1 flex flex-col items-center gap-1 min-w-[36px]" title="${h.title}: ${h.score}/${h.totalMarks} (${h.pct}%)">
        <span class="text-[10px] font-black text-slate-700">${h.pct}%</span>
        <div class="w-full max-w-[32px] h-24 bg-slate-100 rounded-lg flex items-end overflow-hidden border border-slate-200">
          <div class="${colorClass} w-full rounded-t-md transition-all duration-500" style="height: ${heightPct}%"></div>
        </div>
        <span class="text-[9px] text-slate-500 font-medium">${shortDate}</span>
      </div>
    `;
  }).join('');

  const rowsHtml = history.slice(0, 5).map(h => {
    const dt = new Date(h.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    return `
      <div class="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
        <div class="min-w-0">
          <div class="font-bold text-slate-800 truncate">${h.title}</div>
          <div class="text-[10px] text-slate-500">${dt} • ✅ ${h.correct} | ❌ ${h.wrong} | ⏭️ ${h.unattempted}</div>
        </div>
        <div class="text-right shrink-0">
          <span class="font-black text-indigo-700 text-sm">${h.score}</span>
          <span class="text-[10px] text-slate-500">/ ${h.totalMarks} (${h.pct}%)</span>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="flex items-end gap-2 sm:gap-3 pt-2 pb-1 overflow-x-auto custom-scrollbar">
      ${barsHtml}
    </div>
    <div class="space-y-2 pt-2 border-t border-slate-100">
      ${rowsHtml}
    </div>
  `;
}

function clearExamHistory() {
  if (confirm("മോക്ക് ടെസ്റ്റ് ഹിസ്റ്ററി മുഴുവൻ മായ്ക്കണോ?")) {
    state.examHistory = [];
    localStorage.setItem('chm_exam_history', '[]');
    renderExamHistory();
  }
}

// ============================================================================
// 🔖 SAVED BOOKMARKS VIEW
// ============================================================================

function openBookmarksView() {
  navigate('bookmarks');
  const container = document.getElementById('bookmarks-list');
  if (!container) return;
  container.innerHTML = '';

  const bookmarkedQuestions = state.questions.filter(q => state.bookmarks.includes(q.id));
  if (bookmarkedQuestions.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center text-slate-500 text-sm space-y-2">
        <i class="fa-regular fa-star text-4xl text-amber-400"></i>
        <p class="font-bold text-slate-700">ഇതുവരെ ചോദ്യങ്ങളൊന്നും ബുക്ക്‌മാർക്ക് ചെയ്തിട്ടില്ല!</p>
        <p class="text-xs">പ്രാക്ടീസ് ചെയ്യുമ്പോൾ മുകളിലുള്ള ⭐ സ്റ്റാർ ഐക്കണിൽ ക്ലിക്ക് ചെയ്താൽ പ്രധാനപ്പെട്ട ചോദ്യങ്ങൾ ഇവിടെ സേവ് ആകും.</p>
      </div>
    `;
    return;
  }

  bookmarkedQuestions.forEach((q, index) => {
    const card = document.createElement('div');
    card.className = "bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3";
    card.innerHTML = `
      <div class="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span class="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">${q.sheetName || 'Module'}</span>
        <button onclick="removeBookmarkItem('${q.id}')" class="text-slate-400 hover:text-rose-600 font-bold flex items-center gap-1">
          <i class="fa-solid fa-trash-can"></i> Remove
        </button>
      </div>
      <h4 class="font-bold text-slate-800 text-base">${index + 1}. ${q.question}</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div class="p-2 rounded-lg bg-slate-50"><strong>A:</strong> ${q.option_a}</div>
        <div class="p-2 rounded-lg bg-slate-50"><strong>B:</strong> ${q.option_b}</div>
        <div class="p-2 rounded-lg bg-slate-50"><strong>C:</strong> ${q.option_c}</div>
        <div class="p-2 rounded-lg bg-slate-50"><strong>D:</strong> ${q.option_d}</div>
      </div>
      <div class="p-3 bg-emerald-50 text-emerald-900 rounded-xl text-xs space-y-2">
        <div class="font-bold text-sm">Correct Answer: Option (${q.correct_answer})</div>
        <div>${formatExplanation(q.explanation, q.explanation_malayalam)}</div>
      </div>
    `;
    container.appendChild(card);
  });
}

function removeBookmarkItem(questionId) {
  state.bookmarks = state.bookmarks.filter(id => id !== questionId);
  saveUserData();
  openBookmarksView();
}

function practiceBookmarks() {
  const bookmarkedQuestions = state.questions.filter(q => state.bookmarks.includes(q.id));
  if (bookmarkedQuestions.length === 0) {
    alert("ബുക്ക്‌മാർക്ക് ചെയ്ത ചോദ്യങ്ങളൊന്നുമില്ല!");
    return;
  }
  state.activeSession = {
    mode: 'practice',
    title: `Saved Bookmarks (${bookmarkedQuestions.length} Qs)`,
    questions: [...bookmarkedQuestions],
    currentIndex: 0,
    userAnswers: {},
    isSubmitted: false
  };
  initQuizUI();
}

function clearBookmarks() {
  if (state.bookmarks.length === 0) return;
  if (confirm("ബുക്ക്‌മാർക്ക് ചെയ്ത എല്ലാ ചോദ്യങ്ങളും നീക്കം ചെയ്യണോ?")) {
    state.bookmarks = [];
    saveUserData();
    openBookmarksView();
  }
}

// ============================================================================
// 🧮 HARDWARE CHEAT SHEET & MINI-TOOLS
// ============================================================================

function openToolsView() {
  navigate('tools');
}

function switchToolTab(tab) {
  ['resistor', 'converter', 'specs', 'network', 'ip', 'electronics', 'commands', 'law'].forEach(t => {
    const btn = document.getElementById(`tool-tab-${t}`);
    if (btn) {
      btn.className = t === tab
        ? "px-4 py-2.5 rounded-xl bg-indigo-600 text-white flex items-center gap-2 whitespace-nowrap transition"
        : "px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-2 whitespace-nowrap transition";
    }
  });

  const container = document.getElementById('tools-content-container');
  if (!container) return;

  if (tab === 'resistor') {
    const digitOpts = RESISTOR_COLORS.filter(c => c.val !== null)
      .map(c => `<option value="${c.val}" style="background:${c.bg};color:${c.text}">${c.name} (${c.val})</option>`).join('');
    const multOpts = RESISTOR_COLORS.filter(c => c.mult !== null)
      .map(c => `<option value="${c.mult}" style="background:${c.bg};color:${c.text}">${c.name} (${c.multLabel})</option>`).join('');
    const tolOpts = RESISTOR_COLORS.filter(c => c.tol !== null)
      .map(c => `<option value="${c.tol}" ${c.name === 'Gold' ? 'selected' : ''}>${c.name} (${c.tol})</option>`).join('');

    const colorRefRows = RESISTOR_COLORS.map(c => `
      <tr class="border-b border-slate-100">
        <td class="p-2.5 font-bold flex items-center gap-2">
          <span class="w-4 h-4 rounded border border-slate-300 inline-block" style="background:${c.bg}"></span>
          <span>${c.name}</span>
        </td>
        <td class="p-2.5 font-mono font-bold text-indigo-700">${c.val !== null ? c.val : '-'}</td>
        <td class="p-2.5 font-mono font-bold text-emerald-700">${c.multLabel}</td>
        <td class="p-2.5 font-mono font-semibold text-amber-700">${c.tol || '-'}</td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div class="space-y-6">
        <div class="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900">
          <strong>Mnemonic (ഓർത്തിരിക്കാൻ എളുപ്പവഴി):</strong> <em>"<strong>B</strong>.<strong>B</strong>. <strong>R</strong>OY of <strong>G</strong>reat <strong>B</strong>ritain had a <strong>V</strong>ery <strong>G</strong>ood <strong>W</strong>ife"</em> (Black=0, Brown=1, Red=2, Orange=3, Yellow=4, Green=5, Blue=6, Violet=7, Grey=8, White=9)
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Band 1 (1st Digit)</label>
            <select id="res-b1" onchange="updateResistorCalc()" class="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold">${digitOpts}</select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Band 2 (2nd Digit)</label>
            <select id="res-b2" onchange="updateResistorCalc()" class="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold">${digitOpts}</select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Band 3 (Multiplier)</label>
            <select id="res-mult" onchange="updateResistorCalc()" class="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold">${multOpts}</select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Band 4 (Tolerance)</label>
            <select id="res-tol" onchange="updateResistorCalc()" class="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold">${tolOpts}</select>
          </div>
        </div>

        <div class="p-6 rounded-2xl bg-slate-900 text-white text-center space-y-2">
          <div class="text-xs uppercase tracking-wider text-slate-400 font-bold">Calculated Resistance Value</div>
          <div id="res-output" class="text-3xl sm:text-4xl font-black text-amber-400">10 Ω ±5%</div>
          <div id="res-steps" class="text-xs font-mono text-emerald-300 pt-1"></div>
        </div>

        <!-- Step-by-Step Procedure & Solved Examples -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <h4 class="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <i class="fa-solid fa-list-ol text-indigo-600"></i>
              <span>കണക്കുകൂട്ടുന്ന രീതി (4-Band Procedure)</span>
            </h4>
            <div class="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 font-mono font-bold text-indigo-900 text-center">
              R = (Band₁ × 10 + Band₂) × Multiplier ± Tolerance
            </div>
            <ol class="list-decimal list-inside space-y-1.5 text-slate-700 leading-relaxed">
              <li><strong>ഒന്നാമത്തെ ബാൻഡ് (Band 1):</strong> ആദ്യത്തെ അക്കം (1st Digit) എഴുതുക.</li>
              <li><strong>രണ്ടാമത്തെ ബാൻഡ് (Band 2):</strong> രണ്ടാമത്തെ അക്കം അതിനോട് ചേർത്ത് എഴുതുക (2-digit number).</li>
              <li><strong>മൂന്നാമത്തെ ബാൻഡ് (Band 3 - Multiplier):</strong> കിട്ടിയ സംഖ്യയെ 10-ന്റെ ഘാതം (Multiplier) കൊണ്ട് ഗുണിക്കുക (അതായത് നിറത്തിന്റെ വിലയ്ക്ക് തുല്യമായ പൂജ്യങ്ങൾ ചേർക്കുക).</li>
              <li><strong>നാലാമത്തെ ബാൻഡ് (Band 4 - Tolerance):</strong> Gold ആയാൽ ±5%, Silver ആയാൽ ±10%, നിറമില്ലെങ്കിൽ ±20%.</li>
            </ol>
          </div>

          <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2.5">
            <h4 class="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
              <i class="fa-solid fa-chalkboard-user text-emerald-600"></i>
              <span>പരീക്ഷാ ഉദാഹരണങ്ങൾ (Solved Examples)</span>
            </h4>
            <div class="space-y-2 text-slate-700">
              <div class="p-2.5 rounded-xl bg-white border border-emerald-200 space-y-0.5">
                <div class="font-bold text-slate-900">1) Red – Violet – Orange – Gold</div>
                <div class="font-mono text-[11px]">Red = 2, Violet = 7 → <strong>27</strong> | Orange = ×10³ (1,000)</div>
                <div class="text-emerald-700 font-bold">ഉത്തരം: 27 × 1000 = 27,000 Ω = 27 kΩ ±5%</div>
              </div>
              <div class="p-2.5 rounded-xl bg-white border border-emerald-200 space-y-0.5">
                <div class="font-bold text-slate-900">2) Brown – Black – Red – Gold</div>
                <div class="font-mono text-[11px]">Brown = 1, Black = 0 → <strong>10</strong> | Red = ×10² (100)</div>
                <div class="text-emerald-700 font-bold">ഉത്തരം: 10 × 100 = 1,000 Ω = 1 kΩ ±5%</div>
              </div>
              <div class="p-2.5 rounded-xl bg-white border border-emerald-200 space-y-0.5">
                <div class="font-bold text-slate-900">3) Yellow – Violet – Brown – Silver</div>
                <div class="font-mono text-[11px]">Yellow = 4, Violet = 7 → <strong>47</strong> | Brown = ×10¹ (10)</div>
                <div class="text-emerald-700 font-bold">ഉത്തരം: 47 × 10 = 470 Ω ±10%</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reference Table -->
        <div>
          <h4 class="font-bold text-sm text-slate-800 mb-2">🎨 Complete Resistor Color Code Chart</h4>
          <div class="overflow-x-auto rounded-2xl border border-slate-200">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-100 text-slate-700 font-bold">
                <tr><th class="p-2.5">Color</th><th class="p-2.5">Digit (B1/B2)</th><th class="p-2.5">Multiplier (B3)</th><th class="p-2.5">Tolerance (B4)</th></tr>
              </thead>
              <tbody>${colorRefRows}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    document.getElementById('res-b1').value = "1";
    document.getElementById('res-b2').value = "0";
    document.getElementById('res-mult').value = "100";
    updateResistorCalc();
  } else if (tab === 'converter') {
    container.innerHTML = `
      <div class="space-y-6">
        <p class="text-xs text-slate-500">ഏതെങ്കിലും ഒരു ബോക്സിൽ സംഖ്യ നൽകിയാൽ ബാക്കി മൂന്ന് നമ്പർ സിസ്റ്റങ്ങളിലേക്കും തത്സമയം മാറും + താഴെ അതിന്റെ Step-by-Step വിവരങ്ങളും കാണാം:</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <label class="text-xs font-bold text-indigo-700">Decimal (Base 10)</label>
            <input type="text" id="conv-dec" oninput="convertNumberBase('dec')" placeholder="e.g. 255" class="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm font-bold">
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <label class="text-xs font-bold text-emerald-700">Binary (Base 2)</label>
            <input type="text" id="conv-bin" oninput="convertNumberBase('bin')" placeholder="e.g. 11111111" class="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm font-bold">
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <label class="text-xs font-bold text-amber-700">Octal (Base 8)</label>
            <input type="text" id="conv-oct" oninput="convertNumberBase('oct')" placeholder="e.g. 377" class="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm font-bold">
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <label class="text-xs font-bold text-rose-700">Hexadecimal (Base 16)</label>
            <input type="text" id="conv-hex" oninput="convertNumberBase('hex')" placeholder="e.g. FF" class="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm font-bold uppercase">
          </div>
        </div>

        <!-- Live Step-by-Step Breakdown Box -->
        <div id="conv-steps" class="hidden p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono space-y-1.5"></div>

        <!-- Step-by-Step Procedures & Examples -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 class="font-bold text-sm text-indigo-900">1️⃣ Decimal → Binary (2 കൊണ്ട് ഹരിക്കുക)</h4>
            <p class="text-slate-600 leading-relaxed">ദശാംശ സംഖ്യയെ തുടർച്ചയായി <strong>2</strong> കൊണ്ട് ഹരിച്ച് ശിഷ്ടം (Remainder: 0 അല്ലെങ്കിൽ 1) എഴുതുക. അവസാനം <strong>താഴെ നിന്നും മുകളിലേക്ക് (Bottom-to-Top)</strong> എഴുതുക.</p>
            <div class="p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-[11px] space-y-0.5">
              <div><strong>ഉദാഹരണം: (25)₁₀ → Binary</strong></div>
              <div>25 ÷ 2 = 12, Remainder = <strong>1</strong></div>
              <div>12 ÷ 2 = 6,  Remainder = <strong>0</strong></div>
              <div>6 ÷ 2  = 3,  Remainder = <strong>0</strong></div>
              <div>3 ÷ 2  = 1,  Remainder = <strong>1</strong></div>
              <div>1 ÷ 2  = 0,  Remainder = <strong>1</strong></div>
              <div class="text-emerald-700 font-bold pt-1">താഴെ നിന്ന് മുകളിലേക്ക്: (11001)₂</div>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 class="font-bold text-sm text-emerald-900">2️⃣ Binary → Decimal (2-ന്റെ ഘാതങ്ങൾ)</h4>
            <p class="text-slate-600 leading-relaxed">വലത്തുനിന്ന് ഇടത്തോട്ട് ഓരോ ബിറ്റിനെയും <strong>2⁰, 2¹, 2², 2³...</strong> (1, 2, 4, 8, 16...) കൊണ്ട് ഗുണിച്ച് കൂട്ടുക.</p>
            <div class="p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-[11px] space-y-0.5">
              <div><strong>ഉദാഹരണം: (10110)₂ → Decimal</strong></div>
              <div>= (1×2⁴) + (0×2³) + (1×2²) + (1×2¹) + (0×2⁰)</div>
              <div>= 16 + 0 + 4 + 2 + 0</div>
              <div class="text-emerald-700 font-bold pt-1">ഉത്തരം: (22)₁₀</div>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 class="font-bold text-sm text-rose-900">3️⃣ Decimal → Hexadecimal (16 കൊണ്ട് ഹരിക്കുക)</h4>
            <p class="text-slate-600 leading-relaxed">സംഖ്യയെ <strong>16</strong> കൊണ്ട് ഹരിക്കുക. ശിഷ്ടം 10 മുതൽ 15 വരെയാണെങ്കിൽ അക്ഷരങ്ങൾ ഉപയോഗിക്കുക: <strong>10=A, 11=B, 12=C, 13=D, 14=E, 15=F</strong>.</p>
            <div class="p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-[11px] space-y-0.5">
              <div><strong>ഉദാഹരണം 1 (PSC 170/2014): (17)₁₀ → Hex</strong></div>
              <div>17 ÷ 16 = 1, Remainder = <strong>1</strong> → <strong>(11)₁₆</strong></div>
              <div class="pt-1"><strong>ഉദാഹരണം 2: (255)₁₀ → Hex</strong></div>
              <div>255 ÷ 16 = 15 (F), Rem = 15 (F) → <strong class="text-emerald-700">(FF)₁₆</strong></div>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 class="font-bold text-sm text-amber-900">4️⃣ Binary ↔ Hex (4-Bit Grouping എളുപ്പവഴി)</h4>
            <p class="text-slate-600 leading-relaxed">ബൈനറിയെ വലത്തുനിന്ന് <strong>4 ബിറ്റുകളുടെ ഗ്രൂപ്പുകളാക്കി</strong> തിരിച്ച് ഓരോ ഗ്രൂപ്പിനും <strong>8-4-2-1</strong> വില നൽകുക (Octal ആണെങ്കിൽ 3 ബിറ്റ്: <strong>4-2-1</strong>).</p>
            <div class="p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-[11px] space-y-0.5">
              <div><strong>ഉദാഹരണം: (10111110)₂ → Hex</strong></div>
              <div>4-bit ഗ്രൂപ്പുകൾ: <strong>1011</strong> | <strong>1110</strong></div>
              <div>1011 = 8+0+2+1 = 11 = <strong>B</strong></div>
              <div>1110 = 8+4+2+0 = 14 = <strong>E</strong></div>
              <div class="text-emerald-700 font-bold pt-1">ഉത്തരം: (BE)₁₆</div>
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (tab === 'specs') {
    const specRows = CHEATSHEET_HARDWARE_SPECS.map(s => `
      <tr class="border-b border-slate-100">
        <td class="p-3 font-bold text-slate-800">${s.item}</td>
        <td class="p-3 font-mono font-bold text-indigo-700">${s.spec}</td>
        <td class="p-3 text-slate-600">${s.note}</td>
      </tr>
    `).join('');
    const smpsRows = CHEATSHEET_SMPS_WIRES.map(w => `
      <tr class="border-b border-slate-100">
        <td class="p-3 font-bold flex items-center gap-2">
          <span class="w-4 h-4 rounded-full border border-slate-300 inline-block" style="background:${w.hex}"></span>
          <span>${w.color}</span>
        </td>
        <td class="p-3 font-mono font-bold text-emerald-700">${w.voltage}</td>
        <td class="p-3 text-slate-600">${w.use}</td>
      </tr>
    `).join('');
    container.innerHTML = `
      <div class="space-y-6">
        <div>
          <h4 class="font-bold text-sm text-slate-800 mb-2">📌 Essential Hardware Specs, Pins & POST Codes</h4>
          <div class="overflow-x-auto rounded-2xl border border-slate-200">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-100 text-slate-700 font-bold"><tr><th class="p-3">Component</th><th class="p-3">Specification</th><th class="p-3">Key Notes</th></tr></thead>
              <tbody>${specRows}</tbody>
            </table>
          </div>
        </div>
        <div>
          <h4 class="font-bold text-sm text-slate-800 mb-2">🔌 ATX SMPS Wire Color Codes & Voltages</h4>
          <div class="overflow-x-auto rounded-2xl border border-slate-200">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-100 text-slate-700 font-bold"><tr><th class="p-3">Wire Color</th><th class="p-3">Voltage / Signal</th><th class="p-3">Purpose</th></tr></thead>
              <tbody>${smpsRows}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  } else if (tab === 'network') {
    const portRows = CHEATSHEET_PORTS.map(p => `
      <tr class="border-b border-slate-100">
        <td class="p-3 font-mono font-black text-indigo-700">${p.port}</td>
        <td class="p-3 font-bold text-slate-800">${p.protocol}</td>
        <td class="p-3 text-slate-600">${p.desc}</td>
      </tr>
    `).join('');
    const osiRows = CHEATSHEET_OSI_LAYERS.map(l => `
      <tr class="border-b border-slate-100">
        <td class="p-3 font-black text-indigo-700">Layer ${l.num}</td>
        <td class="p-3 font-bold text-slate-800">${l.name}</td>
        <td class="p-3 font-mono text-emerald-700 font-semibold">${l.pdu}</td>
        <td class="p-3 text-slate-600">${l.devices}</td>
        <td class="p-3 text-slate-600">${l.protocols}</td>
      </tr>
    `).join('');
    container.innerHTML = `
      <div class="space-y-6">
        <div>
          <h4 class="font-bold text-sm text-slate-800 mb-2">🌐 OSI 7-Layer Reference Model</h4>
          <div class="overflow-x-auto rounded-2xl border border-slate-200">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-100 text-slate-700 font-bold"><tr><th class="p-3">Layer</th><th class="p-3">Name</th><th class="p-3">PDU</th><th class="p-3">Devices</th><th class="p-3">Protocols</th></tr></thead>
              <tbody>${osiRows}</tbody>
            </table>
          </div>
        </div>
        <div>
          <h4 class="font-bold text-sm text-slate-800 mb-2">🚪 Important TCP/UDP Port Numbers</h4>
          <div class="overflow-x-auto rounded-2xl border border-slate-200">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-100 text-slate-700 font-bold"><tr><th class="p-3">Port</th><th class="p-3">Protocol</th><th class="p-3">Description</th></tr></thead>
              <tbody>${portRows}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  } else if (tab === 'ip') {
    const cidrOptions = Array.from({ length: 23 }, (_, i) => i + 8)
      .map(c => `<option value="${c}" ${c === 24 ? 'selected' : ''}>/${c}</option>`).join('');

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Interactive IPv4 Subnet Calculator -->
        <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div>
            <h4 class="font-bold text-sm text-slate-900 flex items-center gap-2">
              <i class="fa-solid fa-calculator text-indigo-600"></i>
              <span>Interactive IPv4 Analyzer & Subnet Calculator</span>
            </h4>
            <p class="text-xs text-slate-500">ഏതെങ്കിലും ഒരു IPv4 അഡ്രസ്സും CIDR-ഉം നൽകിയാൽ Class, Private/Public, Subnet Mask, Network/Broadcast IP, Usable Hosts എന്നിവ തത്സമയം ലഭിക്കും:</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="sm:col-span-2">
              <label class="block text-xs font-bold text-slate-700 mb-1">IPv4 Address</label>
              <input type="text" id="ip-input" value="192.168.1.10" oninput="calculateIpv4Subnet()" placeholder="e.g. 192.168.1.10" class="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm font-bold">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">CIDR Prefix</label>
              <select id="ip-cidr" onchange="calculateIpv4Subnet()" class="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm font-bold">${cidrOptions}</select>
            </div>
          </div>
          <div id="ip-calc-output" class="p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono space-y-1.5"></div>
        </div>

        <!-- IPv4 vs IPv6 & Private Ranges -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div class="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
            <h4 class="font-bold text-sm text-indigo-950">📌 IPv4 vs IPv6 (പ്രധാന വ്യത്യാസങ്ങൾ)</h4>
            <ul class="space-y-1.5 text-slate-700 leading-relaxed">
              <li>• <strong>IPv4:</strong> <strong>32-bit</strong> (4 Bytes / 4 Octets). ഉദാ: <code class="font-mono font-bold">192.168.1.1</code> (Dotted Decimal).</li>
              <li>• <strong>IPv6:</strong> <strong>128-bit</strong> (16 Bytes / 8 Groups). ഉദാ: <code class="font-mono font-bold">2001:0db8::1</code> (Colon Hexadecimal).</li>
              <li>• <strong>PSC ചോദ്യം (191/2015):</strong> IPv6-ന് IPv4-നേക്കാൾ <strong>96 ബിറ്റ്</strong> (128 - 32 = 96 bits) കൂടുതൽ നീളമുണ്ട്.</li>
            </ul>
          </div>

          <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
            <h4 class="font-bold text-sm text-emerald-950">🔒 Private IP (RFC 1918) & Special IPs</h4>
            <ul class="space-y-1.5 font-mono text-[11px] text-slate-700">
              <li>• <strong>Class A Private:</strong> 10.0.0.0 – 10.255.255.255 (/8)</li>
              <li>• <strong>Class B Private:</strong> 172.16.0.0 – 172.31.255.255 (/12)</li>
              <li>• <strong>Class C Private:</strong> 192.168.0.0 – 192.168.255.255 (/16)</li>
              <li>• <strong>Loopback (Localhost):</strong> 127.0.0.0 – 127.255.255.255 (127.0.0.1)</li>
              <li>• <strong>APIPA (DHCP Fail):</strong> 169.254.0.0 – 169.254.255.255</li>
            </ul>
          </div>
        </div>

        <!-- IPv4 Classes Table -->
        <div>
          <h4 class="font-bold text-sm text-slate-800 mb-2">📊 IPv4 Address Classes (A, B, C, D, E)</h4>
          <div class="overflow-x-auto rounded-2xl border border-slate-200">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th class="p-2.5">Class</th>
                  <th class="p-2.5">1st Octet Range</th>
                  <th class="p-2.5">Leading Bits</th>
                  <th class="p-2.5">Default Subnet Mask</th>
                  <th class="p-2.5">Usable Hosts / Network</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-slate-100"><td class="p-2.5 font-black text-indigo-700">Class A</td><td class="p-2.5 font-mono">1 – 126</td><td class="p-2.5 font-mono">0</td><td class="p-2.5 font-mono font-bold">255.0.0.0 (/8)</td><td class="p-2.5 font-mono">2²⁴ - 2 = 16,777,214</td></tr>
                <tr class="border-b border-slate-100"><td class="p-2.5 font-black text-emerald-700">Class B</td><td class="p-2.5 font-mono">128 – 191</td><td class="p-2.5 font-mono">10</td><td class="p-2.5 font-mono font-bold">255.255.0.0 (/16)</td><td class="p-2.5 font-mono">2¹⁶ - 2 = 65,534</td></tr>
                <tr class="border-b border-slate-100"><td class="p-2.5 font-black text-amber-700">Class C</td><td class="p-2.5 font-mono">192 – 223</td><td class="p-2.5 font-mono">110</td><td class="p-2.5 font-mono font-bold">255.255.255.0 (/24)</td><td class="p-2.5 font-mono">2⁸ - 2 = 254</td></tr>
                <tr class="border-b border-slate-100"><td class="p-2.5 font-black text-rose-700">Class D</td><td class="p-2.5 font-mono">224 – 239</td><td class="p-2.5 font-mono">1110</td><td class="p-2.5 text-slate-500">N/A (Multicasting)</td><td class="p-2.5 text-slate-500">Multicast Groups</td></tr>
                <tr class="border-b border-slate-100"><td class="p-2.5 font-black text-slate-700">Class E</td><td class="p-2.5 font-mono">240 – 255</td><td class="p-2.5 font-mono">1111</td><td class="p-2.5 text-slate-500">N/A (Experimental)</td><td class="p-2.5 text-slate-500">Research & Future</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Subnetting Procedure & Example -->
        <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-2">
          <h4 class="font-bold text-sm text-amber-950">🧮 സബ്നെറ്റിംഗ് കണക്കുകൂട്ടുന്ന രീതി (Subnetting Formula & Example)</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="p-3 rounded-xl bg-white border border-amber-200 space-y-1 text-slate-700">
              <div>• <strong>Host Bits (h):</strong> <code class="font-mono font-bold">32 - CIDR</code></div>
              <div>• <strong>Usable Hosts:</strong> <code class="font-mono font-bold">2ʰ - 2</code> (Network ID-യും Broadcast ID-യും കുറയ്ക്കുക)</div>
              <div>• <strong>Number of Subnets:</strong> <code class="font-mono font-bold">2ˢ</code> (s = കടം എടുത്ത ബിറ്റുകൾ / Borrowed bits)</div>
            </div>
            <div class="p-3 rounded-xl bg-white border border-amber-200 space-y-1 font-mono text-[11px] text-slate-700">
              <div class="font-bold text-slate-900">ഉദാഹരണം: 192.168.1.0/26 (Class C)</div>
              <div>• Borrowed bits (s) = 26 - 24 = 2 → Subnets = 2² = <strong>4</strong></div>
              <div>• Host bits (h) = 32 - 26 = 6 → Hosts = 2⁶ - 2 = <strong>62</strong></div>
              <div class="text-emerald-700 font-bold">• Subnet Mask: 255.255.255.192</div>
            </div>
          </div>
        </div>
      </div>
    `;
    calculateIpv4Subnet();
  } else if (tab === 'electronics') {
    container.innerHTML = `
      <div class="space-y-6">
        <!-- Interactive Logic Gates Simulator -->
        <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 class="font-bold text-sm text-slate-900">🔌 Interactive Logic Gates Simulator (Module 1)</h4>
              <p class="text-xs text-slate-500">Input A, B എന്നിവ മാറ്റി (0 അല്ലെങ്കിൽ 1) എല്ലാ ലോജിക് ഗേറ്റുകളുടെയും ഔട്ട്പുട്ട് തത്സമയം പരിശോധിക്കുക:</p>
            </div>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-1.5 bg-white border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer">
                <span>Input A:</span>
                <select id="gate-in-a" onchange="updateLogicGatesSim()" class="font-mono font-black text-indigo-700 bg-transparent focus:outline-none">
                  <option value="0">0 (LOW)</option>
                  <option value="1" selected>1 (HIGH)</option>
                </select>
              </label>
              <label class="flex items-center gap-1.5 bg-white border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer">
                <span>Input B:</span>
                <select id="gate-in-b" onchange="updateLogicGatesSim()" class="font-mono font-black text-emerald-700 bg-transparent focus:outline-none">
                  <option value="0" selected>0 (LOW)</option>
                  <option value="1">1 (HIGH)</option>
                </select>
              </label>
            </div>
          </div>
          <div id="logic-gates-grid" class="grid grid-cols-2 sm:grid-cols-4 gap-2.5"></div>
          <div class="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950">
            <strong>📌 PSC Exam Key Point:</strong> <strong>NAND</strong>, <strong>NOR</strong> എന്നിവയാണ് <strong>Universal Gates</strong> (ഇവ ഉപയോഗിച്ച് മറ്റെല്ലാ ഗേറ്റുകളും നിർമ്മിക്കാം). <strong>XOR</strong> ഔട്ട്പുട്ട് 1 ആകുന്നത് രണ്ട് ഇൻപുട്ടുകളും വ്യത്യസ്തമാകുമ്പോൾ മാത്രമാണ്.
          </div>
        </div>

        <!-- Interactive Ohm's Law & Series/Parallel Calculator -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <h4 class="font-bold text-sm text-slate-900">⚡ Ohm's Law & Power (V, I, R, P)</h4>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="font-bold text-slate-600 block mb-1">Voltage (V)</label>
                <input type="number" id="ohm-v" value="12" oninput="calcOhmsLaw()" class="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-mono font-bold">
              </div>
              <div>
                <label class="font-bold text-slate-600 block mb-1">Resistance (R in Ω)</label>
                <input type="number" id="ohm-r" value="4" oninput="calcOhmsLaw()" class="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-mono font-bold">
              </div>
            </div>
            <div id="ohm-out" class="p-3 rounded-xl bg-slate-900 text-emerald-300 font-mono font-bold"></div>
            <div class="text-[11px] text-slate-600">• <strong>V = I × R</strong> | <strong>P = V × I = I²R = V²/R</strong></div>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <h4 class="font-bold text-sm text-slate-900">🔗 Series & Parallel (R₁ & R₂)</h4>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="font-bold text-slate-600 block mb-1">Value 1 (R₁ / C₁)</label>
                <input type="number" id="sp-v1" value="6" oninput="calcSeriesParallel()" class="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-mono font-bold">
              </div>
              <div>
                <label class="font-bold text-slate-600 block mb-1">Value 2 (R₂ / C₂)</label>
                <input type="number" id="sp-v2" value="3" oninput="calcSeriesParallel()" class="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-mono font-bold">
              </div>
            </div>
            <div id="sp-out" class="p-3 rounded-xl bg-slate-900 text-amber-300 font-mono font-bold"></div>
            <div class="text-[11px] text-slate-600">• Capacitors-ന് Resistors-ന്റെ നേരെ വിപരീതമാണ് (Series-ൽ കുറയും, Parallel-ൽ കൂടും).</div>
          </div>
        </div>

        <!-- Power Devices & Regulators Summary -->
        <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1.5 text-slate-800">
          <h4 class="font-bold text-sm text-amber-950">🔋 Power Electronics & Regulators Quick Notes (Module 1)</h4>
          <div>• <strong>SCR:</strong> 4 layers (PNPN), 3 junctions, 3 terminals (A, K, G). Unidirectional. Latching Current &gt; Holding Current.</div>
          <div>• <strong>DIAC:</strong> 2 terminals (No Gate), Bidirectional — used to trigger TRIAC. <strong>TRIAC:</strong> 3 terminals (MT1, MT2, Gate), Bidirectional AC control.</div>
          <div>• <strong>3-Pin Regulators:</strong> <strong>78xx</strong> (+ve fixed, e.g., 7805 = +5V), <strong>79xx</strong> (-ve fixed, e.g., 7912 = -12V), <strong>LM317</strong> (Adjustable +1.25V to +37V).</div>
        </div>
      </div>
    `;
    updateLogicGatesSim();
    calcOhmsLaw();
    calcSeriesParallel();
  } else if (tab === 'commands') {
    const raidRows = CHEATSHEET_RAID_LEVELS.map(r => `
      <tr class="border-b border-slate-100">
        <td class="p-2.5 font-black text-indigo-700">${r.level}</td>
        <td class="p-2.5 font-bold text-slate-800">${r.name}</td>
        <td class="p-2.5 font-mono font-bold">${r.minDisks}</td>
        <td class="p-2.5 text-emerald-700 font-semibold">${r.faultTol}</td>
        <td class="p-2.5 font-mono">${r.capacity}</td>
        <td class="p-2.5 text-slate-600">${r.use}</td>
      </tr>
    `).join('');
    const cmdRows = CHEATSHEET_CLI_COMMANDS.map(c => `
      <tr class="border-b border-slate-100">
        <td class="p-2.5 font-mono font-bold text-indigo-700">${c.cmd}</td>
        <td class="p-2.5 font-bold text-slate-700">${c.os}</td>
        <td class="p-2.5 text-slate-600">${c.desc}</td>
      </tr>
    `).join('');
    const offRows = CHEATSHEET_OFFICE_FORMULAS.map(o => `
      <tr class="border-b border-slate-100">
        <td class="p-2.5 font-mono font-bold text-emerald-700">${o.item}</td>
        <td class="p-2.5 font-bold text-slate-700">${o.app}</td>
        <td class="p-2.5 text-slate-600">${o.desc}</td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div class="space-y-6">
        <div>
          <h4 class="font-bold text-sm text-slate-800 mb-2">💾 RAID Levels Comparison (Module 3)</h4>
          <div class="overflow-x-auto rounded-2xl border border-slate-200">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-100 text-slate-700 font-bold">
                <tr><th class="p-2.5">Level</th><th class="p-2.5">Type</th><th class="p-2.5">Min Disks</th><th class="p-2.5">Fault Tolerance</th><th class="p-2.5">Usable Space</th><th class="p-2.5">Use Case</th></tr>
              </thead>
              <tbody>${raidRows}</tbody>
            </table>
          </div>
        </div>
        <div>
          <h4 class="font-bold text-sm text-slate-800 mb-2">💻 Essential Windows & Linux CLI Commands (Module 4, 5, 8)</h4>
          <div class="overflow-x-auto rounded-2xl border border-slate-200">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-100 text-slate-700 font-bold"><tr><th class="p-2.5">Command</th><th class="p-2.5">OS</th><th class="p-2.5">Purpose</th></tr></thead>
              <tbody>${cmdRows}</tbody>
            </table>
          </div>
          <p class="text-[11px] text-slate-500 mt-1.5">• Windows <strong>hosts</strong> file path: <code class="font-mono font-bold">C:\\Windows\\System32\\drivers\\etc\\hosts</code> | MBR Max: 4 Primary Partitions, 2 TB (GPT: 128 Primary).</p>
        </div>
        <div>
          <h4 class="font-bold text-sm text-slate-800 mb-2">📊 MS Office Formulas & Shortcuts (Module 6)</h4>
          <div class="overflow-x-auto rounded-2xl border border-slate-200">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-100 text-slate-700 font-bold"><tr><th class="p-2.5">Formula / Feature</th><th class="p-2.5">App</th><th class="p-2.5">Description</th></tr></thead>
              <tbody>${offRows}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  } else if (tab === 'law') {
    const itRows = CHEATSHEET_IT_ACT.map(i => `
      <tr class="border-b border-slate-100">
        <td class="p-2.5 font-mono font-black text-rose-700">${i.sec}</td>
        <td class="p-2.5 font-bold text-slate-800">${i.topic}</td>
        <td class="p-2.5 text-slate-600">${i.desc}</td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div class="space-y-6">
        <div>
          <h4 class="font-bold text-sm text-slate-800 mb-2">⚖️ Information Technology (IT) Act 2000 – Key Sections (Module 10)</h4>
          <div class="overflow-x-auto rounded-2xl border border-slate-200">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-100 text-slate-700 font-bold"><tr><th class="p-2.5">Section</th><th class="p-2.5">Offence / Topic</th><th class="p-2.5">Details</th></tr></thead>
              <tbody>${itRows}</tbody>
            </table>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div class="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-1.5">
            <h4 class="font-bold text-sm text-indigo-950">☁️ Cloud Service Models</h4>
            <div class="text-slate-700">• <strong>IaaS (Infrastructure):</strong> Virtual Machines, Storage, Networks (e.g., AWS EC2, Azure VM).</div>
            <div class="text-slate-700">• <strong>PaaS (Platform):</strong> App runtime & dev tools (e.g., Google App Engine, Heroku).</div>
            <div class="text-slate-700">• <strong>SaaS (Software):</strong> Ready-to-use cloud apps (e.g., Gmail, Office 365, Google Docs).</div>
          </div>
          <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
            <h4 class="font-bold text-sm text-emerald-950">🖥️ Hypervisors (Virtualization)</h4>
            <div class="text-slate-700">• <strong>Type 1 (Bare-metal):</strong> Runs directly on physical hardware (VMware ESXi, Hyper-V, KVM).</div>
            <div class="text-slate-700">• <strong>Type 2 (Hosted):</strong> Runs on top of a host OS like Windows/Linux (VirtualBox, VMware Workstation).</div>
          </div>
        </div>
      </div>
    `;
  }
}

function updateResistorCalc() {
  const b1 = parseInt(document.getElementById('res-b1')?.value || '1', 10);
  const b2 = parseInt(document.getElementById('res-b2')?.value || '0', 10);
  const mult = parseFloat(document.getElementById('res-mult')?.value || '100');
  const tol = document.getElementById('res-tol')?.value || '±5%';

  const ohms = ((b1 * 10) + b2) * mult;
  let formatted = '';
  if (ohms >= 1000000) formatted = `${(ohms / 1000000).toFixed(2).replace(/\.00$/, '')} MΩ`;
  else if (ohms >= 1000) formatted = `${(ohms / 1000).toFixed(2).replace(/\.00$/, '')} kΩ`;
  else formatted = `${ohms.toFixed(2).replace(/\.00$/, '')} Ω`;

  const out = document.getElementById('res-output');
  if (out) out.innerText = `${formatted} ${tol}`;

  const stepsEl = document.getElementById('res-steps');
  if (stepsEl) {
    stepsEl.innerText = `Step: (${b1} × 10 + ${b2}) × ${mult} = ${ohms} Ω = ${formatted} ${tol}`;
  }
}

function convertNumberBase(source) {
  const decEl = document.getElementById('conv-dec');
  const binEl = document.getElementById('conv-bin');
  const octEl = document.getElementById('conv-oct');
  const hexEl = document.getElementById('conv-hex');
  const stepsEl = document.getElementById('conv-steps');
  if (!decEl || !binEl || !octEl || !hexEl) return;

  const raw = document.getElementById(`conv-${source}`).value.trim();
  if (!raw) {
    decEl.value = binEl.value = octEl.value = hexEl.value = '';
    if (stepsEl) stepsEl.classList.add('hidden');
    return;
  }

  let num = NaN;
  if (source === 'dec' && /^[0-9]+$/.test(raw)) num = parseInt(raw, 10);
  else if (source === 'bin' && /^[01]+$/.test(raw)) num = parseInt(raw, 2);
  else if (source === 'oct' && /^[0-7]+$/.test(raw)) num = parseInt(raw, 8);
  else if (source === 'hex' && /^[0-9a-fA-F]+$/.test(raw)) num = parseInt(raw, 16);

  if (isNaN(num)) return;
  const binStr = num.toString(2);
  const octStr = num.toString(8);
  const hexStr = num.toString(16).toUpperCase();

  if (source !== 'dec') decEl.value = num.toString(10);
  if (source !== 'bin') binEl.value = binStr;
  if (source !== 'oct') octEl.value = octStr;
  if (source !== 'hex') hexEl.value = hexStr;

  if (stepsEl) {
    const paddedBin = binStr.padStart(Math.ceil(binStr.length / 4) * 4, '0');
    const nibbles = paddedBin.match(/.{1,4}/g) || [];
    const hexMap = nibbles.map(n => `${n}→${parseInt(n, 2).toString(16).toUpperCase()}`).join(' | ');
    stepsEl.classList.remove('hidden');
    stepsEl.innerHTML = `
      <div class="text-amber-400 font-bold">⚡ Live Conversion Breakdown (${num}₁₀):</div>
      <div>• Binary 4-bit Hex Grouping: ${hexMap} = <span class="text-emerald-300 font-bold">(${hexStr})₁₆</span></div>
      <div>• Octal (Base 8): <span class="text-amber-300 font-bold">(${octStr})₈</span></div>
    `;
  }
}

function calculateIpv4Subnet() {
  const ipStr = document.getElementById('ip-input')?.value.trim() || '';
  const cidr = parseInt(document.getElementById('ip-cidr')?.value || '24', 10);
  const outEl = document.getElementById('ip-calc-output');
  if (!outEl) return;

  const parts = ipStr.split('.');
  if (parts.length !== 4 || parts.some(p => !/^\d+$/.test(p) || parseInt(p, 10) < 0 || parseInt(p, 10) > 255)) {
    outEl.innerHTML = `<div class="text-rose-400 font-bold">⚠️ ശരിയായ IPv4 അഡ്രസ്സ് നൽകുക (ഉദാ: 192.168.1.10)</div>`;
    return;
  }

  const octets = parts.map(p => parseInt(p, 10));
  const ipInt = ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
  const maskInt = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
  const netInt = (ipInt & maskInt) >>> 0;
  const bcastInt = (netInt | (~maskInt)) >>> 0;

  const toIp = (n) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
  const hostBits = 32 - cidr;
  const usableHosts = hostBits >= 2 ? (Math.pow(2, hostBits) - 2) : 0;
  const firstHost = hostBits >= 2 ? toIp((netInt + 1) >>> 0) : toIp(netInt);
  const lastHost = hostBits >= 2 ? toIp((bcastInt - 1) >>> 0) : toIp(bcastInt);

  const o1 = octets[0];
  let ipClass = 'Class E (Experimental)';
  if (o1 >= 1 && o1 <= 126) ipClass = 'Class A';
  else if (o1 === 127) ipClass = 'Loopback (Reserved)';
  else if (o1 >= 128 && o1 <= 191) ipClass = 'Class B';
  else if (o1 >= 192 && o1 <= 223) ipClass = 'Class C';
  else if (o1 >= 224 && o1 <= 239) ipClass = 'Class D (Multicast)';
  else if (o1 === 0) ipClass = 'Default / Reserved';

  let scope = 'Public IP';
  if (o1 === 10 || (o1 === 172 && octets[1] >= 16 && octets[1] <= 31) || (o1 === 192 && octets[1] === 168)) {
    scope = 'Private IP (RFC 1918)';
  } else if (o1 === 127) {
    scope = 'Loopback Address';
  } else if (o1 === 169 && octets[1] === 254) {
    scope = 'APIPA (Link-Local)';
  }

  const binIp = octets.map(o => o.toString(2).padStart(8, '0')).join('.');

  outEl.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <div>• Class & Type: <span class="text-amber-400 font-bold">${ipClass} • ${scope}</span></div>
      <div>• Subnet Mask: <span class="text-emerald-300 font-bold">${toIp(maskInt)} (/${cidr})</span></div>
      <div>• Network Address: <span class="text-cyan-300 font-bold">${toIp(netInt)}</span></div>
      <div>• Broadcast Address: <span class="text-rose-300 font-bold">${toIp(bcastInt)}</span></div>
      <div>• Usable Host Range: <span class="text-white font-bold">${firstHost} – ${lastHost}</span></div>
      <div>• Total Usable Hosts: <span class="text-amber-300 font-bold">${usableHosts.toLocaleString()} (2^${hostBits} - 2)</span></div>
    </div>
    <div class="pt-1.5 border-t border-slate-700 text-[11px] text-slate-400">
      • Binary: <span class="text-slate-200">${binIp}</span>
    </div>
  `;
}

// ============================================================================
// 🌙 DARK MODE & ⌨️ KEYBOARD SHORTCUTS
// ============================================================================

function initDarkMode() {
  const isDark = localStorage.getItem('chm_dark_mode') === 'true';
  if (isDark) {
    document.documentElement.classList.add('dark');
  }
  updateDarkModeIcon();
}

function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
  const isDark = document.documentElement.classList.contains('dark');
  localStorage.setItem('chm_dark_mode', String(isDark));
  updateDarkModeIcon();
}

function updateDarkModeIcon() {
  const btn = document.getElementById('btn-dark-mode');
  if (!btn) return;
  const isDark = document.documentElement.classList.contains('dark');
  btn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
}

document.addEventListener('keydown', (e) => {
  const quizView = document.getElementById('view-quiz');
  if (!quizView || quizView.classList.contains('hidden')) return;
  if (!state.activeSession) return;

  const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

  const key = e.key.toLowerCase();
  if (key === '1' || key === 'a') selectOption('A');
  else if (key === '2' || key === 'b') selectOption('B');
  else if (key === '3' || key === 'c') selectOption('C');
  else if (key === '4' || key === 'd') selectOption('D');
  else if (e.key === 'ArrowRight') nextQuestion();
  else if (e.key === 'ArrowLeft') prevQuestion();
  else if (key === 'e' && state.activeSession.mode === 'practice') toggleExplanation();
});


// ============================================================================
// 📜 MY ANSWER HISTORY & GOOGLE SHEET PROGRESS SYNC
// ============================================================================

function openAnswerHistoryView() {
  navigate('history');
  const modSelect = document.getElementById('history-filter-module');
  if (modSelect) {
    const existing = modSelect.value || 'all';
    const sheets = Array.from(new Set(Object.values(state.answerHistory || {}).map(r => r.sheetName).filter(Boolean)));
    modSelect.innerHTML = `<option value="all">All Modules & Papers</option>` +
      sheets.map(s => `<option value="${s}">${s}</option>`).join('');
    modSelect.value = sheets.includes(existing) ? existing : 'all';
  }
  renderAnswerHistoryList();
}

function renderAnswerHistoryList() {
  const container = document.getElementById('answer-history-list');
  const countLabel = document.getElementById('history-count-label');
  if (!container) return;

  const resFilter = document.getElementById('history-filter-result')?.value || 'all';
  const modFilter = document.getElementById('history-filter-module')?.value || 'all';

  let records = Object.values(state.answerHistory || {});
  records.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

  if (resFilter === 'wrong') records = records.filter(r => !r.isCorrect);
  else if (resFilter === 'correct') records = records.filter(r => r.isCorrect);

  if (modFilter !== 'all') records = records.filter(r => r.sheetName === modFilter);

  if (countLabel) countLabel.innerText = `${records.length} Records`;

  if (records.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center text-slate-500 text-sm space-y-2 bg-slate-50 rounded-2xl border border-slate-200">
        <i class="fa-solid fa-clock-rotate-left text-3xl text-slate-300"></i>
        <p class="font-bold text-slate-700">ഇതുവരെ ഉത്തരങ്ങളൊന്നും രേഖപ്പെടുത്തിയിട്ടില്ല!</p>
        <p class="text-xs">നിങ്ങൾ ഇനി പ്രാക്ടീസ് ചെയ്യുമ്പോഴും പരീക്ഷ എഴുതുമ്പോഴും തിരഞ്ഞെടുക്കുന്ന ഓരോ ഉത്തരവും ഇവിടെ തനിയെ സേവ് ആകും.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = records.map((rec, idx) => {
    const qObj = state.questions.find(q => q.id === rec.questionId);
    const qText = qObj ? qObj.question : (rec.question || rec.questionId);
    const chosenText = qObj ? (qObj[`option_${(rec.selectedOption || 'a').toLowerCase()}`] || '') : '';
    const correctText = qObj ? (qObj[`option_${(rec.correctOption || 'a').toLowerCase()}`] || '') : '';
    const dt = rec.timestamp ? new Date(rec.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

    return `
      <div class="p-4 rounded-2xl bg-slate-50 border ${rec.isCorrect ? 'border-emerald-200' : 'border-rose-200'} space-y-2 text-xs">
        <div class="flex items-center justify-between flex-wrap gap-2 text-[11px] font-bold">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded ${rec.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
              ${rec.isCorrect ? '✅ ശരി' : '❌ തെറ്റ്'}
            </span>
            <span class="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">${rec.sheetName || 'Module'}</span>
            <span class="text-slate-400 uppercase">${rec.mode || 'practice'}</span>
          </div>
          <span class="text-slate-400">${dt}</span>
        </div>
        <div class="font-bold text-slate-900 text-sm">${idx + 1}. ${qText}</div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <div class="p-2.5 rounded-xl ${rec.isCorrect ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'}">
            <span class="font-bold">നിങ്ങൾ തിരഞ്ഞെടുത്തത്: Option (${rec.selectedOption})</span>
            ${chosenText ? `<div class="text-[11px] opacity-90 mt-0.5">${chosenText}</div>` : ''}
          </div>
          <div class="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200">
            <span class="font-bold">ശരിയായ ഉത്തരം: Option (${rec.correctOption})</span>
            ${correctText ? `<div class="text-[11px] opacity-90 mt-0.5">${correctText}</div>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function syncAllProgressToSheet() {
  const statusEl = document.getElementById('history-sync-status');
  const btn = document.getElementById('btn-push-progress');
  if (!state.apiUrl) {
    alert("Google Apps Script URL നൽകിയിട്ടില്ല. ആദ്യം Sync സെറ്റിംഗ്സിൽ URL നൽകുക.");
    return;
  }

  const items = Object.values(state.answerHistory || {});
  if (items.length === 0) {
    alert("സേവ് ചെയ്യാൻ ഉത്തരങ്ങളൊന്നും ഇതുവരെ ഇല്ല!");
    return;
  }

  if (btn) btn.disabled = true;
  if (statusEl) {
    statusEl.className = "p-3 rounded-xl text-xs font-medium bg-amber-50 text-amber-800 block";
    statusEl.innerText = `${items.length} ഉത്തരങ്ങൾ Google Sheet-ലെ 'User_Progress' ടാബിലേക്ക് അപ്‌ലോഡ് ചെയ്യുന്നു...`;
  }

  try {
    await fetch(state.apiUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'saveProgress',
        items: items
      })
    });
    if (statusEl) {
      statusEl.className = "p-3 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-800 block";
      statusEl.innerText = `✅ വിജയിച്ചു! ${items.length} ചോദ്യങ്ങളുടെയും ഉത്തരങ്ങൾ Google Sheet-ലെ 'User_Progress' ഷീറ്റിലേക്ക് സേവ് ചെയ്തു. (പുതിയ Apps Script കോഡ് ഡിപ്ലോയ് ചെയ്തിട്ടുണ്ടെന്ന് ഉറപ്പുവരുത്തുക).`;
    }
  } catch (err) {
    if (statusEl) {
      statusEl.className = "p-3 rounded-xl text-xs font-medium bg-rose-50 text-rose-800 block";
      statusEl.innerText = `Error: ${err.message}`;
    }
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function loadProgressFromSheet() {
  const statusEl = document.getElementById('history-sync-status');
  const btn = document.getElementById('btn-pull-progress');
  if (!state.apiUrl) {
    alert("Google Apps Script URL നൽകിയിട്ടില്ല.");
    return;
  }

  if (btn) btn.disabled = true;
  if (statusEl) {
    statusEl.className = "p-3 rounded-xl text-xs font-medium bg-amber-50 text-amber-800 block";
    statusEl.innerText = "Google Sheet-ൽ നിന്നും പഴയ ഉത്തരങ്ങൾ തിരികെ എടുക്കുന്നു...";
  }

  try {
    const fetchUrl = state.apiUrl.includes('?') ? `${state.apiUrl}&action=getProgress` : `${state.apiUrl}?action=getProgress`;
    const res = await fetch(fetchUrl);
    const data = await res.json();

    if (data.status === "success" && Array.isArray(data.progress)) {
      let restored = 0;
      data.progress.forEach(rec => {
        if (rec.questionId) {
          const existing = state.answerHistory[rec.questionId];
          if (!existing || new Date(rec.timestamp) >= new Date(existing.timestamp || 0)) {
            state.answerHistory[rec.questionId] = rec;
            restored++;
          }
          if (!state.attemptedIds.includes(rec.questionId)) {
            state.attemptedIds.push(rec.questionId);
          }
        }
      });
      localStorage.setItem('chm_answer_history', JSON.stringify(state.answerHistory));
      localStorage.setItem('chm_attempted_ids', JSON.stringify(state.attemptedIds));
      openAnswerHistoryView();

      if (statusEl) {
        statusEl.className = "p-3 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-800 block";
        statusEl.innerText = `✅ വിജയിച്ചു! Google Sheet-ൽ നിന്നും ${restored} ഉത്തരങ്ങൾ ആപ്പിലേക്ക് തിരികെ കൊണ്ടുവന്നു.`;
      }
    } else {
      throw new Error(data.message || "Could not read progress from sheet");
    }
  } catch (err) {
    if (statusEl) {
      statusEl.className = "p-3 rounded-xl text-xs font-medium bg-rose-50 text-rose-800 block";
      statusEl.innerText = `Error: ${err.message}. Apps Script പുതിയ കോഡ് അപ്‌ഡേറ്റ് ചെയ്ത് Deploy ചെയ്തിട്ടുണ്ടെന്ന് ഉറപ്പുവരുത്തുക.`;
    }
  } finally {
    if (btn) btn.disabled = false;
  }
}

function clearAnswerHistory() {
  if (confirm("ഈ ബ്രൗസറിൽ സേവ് ചെയ്തിട്ടുള്ള ഉത്തരങ്ങളുടെ ഹിസ്റ്ററി മായ്ക്കണോ?")) {
    state.answerHistory = {};
    localStorage.setItem('chm_answer_history', '{}');
    renderAnswerHistoryList();
  }
}


// ============================================================================
// ⚡ ELECTRONICS SIMULATOR & 🔄 RETRY WRONG FROM HISTORY
// ============================================================================

function updateLogicGatesSim() {
  const grid = document.getElementById('logic-gates-grid');
  if (!grid) return;
  const a = parseInt(document.getElementById('gate-in-a')?.value || '0', 10);
  const b = parseInt(document.getElementById('gate-in-b')?.value || '0', 10);

  const gates = [
    { name: "AND", expr: "A · B", out: a & b },
    { name: "OR", expr: "A + B", out: a | b },
    { name: "NOT (A)", expr: "A'", out: a ? 0 : 1 },
    { name: "NAND (Univ)", expr: "(A · B)'", out: (a & b) ? 0 : 1 },
    { name: "NOR (Univ)", expr: "(A + B)'", out: (a | b) ? 0 : 1 },
    { name: "XOR", expr: "A ⊕ B", out: a ^ b },
    { name: "XNOR", expr: "(A ⊕ B)'", out: (a ^ b) ? 0 : 1 }
  ];

  grid.innerHTML = gates.map(g => `
    <div class="p-3 rounded-xl bg-white border ${g.out ? 'border-emerald-400' : 'border-slate-200'} flex items-center justify-between text-xs shadow-sm">
      <div>
        <div class="font-black text-slate-900">${g.name}</div>
        <div class="text-[10px] font-mono text-slate-500">${g.expr}</div>
      </div>
      <span class="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-sm ${g.out ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'}">
        ${g.out}
      </span>
    </div>
  `).join('');
}

function calcOhmsLaw() {
  const v = parseFloat(document.getElementById('ohm-v')?.value || '0');
  const r = parseFloat(document.getElementById('ohm-r')?.value || '0');
  const out = document.getElementById('ohm-out');
  if (!out) return;
  if (!r || r <= 0) {
    out.innerText = "Resistance must be > 0";
    return;
  }
  const i = v / r;
  const p = v * i;
  out.innerText = `Current (I) = ${i.toFixed(2)} A | Power (P) = ${p.toFixed(2)} W`;
}

function calcSeriesParallel() {
  const v1 = parseFloat(document.getElementById('sp-v1')?.value || '0');
  const v2 = parseFloat(document.getElementById('sp-v2')?.value || '0');
  const out = document.getElementById('sp-out');
  if (!out) return;
  const seriesR = v1 + v2;
  const parallelR = (v1 + v2) > 0 ? (v1 * v2) / (v1 + v2) : 0;
  out.innerText = `R_series = ${seriesR.toFixed(2)} Ω | R_parallel = ${parallelR.toFixed(2)} Ω`;
}

function retryWrongFromHistory() {
  const wrongIds = Object.values(state.answerHistory || {})
    .filter(r => !r.isCorrect)
    .map(r => r.questionId);

  const wrongSet = new Set(wrongIds);
  const wrongQs = state.questions.filter(q => wrongSet.has(q.id));

  if (wrongQs.length === 0) {
    alert("അഭിനന്ദനങ്ങൾ! നിങ്ങളുടെ Answer History-ൽ തെറ്റിയ ചോദ്യങ്ങളൊന്നും നിലവിൽ ഇല്ല.");
    return;
  }

  state.activeSession = {
    mode: 'practice',
    title: `🔄 Retry Wrong Questions (${wrongQs.length} Qs)`,
    questions: [...wrongQs],
    currentIndex: 0,
    userAnswers: {},
    isSubmitted: false
  };
  initQuizUI();
}
