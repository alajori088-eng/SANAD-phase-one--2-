/**
 * سند الطالب | SANAD — منطق الواجهة وتجربة المستخدم
 * المرحلة الثالثة: دمج واجهة «رتّب دوامي» مع إدارة المواد والبحث
 */

(function () {
  'use strict';

  const store = window.SanadStore;
  if (!store) {
    console.error('وحدة التخزين SanadStore مفقودة.');
    return;
  }

  store.load();

  // عناصر DOM
  const elements = {
    corruptedBanner: document.getElementById('corrupted-data-banner'),
    corruptionMsg: document.getElementById('corruption-message'),
    menuToggle: document.getElementById('menu-toggle'),
    mainNav: document.getElementById('main-nav'),

    // شريط الطالب
    studentGreeting: document.getElementById('student-greeting'),
    studentMajorBadge: document.getElementById('student-major-badge'),
    studentPlanBadge: document.getElementById('student-plan-badge'),
    editProfileBtn: document.getElementById('btn-edit-profile'),

    // البحث الشامل
    globalSearchInput: document.getElementById('global-search-input'),
    searchResultsPanel: document.getElementById('search-results-panel'),

    // أدوات المواد
    courseSearchInput: document.getElementById('course-search-input'),
    majorFilter: document.getElementById('major-filter'),
    yearFilter: document.getElementById('year-filter'),
    semesterFilter: document.getElementById('semester-filter'),
    classFilter: document.getElementById('class-filter'),
    onlyCurrentBtn: document.getElementById('filter-current-btn'),
    onlyFavBtn: document.getElementById('filter-fav-btn'),
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
    openEditCurrentCourseBtn: document.getElementById('btn-edit-current-course'),
    openAddTopicBtn: document.getElementById('btn-open-add-topic'),

    // عناصر «رتّب دوامي»
    savedScheduleWarning: document.getElementById('saved-schedule-outdated-alert'),
    savedScheduleCard: document.getElementById('saved-schedule-banner'),
    coursePickerList: document.getElementById('schedule-course-picker'),
    sectionsManagerList: document.getElementById('schedule-sections-list'),
    btnOpenAddSection: document.getElementById('btn-open-add-section'),
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

    // خيارات القيود والتفضيلات
    earliestInput: document.getElementById('constraint-earliest'),
    latestInput: document.getElementById('constraint-latest'),
    travelBufferInput: document.getElementById('constraint-travel-buffer'),
    prefMinDays: document.getElementById('pref-min-days'),
    prefMinGaps: document.getElementById('pref-min-gaps'),
    prefDayOff: document.getElementById('pref-day-off'),
    blockedTimesList: document.getElementById('blocked-times-list'),
    btnOpenAddBlocked: document.getElementById('btn-open-add-blocked'),

    // النوافذ المنبثقة
    profileModal: document.getElementById('modal-profile'),
    profileForm: document.getElementById('form-profile'),
    courseModal: document.getElementById('modal-course'),
    courseForm: document.getElementById('form-course'),
    topicModal: document.getElementById('modal-topic'),
    topicForm: document.getElementById('form-topic'),
    resourceModal: document.getElementById('modal-resource'),
    resourceForm: document.getElementById('form-resource'),
    sectionModal: document.getElementById('modal-section'),
    sectionForm: document.getElementById('form-section'),
    blockedModal: document.getElementById('modal-blocked-time'),
    blockedForm: document.getElementById('form-blocked-time'),
    deleteModal: document.getElementById('modal-delete-confirm'),
    deleteConfirmBtn: document.getElementById('btn-confirm-delete'),
    deleteMessage: document.getElementById('delete-modal-message')
  };

  let currentViewCourseId = null;
  let deleteAction = null;
  let activeFilters = { search: '', major: '', year: '', semester: '', classification: '', onlyCurrent: false, onlyFavorites: false };

  let currentGeneratedSchedules = [];
  let currentActiveScheduleIndex = 0;

  // تنبيه تلف البيانات
  if (store.isCorrupted() && elements.corruptedBanner && elements.corruptionMsg) {
    elements.corruptionMsg.textContent = store.getCorruptionDetails();
    elements.corruptedBanner.style.display = 'flex';
  }

  // قائمة الهاتف
  if (elements.menuToggle && elements.mainNav) {
    elements.menuToggle.addEventListener('click', () => {
      const isOpen = elements.mainNav.classList.toggle('is-open');
      elements.menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && elements.mainNav.classList.contains('is-open')) {
        elements.mainNav.classList.remove('is-open');
        elements.menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // تحديث واجهة الطالب
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
        elements.searchResultsPanel.innerHTML = `<div class="search-empty">لم يتم العثور على أي نتائج تطابق "${store.escapeHtml(q)}"</div>`;
        elements.searchResultsPanel.style.display = 'block';
        return;
      }
      let html = '';
      if (results.courses.length > 0) {
        html += `<div class="search-category-title">المواد الدراسية (${results.courses.length})</div>`;
        results.courses.forEach(c => {
          html += `<div class="search-item" data-type="course" data-id="${c.id}">
            <div class="search-item-info">
              <span class="search-item-title">${store.escapeHtml(c.name)}</span>
              <span class="search-item-sub">${c.code ? store.escapeHtml(c.code) + ' — ' : ''}${store.CLASSIFICATIONS[c.classification] || ''}</span>
            </div>
            <span class="tag-badge">عرض المادة</span>
          </div>`;
        });
      }
      if (results.topics.length > 0) {
        html += `<div class="search-category-title">الموضوعات (${results.topics.length})</div>`;
        results.topics.forEach(t => {
          const status = store.TOPIC_STATUSES[t.status] || store.TOPIC_STATUSES.not_started;
          html += `<div class="search-item" data-type="topic" data-course-id="${t.courseId}">
            <div class="search-item-info">
              <span class="search-item-title">${store.escapeHtml(t.title)}</span>
              <span class="search-item-sub">مادة: ${store.escapeHtml(t.courseName)}</span>
            </div>
            <span class="status-badge ${status.color}">${status.label}</span>
          </div>`;
        });
      }
      elements.searchResultsPanel.innerHTML = html;
      elements.searchResultsPanel.style.display = 'block';
    });

    elements.searchResultsPanel.addEventListener('click', (e) => {
      const item = e.target.closest('.search-item');
      if (!item) return;
      const type = item.getAttribute('data-type');
      if (type === 'course') openCourseDetails(item.getAttribute('data-id'));
      else if (type === 'topic') openCourseDetails(item.getAttribute('data-course-id'));
      elements.searchResultsPanel.style.display = 'none';
      elements.globalSearchInput.value = '';
    });
  }

  // عرض المواد
  function renderCourses() {
    const allCourses = store.getCourses();
    const filtered = allCourses.filter(c => {
      if (activeFilters.search) {
        const q = activeFilters.search.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !(c.code && c.code.toLowerCase().includes(q))) return false;
      }
      if (activeFilters.major && !c.majors.includes(activeFilters.major)) return false;
      if (activeFilters.year && c.year !== activeFilters.year) return false;
      if (activeFilters.semester && c.semester !== activeFilters.semester) return false;
      if (activeFilters.classification && c.classification !== activeFilters.classification) return false;
      if (activeFilters.onlyCurrent && !c.isCurrentSemester) return false;
      if (activeFilters.onlyFavorites && !c.isFavorite) return false;
      return true;
    });

    if (allCourses.length === 0) {
      elements.coursesGrid.innerHTML = `
        <div class="empty-state">
          <h3 class="empty-state-title">دليلك الدراسي فارغ حاليًا</h3>
          <p class="empty-state-desc">أضف مواد خطتك للبدء بتنظيم الشعب والمصادر واستخدام أداة رتّب دوامي.</p>
          <button type="button" class="btn btn-primary" id="btn-empty-add-course">+ أضف أول مادة</button>
        </div>`;
      document.getElementById('btn-empty-add-course')?.addEventListener('click', () => openCourseModal());
      renderScheduleCoursePicker();
      return;
    }

    if (filtered.length === 0) {
      elements.coursesGrid.innerHTML = `<div class="empty-state"><h3 class="empty-state-title">لا توجد مواد تطابق خيارات التصفية</h3></div>`;
      return;
    }

    let html = '';
    filtered.forEach(c => {
      const topics = store.getTopicsByCourse(c.id);
      const completed = topics.filter(t => t.status === 'completed').length;
      const pct = topics.length > 0 ? Math.round((completed / topics.length) * 100) : 0;
      const classLabel = store.CLASSIFICATIONS[c.classification] || 'غير محدد';
      const sections = store.getSectionsByCourse(c.id);

      html += `
        <article class="course-card" data-id="${c.id}">
          <div>
            <div class="course-card-top">
              <span class="course-code">${c.code ? store.escapeHtml(c.code) : 'مادة'}</span>
              <div class="card-actions-quick">
                <button type="button" class="icon-btn ${c.isFavorite ? 'active-favorite' : ''}" data-action="toggle-fav" data-id="${c.id}">★</button>
                <button type="button" class="icon-btn ${c.isCurrentSemester ? 'active-semester' : ''}" data-action="toggle-sem" data-id="${c.id}">📅</button>
              </div>
            </div>
            <h3 class="course-title">${store.escapeHtml(c.name)}</h3>
            <div class="course-meta">
              <span class="badge-meta">${classLabel}</span>
              ${c.hours ? `<span class="badge-meta">${c.hours} ساعات</span>` : ''}
              <span class="badge-meta">${sections.length} شُعب متاحة</span>
            </div>
            <div class="course-progress-box">
              <div class="progress-label"><span>الإنجاز</span><span>${completed} من ${topics.length} موضوعات</span></div>
              <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${pct}%;"></div></div>
            </div>
          </div>
          <div class="course-card-footer">
            <button type="button" class="btn btn-secondary btn-sm" data-action="view-details" data-id="${c.id}">التفاصيل والمصادر</button>
            <div style="display:flex; gap:4px;">
              <button type="button" class="icon-btn" data-action="edit-course" data-id="${c.id}">✎</button>
              <button type="button" class="icon-btn" data-action="delete-course" data-id="${c.id}">🗑</button>
            </div>
          </div>
        </article>`;
    });

    elements.coursesGrid.innerHTML = html;
    renderScheduleCoursePicker();
  }

  // أحداث المواد
  elements.coursesGrid?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');
    if (action === 'toggle-fav') { store.toggleCourseFavorite(id); renderCourses(); }
    else if (action === 'toggle-sem') { store.toggleCourseCurrentSemester(id); renderCourses(); }
    else if (action === 'view-details') openCourseDetails(id);
    else if (action === 'edit-course') openCourseModal(id);
    else if (action === 'delete-course') confirmDeleteCourse(id);
  });

  function openCourseDetails(courseId) {
    const course = store.getCourse(courseId);
    if (!course) return;
    currentViewCourseId = courseId;
    elements.detailCourseName.textContent = course.name;
    elements.detailCourseCode.textContent = course.code || 'بدون رمز';
    elements.detailCourseHours.textContent = course.hours ? `${course.hours} ساعات` : 'غير محدد';
    elements.detailCourseClass.textContent = store.CLASSIFICATIONS[course.classification] || 'غير محدد';
    elements.detailCourseDesc.textContent = course.description || 'لم يُضف وصف لهذه المادة بعد.';
    renderCourseTopics(courseId);
    elements.coursesListView.style.display = 'none';
    elements.courseDetailsView.style.display = 'block';
  }

  function renderCourseTopics(courseId) {
    const topics = store.getTopicsByCourse(courseId);
    if (topics.length === 0) {
      elements.detailTopicsList.innerHTML = `<div class="empty-state" style="padding:1.5rem;"><h3 class="empty-state-title" style="font-size:1rem;">لم يُضف محتوى بعد</h3><button type="button" class="btn btn-primary btn-sm" id="btn-first-top">+ أضف أول موضوع</button></div>`;
      document.getElementById('btn-first-top')?.addEventListener('click', () => openTopicModal(null, courseId));
      return;
    }
    let html = '';
    topics.forEach(t => {
      const res = store.getResourcesByTopic(t.id);
      html += `
        <div class="topic-card" data-topic-id="${t.id}">
          <div class="topic-card-header">
            <h4 class="topic-title">${store.escapeHtml(t.title)}</h4>
            <div class="topic-controls">
              <select class="filter-select" data-action="change-topic-status" data-topic-id="${t.id}">
                <option value="not_started" ${t.status === 'not_started' ? 'selected' : ''}>لم أبدأ</option>
                <option value="in_progress" ${t.status === 'in_progress' ? 'selected' : ''}>قيد الدراسة</option>
                <option value="completed" ${t.status === 'completed' ? 'selected' : ''}>مكتمل</option>
                <option value="needs_review" ${t.status === 'needs_review' ? 'selected' : ''}>بحاجة مراجعة</option>
              </select>
              <button type="button" class="icon-btn" data-action="delete-topic" data-topic-id="${t.id}">🗑</button>
            </div>
          </div>
          <div class="topic-resources">
            <button type="button" class="btn btn-secondary btn-sm" data-action="add-res" data-topic-id="${t.id}">+ إضافة مصدر</button>
            <div class="resources-list" style="margin-top:8px;">
              ${res.map(r => `<div class="resource-item"><a href="${store.escapeHtml(r.url)}" target="_blank" class="resource-link">🔗 ${store.escapeHtml(r.title)}</a><button type="button" class="icon-btn" data-action="del-res" data-res-id="${r.id}">✕</button></div>`).join('')}
            </div>
          </div>
        </div>`;
    });
    elements.detailTopicsList.innerHTML = html;
  }

  elements.detailTopicsList?.addEventListener('change', (e) => {
    if (e.target.matches('[data-action="change-topic-status"]')) {
      store.updateTopic(e.target.getAttribute('data-topic-id'), { status: e.target.value });
      renderCourses();
    }
  });

  elements.detailTopicsList?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const act = btn.getAttribute('data-action');
    if (act === 'delete-topic') {
      store.deleteTopic(btn.getAttribute('data-topic-id'));
      renderCourseTopics(currentViewCourseId);
    } else if (act === 'add-res') {
      openResourceModal(currentViewCourseId, btn.getAttribute('data-topic-id'));
    } else if (act === 'del-res') {
      store.deleteResource(btn.getAttribute('data-res-id'));
      renderCourseTopics(currentViewCourseId);
    }
  });

  elements.backToCoursesBtn?.addEventListener('click', () => {
    elements.courseDetailsView.style.display = 'none';
    elements.coursesListView.style.display = 'block';
    currentViewCourseId = null;
    renderCourses();
  });

  // -------------------------------------------------------------
  // منطق واجهة «رتّب دوامي»
  // -------------------------------------------------------------

  function renderScheduleCoursePicker() {
    const courses = store.getCourses();
    if (!elements.coursePickerList) return;

    if (courses.length === 0) {
      elements.coursePickerList.innerHTML = '<p style="color:var(--color-muted); font-size:0.85rem;">لا توجد مواد مضافة بعد. أضف موادك أولاً من قسم "تخصصي وموادي".</p>';
      return;
    }

    elements.coursePickerList.innerHTML = courses.map(c => `
      <div class="course-pick-row">
        <label class="course-pick-label">
          <input type="checkbox" name="schedule-course-select" value="${c.id}" ${c.isCurrentSemester ? 'checked' : ''}>
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
      elements.sectionsManagerList.innerHTML = '<p style="color:var(--color-muted); font-size:0.85rem;">لم تُضف أي شعب بعد. اضغط على "+ إضافة شعبة جديدة" لإدخال أوقات المحاضرات والمختبرات.</p>';
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
          <div class="section-item-info">
            <div style="display:flex; align-items:center; gap:6px;">
              <strong>${c ? store.escapeHtml(c.name) : 'مادة'} — شعبة ${store.escapeHtml(s.sectionNumber)}</strong>
              ${s.isPinned ? '<span class="pin-badge">📌 مُثبتة</span>' : ''}
            </div>
            <div class="section-item-meta">${store.escapeHtml(meetStr)}</div>
          </div>
          <div style="display:flex; gap:4px;">
            <button type="button" class="icon-btn" title="${s.isPinned ? 'إلغاء التثبيت' : 'تثبيت الشعبة'}" data-action="toggle-pin-sec" data-id="${s.id}">
              ${s.isPinned ? '📌' : '📍'}
            </button>
            <button type="button" class="icon-btn" title="حذف" data-action="del-sec" data-id="${s.id}">🗑</button>
          </div>
        </div>`;
    }).join('');
  }

  elements.sectionsManagerList?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const act = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');
    if (act === 'toggle-pin-sec') {
      store.togglePinSection(id);
      renderScheduleSectionsList();
    } else if (act === 'del-sec') {
      store.deleteSection(id);
      renderScheduleSectionsList();
      renderScheduleCoursePicker();
      checkSavedScheduleStatus();
    }
  });

  // الفترات الممنوعة (Blocked Times)
  function renderBlockedTimes() {
    if (!elements.blockedTimesList) return;
    const constraints = store.getScheduleConstraints();
    if (constraints.blockedTimes.length === 0) {
      elements.blockedTimesList.innerHTML = '<span style="font-size:0.8rem; color:var(--color-muted);">لا توجد فترات ممنوعة مضافة حالياً.</span>';
      return;
    }
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
    if (btn) {
      store.deleteBlockedTime(btn.getAttribute('data-id'));
      renderBlockedTimes();
    }
  });

  // توليد الجداول
  elements.btnGenerateSchedule?.addEventListener('click', () => {
    // تحديث القيود أولاً
    const forbidden = [];
    document.querySelectorAll('input[name="forbidden-days"]:checked').forEach(cb => forbidden.push(cb.value));

    store.setScheduleConstraints({
      earliestStart: elements.earliestInput?.value || '08:00',
      latestEnd: elements.latestInput?.value || '18:00',
      travelBuffer: parseInt(elements.travelBufferInput?.value, 10) || 0,
      forbiddenDays: forbidden,
      blockedTimes: store.getScheduleConstraints().blockedTimes
    });

    store.setSchedulePreferences({
      minimizeDays: elements.prefMinDays?.checked ?? true,
      minimizeGaps: elements.prefMinGaps?.checked ?? true,
      preferredDayOff: elements.prefDayOff?.value || ''
    });

    // جمع المواد المختارة
    const selectedCourseIds = [];
    document.querySelectorAll('input[name="schedule-course-select"]:checked').forEach(cb => {
      selectedCourseIds.push(cb.value);
    });

    elements.conflictReportBox.style.display = 'none';
    elements.scheduleResultsContainer.style.display = 'none';

    const result = store.generateSchedules(selectedCourseIds);

    if (!result.success) {
      elements.conflictReportBox.style.display = 'block';
      if (result.technicalLimit) {
        elements.conflictReportBox.innerHTML = `
          <h4>⚠️ توقف البحث مؤقتاً بسبب حد تقني</h4>
          <p style="color:#FECACA; font-size:0.9rem; margin-bottom:8px;">${store.escapeHtml(result.error)}</p>
          <div class="suggestions-box">
            <strong>نصيحة للمتابعة:</strong> يُرجى تثبيت شعبة مؤكدة لبعض المواد أو تقليل عدد المواد مؤقتاً لتقليص فضاء الاحتمالات.
          </div>`;
      } else if (result.noSolution) {
        elements.conflictReportBox.innerHTML = `
          <h4>⚠️️ تعذر تكوين جدول متوافق</h4>
          <p style="color:#FECACA; font-size:0.9rem; margin-bottom:8px;">تم رصد التعارضات التالية بين خياراتك ومدخلاتك:</p>
          <ul class="conflict-list">
            ${result.conflicts.map(c => `<li>${store.escapeHtml(c)}</li>`).join('')}
          </ul>
          <div class="suggestions-box">
            <strong>مقترحات لحل التعارض دون تخفيف القيود تلقائياً:</strong>
            <ul style="list-style:disc; padding-right:20px; margin-top:4px;">
              <li>إضافة أوقات شُعب بديلة للمواد المذكورة في التعارضات أعلاه.</li>
              <li>تعديل وقت الفترة الممنوعة أو تقليل وقت الانتقال المطلوب.</li>
              <li>توسيع نطاق الدوام المسموح (أبكر بداية وآخر نهاية).</li>
            </ul>
          </div>`;
      } else {
        elements.conflictReportBox.innerHTML = `<h4>⚠️ تنبيه</h4><p style="color:#FECACA;">${store.escapeHtml(result.error)}</p>`;
      }
      return;
    }

    currentGeneratedSchedules = result.schedules;
    currentActiveScheduleIndex = 0;
    renderScheduleResults();
    elements.scheduleResultsContainer.style.display = 'block';
    elements.scheduleResultsContainer.scrollIntoView({ behavior: 'smooth' });
  });

  function renderScheduleResults() {
    if (currentGeneratedSchedules.length === 0) return;

    // رسم أزرار التبويبات (حتى 3 جداول)
    elements.scheduleTabsContainer.innerHTML = currentGeneratedSchedules.map((s, idx) => `
      <button type="button" class="tab-btn ${idx === currentActiveScheduleIndex ? 'active' : ''}" data-tab-idx="${idx}">
        الجدول المقترح (${idx + 1}) ${idx === 0 ? '★ الأنسب لتفضيلاتك' : ''}
      </button>
    `).join('');

    renderActiveSchedule(currentGeneratedSchedules[currentActiveScheduleIndex]);
  }

  elements.scheduleTabsContainer?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tab-idx]');
    if (!btn) return;
    currentActiveScheduleIndex = parseInt(btn.getAttribute('data-tab-idx'), 10);
    renderScheduleResults();
  });

  function renderActiveSchedule(schedule) {
    if (!schedule) return;

    // مقاييس الجدول
    const daysStr = schedule.attendanceDayNames.join('، ');
    const hoursGap = (schedule.totalGapMinutes / 60).toFixed(1);
    elements.scheduleMetricsPills.innerHTML = `
      <div class="metric-pill">📅 <strong>أيام الدوام:</strong> ${schedule.attendanceDaysCount} أيام (${store.escapeHtml(daysStr)})</div>
      <div class="metric-pill">⏳ <strong>مجموع الفراغات:</strong> ${schedule.totalGapMinutes} دقيقة (${hoursGap} ساعة)</div>
    `;

    // تنبيه التفضيلات غير المحققة
    if (schedule.unmetPreferences.length > 0) {
      elements.scheduleUnmetPreferences.style.display = 'block';
      elements.scheduleUnmetPreferences.innerHTML = `
        <div style="background:rgba(251,191,36,0.1); border:1px solid rgba(251,191,36,0.3); padding:8px 12px; border-radius:6px; font-size:0.85rem; color:#FDE68A;">
          ${schedule.unmetPreferences.map(u => `<div>⚠️ ${store.escapeHtml(u)}</div>`).join('')}
        </div>`;
    } else {
      elements.scheduleUnmetPreferences.style.display = 'none';
    }

    // بناء الجدول الأسبوعي المكتبي
    const days = store.DAYS;
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
                <div class="meeting-loc">${m.type === 'online' ? '🌐 عن بُعد' : (m.location ? `📍 ${store.escapeHtml(m.location)}` : '📍 وجاهي')}</div>
              </div>
            `).join('')}
          </div>
        </td>`;
    });
    desktopHtml += '</tr>';
    elements.timetableGridBody.innerHTML = desktopHtml;

    // بناء جدول الهاتف المقسم بالأيام
    let mobileHtml = '';
    days.forEach(d => {
      const meetings = schedule.dayMap[d.id] || [];
      if (meetings.length > 0) {
        const times = schedule.dailyTimes[d.id];
        mobileHtml += `
          <div class="day-agenda-card">
            <div class="day-agenda-header">
              <span>${d.name}</span>
              <span style="font-size:0.8rem; font-family:var(--font-code); color:var(--color-primary);">${times.start} - ${times.end}</span>
            </div>
            <div>
              ${meetings.map(m => `
                <div class="meeting-block ${m.isLab ? 'is-lab' : ''}" style="margin-bottom:8px;">
                  <div class="meeting-title">${store.escapeHtml(m.courseName)} — شعبة ${store.escapeHtml(m.sectionNumber)}</div>
                  <div class="meeting-time">${m.startTime} - ${m.endTime}${m.isLab ? '• [مختبر]' : ''}</div>
                  <div class="meeting-loc">${m.type === 'online' ? '🌐 عن بُعد' : (m.location ? `📍 ${store.escapeHtml(m.location)}` : '📍 وجاهي')}</div>
                </div>
              `).join('')}
            </div>
          </div>`;
      }
    });
    elements.timetableMobileList.innerHTML = mobileHtml || '<p style="color:var(--color-muted);">لا توجد محاضرات في هذا الجدول.</p>';
  }

  // حفظ وطباعة الجدول
  elements.btnSaveSchedule?.addEventListener('click', () => {
    const cur = currentGeneratedSchedules[currentActiveScheduleIndex];
    if (!cur) return;
    store.saveSelectedSchedule(cur);
    alert('تم حفظ هذا الجدول بنجاح في متصفحك.');
    checkSavedScheduleStatus();
  });

  elements.btnPrintSchedule?.addEventListener('click', () => {
    window.print();
  });

  function checkSavedScheduleStatus() {
    const saved = store.getSavedSchedule();
    if (!saved) {
      if (elements.savedScheduleCard) elements.savedScheduleCard.style.display = 'none';
      if (elements.savedScheduleWarning) elements.savedScheduleWarning.style.display = 'none';
      return;
    }

    if (elements.savedScheduleCard) {
      elements.savedScheduleCard.style.display = 'block';
    }

    if (store.isSavedScheduleOutdated()) {
      if (elements.savedScheduleWarning) {
        elements.savedScheduleWarning.style.display = 'flex';
      }
    } else {
      if (elements.savedScheduleWarning) {
        elements.savedScheduleWarning.style.display = 'none';
      }
    }
  }

  // إدارة النوافذ المنبثقة
  function showModal(m) { if (m) m.style.display = 'flex'; }
  function hideModal(m) { if (m) m.style.display = 'none'; }

  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.matches('[data-dismiss="modal"]')) hideModal(modal);
    });
  });

  // إضافة شعبة
  elements.btnOpenAddSection?.addEventListener('click', () => {
    const courses = store.getCourses();
    const select = document.getElementById('select-section-course');
    if (!select) return;
    select.innerHTML = courses.map(c => `<option value="${c.id}">${store.escapeHtml(c.name)}</option>`).join('');
    elements.sectionForm.reset();
    document.getElementById('meetings-rows-container').innerHTML = '';
    addMeetingRow(); // إضافة سطر اللقاء الأول تلقائياً
    showModal(elements.sectionModal);
  });

  function addMeetingRow() {
    const cont = document.getElementById('meetings-rows-container');
    const idx = cont.children.length;
    const div = document.createElement('div');
    div.className = 'meeting-input-row';
    div.style.cssText = 'background:var(--color-bg); border:1px solid var(--color-border); padding:8px; border-radius:6px; margin-bottom:8px; display:flex; flex-direction:column; gap:6px;';
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.8rem; font-weight:bold; color:var(--color-accent);">لقاء (${idx + 1})</span>
        ${idx > 0 ? `<button type="button" class="icon-btn" onclick="this.parentElement.parentElement.remove()" style="color:var(--color-danger)">حذف اللقاء</button>` : ''}
      </div>
      <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:6px;">
        <select class="form-select m-day" required>
          <option value="sun">الأحد</option>
          <option value="mon">الإثنين</option>
          <option value="tue">الثلاثاء</option>
          <option value="wed">الأربعاء</option>
          <option value="thu">الخميس</option>
        </select>
        <input type="time" class="form-input m-start" value="09:30" required>
        <input type="time" class="form-input m-end" value="11:00" required>
      </div>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px;">
        <input type="text" class="form-input m-loc" placeholder="القاعة / المبنى (اختياري)">
        <select class="form-select m-type">
          <option value="in_person">وجاهي</option>
          <option value="online">عن بُعد</option>
        </select>
      </div>
      <label style="font-size:0.8rem; color:var(--color-muted); display:flex; align-items:center; gap:4px; margin-top:2px;">
        <input type="checkbox" class="m-is-lab"> هذا اللقاء مختبر / عملي إلزامي
      </label>
    `;
    cont.appendChild(div);
  }

  document.getElementById('btn-add-meeting-row')?.addEventListener('click', addMeetingRow);

  elements.sectionForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const rows = document.querySelectorAll('.meeting-input-row');
    const meetings = [];
    rows.forEach(r => {
      meetings.push({
        day: r.querySelector('.m-day').value,
        startTime: r.querySelector('.m-start').value,
        endTime: r.querySelector('.m-end').value,
        location: r.querySelector('.m-loc').value,
        type: r.querySelector('.m-type').value,
        isLab: r.querySelector('.m-is-lab').checked
      });
    });

    const res = store.addSection({
      courseId: document.getElementById('select-section-course').value,
      sectionNumber: document.getElementById('input-section-number').value,
      isPinned: document.getElementById('check-pin-section').checked,
      meetings: meetings
    });

    if (!res.success) {
      alert(res.error);
      return;
    }
    hideModal(elements.sectionModal);
    renderScheduleSectionsList();
    renderCourses();
  });

  // إضافة فترة ممنوعة
  elements.btnOpenAddBlocked?.addEventListener('click', () => {
    elements.blockedForm.reset();
    showModal(elements.blockedModal);
  });

  elements.blockedForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const res = store.addBlockedTime({
      title: document.getElementById('input-blocked-title').value,
      day: document.getElementById('select-blocked-day').value,
      startTime: document.getElementById('input-blocked-start').value,
      endTime: document.getElementById('input-blocked-end').value
    });
    if (!res.success) {
      alert(res.error);
      return;
    }
    hideModal(elements.blockedModal);
    renderBlockedTimes();
  });

  // مودال المادة والموضوع
  function openCourseModal(courseId = null) {
    elements.courseForm.reset();
    const checkboxes = elements.courseForm.querySelectorAll('input[name="course-majors"]');
    checkboxes.forEach(cb => cb.checked = false);
    showModal(elements.courseModal);
  }
  elements.openAddCourseBtn?.addEventListener('click', () => openCourseModal());
  elements.courseForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const majors = [];
    elements.courseForm.querySelectorAll('input[name="course-majors"]:checked').forEach(cb => majors.push(cb.value));
    const res = store.addCourse({
      name: document.getElementById('input-course-name').value,
      code: document.getElementById('input-course-code').value,
      hours: document.getElementById('input-course-hours').value,
      year: document.getElementById('select-course-year').value,
      semester: document.getElementById('select-course-semester').value,
      classification: document.getElementById('select-course-class').value,
      description: document.getElementById('input-course-desc').value,
      isCurrentSemester: document.getElementById('check-course-current').checked,
      isFavorite: document.getElementById('check-course-favorite').checked,
      majors
    });
    if (!res.success) { alert(res.error); return; }
    hideModal(elements.courseModal);
    renderCourses();
  });

  function confirmDeleteCourse(id) {
    const c = store.getCourse(id);
    if (!c) return;
    elements.deleteMessage.textContent = `هل أنت متأكد من حذف مادة "${c.name}"؟ سيتم حذف جميع شعبها ومصادرها وموضوعاتها نهائياً.`;
    deleteAction = () => {
      store.deleteCourse(id);
      renderCourses();
      checkSavedScheduleStatus();
      hideModal(elements.deleteModal);
    };
    showModal(elements.deleteModal);
  }
  elements.deleteConfirmBtn?.addEventListener('click', () => { if (deleteAction) deleteAction(); });

  // تهيئة عامة
  renderStudentProfile();
  renderCourses();
  renderScheduleCoursePicker();
  renderBlockedTimes();
  checkSavedScheduleStatus();

})();