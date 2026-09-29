/**
 * سند الطالب | SANAD — منطق الواجهة وتجربة المستخدم
 * المرحلة الثانية: تشغيل «تخصصي وموادي»، البحث الشامل، والمودالات
 */

(function () {
  'use strict';

  // التحقق من وجود وحدة التخزين
  const store = window.SanadStore;
  if (!store) {
    console.error('لم يتم تحميل وحدة التخزين SanadStore بنجاح.');
    return;
  }

  // تحميل البيانات والتحقق من حالتها
  const loadResult = store.load();

  // عناصر DOM الرئيسية
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
    
    // شريط أدوات المواد
    courseSearchInput: document.getElementById('course-search-input'),
    majorFilter: document.getElementById('major-filter'),
    yearFilter: document.getElementById('year-filter'),
    semesterFilter: document.getElementById('semester-filter'),
    classFilter: document.getElementById('class-filter'),
    onlyCurrentBtn: document.getElementById('filter-current-btn'),
    onlyFavBtn: document.getElementById('filter-fav-btn'),
    openAddCourseBtn: document.getElementById('btn-open-add-course'),
    
    // حاويات المواد
    coursesListView: document.getElementById('courses-list-view'),
    coursesGrid: document.getElementById('courses-grid'),
    courseDetailsView: document.getElementById('course-details-view'),
    
    // تفاصيل المادة
    backToCoursesBtn: document.getElementById('btn-back-to-courses'),
    detailCourseName: document.getElementById('detail-course-name'),
    detailCourseCode: document.getElementById('detail-course-code'),
    detailCourseHours: document.getElementById('detail-course-hours'),
    detailCourseClass: document.getElementById('detail-course-class'),
    detailCourseDesc: document.getElementById('detail-course-desc'),
    detailTopicsList: document.getElementById('detail-topics-list'),
    openEditCurrentCourseBtn: document.getElementById('btn-edit-current-course'),
    openAddTopicBtn: document.getElementById('btn-open-add-topic'),
    
    // النوافذ المنبثقة
    profileModal: document.getElementById('modal-profile'),
    profileForm: document.getElementById('form-profile'),
    courseModal: document.getElementById('modal-course'),
    courseForm: document.getElementById('form-course'),
    topicModal: document.getElementById('modal-topic'),
    topicForm: document.getElementById('form-topic'),
    resourceModal: document.getElementById('modal-resource'),
    resourceForm: document.getElementById('form-resource'),
    deleteModal: document.getElementById('modal-delete-confirm'),
    deleteConfirmBtn: document.getElementById('btn-confirm-delete'),
    deleteMessage: document.getElementById('delete-modal-message')
  };

  // الحالة المؤقتة لواجهة العرض
  let currentViewCourseId = null;
  let deleteAction = null;
  let activeFilters = {
    search: '',
    major: '',
    year: '',
    semester: '',
    classification: '',
    onlyCurrent: false,
    onlyFavorites: false
  };

  // تهيئة تنبيه التلف
  if (store.isCorrupted()) {
    if (elements.corruptedBanner && elements.corruptionMsg) {
      elements.corruptionMsg.textContent = store.getCorruptionDetails();
      elements.corruptedBanner.style.display = 'flex';
    }
  }

  // 1. إدارة قائمة الهاتف
  if (elements.menuToggle && elements.mainNav) {
    elements.menuToggle.addEventListener('click', () => {
      const isOpen = elements.mainNav.classList.toggle('is-open');
      elements.menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && elements.mainNav.classList.contains('is-open')) {
        elements.mainNav.classList.remove('is-open');
        elements.menuToggle.setAttribute('aria-expanded', 'false');
        elements.menuToggle.focus();
      }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        elements.mainNav.classList.remove('is-open');
        elements.menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 2. تحديث واجهة بطاقة الطالب
  function renderStudentProfile() {
    const student = store.getStudent();
    if (elements.studentGreeting) {
      elements.studentGreeting.textContent = student.firstName 
        ? `أهلاً بك، ${store.escapeHtml(student.firstName)}` 
        : 'مساحة دراستك في كلية الذكاء الاصطناعي';
    }

    if (elements.studentMajorBadge) {
      const majorObj = store.MAJORS.find(m => m.id === student.majorId);
      if (majorObj) {
        elements.studentMajorBadge.textContent = majorObj.name;
        elements.studentMajorBadge.style.display = 'inline-block';
      } else {
        elements.studentMajorBadge.style.display = 'none';
      }
    }

    if (elements.studentPlanBadge) {
      if (student.planYear) {
        elements.studentPlanBadge.textContent = `خطة سنة ${store.escapeHtml(student.planYear)}`;
        elements.studentPlanBadge.style.display = 'inline-block';
      } else {
        elements.studentPlanBadge.style.display = 'none';
      }
    }
  }

  // 3. البحث الشامل في الهيدر/الترحيب
  if (elements.globalSearchInput && elements.searchResultsPanel) {
    elements.globalSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      if (!q) {
        elements.searchResultsPanel.style.display = 'none';
        elements.searchResultsPanel.innerHTML = '';
        return;
      }

      const results = store.globalSearch(q);
      if (results.count === 0) {
        elements.searchResultsPanel.innerHTML = `
          <div class="search-empty">لم يتم العثور على أي مواد، موضوعات، أو مصادر تطابق "${store.escapeHtml(q)}"</div>
        `;
        elements.searchResultsPanel.style.display = 'block';
        return;
      }

      let html = '';

      if (results.courses.length > 0) {
        html += `<div class="search-category-title">المواد الدراسية (${results.courses.length})</div>`;
        results.courses.forEach(c => {
          html += `
            <div class="search-item" data-type="course" data-id="${c.id}">
              <div class="search-item-info">
                <span class="search-item-title">${store.escapeHtml(c.name)}</span>
                <span class="search-item-sub">${c.code ? store.escapeHtml(c.code) + ' — ' : ''}${store.CLASSIFICATIONS[c.classification] || ''}</span>
              </div>
              <span class="tag-badge">عرض المادة</span>
            </div>
          `;
        });
      }

      if (results.topics.length > 0) {
        html += `<div class="search-category-title">الموضوعات (${results.topics.length})</div>`;
        results.topics.forEach(t => {
          const status = store.TOPIC_STATUSES[t.status] || store.TOPIC_STATUSES.not_started;
          html += `
            <div class="search-item" data-type="topic" data-course-id="${t.courseId}">
              <div class="search-item-info">
                <span class="search-item-title">${store.escapeHtml(t.title)}</span>
                <span class="search-item-sub">مادة: ${store.escapeHtml(t.courseName)}</span>
              </div>
              <span class="status-badge ${status.color}">${status.label}</span>
            </div>
          `;
        });
      }

      if (results.resources.length > 0) {
        html += `<div class="search-category-title">المصادر (${results.resources.length})</div>`;
        results.resources.forEach(r => {
          const typeName = store.RESOURCE_TYPES[r.type] || 'مصدر';
          html += `
            <div class="search-item" data-type="resource" data-url="${store.escapeHtml(r.url)}">
              <div class="search-item-info">
                <span class="search-item-title">${store.escapeHtml(r.title)}</span>
                <span class="search-item-sub">${typeName} — ${store.escapeHtml(r.courseName)}</span>
              </div>
              <a href="${store.escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer" class="tag-badge">فتح الرابط</a>
            </div>
          `;
        });
      }

      elements.searchResultsPanel.innerHTML = html;
      elements.searchResultsPanel.style.display = 'block';
    });

    // التنقل عند النقر على نتائج البحث
    elements.searchResultsPanel.addEventListener('click', (e) => {
      const item = e.target.closest('.search-item');
      if (!item) return;

      const type = item.getAttribute('data-type');
      if (type === 'course') {
        const id = item.getAttribute('data-id');
        openCourseDetails(id);
      } else if (type === 'topic') {
        const cId = item.getAttribute('data-course-id');
        openCourseDetails(cId);
      } else if (type === 'resource') {
        const url = item.getAttribute('data-url');
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
      }

      elements.searchResultsPanel.style.display = 'none';
      elements.globalSearchInput.value = '';
    });

    // إغلاق قائمة البحث عند النقر بالخارج
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.global-search-wrapper')) {
        elements.searchResultsPanel.style.display = 'none';
      }
    });
  }

  // 4. تصيير قائمة المواد
  function renderCourses() {
    const allCourses = store.getCourses();

    // تطبيق المرشحات
    const filtered = allCourses.filter(c => {
      if (activeFilters.search) {
        const q = activeFilters.search.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchCode = c.code && c.code.toLowerCase().includes(q);
        if (!matchName && !matchCode) return false;
      }
      if (activeFilters.major && !c.majors.includes(activeFilters.major)) {
        return false;
      }
      if (activeFilters.year && c.year !== activeFilters.year) {
        return false;
      }
      if (activeFilters.semester && c.semester !== activeFilters.semester) {
        return false;
      }
      if (activeFilters.classification && c.classification !== activeFilters.classification) {
        return false;
      }
      if (activeFilters.onlyCurrent && !c.isCurrentSemester) {
        return false;
      }
      if (activeFilters.onlyFavorites && !c.isFavorite) {
        return false;
      }
      return true;
    });

    if (allCourses.length === 0) {
      elements.coursesGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <h3 class="empty-state-title">دليلك الدراسي فارغ حاليًا</h3>
          <p class="empty-state-desc">لم تقم بإضافة أي مواد بعد. يمكنك البدء بإضافة مواد خطتك الدراسية لتنظيم موضوعاتها ومصادرها ومتابعة إنجازك أولاً بأول.</p>
          <button type="button" class="btn btn-primary" id="btn-empty-add-course">+ أضف أول مادة</button>
        </div>
      `;
      const btn = document.getElementById('btn-empty-add-course');
      if (btn) btn.addEventListener('click', () => openCourseModal());
      return;
    }

    if (filtered.length === 0) {
      elements.coursesGrid.innerHTML = `
        <div class="empty-state">
          <h3 class="empty-state-title">لا توجد مواد تطابق خيارات التصفية</h3>
          <p class="empty-state-desc">جرّب تغيير كلمات البحث أو إعادة ضبط خيارات التصفية لعرض المواد.</p>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach(c => {
      const topics = store.getTopicsByCourse(c.id);
      const completedTopics = topics.filter(t => t.status === 'completed').length;
      const progressPercent = topics.length > 0 ? Math.round((completedTopics / topics.length) * 100) : 0;
      const classLabel = store.CLASSIFICATIONS[c.classification] || 'غير محدد';

      html += `
        <article class="course-card" data-id="${c.id}">
          <div>
            <div class="course-card-top">
              <span class="course-code">${c.code ? store.escapeHtml(c.code) : 'مادة'}</span>
              <div class="card-actions-quick">
                <button type="button" class="icon-btn ${c.isFavorite ? 'active-favorite' : ''}" title="${c.isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}" data-action="toggle-fav" data-id="${c.id}" aria-label="المفضلة">
                  ★
                </button>
                <button type="button" class="icon-btn ${c.isCurrentSemester ? 'active-semester' : ''}" title="${c.isCurrentSemester ? 'مادة في هذا الفصل' : 'تحديد كمادة هذا الفصل'}" data-action="toggle-sem" data-id="${c.id}" aria-label="مواد الفصل">
                  📅
                </button>
              </div>
            </div>

            <h3 class="course-title">${store.escapeHtml(c.name)}</h3>

            <div class="course-meta">
              <span class="badge-meta">${classLabel}</span>
              ${c.hours ? `<span class="badge-meta">${c.hours} ساعات</span>` : ''}
              ${c.year ? `<span class="badge-meta">السنة ${store.escapeHtml(c.year)}</span>` : ''}
              ${c.semester ? `<span class="badge-meta">الفصل ${store.escapeHtml(c.semester)}</span>` : ''}
            </div>

            <div class="course-progress-box">
              <div class="progress-label">
                <span>الإنجاز</span>
                <span>${completedTopics} من ${topics.length} موضوعات</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
              </div>
            </div>
          </div>

          <div class="course-card-footer">
            <button type="button" class="btn btn-secondary btn-sm" data-action="view-details" data-id="${c.id}">
              عرض التفاصيل والمحتوى
            </button>
            <div style="display: flex; gap: 4px;">
              <button type="button" class="icon-btn" title="تعديل المادة" data-action="edit-course" data-id="${c.id}" aria-label="تعديل">
                ✎
              </button>
              <button type="button" class="icon-btn" title="حذف المادة" data-action="delete-course" data-id="${c.id}" aria-label="حذف">
                🗑
              </button>
            </div>
          </div>
        </article>
      `;
    });

    elements.coursesGrid.innerHTML = html;
  }

  // أحداث التفاعل على بطاقات المواد
  if (elements.coursesGrid) {
    elements.coursesGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      const action = btn.getAttribute('data-action');
      const id = btn.getAttribute('data-id');

      if (action === 'toggle-fav') {
        store.toggleCourseFavorite(id);
        renderCourses();
      } else if (action === 'toggle-sem') {
        store.toggleCourseCurrentSemester(id);
        renderCourses();
      } else if (action === 'view-details') {
        openCourseDetails(id);
      } else if (action === 'edit-course') {
        openCourseModal(id);
      } else if (action === 'delete-course') {
        confirmDeleteCourse(id);
      }
    });
  }

  // 5. شاشة تفاصيل المادة
  function openCourseDetails(courseId) {
    const course = store.getCourse(courseId);
    if (!course) return;

    currentViewCourseId = courseId;
    elements.detailCourseName.textContent = course.name;
    elements.detailCourseCode.textContent = course.code || 'بدون رمز';
    elements.detailCourseHours.textContent = course.hours ? `${course.hours} ساعات معتمدة` : 'الساعات غير محددة';
    elements.detailCourseClass.textContent = store.CLASSIFICATIONS[course.classification] || 'غير محدد';
    elements.detailCourseDesc.textContent = course.description || 'لم يُضف وصف لهذه المادة بعد. يمكنك إضافة وصف مختصر وملاحظات عبر تعديل المادة.';

    renderCourseTopics(courseId);

    elements.coursesListView.style.display = 'none';
    elements.courseDetailsView.style.display = 'block';
    elements.courseDetailsView.scrollIntoView({ behavior: 'smooth' });
  }

  function renderCourseTopics(courseId) {
    const topics = store.getTopicsByCourse(courseId);
    if (topics.length === 0) {
      elements.detailTopicsList.innerHTML = `
        <div class="empty-state" style="padding: 2rem 1rem;">
          <h3 class="empty-state-title" style="font-size: 1.1rem;">لم يُضف محتوى لهذه المادة بعد</h3>
          <p class="empty-state-desc" style="font-size: 0.9rem;">أضف أول موضوع لتنظيم مادتك وإرفاق المراجع والملخصات الخاصة بها.</p>
          <button type="button" class="btn btn-primary btn-sm" id="btn-first-topic">+ أضف أول موضوع</button>
        </div>
      `;
      const btn = document.getElementById('btn-first-topic');
      if (btn) btn.addEventListener('click', () => openTopicModal(null, courseId));
      return;
    }

    let html = '';
    topics.forEach(t => {
      const statusObj = store.TOPIC_STATUSES[t.status] || store.TOPIC_STATUSES.not_started;
      const resources = store.getResourcesByTopic(t.id);

      html += `
        <div class="topic-card" data-topic-id="${t.id}">
          <div class="topic-card-header">
            <div>
              <h4 class="topic-title">${store.escapeHtml(t.title)}</h4>
              ${t.description ? `<p style="font-size:0.85rem; color:var(--color-muted); margin-top:4px;">${store.escapeHtml(t.description)}</p>` : ''}
            </div>
            <div class="topic-controls">
              <select class="filter-select" data-action="change-topic-status" data-topic-id="${t.id}" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;">
                <option value="not_started" ${t.status === 'not_started' ? 'selected' : ''}>لم أبدأ</option>
                <option value="in_progress" ${t.status === 'in_progress' ? 'selected' : ''}>قيد الدراسة</option>
                <option value="completed" ${t.status === 'completed' ? 'selected' : ''}>مكتمل</option>
                <option value="needs_review" ${t.status === 'needs_review' ? 'selected' : ''}>بحاجة مراجعة</option>
              </select>
              <button type="button" class="icon-btn" title="تعديل الموضوع" data-action="edit-topic" data-topic-id="${t.id}">✎</button>
              <button type="button" class="icon-btn" title="حذف الموضوع" data-action="delete-topic" data-topic-id="${t.id}">🗑</button>
            </div>
          </div>

          <div class="topic-resources">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span style="font-size:0.85rem; font-weight:bold; color:var(--color-muted);">المصادر والروابط (${resources.length})</span>
              <button type="button" class="btn btn-secondary btn-sm" style="font-size:0.75rem; padding:0.2rem 0.5rem;" data-action="add-resource-for-topic" data-topic-id="${t.id}">+ إضافة مصدر</button>
            </div>

            <div class="resources-list">
      `;

      if (resources.length === 0) {
        html += `<p style="font-size:0.8rem; color:var(--color-muted); font-style:italic;">لا توجد مصادر مضافة لهذا الموضوع بعد.</p>`;
      } else {
        resources.forEach(r => {
          const typeName = store.RESOURCE_TYPES[r.type] || 'مصدر';
          html += `
            <div class="resource-item">
              <div>
                <a href="${store.escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer" class="resource-link">
                  🔗 ${store.escapeHtml(r.title)}
                </a>
                <div class="resource-meta">
                  <span>${typeName}</span>
                  ${r.sourceName ? ` • <span>المصدر: ${store.escapeHtml(r.sourceName)}</span>` : ''}
                  ${r.updateDate ? ` • <span>تاريخ: ${store.escapeHtml(r.updateDate)}</span>` : ''}
                </div>
              </div>
              <button type="button" class="icon-btn" title="حذف المصدر" data-action="delete-resource" data-resource-id="${r.id}">✕</button>
            </div>
          `;
        });
      }

      html += `
            </div>
          </div>
        </div>
      `;
    });

    elements.detailTopicsList.innerHTML = html;
  }

  // أحداث التفاعل داخل شاشة تفاصيل المادة
  if (elements.detailTopicsList) {
    elements.detailTopicsList.addEventListener('change', (e) => {
      if (e.target.matches('[data-action="change-topic-status"]')) {
        const topicId = e.target.getAttribute('data-topic-id');
        const newStatus = e.target.value;
        store.updateTopic(topicId, { status: newStatus });
        renderCourses();
      }
    });

    elements.detailTopicsList.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      const action = btn.getAttribute('data-action');

      if (action === 'edit-topic') {
        const topicId = btn.getAttribute('data-topic-id');
        openTopicModal(topicId, currentViewCourseId);
      } else if (action === 'delete-topic') {
        const topicId = btn.getAttribute('data-topic-id');
        store.deleteTopic(topicId);
        renderCourseTopics(currentViewCourseId);
        renderCourses();
      } else if (action === 'add-resource-for-topic') {
        const topicId = btn.getAttribute('data-topic-id');
        openResourceModal(currentViewCourseId, topicId);
      } else if (action === 'delete-resource') {
        const resId = btn.getAttribute('data-resource-id');
        store.deleteResource(resId);
        renderCourseTopics(currentViewCourseId);
      }
    });
  }

  if (elements.backToCoursesBtn) {
    elements.backToCoursesBtn.addEventListener('click', () => {
      elements.courseDetailsView.style.display = 'none';
      elements.coursesListView.style.display = 'block';
      currentViewCourseId = null;
      renderCourses();
    });
  }

  if (elements.openEditCurrentCourseBtn) {
    elements.openEditCurrentCourseBtn.addEventListener('click', () => {
      if (currentViewCourseId) openCourseModal(currentViewCourseId);
    });
  }

  if (elements.openAddTopicBtn) {
    elements.openAddTopicBtn.addEventListener('click', () => {
      if (currentViewCourseId) openTopicModal(null, currentViewCourseId);
    });
  }

  // 6. أحداث شريط أدوات التصفية
  if (elements.courseSearchInput) {
    elements.courseSearchInput.addEventListener('input', (e) => {
      activeFilters.search = e.target.value;
      renderCourses();
    });
  }
  if (elements.majorFilter) {
    elements.majorFilter.addEventListener('change', (e) => {
      activeFilters.major = e.target.value;
      renderCourses();
    });
  }
  if (elements.yearFilter) {
    elements.yearFilter.addEventListener('change', (e) => {
      activeFilters.year = e.target.value;
      renderCourses();
    });
  }
  if (elements.semesterFilter) {
    elements.semesterFilter.addEventListener('change', (e) => {
      activeFilters.semester = e.target.value;
      renderCourses();
    });
  }
  if (elements.classFilter) {
    elements.classFilter.addEventListener('change', (e) => {
      activeFilters.classification = e.target.value;
      renderCourses();
    });
  }
  if (elements.onlyCurrentBtn) {
    elements.onlyCurrentBtn.addEventListener('click', () => {
      activeFilters.onlyCurrent = !activeFilters.onlyCurrent;
      elements.onlyCurrentBtn.classList.toggle('active', activeFilters.onlyCurrent);
      renderCourses();
    });
  }
  if (elements.onlyFavBtn) {
    elements.onlyFavBtn.addEventListener('click', () => {
      activeFilters.onlyFavorites = !activeFilters.onlyFavorites;
      elements.onlyFavBtn.classList.toggle('active', activeFilters.onlyFavorites);
      renderCourses();
    });
  }

  // 7. إدارة النوافذ المنبثقة (Modals)
  function showModal(modalEl) {
    if (!modalEl) return;
    modalEl.style.display = 'flex';
    const firstInput = modalEl.querySelector('input, select, textarea');
    if (firstInput) firstInput.focus();
  }

  function hideModal(modalEl) {
    if (!modalEl) return;
    modalEl.style.display = 'none';
  }

  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.matches('[data-dismiss="modal"]')) {
        hideModal(modal);
      }
    });
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hideModal(modal);
    });
  });

  // مودال الملف الشخصي
  if (elements.editProfileBtn) {
    elements.editProfileBtn.addEventListener('click', () => {
      const s = store.getStudent();
      document.getElementById('input-student-name').value = s.firstName || '';
      document.getElementById('select-student-major').value = s.majorId || '';
      document.getElementById('input-student-year').value = s.planYear || '';
      showModal(elements.profileModal);
    });
  }
  if (elements.profileForm) {
    elements.profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const res = store.setStudent({
        firstName: document.getElementById('input-student-name').value,
        majorId: document.getElementById('select-student-major').value,
        planYear: document.getElementById('input-student-year').value
      });
      if (!res.success) {
        alert(res.error);
        return;
      }
      renderStudentProfile();
      hideModal(elements.profileModal);
    });
  }

  // مودال المادة (إضافة / تعديل)
  let editingCourseId = null;
  function openCourseModal(courseId = null) {
    editingCourseId = courseId;
    const modalTitle = elements.courseModal.querySelector('.modal-title');
    elements.courseForm.reset();

    const checkboxes = elements.courseForm.querySelectorAll('input[name="course-majors"]');
    checkboxes.forEach(cb => cb.checked = false);

    if (courseId) {
      modalTitle.textContent = 'تعديل بيانات المادة';
      const course = store.getCourse(courseId);
      if (course) {
        document.getElementById('input-course-name').value = course.name;
        document.getElementById('input-course-code').value = course.code || '';
        document.getElementById('input-course-hours').value = course.hours || '';
        document.getElementById('select-course-year').value = course.year || '';
        document.getElementById('select-course-semester').value = course.semester || '';
        document.getElementById('select-course-class').value = course.classification || 'unspecified';
        document.getElementById('input-course-desc').value = course.description || '';
        document.getElementById('check-course-current').checked = course.isCurrentSemester;
        document.getElementById('check-course-favorite').checked = course.isFavorite;

        checkboxes.forEach(cb => {
          cb.checked = course.majors.includes(cb.value);
        });
      }
    } else {
      modalTitle.textContent = 'إضافة مادة جديدة';
      // تحديد تخصص الطالب تلقائياً في خانات الاختيار إن وجد
      const student = store.getStudent();
      if (student.majorId) {
        checkboxes.forEach(cb => {
          if (cb.value === student.majorId) cb.checked = true;
        });
      }
    }

    showModal(elements.courseModal);
  }

  if (elements.openAddCourseBtn) {
    elements.openAddCourseBtn.addEventListener('click', () => openCourseModal());
  }

  if (elements.courseForm) {
    elements.courseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const selectedMajors = [];
      elements.courseForm.querySelectorAll('input[name="course-majors"]:checked').forEach(cb => {
        selectedMajors.push(cb.value);
      });

      const courseData = {
        name: document.getElementById('input-course-name').value,
        code: document.getElementById('input-course-code').value,
        hours: document.getElementById('input-course-hours').value,
        year: document.getElementById('select-course-year').value,
        semester: document.getElementById('select-course-semester').value,
        classification: document.getElementById('select-course-class').value,
        description: document.getElementById('input-course-desc').value,
        isCurrentSemester: document.getElementById('check-course-current').checked,
        isFavorite: document.getElementById('check-course-favorite').checked,
        majors: selectedMajors
      };

      let res;
      if (editingCourseId) {
        res = store.updateCourse(editingCourseId, courseData);
      } else {
        res = store.addCourse(courseData);
      }

      if (!res.success) {
        alert(res.error);
        return;
      }

      hideModal(elements.courseModal);
      renderCourses();

      if (currentViewCourseId && currentViewCourseId === editingCourseId) {
        openCourseDetails(currentViewCourseId);
      }
    });
  }

  // مودال الموضوع (Topic)
  let editingTopicId = null;
  let targetCourseIdForTopic = null;
  function openTopicModal(topicId = null, courseId = null) {
    editingTopicId = topicId;
    targetCourseIdForTopic = courseId;
    elements.topicForm.reset();

    const titleEl = elements.topicModal.querySelector('.modal-title');

    if (topicId) {
      titleEl.textContent = 'تعديل الموضوع';
      const topic = store.getTopicsByCourse(courseId).find(t => t.id === topicId);
      if (topic) {
        document.getElementById('input-topic-title').value = topic.title;
        document.getElementById('input-topic-desc').value = topic.description || '';
        document.getElementById('select-topic-status').value = topic.status;
      }
    } else {
      titleEl.textContent = 'إضافة موضوع جديد للمادة';
    }

    showModal(elements.topicModal);
  }

  if (elements.topicForm) {
    elements.topicForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const topicData = {
        courseId: targetCourseIdForTopic,
        title: document.getElementById('input-topic-title').value,
        description: document.getElementById('input-topic-desc').value,
        status: document.getElementById('select-topic-status').value
      };

      let res;
      if (editingTopicId) {
        res = store.updateTopic(editingTopicId, topicData);
      } else {
        res = store.addTopic(topicData);
      }

      if (!res.success) {
        alert(res.error);
        return;
      }

      hideModal(elements.topicModal);
      if (currentViewCourseId) {
        renderCourseTopics(currentViewCourseId);
        renderCourses();
      }
    });
  }

  // مودال المصدر (Resource)
  let targetCourseIdForResource = null;
  let targetTopicIdForResource = null;
  function openResourceModal(courseId, topicId) {
    targetCourseIdForResource = courseId;
    targetTopicIdForResource = topicId;
    elements.resourceForm.reset();
    showModal(elements.resourceModal);
  }

  if (elements.resourceForm) {
    elements.resourceForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const resData = {
        courseId: targetCourseIdForResource,
        topicId: targetTopicIdForResource,
        title: document.getElementById('input-resource-title').value,
        type: document.getElementById('select-resource-type').value,
        url: document.getElementById('input-resource-url').value,
        sourceName: document.getElementById('input-resource-source').value,
        updateDate: document.getElementById('input-resource-date').value
      };

      const res = store.addResource(resData);
      if (!res.success) {
        alert(res.error);
        return;
      }

      hideModal(elements.resourceModal);
      if (currentViewCourseId) {
        renderCourseTopics(currentViewCourseId);
      }
    });
  }

  // نافذة تأكيد الحذف
  function confirmDeleteCourse(courseId) {
    const course = store.getCourse(courseId);
    if (!course) return;

    elements.deleteMessage.textContent = `هل أنت متأكد من رغبتك في حذف مادة "${course.name}"؟ تنبيه: سيؤدي الحذف إلى إزالة جميع الموضوعات والمصادر ومعدلات الإنجاز التابعة لها نهائيًا من هذا المتصفح.`;
    deleteAction = () => {
      store.deleteCourse(courseId);
      if (currentViewCourseId === courseId) {
        elements.courseDetailsView.style.display = 'none';
        elements.coursesListView.style.display = 'block';
        currentViewCourseId = null;
      }
      renderCourses();
      hideModal(elements.deleteModal);
    };
    showModal(elements.deleteModal);
  }

  if (elements.deleteConfirmBtn) {
    elements.deleteConfirmBtn.addEventListener('click', () => {
      if (deleteAction) deleteAction();
    });
  }

  // التهيئة الأولية للواجهة
  renderStudentProfile();
  renderCourses();

})();