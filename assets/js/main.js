/**
 * سند الطالب | SANAD — المحرك البرمجي الموحد والشامل
 * حل مشكلات عرض الهاتف، استخراج نصوص البوابة، ونوافذ التعديل
 */

(function () {
  'use strict';

  const store = window.SanadStore;
  if (!store) return;

  store.load();

  // عناصر واجهة المستخدم الكاملة
  const elements = {
    // الشريط والبيانات
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

    // البحث
    globalSearchInput: document.getElementById('global-search-input'),
    searchResultsPanel: document.getElementById('search-results-panel'),

    // المواد والموضوعات (المرحلة 1 و 2)
    courseSearchInput: document.getElementById('course-search-input'),
    openAddCourseBtn: document.getElementById('btn-open-add-course'),
    coursesListView: document.getElementById('courses-list-view'),
    coursesGrid: document.getElementById('courses-grid'),
    courseDetailsView: document.getElementById('course-details-view'),
    backToCoursesBtn: document.getElementById('btn-back-to-courses'),
    detailCourseName: document.getElementById('detail-course-name'),
    detailCourseCode: document.getElementById('detail-course-code'),
    detailCourseHours: document.getElementById('detail-course-hours'),
    detailCourseClass: document.getElementById('detail-course-class'),
    detailCourseDesc: document.getElementById('detail-course-desc'),
    detailTopicsList: document.getElementById('detail-topics-list'),
    btnOpenAddTopic: document.getElementById('btn-open-add-topic'),
    courseModal: document.getElementById('modal-course'),
    courseForm: document.getElementById('form-course'),
    topicModal: document.getElementById('modal-topic'),
    formTopic: document.getElementById('form-topic'),
    resourceModal: document.getElementById('modal-resource'),
    formResource: document.getElementById('form-resource'),
    deleteModal: document.getElementById('modal-delete-confirm'),
    deleteConfirmBtn: document.getElementById('btn-confirm-delete'),
    deleteMessage: document.getElementById('delete-modal-message'),

    // رتّب دوامي (المرحلة 3)
    savedScheduleWarning: document.getElementById('saved-schedule-outdated-alert'),
    coursePickerList: document.getElementById('schedule-course-picker'),
    sectionsManagerList: document.getElementById('schedule-sections-list'),
    btnOpenAddSection: document.getElementById('btn-open-add-section'),
    btnOpenSmartImport: document.getElementById('btn-open-smart-import'),
    btnGenerateSchedule: document.getElementById('btn-generate-schedule'),
    scheduleResultsContainer: document.getElementById('schedule-results-container'),
    scheduleTabsContainer: document.getElementById('schedule-tabs-container'),
    scheduleMetricsPills: document.getElementById('schedule-metrics-pills'),
    scheduleUnmetPreferences: document.getElementById('schedule-unmet-preferences'),
    timetableGridBody: document.getElementById('timetable-grid-body'),
    timetableMobileList: document.getElementById('timetable-mobile-list'),
    conflictReportBox: document.getElementById('schedule-conflict-report'),
    btnSaveSchedule: document.getElementById('btn-save-this-schedule'),
    btnPrintSchedule: document.getElementById('btn-print-this-schedule'),
    earliestInput: document.getElementById('constraint-earliest'),
    latestInput: document.getElementById('constraint-latest'),
    travelBufferInput: document.getElementById('constraint-travel-buffer'),
    blockedTimesList: document.getElementById('blocked-times-list'),
    btnOpenAddBlocked: document.getElementById('btn-open-add-blocked'),
    modalBlockedTime: document.getElementById('modal-blocked-time'),
    formBlockedTime: document.getElementById('form-blocked-time'),
    sectionModal: document.getElementById('modal-section'),
    sectionForm: document.getElementById('form-section'),

    // الاستيراد الذكي
    smartImportModal: document.getElementById('modal-smart-import'),
    tabBtnPaste: document.getElementById('tab-btn-paste'),
    tabBtnImage: document.getElementById('tab-btn-image'),
    importModePaste: document.getElementById('import-mode-paste'),
    importModeImage: document.getElementById('import-mode-image'),
    smartPasteTextarea: document.getElementById('smart-paste-textarea'),
    btnParsePastedText: document.getElementById('btn-parse-pasted-text'),
    ocrDropzone: document.getElementById('ocr-dropzone'),
    ocrFileInput: document.getElementById('ocr-file-input'),
    ocrProgressBox: document.getElementById('ocr-progress-box'),
    ocrStatusText: document.getElementById('ocr-status-text'),
    ocrPercentageText: document.getElementById('ocr-percentage-text'),
    ocrProgressFill: document.getElementById('ocr-progress-fill'),
    importPreviewSection: document.getElementById('import-preview-section'),
    parsedCountBadge: document.getElementById('parsed-count-badge'),
    parsedSectionsContainer: document.getElementById('parsed-sections-container'),
    btnConfirmSaveImported: document.getElementById('btn-confirm-save-imported'),

    // خطة الدراسة (المرحلة 4)
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
    btnConfirmRedistribute: document.getElementById('btn-confirm-redistribute')
  };

  let activePlanView = 'today';
  let pendingPartialSessionId = null;
  let pendingEditSessionId = null;
  let currentViewCourseId = null;
  let activeTopicForResource = null;
  let deleteAction = null;
  let stagedExtractedData = [];
  let currentGeneratedSchedules = [];
  let currentActiveScheduleIndex = 0;

  // إدارة النوافذ المنبثقة
  function showModal(m) {
    if (!m) return;
    m.classList.add('is-open');
    const firstInput = m.querySelector('input:not([type="hidden"]), select, textarea');
    if (firstInput) setTimeout(() => firstInput.focus(), 50);
  }

  function hideModal(m) {
    if (!m) return;
    m.classList.remove('is-open');
  }

  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('[data-dismiss="modal"]')) hideModal(modal);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.querySelectorAll('.modal-backdrop.is-open').forEach(m => hideModal(m));
  });

  // قائمة الهاتف
  if (elements.menuToggle && elements.mainNav) {
    elements.menuToggle.addEventListener('click', () => elements.mainNav.classList.toggle('is-open'));
  }

  // شريط الطالب
  function renderStudentProfile() {
    const student = store.getStudent();
    if (elements.studentGreeting) {
      elements.studentGreeting.textContent = student.firstName
        ? `أهلاً بك، ${store.escapeHtml(student.firstName)}`
        : 'مساحة دراستك في كلية الذكاء الاصطناعي';
    }
    if (elements.studentMajorBadge) {
      const majorObj = store.MAJORS.find(m => m.id === student.majorId);
      elements.studentMajorBadge.textContent = majorObj ? majorObj.name : '';
      elements.studentMajorBadge.style.display = majorObj ? 'inline-block' : 'none';
    }
    if (elements.studentPlanBadge) {
      elements.studentPlanBadge.textContent = student.planYear ? `خطة سنة ${store.escapeHtml(student.planYear)}` : '';
      elements.studentPlanBadge.style.display = student.planYear ? 'inline-block' : 'none';
    }
  }

  elements.editProfileBtn?.addEventListener('click', () => {
    const s = store.getStudent();
    document.getElementById('input-student-name').value = s.firstName || '';
    document.getElementById('select-student-major').value = s.majorId || '';
    document.getElementById('input-student-year').value = s.planYear || '';
    showModal(elements.profileModal);
  });

  elements.profileForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    store.setStudent({
      firstName: document.getElementById('input-student-name').value,
      majorId: document.getElementById('select-student-major').value,
      planYear: document.getElementById('input-student-year').value
    });
    renderStudentProfile();
    hideModal(elements.profileModal);
  });

  // البحث الشامل
  if (elements.globalSearchInput && elements.searchResultsPanel) {
    elements.globalSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      if (!q) {
        elements.searchResultsPanel.style.display = 'none';
        return;
      }
      const results = store.globalSearch(q);
      if (results.count === 0) {
        elements.searchResultsPanel.innerHTML = `<div style="padding:1rem; text-align:center; color:var(--color-muted);">لا توجد نتائج تطابق "${store.escapeHtml(q)}"</div>`;
        elements.searchResultsPanel.style.display = 'block';
        return;
      }
      let html = '';
      if (results.courses.length > 0) {
        html += `<div style="padding:6px 12px; font-size:0.8rem; font-weight:bold; color:var(--color-accent); background:rgba(8,13,24,0.6);">المواد الدراسية</div>`;
        results.courses.forEach(c => {
          html += `<div class="search-item" data-action="go-course" data-id="${c.id}" style="padding:8px 12px; cursor:pointer; border-bottom:1px solid var(--color-border); display:flex; justify-content:space-between;">
            <strong>${store.escapeHtml(c.name)}</strong><span class="tag-badge">عرض</span>
          </div>`;
        });
      }
      elements.searchResultsPanel.innerHTML = html;
      elements.searchResultsPanel.style.display = 'block';
    });

    elements.searchResultsPanel.addEventListener('click', (e) => {
      const item = e.target.closest('[data-action="go-course"]');
      if (item) {
        openCourseDetails(item.getAttribute('data-id'));
        elements.searchResultsPanel.style.display = 'none';
        elements.globalSearchInput.value = '';
      }
    });
  }

  // -------------------------------------------------------------
  // إدارة المواد والموضوعات والمصادر
  // -------------------------------------------------------------

  function renderCourses() {
    const courses = store.getCourses();
    if (!elements.coursesGrid) return;

    if (courses.length === 0) {
      elements.coursesGrid.innerHTML = `
        <div class="info-card" style="text-align:center; grid-column: 1 / -1; padding:2rem;">
          <h4 style="color:var(--color-primary); font-size:1.1rem; margin-bottom:4px;">دليلك الدراسي فارغ حالياً</h4>
          <p style="font-size:0.85rem; color:var(--color-muted);">أضف مواد خطتك للبدء بتنظيم الشعب والمصادر واستخدام أدوات الجداول والمذاكرة.</p>
        </div>`;
      renderScheduleCoursePicker();
      return;
    }

    elements.coursesGrid.innerHTML = courses.map(c => {
      const topics = store.getTopicsByCourse(c.id);
      const sections = store.getSectionsByCourse(c.id);
      const completed = topics.filter(t => t.status === 'completed').length;
      const pct = topics.length > 0 ? Math.round((completed / topics.length) * 100) : 0;

      return `
        <article class="course-card" data-id="${c.id}">
          <div>
            <div class="course-card-top">
              <span class="course-code">${c.code ? store.escapeHtml(c.code) : 'مادة'}</span>
              <div style="display:flex; gap:4px;">
                <button type="button" class="icon-btn" data-action="delete-course" data-id="${c.id}" title="حذف المادة">🗑</button>
              </div>
            </div>
            <h3 class="course-title">${store.escapeHtml(c.name)}</h3>
            <div class="course-meta">
              <span class="badge-meta">${c.hours || 3} ساعات</span>
              <span class="badge-meta" style="color:var(--color-primary);">${sections.length} شُعب متاحة</span>
            </div>
            <div style="margin: 8px 0;">
              <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--color-muted); margin-bottom:4px;">
                <span>الإنجاز</span><span>${completed} من ${topics.length} موضوعات</span>
              </div>
              <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${pct}%;"></div></div>
            </div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--color-border); padding-top:8px; margin-top:8px;">
            <button type="button" class="btn btn-secondary btn-sm" data-action="view-details" data-id="${c.id}">التفاصيل والمصادر</button>
          </div>
        </article>`;
    }).join('');

    renderScheduleCoursePicker();
  }

  elements.coursesGrid?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const act = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');
    if (act === 'view-details') openCourseDetails(id);
    else if (act === 'delete-course') confirmDeleteCourse(id);
  });

  function openCourseDetails(courseId) {
    const course = store.getCourse(courseId);
    if (!course) return;
    currentViewCourseId = courseId;
    if (elements.detailCourseName) elements.detailCourseName.textContent = course.name;
    if (elements.detailCourseCode) elements.detailCourseCode.textContent = course.code || 'بدون رمز';
    if (elements.detailCourseHours) elements.detailCourseHours.textContent = `${course.hours || 3} ساعات`;
    if (elements.detailCourseClass) elements.detailCourseClass.textContent = store.CLASSIFICATIONS[course.classification] || 'متطلب';
    renderCourseTopics(courseId);
    if (elements.coursesListView) elements.coursesListView.style.display = 'none';
    if (elements.courseDetailsView) elements.courseDetailsView.style.display = 'block';
  }

  elements.backToCoursesBtn?.addEventListener('click', () => {
    if (elements.courseDetailsView) elements.courseDetailsView.style.display = 'none';
    if (elements.coursesListView) elements.coursesListView.style.display = 'block';
    currentViewCourseId = null;
    renderCourses();
  });

  function renderCourseTopics(courseId) {
    if (!elements.detailTopicsList) return;
    const topics = store.getTopicsByCourse(courseId);
    if (topics.length === 0) {
      elements.detailTopicsList.innerHTML = `<div class="info-card" style="text-align:center; padding:1.5rem;"><p style="font-size:0.85rem; color:var(--color-muted);">لم يُضف محتوى بعد. اضغط على "+ إضافة موضوع للمادة" للبدء.</p></div>`;
      return;
    }
    elements.detailTopicsList.innerHTML = topics.map(t => {
      const res = store.getResourcesByTopic(t.id);
      return `
        <div class="info-card" style="padding:1rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <strong>${store.escapeHtml(t.title)}</strong>
            <div style="display:flex; gap:6px;">
              <button type="button" class="btn btn-secondary btn-sm" data-action="add-res-to-topic" data-topic-id="${t.id}">+ إضافة مصدر</button>
              <button type="button" class="icon-btn" data-action="delete-topic" data-topic-id="${t.id}" style="color:var(--color-danger);">🗑</button>
            </div>
          </div>
          <div style="display:flex; flex-direction:column; gap:4px;">
            ${res.map(r => `<div style="display:flex; justify-content:space-between; font-size:0.85rem; background:var(--color-bg); padding:4px 8px; border-radius:4px; border:1px solid var(--color-border);"><a href="${store.escapeHtml(r.url)}" target="_blank" style="color:var(--color-primary); text-decoration:none;">🔗 ${store.escapeHtml(r.title)}</a><button type="button" class="icon-btn" data-action="del-res" data-id="${r.id}">✕</button></div>`).join('')}
          </div>
        </div>`;
    }).join('');
  }

  elements.detailTopicsList?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const act = btn.getAttribute('data-action');
    if (act === 'delete-topic') {
      store.deleteTopic(btn.getAttribute('data-topic-id'));
      renderCourseTopics(currentViewCourseId);
    } else if (act === 'add-res-to-topic') {
      activeTopicForResource = btn.getAttribute('data-topic-id');
      elements.formResource?.reset();
      showModal(elements.resourceModal);
    } else if (act === 'del-res') {
      store.deleteResource(btn.getAttribute('data-id'));
      renderCourseTopics(currentViewCourseId);
    }
  });

  elements.btnOpenAddTopic?.addEventListener('click', () => {
    if (!currentViewCourseId) return;
    elements.formTopic?.reset();
    showModal(elements.topicModal);
  });

  elements.formTopic?.addEventListener('submit', (e) => {
    e.preventDefault();
    store.addTopic({
      courseId: currentViewCourseId,
      title: document.getElementById('input-topic-title').value,
      status: document.getElementById('select-topic-status').value
    });
    hideModal(elements.topicModal);
    renderCourseTopics(currentViewCourseId);
    renderCourses();
  });

  elements.formResource?.addEventListener('submit', (e) => {
    e.preventDefault();
    store.addResource({
      courseId: currentViewCourseId,
      topicId: activeTopicForResource,
      title: document.getElementById('input-resource-title').value,
      url: document.getElementById('input-resource-url').value,
      type: document.getElementById('select-resource-type').value
    });
    hideModal(elements.resourceModal);
    renderCourseTopics(currentViewCourseId);
  });

  elements.openAddCourseBtn?.addEventListener('click', () => {
    elements.courseForm?.reset();
    showModal(elements.courseModal);
  });

  elements.courseForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    store.addCourse({
      name: document.getElementById('input-course-name').value,
      code: document.getElementById('input-course-code').value,
      hours: document.getElementById('input-course-hours').value,
      classification: document.getElementById('select-course-class').value,
      isCurrentSemester: true
    });
    hideModal(elements.courseModal);
    renderCourses();
  });

  // إصلاح بقاء الشعب معلقة عند حذف المادة
  function confirmDeleteCourse(id) {
    const c = store.getCourse(id);
    if (!c) return;
    elements.deleteMessage.textContent = `هل أنت متأكد من حذف مادة "${c.name}"؟ سيتم حذف جميع شعبها ومصادرها وموضوعاتها نهائياً.`;
    deleteAction = () => {
      store.deleteCourse(id);
      renderCourses();
      renderScheduleSectionsList();
      renderScheduleCoursePicker();
      renderStudyPlanUI();
      hideModal(elements.deleteModal);
    };
    showModal(elements.deleteModal);
  }

  elements.deleteConfirmBtn?.addEventListener('click', () => {
    if (deleteAction) deleteAction();
  });

  // -------------------------------------------------------------
  // رتّب دوامي: إدارة الشُعب وتوليد الجداول
  // -------------------------------------------------------------

  function renderScheduleCoursePicker() {
    if (!elements.coursePickerList) return;
    const courses = store.getCourses();
    if (courses.length === 0) {
      elements.coursePickerList.innerHTML = '<p style="font-size:0.85rem; color:var(--color-muted);">أضف موادك أولاً من قسم تخصصي وموادي للبدء.</p>';
      return;
    }
    elements.coursePickerList.innerHTML = courses.map(c => `
      <div class="course-pick-row">
        <label class="course-pick-label">
          <input type="checkbox" name="schedule-course-select" value="${c.id}" checked>
          <span>${store.escapeHtml(c.name)} ${c.code ? `(${store.escapeHtml(c.code)})` : ''}</span>
        </label>
        <span class="tag-badge">${store.getSectionsByCourse(c.id).length} شُعب</span>
      </div>
    `).join('');
    renderScheduleSectionsList();
  }

  function renderScheduleSectionsList() {
    if (!elements.sectionsManagerList) return;
    const sections = store.getSections();
    if (sections.length === 0) {
      elements.sectionsManagerList.innerHTML = '<p style="font-size:0.85rem; color:var(--color-muted);">لم تُضف أي شعب بعد. استخدم زر "⚡ استيراد ذكي" أو "+ إضافة يدوية".</p>';
      return;
    }
    elements.sectionsManagerList.innerHTML = sections.map(s => {
      const c = store.getCourse(s.courseId);
      const meetStr = s.meetings.map(m => {
        const d = store.DAYS.find(day => day.id === m.day)?.name || m.day;
        return `${d} (${m.startTime}-${m.endTime})${m.isLab ? ' [مختبر]' : ''}`;
      }).join(' • ');

      return `
        <div class="section-item-row">
          <div>
            <strong>${c ? store.escapeHtml(c.name) : 'مادة'} — شعبة ${store.escapeHtml(s.sectionNumber)}</strong>
            ${s.isPinned ? '<span class="pin-badge">📌 مثبتة</span>' : ''}
            <div style="font-size:0.8rem; color:var(--color-muted);">${store.escapeHtml(meetStr)}</div>
          </div>
          <button type="button" class="icon-btn" data-action="del-sec" data-id="${s.id}">🗑</button>
        </div>`;
    }).join('');
  }

  elements.sectionsManagerList?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="del-sec"]');
    if (!btn) return;
    store.deleteSection(btn.getAttribute('data-id'));
    renderScheduleSectionsList();
    renderScheduleCoursePicker();
  });

  // إضافة شعبة يدوياً
  elements.btnOpenAddSection?.addEventListener('click', () => {
    const courses = store.getCourses();
    if (courses.length === 0) {
      alert('يجب إضافة مادة دراسية أولاً في قسم تخصصي وموادي.');
      return;
    }
    const select = document.getElementById('select-section-course');
    if (select) select.innerHTML = courses.map(c => `<option value="${c.id}">${store.escapeHtml(c.name)}</option>`).join('');
    elements.sectionForm?.reset();
    document.getElementById('meetings-rows-container').innerHTML = '';
    addMeetingRow();
    showModal(elements.sectionModal);
  });

  function addMeetingRow() {
    const cont = document.getElementById('meetings-rows-container');
    if (!cont) return;
    const div = document.createElement('div');
    div.style.cssText = 'background:var(--color-bg); border:1px solid var(--color-border); padding:8px; border-radius:6px; margin-bottom:8px; display:flex; flex-direction:column; gap:6px;';
    div.innerHTML = `
      <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:6px;">
        <select class="form-select m-day">
          <option value="sun">الأحد</option><option value="mon">الإثنين</option><option value="tue">الثلاثاء</option><option value="wed">الأربعاء</option><option value="thu">الخميس</option>
        </select>
        <input type="time" class="form-input m-start" value="09:30">
        <input type="time" class="form-input m-end" value="11:00">
      </div>
      <label style="font-size:0.8rem; color:var(--color-muted); display:flex; align-items:center; gap:4px;">
        <input type="checkbox" class="m-is-lab"> هذا اللقاء مختبر
      </label>
    `;
    cont.appendChild(div);
  }

  document.getElementById('btn-add-meeting-row')?.addEventListener('click', addMeetingRow);

  elements.sectionForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const rows = document.querySelectorAll('#meetings-rows-container > div');
    const meetings = [];
    rows.forEach(r => {
      meetings.push({
        day: r.querySelector('.m-day').value,
        startTime: r.querySelector('.m-start').value,
        endTime: r.querySelector('.m-end').value,
        type: 'in_person',
        isLab: r.querySelector('.m-is-lab').checked
      });
    });
    store.addSection({
      courseId: document.getElementById('select-section-course').value,
      sectionNumber: document.getElementById('input-section-number').value,
      isPinned: document.getElementById('check-pin-section').checked,
      meetings
    });
    hideModal(elements.sectionModal);
    renderScheduleSectionsList();
    renderCourses();
  });

  // الفترات الممنوعة
  elements.btnOpenAddBlocked?.addEventListener('click', () => {
    elements.formBlockedTime?.reset();
    showModal(elements.modalBlockedTime);
  });

  elements.formBlockedTime?.addEventListener('submit', (e) => {
    e.preventDefault();
    store.addBlockedTime({
      title: document.getElementById('input-blocked-title').value,
      day: document.getElementById('select-blocked-day').value,
      startTime: document.getElementById('input-blocked-start').value,
      endTime: document.getElementById('input-blocked-end').value
    });
    hideModal(elements.modalBlockedTime);
    renderBlockedTimes();
  });

  function renderBlockedTimes() {
    if (!elements.blockedTimesList) return;
    const constraints = store.getScheduleConstraints();
    elements.blockedTimesList.innerHTML = constraints.blockedTimes.map(b => {
      const d = store.DAYS.find(day => day.id === b.day)?.name || b.day;
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--color-bg); padding:4px 8px; border-radius:4px; border:1px solid var(--color-border); font-size:0.8rem;">
          <span>⛔ ${store.escapeHtml(b.title)} (${d}: ${b.startTime} - ${b.endTime})</span>
          <button type="button" class="icon-btn" data-action="del-blocked" data-id="${b.id}">✕</button>
        </div>`;
    }).join('');
  }

  elements.blockedTimesList?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="del-blocked"]');
    if (!btn) return;
    store.deleteBlockedTime(btn.getAttribute('data-id'));
    renderBlockedTimes();
  });

  // توليد الجداول الأسبوعية
  elements.btnGenerateSchedule?.addEventListener('click', () => {
    const forbidden = [];
    document.querySelectorAll('input[name="forbidden-days"]:checked').forEach(cb => forbidden.push(cb.value));

    store.setScheduleConstraints({
      earliestStart: elements.earliestInput?.value || '08:00',
      latestEnd: elements.latestInput?.value || '18:00',
      travelBuffer: parseInt(elements.travelBufferInput?.value, 10) || 0,
      forbiddenDays: forbidden,
      blockedTimes: store.getScheduleConstraints().blockedTimes
    });

    const selectedCourseIds = [];
    document.querySelectorAll('input[name="schedule-course-select"]:checked').forEach(cb => selectedCourseIds.push(cb.value));

    elements.conflictReportBox.style.display = 'none';
    elements.scheduleResultsContainer.style.display = 'none';

    const result = store.generateSchedules(selectedCourseIds);
    if (!result.success) {
      elements.conflictReportBox.style.display = 'block';
      elements.conflictReportBox.innerHTML = `<h4>⚠️ تنبيه بالتعارض</h4><p style="color:#FECACA; font-size:0.9rem;">${store.escapeHtml(result.error)}</p>${result.conflicts ? `<ul class="conflict-list" style="margin-top:6px;">${result.conflicts.map(c => `<li>${store.escapeHtml(c)}</li>`).join('')}</ul>` : ''}`;
      return;
    }

    currentGeneratedSchedules = result.schedules;
    currentActiveScheduleIndex = 0;
    renderScheduleTabs();
    elements.scheduleResultsContainer.style.display = 'block';
    elements.scheduleResultsContainer.scrollIntoView({ behavior: 'smooth' });
  });

  function renderScheduleTabs() {
    if (!elements.scheduleTabsContainer) return;
    elements.scheduleTabsContainer.innerHTML = currentGeneratedSchedules.map((s, idx) => `
      <button type="button" class="tab-btn ${idx === currentActiveScheduleIndex ? 'active' : ''}" data-idx="${idx}">
        الجدول (${idx + 1}) ${idx === 0 ? '★ الأنسب' : ''}
      </button>
    `).join('');
    renderActiveSchedule(currentGeneratedSchedules[currentActiveScheduleIndex]);
  }

  elements.scheduleTabsContainer?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-idx]');
    if (!btn) return;
    currentActiveScheduleIndex = parseInt(btn.getAttribute('data-idx'), 10);
    renderScheduleTabs();
  });

  // تصيير جدول سطح المكتب + جدول الموبايل
  function renderActiveSchedule(schedule) {
    if (!schedule) return;
    const daysStr = schedule.attendanceDayNames.join('، ');
    const hoursGap = (schedule.totalGapMinutes / 60).toFixed(1);
    if (elements.scheduleMetricsPills) {
      elements.scheduleMetricsPills.innerHTML = `
        <div class="metric-pill">📅 <strong>أيام الدوام:</strong> ${schedule.attendanceDaysCount} أيام (${store.escapeHtml(daysStr)})</div>
        <div class="metric-pill">⏳ <strong>مجموع الفراغات:</strong> ${schedule.totalGapMinutes} دقيقة (${hoursGap} ساعة)</div>
      `;
    }

    const days = store.DAYS.slice(0, 5); // من الأحد للخميس

    // 1. جدول الحواسيب المكتبي
    let desktopHtml = '<tr>';
    days.forEach(d => {
      const meetings = schedule.dayMap[d.id] || [];
      const times = schedule.dailyTimes[d.id];
      const timeHeader = times ? `<br><small style="color:var(--color-muted); font-size:0.75rem;">${times.start} - ${times.end}</small>` : '<br><small style="color:var(--color-muted); font-size:0.75rem;">إجازة</small>';

      desktopHtml += `
        <td>
          <div style="font-weight:bold; margin-bottom:8px; border-bottom:1px solid var(--color-border); padding-bottom:4px;">
            ${d.name} ${timeHeader}
          </div>
          <div>
            ${meetings.map(m => `
              <div class="meeting-block ${m.isLab ? 'is-lab' : ''}">
                <div class="meeting-title">${store.escapeHtml(m.courseName)}</div>
                <div class="meeting-time">${m.startTime} - ${m.endTime} (شعبة ${store.escapeHtml(m.sectionNumber)})</div>
              </div>
            `).join('')}
          </div>
        </td>`;
    });
    desktopHtml += '</tr>';
    if (elements.timetableGridBody) elements.timetableGridBody.innerHTML = desktopHtml;

    // 2. جدول الموبايل
    if (elements.timetableMobileList) {
      let mobileHtml = '';
      days.forEach(d => {
        const meetings = schedule.dayMap[d.id] || [];
        if (meetings.length > 0) {
          const times = schedule.dailyTimes[d.id];
          mobileHtml += `
            <div class="day-agenda-card">
              <div style="display:flex; justify-content:space-between; font-weight:bold; border-bottom:1px solid var(--color-border); padding-bottom:6px; margin-bottom:8px;">
                <span style="color:var(--color-accent);">${d.name}</span>
                <span style="font-family:var(--font-code); color:var(--color-primary);">${times.start} - ${times.end}</span>
              </div>
              <div style="display:flex; flex-direction:column; gap:6px;">
                ${meetings.map(m => `
                  <div class="meeting-block ${m.isLab ? 'is-lab' : ''}">
                    <div class="meeting-title">${store.escapeHtml(m.courseName)} — شعبة ${store.escapeHtml(m.sectionNumber)}</div>
                    <div class="meeting-time">${m.startTime} - ${m.endTime}${m.isLab ? '• [مختبر]' : ''}</div>
                  </div>
                `).join('')}
              </div>
            </div>`;
        }
      });
      elements.timetableMobileList.innerHTML = mobileHtml || '<p style="color:var(--color-muted); text-align:center; padding:1rem;">لا توجد محاضرات مجدولة.</p>';
    }
  }

  elements.btnSaveSchedule?.addEventListener('click', () => {
    const cur = currentGeneratedSchedules[currentActiveScheduleIndex];
    if (!cur) return;
    store.saveSelectedSchedule(cur);
    alert('تم حفظ هذا الجدول بنجاح في متصفحك.');
  });

  elements.btnPrintSchedule?.addEventListener('click', () => window.print());

  // -------------------------------------------------------------
  // الاستيراد الذكي (لصق / OCR)
  // -------------------------------------------------------------

  elements.btnOpenSmartImport?.addEventListener('click', () => {
    stagedExtractedData = [];
    if (elements.importPreviewSection) elements.importPreviewSection.style.display = 'none';
    if (elements.btnConfirmSaveImported) elements.btnConfirmSaveImported.style.display = 'none';
    if (elements.smartPasteTextarea) elements.smartPasteTextarea.value = '';
    showModal(elements.smartImportModal);
  });

  elements.tabBtnPaste?.addEventListener('click', () => {
    elements.tabBtnPaste.classList.add('active');
    elements.tabBtnImage.classList.remove('active');
    elements.importModePaste.style.display = 'block';
    elements.importModeImage.style.display = 'none';
  });

  elements.tabBtnImage?.addEventListener('click', () => {
    elements.tabBtnImage.classList.add('active');
    elements.tabBtnPaste.classList.remove('active');
    elements.importModeImage.style.display = 'block';
    elements.importModePaste.style.display = 'none';
  });

  // تفكيك وتحليل نصوص البوابة
  function parseTextLines(text) {
    const lines = text.split('\n');
    const parsed = [];
    lines.forEach((line, idx) => {
      const timeMatch = line.match(/(\d{1,2})[:.](\d{2})\s*(?:-|–|إلى|to)\s*(\d{1,2})[:.](\d{2})/i);
      if (timeMatch) {
        let sH = parseInt(timeMatch[1], 10), sM = timeMatch[2], eH = parseInt(timeMatch[3], 10), eM = timeMatch[4];
        if (sH >= 1 && sH <= 7) sH += 12;
        if (eH >= 1 && eH <= 7) eH += 12;

        const days = /ح\s*ث\s*خ/i.test(line) ? ['sun', 'tue', 'thu'] : (/ن\s*ر/i.test(line) ? ['mon', 'wed'] : ['sun', 'tue', 'thu']);

        // استخراج اسم المادة دون حذف الحروف العربية
        const beforeTime = line.split(timeMatch[0])[0].trim();
        const words = beforeTime.split(/\s+/).filter(w => {
          const isDayToken = /^(ح|ث|خ|ن|ر|الأحد|الاحد|الإثنين|الاثنين|الثلاثاء|الأربعاء|الاربعاء|الخميس)$/i.test(w.trim());
          const isNumeric = /^\d+$/.test(w.trim());
          return !isDayToken && !isNumeric;
        });

        const courseName = words.slice(0, 4).join(' ').trim() || `مادة (${idx + 1})`;

        parsed.push({
          courseName: courseName,
          sectionNumber: '1',
          meetings: days.map(d => ({
            day: d,
            startTime: `${String(sH).padStart(2,'0')}:${sM}`,
            endTime: `${String(eH).padStart(2,'0')}:${eM}`,
            type: 'in_person',
            isLab: /مختبر|عملي|lab/i.test(line)
          }))
        });
      }
    });
    return parsed;
  }

  elements.btnParsePastedText?.addEventListener('click', () => {
    const text = elements.smartPasteTextarea.value.trim();
    if (!text) return alert('الرجاء لصق نص الجدول أولاً.');
    const parsed = parseTextLines(text);

    if (parsed.length === 0) return alert('لم يتم العثور على أوقات مثل (09:30 - 11:00) في النص.');
    stagedExtractedData = parsed;
    elements.importPreviewSection.style.display = 'block';
    elements.btnConfirmSaveImported.style.display = 'inline-flex';
    elements.parsedCountBadge.textContent = `${parsed.length} شعبة`;
    elements.parsedSectionsContainer.innerHTML = parsed.map(p => `
      <div style="background:var(--color-bg); padding:6px 10px; border-radius:4px; border:1px solid var(--color-border); font-size:0.85rem;">
        <strong>${store.escapeHtml(p.courseName)}</strong> (${p.meetings[0].startTime} - ${p.meetings[0].endTime})
      </div>`).join('');
  });

  // معالجة اختيار ملف الصورة للقارئ البصري
  elements.ocrDropzone?.addEventListener('click', () => elements.ocrFileInput?.click());

  elements.ocrFileInput?.addEventListener('change', async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    if (!window.Tesseract) {
      return alert('محرك القراءة غير متصل. استخدمي خيار "📋 لصق نص الجدول" فهو فوري وأدق بنسبة 100%.');
    }

    elements.ocrProgressBox.style.display = 'block';
    elements.ocrStatusText.textContent = 'جارٍ مسح أوقات المحاضرات ضوئياً...';
    elements.ocrPercentageText.textContent = '10%';
    elements.ocrProgressFill.style.width = '10%';

    try {
      const result = await window.Tesseract.recognize(file, 'ara+eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            const p = Math.round((m.progress || 0) * 100);
            elements.ocrPercentageText.textContent = `${p}%`;
            elements.ocrProgressFill.style.width = `${p}%`;
          }
        }
      });

      const parsed = parseTextLines(result.data.text || '');
      if (parsed.length === 0) {
        alert('تم مسح الصورة ولكن خط الجدول غير واضح. يفضل نسخ النص بالفأرة ولصقه في تبويب "لصق نص الجدول".');
        return;
      }

      stagedExtractedData = parsed;
      elements.importPreviewSection.style.display = 'block';
      elements.btnConfirmSaveImported.style.display = 'inline-flex';
      elements.parsedCountBadge.textContent = `${parsed.length} شعبة`;
      elements.parsedSectionsContainer.innerHTML = parsed.map(p => `
        <div style="background:var(--color-bg); padding:6px 10px; border-radius:4px; border:1px solid var(--color-border); font-size:0.85rem;">
          <strong>${store.escapeHtml(p.courseName)}</strong> (${p.meetings[0].startTime} - ${p.meetings[0].endTime})
        </div>`).join('');

    } catch (err) {
      alert('حدث خطأ أثناء فحص الصورة. يمكنك نسخ النص ولصقه مباشرة.');
    } finally {
      elements.ocrProgressBox.style.display = 'none';
    }
  });

  elements.btnConfirmSaveImported?.addEventListener('click', () => {
    stagedExtractedData.forEach(item => {
      let c = store.getCourses().find(course => course.name.toLowerCase() === item.courseName.toLowerCase());
      let cId = c ? c.id : null;
      if (!c) {
        const added = store.addCourse({ name: item.courseName, hours: 3, isCurrentSemester: true });
        if (added.success) cId = added.course.id;
      }
      if (cId) store.addSection({ courseId: cId, sectionNumber: item.sectionNumber, meetings: item.meetings });
    });
    hideModal(elements.smartImportModal);
    renderCourses();
    renderScheduleSectionsList();
    renderScheduleCoursePicker();
    alert('تم اعتماد واستيراد الشعب بنجاح!');
  });

  // -------------------------------------------------------------
  // خطة الدراسة والمذاكرة (المرحلة 4)
  // -------------------------------------------------------------

  function renderStudyPlanUI() {
    if (elements.studyPlanScheduleAlert) {
      elements.studyPlanScheduleAlert.style.display = store.isStudyPlanScheduleOutdated() ? 'flex' : 'none';
    }
    renderStudyStats();
    renderDeficitCard();
    if (activePlanView === 'today') renderTodayView();
    else renderWeekView();
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
      <h4>⚠️ عجز في الوقت المتاح للدراسة (${deficit.totalUnscheduledMinutes} دقيقة • ${unH} ساعة)</h4>
      <p style="font-size:0.85rem;">لم تكفِ فترات فراغك لتغطية كامل المهام قبل الامتحانات:</p>
      <ul style="list-style:disc; padding-right:20px; font-size:0.85rem; margin-top:4px;">
        ${deficit.affectedTasks.map(t => `<li><strong>${store.escapeHtml(t.taskTitle)}:</strong> تبقى ${t.unscheduledMinutes} دقيقة.</li>`).join('')}
      </ul>`;
  }

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
        <div class="info-card" style="text-align:center; padding:1.5rem;">
          <h4 style="color:var(--color-accent); font-size:1.1rem;">لا توجد جلسات دراسية مجدولة لليوم 🎉</h4>
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
        <div class="info-card" style="text-align:center; padding:1.5rem;">
          <h4 style="color:var(--color-primary); font-size:1.1rem;">الخطة الدراسية فارغة حالياً</h4>
        </div>`;
      return;
    }
    const groups = {};
    plan.sessions.forEach(s => {
      if (!groups[s.date]) groups[s.date] = [];
      groups[s.date].push(s);
    });

    elements.planViewWeekContainer.innerHTML = Object.keys(groups).sort().map(dStr => `
      <div class="agenda-day-group">
        <div class="agenda-date-heading">📅 ${dStr} (${groups[dStr].length} جلسات)</div>
        <div>${groups[dStr].map(s => renderSessionCardHtml(s)).join('')}</div>
      </div>`).join('');
  }

  function renderSessionCardHtml(sess) {
    const isCompleted = sess.status === 'completed';
    return `
      <div class="study-task-card ${sess.isReview ? 'is-review' : ''} ${isCompleted ? 'is-completed' : ''}">
        <div class="study-task-info">
          <div class="study-task-title">
            ${store.escapeHtml(sess.courseName)}: ${store.escapeHtml(sess.topicTitle)}
            ${sess.isReview ? '<span class="badge-review">🎯 مراجعة للامتحان</span>' : ''}
          </div>
          <div class="study-task-badges">
            <span style="font-family:var(--font-code); color:var(--color-primary);">🕒 ${sess.startTime} - ${sess.endTime} (${sess.durationMinutes} دقيقة)</span>
            <span class="badge-worktype">${sess.workType === 'practical' ? '💻 عملي' : '📖 نظري'}</span>
            ${isCompleted ? '<span style="color:var(--color-accent); font-weight:bold;">✔ مكتملة</span>' : ''}
          </div>
        </div>
        <div class="study-task-actions">
          ${!isCompleted ? `
            <button type="button" class="btn btn-accent btn-sm" data-action="complete-sess" data-id="${sess.id}">✔ أنجزت</button>
            <button type="button" class="btn btn-secondary btn-sm" data-action="partial-sess" data-id="${sess.id}">⏱ جزء منها</button>
            <button type="button" class="btn btn-secondary btn-sm" data-action="edit-time-sess" data-id="${sess.id}">✎ التوقيت</button>
            <button type="button" class="btn btn-danger btn-sm" data-action="postpone-sess" data-id="${sess.id}">تأجيل</button>
          ` : '<span style="font-size:0.8rem; color:var(--color-muted);">تم الإنجاز</span>'}
        </div>
      </div>`;
  }

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
    } else if (act === 'edit-time-sess') {
      const sess = store.getStudyPlan().sessions.find(s => s.id === id);
      if (!sess) return;
      pendingEditSessionId = id;
      if (elements.inputEditSessionDate) elements.inputEditSessionDate.value = sess.date;
      if (elements.inputEditSessionStart) elements.inputEditSessionStart.value = sess.startTime;
      if (elements.inputEditSessionEnd) elements.inputEditSessionEnd.value = sess.endTime;
      showModal(elements.modalEditSessionTime);
    } else if (act === 'postpone-sess') {
      store.postponeSession(id);
      renderStudyPlanUI();
    }
  });

  // تسجيل الإنجاز الجزئي
  elements.formPartialComplete?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!pendingPartialSessionId) return;
    store.markSessionComplete(pendingPartialSessionId, parseInt(elements.inputPartialMinutes.value, 10));
    hideModal(elements.modalPartialComplete);
    renderStudyPlanUI();
  });

  // تفعيل حفظ تعديل توقيت الجلسة يدوياً
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

  elements.btnOpenAddStudyTask?.addEventListener('click', () => {
    const courses = store.getCourses();
    if (courses.length === 0) return alert('أضف مادة في قسم تخصصي وموادي أولاً.');
    if (elements.selectStudyTaskCourse) {
      elements.selectStudyTaskCourse.innerHTML = courses.map(c => `<option value="${c.id}">${store.escapeHtml(c.name)}</option>`).join('');
      updateTopicsDropdown(courses[0].id);
    }
    elements.formStudyTask?.reset();
    showModal(elements.modalStudyTask);
  });

  elements.selectStudyTaskCourse?.addEventListener('change', (e) => updateTopicsDropdown(e.target.value));

  function updateTopicsDropdown(courseId) {
    if (!elements.selectStudyTaskTopic) return;
    const topics = store.getTopicsByCourse(courseId);
    elements.selectStudyTaskTopic.innerHTML = '<option value="">-- أو اختر موضوعاً مسجلاً --</option>' +
      topics.map(t => `<option value="${t.id}" data-title="${store.escapeHtml(t.title)}">${store.escapeHtml(t.title)}</option>`).join('');
  }

  elements.selectStudyTaskTopic?.addEventListener('change', (e) => {
    const sel = e.target.options[e.target.selectedIndex];
    if (sel && sel.getAttribute('data-title')) elements.inputStudyTaskNewTopic.value = sel.getAttribute('data-title');
  });

  elements.formStudyTask?.addEventListener('submit', (e) => {
    e.preventDefault();
    store.addStudyTask({
      courseId: elements.selectStudyTaskCourse.value,
      topicId: elements.selectStudyTaskTopic.value,
      topicTitle: elements.inputStudyTaskNewTopic.value.trim(),
      estimatedMinutes: parseInt(elements.inputStudyTaskMinutes.value, 10),
      difficulty: elements.selectStudyTaskDiff.value,
      priority: elements.selectStudyTaskPrio.value,
      understandingLevel: elements.selectStudyTaskUnd.value,
      workType: elements.selectStudyTaskWorkType.value,
      examDate: elements.inputStudyTaskExamDate.value,
      examTime: elements.inputStudyTaskExamTime.value,
      reviewMinutesRequired: parseInt(elements.inputStudyTaskReviewMins.value, 10) || 0
    });
    hideModal(elements.modalStudyTask);
    store.planStudySchedule();
    renderStudyPlanUI();
  });

  elements.btnOpenStudySettings?.addEventListener('click', () => {
    const s = store.getStudyPlan().settings;
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
    alert('تم حفظ الإعدادات بنجاح.');
  });

  elements.btnTriggerRedistribute?.addEventListener('click', () => {
    const preview = store.planStudySchedule({ dryRun: true });
    if (!preview.success) return alert(preview.error);
    if (elements.redistributePreviewContent) {
      elements.redistributePreviewContent.innerHTML = `
        <p style="font-size:0.9rem;">سيتم الاحتفاظ بالمهام المكتملة مسبقاً، وتوزيع ${preview.scheduledCount} جلسة جديدة.</p>
        ${preview.deficit ? `<div style="background:rgba(248,113,113,0.15); border:1px solid var(--color-danger); padding:8px; border-radius:6px; margin:8px 0; color:#FECACA;">⚠️ عجز قدره ${preview.deficit.totalUnscheduledMinutes} دقيقة.</div>` : ''}
      `;
    }
    showModal(elements.modalRedistributePreview);
  });

  elements.btnConfirmRedistribute?.addEventListener('click', () => {
    store.planStudySchedule();
    hideModal(elements.modalRedistributePreview);
    renderStudyPlanUI();
    alert('تمت إعادة توزيع الخطة بنجاح!');
  });

  // التهيئة الأولية الكاملة
  renderStudentProfile();
  renderCourses();
  renderScheduleSectionsList();
  renderScheduleCoursePicker();
  renderBlockedTimes();
  renderStudyPlanUI();

})();