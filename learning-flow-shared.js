(function () {
  const config = window.learningFlowConfig;
  if (!config || !Array.isArray(config.modules) || config.modules.length === 0) {
    return;
  }

  const modules = config.modules;
  const storageKey = config.storageKey || 'learningFlowShared';
  const passMark = Number.isFinite(config.passMark) ? config.passMark : 60;
  const certificateRequestUrl = config.certificateRequestUrl || '../../../certificate-request.html';
  const certificateDownloadUrl = config.certificateDownloadUrl || '';

  function buildSteps() {
    const allSteps = [];
    modules.forEach((module) => {
      module.lessons.forEach((lesson, lessonIndex) => {
        allSteps.push({
          id: `${module.id}-lesson-${lessonIndex + 1}`,
          type: 'lesson',
          moduleId: module.id,
          moduleTitle: module.title,
          title: lesson.title,
          video: lesson.video,
          note: lesson.note,
          noteUrl: module.noteUrl,
          practiceUrl: module.practiceUrl,
          quizLabel: module.quizLabel
        });
      });

      allSteps.push({
        id: `${module.id}-quiz`,
        type: 'quiz',
        moduleId: module.id,
        moduleTitle: module.title,
        title: module.quizLabel,
        questions: module.quizQuestions,
        noteUrl: module.noteUrl,
        practiceUrl: module.practiceUrl,
        quizLabel: module.quizLabel
      });
    });
    return allSteps;
  }

  const steps = buildSteps();

  function defaultState() {
    return { completed: [], unlockedIndex: 0, currentIndex: 0, quizResults: {}, quizAttempts: {} };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      const safeQuizResults = parsed.quizResults && typeof parsed.quizResults === 'object' ? parsed.quizResults : {};
      const safeQuizAttempts = parsed.quizAttempts && typeof parsed.quizAttempts === 'object'
        ? Object.fromEntries(
            Object.entries(parsed.quizAttempts).map(([stepId, attempts]) => {
              if (!Array.isArray(attempts)) return [stepId, []];
              const validAttempts = attempts
                .filter((attempt) => attempt && typeof attempt === 'object' && Number.isFinite(attempt.score))
                .map((attempt) => ({
                  score: Math.max(0, Math.min(100, Number(attempt.score))),
                  timestamp: typeof attempt.timestamp === 'string' ? attempt.timestamp : null
                }));
              return [stepId, validAttempts];
            })
          )
        : {};

      Object.entries(safeQuizResults).forEach(([stepId, score]) => {
        if (!Number.isFinite(score)) return;
        if (!Array.isArray(safeQuizAttempts[stepId]) || safeQuizAttempts[stepId].length === 0) {
          safeQuizAttempts[stepId] = [{ score: Math.max(0, Math.min(100, Number(score))), timestamp: null }];
        }
      });

      return {
        completed: Array.isArray(parsed.completed) ? parsed.completed : [],
        unlockedIndex: Number.isFinite(parsed.unlockedIndex) ? parsed.unlockedIndex : 0,
        currentIndex: Number.isFinite(parsed.currentIndex) ? parsed.currentIndex : 0,
        quizResults: safeQuizResults,
        quizAttempts: safeQuizAttempts
      };
    } catch {
      return defaultState();
    }
  }

  let state = loadState();

  function saveState() {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function isCompleted(stepId) {
    return state.completed.includes(stepId);
  }

  function markCompleted(stepId) {
    if (!isCompleted(stepId)) state.completed.push(stepId);
  }

  function getQuizAttempts(stepId) {
    const attempts = state.quizAttempts?.[stepId];
    return Array.isArray(attempts) ? attempts : [];
  }

  function addQuizAttempt(stepId, score) {
    if (!state.quizAttempts || typeof state.quizAttempts !== 'object') {
      state.quizAttempts = {};
    }
    if (!Array.isArray(state.quizAttempts[stepId])) {
      state.quizAttempts[stepId] = [];
    }
    state.quizAttempts[stepId].push({ score, timestamp: new Date().toISOString() });
  }

  function formatAttemptTime(timestamp) {
    if (!timestamp) return 'Saved from previous progress';
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return 'Unknown time';
    return date.toLocaleString();
  }

  function goToStep(index) {
    if (index < 0 || index >= steps.length) return;
    if (index > state.unlockedIndex) return;
    state.currentIndex = index;
    saveState();
    render();
  }

  function nextStep() {
    const currentStep = steps[state.currentIndex];
    markCompleted(currentStep.id);
    state.unlockedIndex = Math.min(Math.max(state.unlockedIndex, state.currentIndex + 1), steps.length - 1);
    state.currentIndex = Math.min(state.currentIndex + 1, steps.length - 1);
    saveState();
    render();
  }

  function previousStep() {
    state.currentIndex = Math.max(state.currentIndex - 1, 0);
    saveState();
    render();
  }

  function stepQuizIndex(moduleId) {
    return steps.findIndex((step) => step.type === 'quiz' && step.moduleId === moduleId);
  }

  function renderProgress() {
    const completedCount = state.completed.length;
    const total = steps.length;
    const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    const blocks = 5;
    const filled = Math.round((percentage / 100) * blocks);
    const visual = `${'⬛'.repeat(filled)}${'⬜'.repeat(blocks - filled)} ${percentage}% Complete`;

    const progressText = document.getElementById('progress-text');
    if (progressText) progressText.textContent = visual;

    const fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = `${percentage}%`;

    const track = document.querySelector('.progress-track');
    track?.setAttribute('aria-valuenow', String(percentage));
  }

  function renderNav() {
    const container = document.getElementById('course-content-nav');
    if (!container) return;

    let html = '';

    modules.forEach((module) => {
      html += `<h3>${module.title}</h3><ul class="list-tight learning-nav-list">`;

      module.lessons.forEach((lesson, index) => {
        const stepId = `${module.id}-lesson-${index + 1}`;
        const stepIndex = steps.findIndex((s) => s.id === stepId);
        const locked = stepIndex > state.unlockedIndex;
        const complete = isCompleted(stepId);
        const active = stepIndex === state.currentIndex;
        html += `<li><button type="button" class="learning-nav-item ${locked ? 'is-locked' : ''} ${active ? 'is-active' : ''}" data-step-index="${stepIndex}" ${locked ? 'disabled' : ''}>${lesson.title} ${complete ? '✓' : ''}</button></li>`;
      });

      const quizId = `${module.id}-quiz`;
      const quizIndex = steps.findIndex((s) => s.id === quizId);
      const quizLocked = quizIndex > state.unlockedIndex;
      const quizComplete = isCompleted(quizId);
      const quizActive = quizIndex === state.currentIndex;
      const quizScore = state.quizResults[quizId];
      const scoreText = typeof quizScore === 'number' ? ` (${quizScore}%)` : '';
      html += `<li><button type="button" class="learning-nav-item ${quizLocked ? 'is-locked' : ''} ${quizActive ? 'is-active' : ''}" data-step-index="${quizIndex}" ${quizLocked ? 'disabled' : ''}>${module.quizLabel}${scoreText} ${quizComplete ? '✓' : ''}</button></li>`;

      html += '</ul>';
    });

    container.innerHTML = html;

    container.querySelectorAll('.learning-nav-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.stepIndex);
        goToStep(idx);
      });
    });
  }

  function renderScoreHistory() {
    const box = document.getElementById('score-history');
    if (!box) return;

    const items = modules
      .map((module) => {
        const quizId = `${module.id}-quiz`;
        const score = state.quizResults[quizId];
        const attempts = getQuizAttempts(quizId);
        const latestLabel = typeof score === 'number' ? `${score}%` : 'Not attempted';
        const clearButton = `<button type="button" class="btn btn-outline btn-compact" data-clear-quiz-id="${quizId}">Clear</button>`;

        if (attempts.length === 0) {
          return `<li><div class="learning-score-row"><strong>${module.quizLabel}:</strong> ${clearButton}</div><p class="form-note">${latestLabel}</p></li>`;
        }

        const history = attempts
          .slice()
          .reverse()
          .map((attempt, index) => `<li>Attempt ${attempts.length - index}: ${attempt.score}% <span class="form-note">(${formatAttemptTime(attempt.timestamp)})</span></li>`)
          .join('');

        return `<li><div class="learning-score-row"><strong>${module.quizLabel}:</strong> ${clearButton}</div><p class="form-note">Latest ${latestLabel}</p><ul class="list-tight">${history}</ul></li>`;
      })
      .join('');

    box.innerHTML = `<ul class="list-tight">${items}</ul>`;

    box.querySelectorAll('[data-clear-quiz-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const quizId = btn.getAttribute('data-clear-quiz-id');
        if (!quizId) return;
        const shouldClear = window.confirm('Clear score history for this quiz?');
        if (!shouldClear) return;
        delete state.quizResults[quizId];
        if (state.quizAttempts && typeof state.quizAttempts === 'object') {
          delete state.quizAttempts[quizId];
        }
        saveState();
        render();
      });
    });

    document.getElementById('clear-score-history-btn')?.addEventListener('click', () => {
      const shouldClear = window.confirm('Clear all saved quiz scores and attempt history?');
      if (!shouldClear) return;
      state.quizResults = {};
      state.quizAttempts = {};
      saveState();
      render();
    });
  }

  function renderContent() {
    const step = steps[state.currentIndex];
    const area = document.getElementById('lesson-content-area');
    if (!area || !step) return;

    const isFirst = state.currentIndex === 0;
    const isLast = state.currentIndex === steps.length - 1;
    const finalQuizStep = steps[steps.length - 1];
    const finalQuizCompleted = finalQuizStep ? isCompleted(finalQuizStep.id) : false;

    if (step.type === 'lesson') {
      const completionPreview = isLast && !finalQuizCompleted
        ? `<section class="card learning-block"><h3>🎓 Course Completed</h3><p>Next steps:</p><ul class="list-tight"><li>✔ Take Final Quiz</li><li>✔ Request Certificate</li><li>✔ Download Certificate</li></ul><div class="hero-actions"><button type="button" class="btn btn-primary" id="go-final-quiz-btn">Take Final Quiz</button></div></section>`
        : '';

      area.innerHTML = `
        <h2>${step.title}</h2>
        <section class="learning-video-wrap">
          <iframe src="${step.video}" title="${step.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
        </section>
        <section class="card learning-block">
          <h3>Lesson Notes</h3>
          <p>${step.note}</p>
        </section>
        <section class="card learning-block">
          <h3>Example / Practice</h3>
          <p>Complete the related practice activity for this module to reinforce the lesson.</p>
        </section>
        <div class="hero-actions">
          <button type="button" class="btn btn-outline" id="prev-btn" ${isFirst ? 'disabled' : ''}>⬅ Previous Lesson</button>
          <button type="button" class="btn btn-primary" id="next-btn">➡ Next Lesson</button>
          <a class="btn btn-secondary" href="${step.noteUrl}" target="_blank" rel="noopener noreferrer">Download Lesson Notes</a>
          <a class="btn btn-secondary" href="${step.practiceUrl}" target="_blank" rel="noopener noreferrer">Practice Exercise</a>
          <button type="button" class="btn btn-outline" id="quiz-jump-btn">Take Quiz</button>
        </div>
        ${completionPreview}
      `;

      document.getElementById('prev-btn')?.addEventListener('click', previousStep);
      document.getElementById('next-btn')?.addEventListener('click', nextStep);
      document.getElementById('quiz-jump-btn')?.addEventListener('click', () => {
        const idx = stepQuizIndex(step.moduleId);
        goToStep(idx);
      });

      document.getElementById('go-final-quiz-btn')?.addEventListener('click', () => {
        const finalQuizIndex = steps.length - 1;
        if (finalQuizIndex >= 0) goToStep(finalQuizIndex);
      });
    } else {
      const previousScore = state.quizResults[step.id];
      const questionItems = step.questions
        .map((item, index) => {
          const options = item.options
            .map((option, optionIndex) => `<label><input type="radio" name="q${index + 1}" value="${optionIndex}" required /> ${option}</label>`)
            .join('');
          return `<div class="learning-block"><p><strong>${index + 1}. ${item.question}</strong></p>${options}</div>`;
        })
        .join('');

      const completionMessage = isLast && isCompleted(step.id)
        ? `<section class="card learning-block"><h3>🎓 Course Completed</h3><p>Next steps:</p><ul class="list-tight"><li>✔ Take Final Quiz</li><li>✔ Request Certificate</li><li>✔ Download Certificate</li></ul><div class="hero-actions"><a class="btn btn-secondary" href="${certificateRequestUrl}">Request Certificate - $5</a>${certificateDownloadUrl ? `<a class="btn btn-primary" href="${certificateDownloadUrl}" download>Download Certificate</a>` : ''}</div></section>`
        : '';

      area.innerHTML = `
        <h2>${step.title}</h2>
        <form class="card form-card learning-block" id="flow-quiz-form">
          <h3>Quiz Questions</h3>
          ${questionItems}
          <div class="hero-actions">
            <button type="submit" class="btn btn-primary">${isLast ? 'Submit Final Quiz' : 'Submit Quiz'}</button>
            <button type="button" class="btn btn-outline" id="retake-quiz-btn">Retake Quiz</button>
          </div>
          <p class="form-feedback" id="quiz-feedback" aria-live="polite">${typeof previousScore === 'number' ? `Last score: ${previousScore}%` : ''}</p>
        </form>
        <div class="hero-actions">
          <button type="button" class="btn btn-outline" id="prev-btn" ${isFirst ? 'disabled' : ''}>⬅ Previous Lesson</button>
          <a class="btn btn-secondary" href="${step.noteUrl}" target="_blank" rel="noopener noreferrer">Download Lesson Notes</a>
          <a class="btn btn-secondary" href="${step.practiceUrl}" target="_blank" rel="noopener noreferrer">Practice Exercise</a>
          <button type="button" class="btn btn-outline" id="next-btn" ${isLast ? 'disabled' : ''}>➡ Next Lesson</button>
        </div>
        ${completionMessage}
      `;

      document.getElementById('prev-btn')?.addEventListener('click', previousStep);
      document.getElementById('next-btn')?.addEventListener('click', nextStep);

      document.getElementById('flow-quiz-form')?.addEventListener('submit', (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const feedback = document.getElementById('quiz-feedback');
        const answers = new FormData(form);

        let correctCount = 0;
        step.questions.forEach((question, index) => {
          const selected = Number(answers.get(`q${index + 1}`));
          if (selected === question.correctIndex) correctCount += 1;
        });

        const score = Math.round((correctCount / step.questions.length) * 100);
        state.quizResults[step.id] = score;
        addQuizAttempt(step.id, score);

        if (score >= passMark) {
          markCompleted(step.id);
          state.unlockedIndex = Math.min(Math.max(state.unlockedIndex, state.currentIndex + 1), steps.length - 1);
          if (!isLast) state.currentIndex += 1;
          if (feedback) {
            feedback.textContent = `Passed: ${score}% (minimum ${passMark}%).`;
            feedback.style.color = '#0b5a32';
          }
        } else {
          if (feedback) {
            feedback.textContent = `Score: ${score}%. You need at least ${passMark}% to unlock the next module.`;
            feedback.style.color = '#b42318';
          }
        }

        saveState();
        render();
      });

      document.getElementById('retake-quiz-btn')?.addEventListener('click', () => {
        const form = document.getElementById('flow-quiz-form');
        const feedback = document.getElementById('quiz-feedback');
        if (!form) return;
        form.reset();
        if (feedback) {
          feedback.textContent = 'Quiz reset. You can submit a new attempt.';
          feedback.style.color = '#1b3d6b';
        }
      });
    }
  }

  function render() {
    renderProgress();
    renderNav();
    renderScoreHistory();
    renderContent();
  }

  render();
})();
