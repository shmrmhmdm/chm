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
  apiUrl: localStorage.getItem('chm_api_url') || DEFAULT_API_URL,
  geminiKey: localStorage.getItem('chm_gemini_key') || DEFAULT_GEMINI_KEY
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  loadQuestions();
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

const CURRENT_DATA_VERSION = "2026_11_24_TRADESMAN_191_V1";

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
  ['home', 'quiz', 'results', 'mistakes', 'revision', 'syllabus'].forEach(v => {
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

// Render Module Analytics & Weak Area Progress Bars
function renderModuleAnalytics() {
  const container = document.getElementById('module-analytics-container');
  if (!container) return;
  container.innerHTML = '';

  MODULE_DEFINITIONS.forEach(mod => {
    const stats = state.moduleStats[mod.id] || { attempted: 0, correct: 0, wrong: 0 };
    const attempted = stats.attempted || 0;
    const correct = stats.correct || 0;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

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
        <div class="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
          <span>പരിശീലിച്ചത്: <strong>${attempted}</strong> ചോദ്യങ്ങൾ (${correct} ശരി)</span>
          <span class="font-bold text-indigo-700">${mod.marks} Marks</span>
        </div>
        <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
          <div class="${barColor} h-full transition-all duration-500" style="width: ${attempted > 0 ? accuracy : 0}%"></div>
        </div>
      </div>
      <div class="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/50">
        <button onclick="startModulePractice('${mod.id}')" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline">
          <i class="fa-solid fa-play text-[10px]"></i> പരിശീലിക്കുക
        </button>
      </div>
    `;
    container.appendChild(item);
  });
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

// Start Module Practice Mode
function startModulePractice(moduleId) {
  const modDef = MODULE_DEFINITIONS.find(m => m.id === moduleId);
  let questions = state.questions.filter(q => q.sheetName === moduleId);
  
  if (questions.length === 0) {
    alert(`No questions found in ${modDef ? modDef.name : moduleId}. Please add questions in your Google Sheet or use Sync!`);
    return;
  }

  // Shuffle questions for practice
  questions = [...questions].sort(() => Math.random() - 0.5);

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
    title: 'PSC CHM Full Mock Exam (Cat: 884/2025)',
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

// Start Tradesman CHM 191/2015 Practice Mode (Instant answers, Malayalam explanations, jump palette)
function startTradesman191Practice() {
  const questions = (typeof PSC_TRADESMAN_191_QUESTIONS !== 'undefined' && PSC_TRADESMAN_191_QUESTIONS.length > 0)
    ? PSC_TRADESMAN_191_QUESTIONS
    : state.questions.filter(q => q.sheetName === "PSC_Tradesman_191_2015");

  if (!questions || questions.length === 0) {
    alert("Tradesman 191/2015 questions not found! Please check psc_tradesman_191_2015.js or sync with Google Sheets.");
    return;
  }

  state.activeSession = {
    mode: 'practice',
    title: 'Tradesman CHM (Code: 191/2015) - Practice Mode',
    questions: [...questions],
    currentIndex: 0,
    userAnswers: {},
    isSubmitted: false
  };

  initQuizUI();
}

// Start Tradesman CHM 191/2015 Timed Exam Mode (-0.33 mark, 60 minutes)
function startTradesman191Exam() {
  const questions = (typeof PSC_TRADESMAN_191_QUESTIONS !== 'undefined' && PSC_TRADESMAN_191_QUESTIONS.length > 0)
    ? PSC_TRADESMAN_191_QUESTIONS
    : state.questions.filter(q => q.sheetName === "PSC_Tradesman_191_2015");

  if (!questions || questions.length === 0) {
    alert("Tradesman 191/2015 questions not found! Please check psc_tradesman_191_2015.js or sync with Google Sheets.");
    return;
  }

  state.activeSession = {
    mode: 'exam',
    title: 'Tradesman CHM Exam (Code: 191/2015)',
    questions: [...questions],
    currentIndex: 0,
    userAnswers: {},
    timeRemaining: 60 * 60, // 60 minutes for 83 questions
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

  // Update Lifetime Stats
  state.stats.attempted += (correct + wrong);
  state.stats.correct += correct;
  state.stats.wrong += wrong;
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



