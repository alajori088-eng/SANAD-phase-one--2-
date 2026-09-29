/**
 * سند الطالب | SANAD — منطق الواجهة وتجربة المستخدم
 * المرحلة الرابعة: ربط أداة «خطة الدراسة» مع المحرك والجدول المحفوظ
 */

(function () {
  'use strict';

  const store = window.SanadStore;
  if (!store) return;

  store.load();

  // عناصر DOM
  const elements = {
    // شريط الطالب والتنبيهات
    corruptedBanner: document.getElementById('corrupted-data-banner'),
    corruptionMsg: document.getElementById('corruption-message'),
    menuToggle: document.getElementById('menu-toggle'),
    mainNav: document.getElementById('main-nav'),
    studentGreeting: document.getElementById('student-greeting'),
    studentMajorBadge: document.getElementById('student-major-badge'),
    studentPlanBadge: document.getElementById('student-plan-badge'),
    editProfileBtn: document.getElementById('btn-edit-profile'),
    profileModal: document.getElementById('modal-profile'),
    profileForm: document.getElementById('form-profile'),

    // خطة الدراسة (المرحلة الرابعة)
    studyPlanScheduleAlert: document.getElementById('study-plan-schedule-alert'),
    planProgressPctText: document.getElementById('plan-progress-pct-text'),
    planProgressHoursText: document.getElementById('plan-progress-hours-text'),
    planProgressBarFill: document.getElementById('plan-progress-bar-fill'),
    btnOpenAddStudyTask: document.getElementById('btn-open-add-study-task'),
    btnOpenStudySettings: document.getElementById('btn-open-study-settings'),
    btnTriggerRedistribute: document.getElementById('btn-trigger-redistribute'),
    studyPlanDeficitCard: document.getElementById('study-plan-deficit-card'),
    planTabTodayBtn: document.getElementById('plan-tab-today'),
    planTabWeekBtn: document.getElementById('plan-tab-week'),
    planViewTodayContainer: document.getElementById('plan-view-today'),
    planViewWeekContainer: document.getElementById('plan-view-week'),

    // نوافذ خطة الدراسة
    modalStudyTask: document.getElementById('modal-study-task'),
    formStudyTask: document.getElementById('form-study-task'),
    selectStudyTaskCourse: document.getElementById('select-study-task-course'),
    selectStudyTaskTopic: document.getElementById('select-study-task-topic'),
    inputStudyTaskNewTopic: document.getElementById('input-study-task-new-topic'),
    inputStudyTaskMinutes: document.getElementById('input-study-task-minutes'),
    selectStudyTaskDiff: document.getElementById('select-study-task-diff'),
    selectStudyTaskPrio: document.getElementById('select-study-task-prio'),
    selectStudyTaskUnd: document.getElementById('select-study-task-und'),
    selectStudyTaskWorkType: document.getElementById('select-study-task-worktype'),
    inputStudyTaskExamDate: document.getElementById('input-study-task-examdate'),
    inputStudyTaskExamTime: document.getElementById('input-study-task-examtime'),
    inputStudyTaskReviewMins: document.getElementById('input-study-task-reviewmins'),

    modalStudySettings: document.getElementById('modal-study-settings'),
    formStudySettings: document.getElementById('form-study-settings'),
    inputStudyStartDate: document.getElementById('input-study-start-date'),
    inputStudyEndDate: document.getElementById('input-study-end-date'),
    inputStudySessionLen: document.getElementById('input-study-session-len'),
    inputStudyBreakLen: document.getElementById('input-study-break-len'),
    inputStudyTransitBuffer: document.getElementById('input-study-transit-buffer'),

    modalPartialComplete: document.getElementById('modal-partial-complete'),
    formPartialComplete: document.getElementById('form-partial-complete'),
    inputPartialMinutes: document.getElementById('input-partial-minutes'),
    partialSessionDurationMax: document.getElementById('partial-session-duration-max'),

    modalEditSessionTime: document.getElementById('modal-edit-session-time'),
    formEditSessionTime: document.getElementById('form-edit-session-time'),
    inputEditSessionDate: document.getElementById('input-edit-session-date'),
    inputEditSessionStart: document.getElementById('input-edit-session-start'),
    inputEditSessionEnd: document.getElementById('input-edit-session-end'),

    modalRedistributePreview: document.getElementById('modal-redistribute-preview'),
    redistributePreviewContent: document.getElementById('redistribute-preview-content'),
    btnConfirmRedistribute: document.getElementById('btn-confirm-redistribute'),

    // المرحلة الثالثة: رتّب دوامي
    coursePickerList: document.getElementById('schedule-course-picker'),
    sectionsManagerList: document.getElementById('schedule-sections-list'),
    btnGenerateSchedule: document.getElementById('btn-generate-schedule'),
    scheduleResultsContainer: document.getElementById('schedule-results-container'),
    scheduleTabsContainer: document.getElementById('schedule-tabs-container'),
    scheduleMetricsPills: document.getElementById('schedule-metrics-pills'),
    timetableGridBody: document.getElementById('timetable-grid-body'),
    timetableMobileList: document.getElementById('timetable-mobile-list'),
    conflictReportBox: document.getElementById('schedule-conflict-report'),
    btnSaveSchedule: document.getElementById('btn-save-this-schedule'),
    btnPrintSchedule: document.getElementById('btn-print-this-schedule')
  };

  let activePlanView = 'today'; // 'today' or 'week'
  let pendingPartialSessionId = null;
  let pendingEditSessionId = null;
  let cachedPreviewResult = null;

  function showModal(m) { if (m) m.style.display = 'flex'; }
  function hideModal(m) { if (m) m.style.display = 'none'; }

  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('[data-dismiss="modal"]')) hideModal(modal);
    });
  });

  // قائمة الموبايل
  if (elements.menuToggle && elements.mainNav) {
    elements.menuToggle.addEventListener('click', () => elements.mainNav.classList.toggle('is-open'));
  }

  // -------------------------------------------------------------
  // منطق «خطة الدراسة» (المرحلة الرابعة)
  // -------------------------------------------------------------

  function checkStudyPlanScheduleAlert() {
    if (elements.studyPlanScheduleAlert) {
      const isOutdated = store.isStudyPlanScheduleOutdated();
      elements.studyPlanScheduleAlert.style.display = isOutdated ? 'flex' : 'none';
    }
  }

  function renderStudyPlanUI() {
    checkStudyPlanScheduleAlert();
    renderStudyStats();
    renderDeficitCard();
    if (activePlanView === 'today') {
      renderTodayView();
    } else {
      renderWeekView();
    }
  }

  function renderStudyStats() {
    const stats = store.getStudyProgressStats();
    if (elements.planProgressPctText) elements.planProgressPctText.textContent = `${stats.percentage}%`;
    if (elements.planProgressBarFill) elements.planProgressBarFill.style.width = `${stats.percentage}%`;
    if (elements.planProgressHoursText) {
      const compH = (stats.completedMinutes / 60).toFixed(1);
      const totalH = (stats.totalNeededMinutes / 60).toFixed(1);
      elements.planProgressHoursText.textContent = `${compH} من ${totalH} ساعة مكتملة (${stats.tasksCount} مهمة)`;
    }
  }

  function renderDeficitCard() {
    if (!elements.studyPlanDeficitCard) return;
    const plan = store.getStudyPlan();
    const deficit = plan.lastDeficit;

    if (!deficit || deficit.totalUnscheduledMinutes <= 0) {
      elements.studyPlanDeficitCard.style.display = 'none';
      return;
    }

    const unH = (deficit.totalUnscheduledMinutes / 60).toFixed(1);
    elements.studyPlanDeficitCard.style.display = 'block';
    elements.studyPlanDeficitCard.innerHTML = `
      <h4>⚠️ تنبيه: عجز في الوقت المتاح للدراسة (${deficit.totalUnscheduledMinutes} دقيقة • ${unH} ساعة)</h4>
      <p style="font-size:0.85rem; margin-bottom:8px;">لم تكفِ فترات فراغك المحددة لتغطية الموضوعات التالية قبل موعدها النهائي:</p>
      <ul style="list-style:disc; padding-right:20px; font-size:0.85rem;">
        ${deficit.affectedTasks.map(t => `<li><strong>${store.escapeHtml(t.taskTitle)}:</strong> تبقى ${t.unscheduledMinutes} دقيقة دون جدولة (${t.reason}).</li>`).join('')}
      </ul>
      <p style="font-size:0.8rem; margin-top:6px; color:#FDE68A;">
        💡 <strong>مقترح للحل:</strong> زيدي نافذة الفراغ اليومية من زر «⚙️ إعدادات الفراغ»، أو قللي أوقات الاستراحة، أو مدي تاريخ نهاية الخطة.
      </p>
    `;
  }

  // تبديل بين خطة اليوم وخطة الأسبوع
  elements.planTabTodayBtn?.addEventListener('click', () => {
    activePlanView = 'today';
    elements.planTabTodayBtn.classList.add('active');
    elements.planTabWeekBtn.classList.remove('active');
    elements.planViewTodayContainer.style.display = 'block';
    elements.planViewWeekContainer.style.display = 'none';
    renderTodayView();
  });

  elements.planTabWeekBtn?.addEventListener('click', () => {
    activePlanView = 'week';
    elements.planTabWeekBtn.classList.add('active');
    elements.planTabTodayBtn.classList.remove('active');
    elements.planViewTodayContainer.style.display = 'none';
    elements.planViewWeekContainer.style.display = 'block';
    renderWeekView();
  });

  function renderTodayView() {
    if (!elements.planViewTodayContainer) return;
    const todayStr = store.formatLocalDate(new Date());
    const plan = store.getStudyPlan();
    const todaySessions = plan.sessions.filter(s => s.date === todayStr);

    if (todaySessions.length === 0) {
      elements.planViewTodayContainer.innerHTML = `
        <div class="info-card" style="text-align:center; padding:2rem;">
          <h4 style="color:var(--color-accent); font-size:1.1rem; margin-bottom:4px;">لا توجد جلسات مجدولة لهذا اليوم 🎉</h4>
          <p style="font-size:0.85rem; color:var(--color-muted);">استمتع براحتك، أو اضغط على "+ إضافة مهمة دراسية" لإضافة موضوعات جديدة وتوزيعها.</p>
        </div>`;
      return;
    }

    elements.planViewTodayContainer.innerHTML = todaySessions.map(sess => renderSessionCardHtml(sess)).join('');
  }

  function renderWeekView() {
    if (!elements.planViewWeekContainer) return;
    const plan = store.getStudyPlan();
    if (plan.sessions.length === 0) {
      elements.planViewWeekContainer.innerHTML = `
        <div class="info-card" style="text-align:center; padding:2rem;">
          <h4 style="color:var(--color-primary); font-size:1.1rem; margin-bottom:4px;">الخطة الدراسية فارغة حالياً</h4>
          <p style="font-size:0.85rem; color:var(--color-muted);">أضف موضوعاتك ومواعيد امتحاناتك بالضغط على "+ إضافة مهمة دراسية جديدة".</p>
        </div>`;
      return;
    }

    // تجميع الجلسات حسب التاريخ
    const groups = {};
    plan.sessions.forEach(s => {
      if (!groups[s.date]) groups[s.date] = [];
      groups[s.date].push(s);
    });

    const dates = Object.keys(groups).sort();
    let html = '';
    dates.forEach(dStr => {
      const dObj = store.parseLocalDate(dStr);
      const dayName = store.DAYS.find(d => d.id === store.getDayIdFromDate(dObj))?.name || '';
      html += `
        <div class="agenda-day-group">
          <div class="agenda-date-heading">
            <span>📅 ${dayName} (${dStr})</span>
            <span style="font-size:0.8rem; color:var(--color-muted); font-weight:normal;">• ${groups[dStr].length} جلسات</span>
          </div>
          <div>${groups[dStr].map(s => renderSessionCardHtml(s)).join('')}</div>
        </div>`;
    });

    elements.planViewWeekContainer.innerHTML = html;
  }

  function renderSessionCardHtml(sess) {
    const isCompleted = sess.status === 'completed';
    const isPartial = sess.status === 'partial';
    const isReview = Boolean(sess.isReview);

    return `
      <div class="study-task-card ${isReview ? 'is-review' : ''} ${isCompleted ? 'is-completed' : ''}" data-sess-id="${sess.id}">
        <div class="study-task-info">
          <div class="study-task-title">
            ${store.escapeHtml(sess.courseName)}: ${store.escapeHtml(sess.topicTitle)}
            ${isReview ? '<span class="badge-review">🎯 مراجعة للامتحان</span>' : ''}
          </div>
          <div class="study-task-badges">
            <span style="font-family:var(--font-code); color:var(--color-primary); font-weight:bold;">🕒 ${sess.startTime} - ${sess.endTime} (${sess.durationMinutes} دقيقة)</span>
            <span class="badge-worktype">${sess.workType === 'practical' ? '💻 عملي وتطبيق' : '📖 دراسة نظرية'}</span>
            ${isPartial ? `<span style="color:var(--color-warning);">⚠️ أُنجز منها ${sess.completedMinutes} دقيقة</span>` : ''}
            ${isCompleted ? '<span style="color:var(--color-accent); font-weight:bold;">✔ مكتملة</span>' : ''}
          </div>
        </div>

        <div class="study-task-actions">
          ${!isCompleted ? `
            <button type="button" class="btn btn-accent btn-sm" data-action="complete-sess" data-id="${sess.id}">✔ أنجزت</button>
            <button type="button" class="btn btn-secondary btn-sm" data-action="partial-sess" data-id="${sess.id}">⏱ جزء منها</button>
            <button type="button" class="btn btn-secondary btn-sm" data-action="edit-time-sess" data-id="${sess.id}">✎ التوقيت</button>
            <button type="button" class="btn btn-danger btn-sm" data-action="postpone-sess" data-id="${sess.id}">تأجيل</button>
          ` : `
            <span style="font-size:0.8rem; color:var(--color-muted);">أحسنت! تم الإنجاز</span>
          `}
        </div>
      </div>`;
  }

  // التفاعل مع بطاقات الجلسات
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const act = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');

    if (act === 'complete-sess') {
      store.markSessionComplete(id);
      renderStudyPlanUI();
    } else if (act === 'partial-sess') {
      const sess = store.getStudyPlan().sessions.find(s => s.id === id);
      if (!sess) return;
      pendingPartialSessionId = id;
      if (elements.partialSessionDurationMax) elements.partialSessionDurationMax.textContent = sess.durationMinutes;
      if (elements.inputPartialMinutes) elements.inputPartialMinutes.value = Math.round(sess.durationMinutes / 2);
      showModal(elements.modalPartialComplete);
    } else if (act === 'postpone-sess') {
      if (confirm('هل ترغب بتأجيل هذه الجلسة؟ سيتم إرجاع دقائقها إلى رصيد المادة ليتم توزيعها مجدداً.')) {
        store.postponeSession(id);
        renderStudyPlanUI();
      }
    } else if (act === 'edit-time-sess') {
      const sess = store.getStudyPlan().sessions.find(s => s.id === id);
      if (!sess) return;
      pendingEditSessionId = id;
      if (elements.inputEditSessionDate) elements.inputEditSessionDate.value = sess.date;
      if (elements.inputEditSessionStart) elements.inputEditSessionStart.value = sess.startTime;
      if (elements.inputEditSessionEnd) elements.inputEditSessionEnd.value = sess.endTime;
      showModal(elements.modalEditSessionTime);
    }
  });

  // تسجيل الإنجاز الجزئي
  elements.formPartialComplete?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!pendingPartialSessionId) return;
    const mins = parseInt(elements.inputPartialMinutes.value, 10);
    store.markSessionComplete(pendingPartialSessionId, mins);
    hideModal(elements.modalPartialComplete);
    renderStudyPlanUI();
  });

  // تعديل توقيت جلسة يدوياً
  elements.formEditSessionTime?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!pendingEditSessionId) return;
    const date = elements.inputEditSessionDate.value;
    const start = elements.inputEditSessionStart.value;
    const end = elements.inputEditSessionEnd.value;

    const res = store.editSessionTime(pendingEditSessionId, date, start, end);
    if (!res.success) {
      alert(res.error);
      return;
    }
    hideModal(elements.modalEditSessionTime);
    renderStudyPlanUI();
  });

  // إضافة مهمة دراسية جديدة
  elements.btnOpenAddStudyTask?.addEventListener('click', () => {
    const courses = store.getCourses();
    if (courses.length === 0) {
      alert('يجب إضافة مادة واحدة على الأقل في قسم "تخصصي وموادي" أولاً.');
      return;
    }
    if (elements.selectStudyTaskCourse) {
      elements.selectStudyTaskCourse.innerHTML = courses.map(c => `<option value="${c.id}">${store.escapeHtml(c.name)}</option>`).join('');
      updateTopicsDropdownForTask(courses[0].id);
    }
    elements.formStudyTask?.reset();
    showModal(elements.modalStudyTask);
  });

  elements.selectStudyTaskCourse?.addEventListener('change', (e) => {
    updateTopicsDropdownForTask(e.target.value);
  });

  function updateTopicsDropdownForTask(courseId) {
    if (!elements.selectStudyTaskTopic) return;
    const topics = store.getTopicsByCourse(courseId);
    let html = '<option value="">-- أو اختر من الموضوعات المسجلة سابقاً --</option>';
    topics.forEach(t => {
      html += `<option value="${t.id}" data-title="${store.escapeHtml(t.title)}">${store.escapeHtml(t.title)}</option>`;
    });
    elements.selectStudyTaskTopic.innerHTML = html;
  }

  elements.selectStudyTaskTopic?.addEventListener('change', (e) => {
    const selected = e.target.options[e.target.selectedIndex];
    if (selected && selected.getAttribute('data-title')) {
      if (elements.inputStudyTaskNewTopic) elements.inputStudyTaskNewTopic.value = selected.getAttribute('data-title');
    }
  });

  elements.formStudyTask?.addEventListener('submit', (e) => {
    e.preventDefault();
    const courseId = elements.selectStudyTaskCourse.value;
    const topicTitle = elements.inputStudyTaskNewTopic.value.trim();
    const topicId = elements.selectStudyTaskTopic.value;
    const mins = parseInt(elements.inputStudyTaskMinutes.value, 10);

    const res = store.addStudyTask({
      courseId,
      topicId,
      topicTitle,
      estimatedMinutes: mins,
      difficulty: elements.selectStudyTaskDiff.value,
      priority: elements.selectStudyTaskPrio.value,
      understandingLevel: elements.selectStudyTaskUnd.value,
      workType: elements.selectStudyTaskWorkType.value,
      examDate: elements.inputStudyTaskExamDate.value,
      examTime: elements.inputStudyTaskExamTime.value,
      reviewMinutesRequired: parseInt(elements.inputStudyTaskReviewMins.value, 10) || 0
    });

    if (!res.success) {
      alert(res.error);
      return;
    }

    hideModal(elements.modalStudyTask);

    // جدولة تلقائية للمهمة فور إضافتها
    store.planStudySchedule();
    renderStudyPlanUI();
  });

  // إعدادات وقت الفراغ والجلسات
  elements.btnOpenStudySettings?.addEventListener('click', () => {
    const plan = store.getStudyPlan();
    const s = plan.settings;
    if (elements.inputStudyStartDate) elements.inputStudyStartDate.value = s.startDate;
    if (elements.inputStudyEndDate) elements.inputStudyEndDate.value = s.endDate;
    if (elements.inputStudySessionLen) elements.inputStudySessionLen.value = s.sessionDuration;
    if (elements.inputStudyBreakLen) elements.inputStudyBreakLen.value = s.breakDuration;
    if (elements.inputStudyTransitBuffer) elements.inputStudyTransitBuffer.value = s.transitBuffer;
    showModal(elements.modalStudySettings);
  });

  elements.formStudySettings?.addEventListener('submit', (e) => {
    e.preventDefault();
    store.setStudyPlanSettings({
      startDate: elements.inputStudyStartDate.value,
      endDate: elements.inputStudyEndDate.value,
      sessionDuration: parseInt(elements.inputStudySessionLen.value, 10) || 50,
      breakDuration: parseInt(elements.inputStudyBreakLen.value, 10) || 10,
      transitBuffer: parseInt(elements.inputStudyTransitBuffer.value, 10) || 15
    });
    hideModal(elements.modalStudySettings);
    alert('تم حفظ الإعدادات بنجاح. يمكنك الآن الضغط على "إعادة توزيع الخطة" لتطبيق التحديثات.');
  });

  // إعادة التوزيع مع معاينة مسبقة وطلب التأكيد
  elements.btnTriggerRedistribute?.addEventListener('click', () => {
    // تشغيل تجريبي (Dry Run) للحصول على المعاينة أولاً
    const preview = store.planStudySchedule({ dryRun: true });
    if (!preview.success) {
      alert(preview.error);
      return;
    }

    cachedPreviewResult = preview;
    if (elements.redistributePreviewContent) {
      let deficitText = '';
      if (preview.deficit) {
        deficitText = `
          <div style="background:rgba(248,113,113,0.15); border:1px solid var(--color-danger); padding:8px 12px; border-radius:6px; margin-bottom:12px; color:#FECACA; font-size:0.85rem;">
            ⚠️ سيتبقى عجز قدره ${preview.deficit.totalUnscheduledMinutes} دقيقة لعدم كفاية الوقت قبل المواعيد المحددة.
          </div>`;
      }

      elements.redistributePreviewContent.innerHTML = `
        <p style="font-size:0.9rem; margin-bottom:12px;">
          سيتم الاحتفاظ بجميع المهام المكتملة سابقاً، وإعادة جدولة وتوزيع الجلسات المتبقية (${preview.scheduledCount} جلسة جديدة) بدءاً من تاريخ اليوم.
        </p>
        ${deficitText}
        <div style="max-height:180px; overflow-y:auto; border:1px solid var(--color-border); border-radius:6px; padding:8px; font-size:0.85rem; background:var(--color-bg);">
          ${preview.previewSessions.slice(0, 8).map(s => `
            <div style="padding:4px 0; border-bottom:1px solid var(--color-border);">
              📅 <strong>${s.date}</strong> (${s.startTime} -${s.endTime}): ${store.escapeHtml(s.courseName)} —${store.escapeHtml(s.topicTitle)}
            </div>
          `).join('')}
          ${preview.previewSessions.length > 8 ? `<div style="text-align:center; color:var(--color-muted); padding-top:4px;">... والمزيد (${preview.previewSessions.length - 8} جلسات أخرى)</div>` : ''}
        </div>
      `;
    }

    showModal(elements.modalRedistributePreview);
  });

  elements.btnConfirmRedistribute?.addEventListener('click', () => {
    store.planStudySchedule();
    hideModal(elements.modalRedistributePreview);
    renderStudyPlanUI();
    alert('تمت إعادة توزيع الخطة الدراسية بنجاح وفق القواعد المحددة!');
  });

  // التهيئة العامة
  renderStudyPlanUI();

})();