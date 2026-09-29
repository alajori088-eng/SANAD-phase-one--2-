/**
 * سند الطالب | SANAD — منطق الواجهة وتجربة المستخدم
 * المرحلة الثالثة المحدثة: دمج القارئ البصري الذكي (OCR) ومحلل نصوص البوابة الجامعية
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

    // عناصر «رتّب دوامي»
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

    // خيارات القيود والتفضيلات
    earliestInput: document.getElementById('constraint-earliest'),
    latestInput: document.getElementById('constraint-latest'),
    travelBufferInput: document.getElementById('constraint-travel-buffer'),
    prefMinDays: document.getElementById('pref-min-days'),
    prefMinGaps: document.getElementById('pref-min-gaps'),
    prefDayOff: document.getElementById('pref-day-off'),
    blockedTimesList: document.getElementById('blocked-times-list'),
    btnOpenAddBlocked: document.getElementById('btn-open-add-blocked'),

    // عناصر الاستيراد الذكي (OCR ولصق النص)
    smartImportModal: document.getElementById('modal-smart-import'),
    smartImportCourseSelect: document.getElementById('smart-import-course-select'),
    tabBtnImage: document.getElementById('tab-btn-image'),
    tabBtnPaste: document.getElementById('tab-btn-paste'),
    importModeImage: document.getElementById('import-mode-image'),
    importModePaste: document.getElementById('import-mode-paste'),
    ocrDropzone: document.getElementById('ocr-dropzone'),
    ocrFileInput: document.getElementById('ocr-file-input'),
    ocrProgressBox: document.getElementById('ocr-progress-box'),
    ocrStatusText: document.getElementById('ocr-status-text'),
    ocrPercentageText: document.getElementById('ocr-percentage-text'),
    ocrProgressFill: document.getElementById('ocr-progress-fill'),
    smartPasteTextarea: document.getElementById('smart-paste-textarea'),
    btnParsePastedText: document.getElementById('btn-parse-pasted-text'),
    importPreviewSection: document.getElementById('import-preview-section'),
    parsedCountBadge: document.getElementById('parsed-count-badge'),
    parsedSectionsContainer: document.getElementById('parsed-sections-container'),
    btnConfirmSaveImported: document.getElementById('btn-confirm-save-imported'),

    // النوافذ المنبثقة
    profileModal: document.getElementById('modal-profile'),
    profileForm: document.getElementById('form-profile'),
    courseModal: document.getElementById('modal-course'),
    courseForm: document.getElementById('form-course'),
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
  let currentGeneratedSchedules = [];
  let currentActiveScheduleIndex = 0;
  let stagedParsedSections = [];

  // تنبيه تلف البيانات
  if (store.isCorrupted() && elements.corruptedBanner && elements.corruptionMsg) {
    elements.corruptionMsg.textContent = store.getCorruptionDetails();
    elements.corruptedBanner.style.display = 'flex';
  }

  // إدارة النوافذ المنبثقة
  function showModal(m) {
    if (!m) return;
    m.style.display = 'flex';
  }

  function hideModal(m) {
    if (!m) return;
    m.style.display = 'none';
  }

  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('[data-dismiss="modal"]')) {
        hideModal(modal);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop').forEach(m => hideModal(m));
    }
  });

  // قائمة الهاتف
  if (elements.menuToggle && elements.mainNav) {
    elements.menuToggle.addEventListener('click', () => {
      const isOpen = elements.mainNav.classList.toggle('is-open');
      elements.menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // بيانات الطالب
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
      firstName: document.getElementById('input-student-name')?.value || '',
      majorId: document.getElementById('select-student-major')?.value || '',
      planYear: document.getElementById('input-student-year')?.value || ''
    });
    renderStudentProfile();
    hideModal(elements.profileModal);
  });

  // -------------------------------------------------------------
  // محرك التحليل الذكي لنصوص وأوقات الجامعات (Jordanian Universities Parser)
  // -------------------------------------------------------------

  function parseUniversityScheduleText(rawText) {
    if (!rawText || typeof rawText !== 'string') return [];

    // تنظيف الأسطر وتوحيد الأرقام والرموز
    const clean = rawText
      .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)) // تحويل الأرقام الهندية للعربية القياسية
      .replace(/[ـ_]/g, ' ')
      .replace(/[\r\n]+/g, '\n');

    const lines = clean.split('\n');
    const sections = [];
    let currentSecNum = 1;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.length < 5) return;

      // 1. استخراج الأوقات بنظام (HH:MM - HH:MM)
      const timeRegex = /(\d{1,2})[:.](\d{2})\s*(?:-|–|إلى|to)\s*(\d{1,2})[:.](\d{2})/i;
      const timeMatch = trimmed.match(timeRegex);
      if (!timeMatch) return;

      let startH = parseInt(timeMatch[1], 10);
      const startM = timeMatch[2];
      let endH = parseInt(timeMatch[3], 10);
      const endM = timeMatch[4];

      // معالجة الأوقات بنظام 12 ساعة (مثلاً 01:00 إلى 02:30 تعني بعد الظهر)
      if (startH >= 1 && startH <= 7) startH += 12;
      if (endH >= 1 && endH <= 7) endH += 12;
      if (endH < startH) endH += 12;

      const formattedStart = `${String(startH).padStart(2, '0')}:${startM}`;
      const formattedEnd = `${String(endH).padStart(2, '0')}:${endM}`;

      // 2. استخراج الأيام (دعم أنماط الجامعات: ح ث خ / ن ر / الأيام المكتوبة)
      const days = [];
      const lower = trimmed.toLowerCase();

      if (/ح\s*ث\s*خ/i.test(trimmed) || /أحد\s*ثلاثاء\s*خميس/i.test(trimmed)) {
        days.push('sun', 'tue', 'thu');
      } else if (/ن\s*ر/i.test(trimmed) || /إثنين\s*أربعاء/i.test(trimmed) || /اثنين\s*اربعاء/i.test(trimmed)) {
        days.push('mon', 'wed');
      } else {
        if (/أحد|احد/i.test(trimmed)) days.push('sun');
        if (/إثنين|اثنين/i.test(trimmed)) days.push('mon');
        if (/ثلاثاء/i.test(trimmed)) days.push('tue');
        if (/أربعاء|اربعاء/i.test(trimmed)) days.push('wed');
        if (/خميس/i.test(trimmed)) days.push('thu');
      }

      if (days.length === 0) {
        // افتراض الأحد والثلاثاء والخميس إن لم يُذكر لتفادي ضياع الوقت
        days.push('sun', 'tue', 'thu');
      }

      // 3. فحص ما إذا كان اللقاء مختبراً أو تدريباً عملياً
      const isLab = /مختبر|عملي|lab/i.test(trimmed);

      // 4. استخراج رقم الشعبة إن وُجد، أو ترقيمه تلقائياً
      const secMatch = trimmed.match(/شعبة\s*[:#-]?\s*(\d+)/i) || trimmed.match(/sec(?:tion)?\s*[:#-]?\s*(\d+)/i);
      let secNumber = secMatch ? secMatch[1] : String(currentSecNum++);

      // 5. استخراج القاعة أو المبنى
      let location = '';
      const locMatch = trimmed.match(/(?:قاعة|مبنى|مختبر|مدرج)\s*([A-Za-z0-9\u0600-\u06FF\s]+)/i);
      if (locMatch) {
        location = locMatch[0].trim().slice(0, 25);
      }

      // تجهيز كائن اللقاءات للشعبة
      const meetings = days.map(d => ({
        day: d,
        startTime: formattedStart,
        endTime: formattedEnd,
        location: location,
        type: /عن\s*بُعد|اونلاين|online/i.test(trimmed) ? 'online' : 'in_person',
        isLab: isLab
      }));

      sections.push({
        tempId: 'tmp_' + Math.random().toString(36).substr(2, 6),
        sectionNumber: secNumber,
        isPinned: false,
        meetings: meetings
      });
    });

    return sections;
  }

  // -------------------------------------------------------------
  // منطق نافذة الاستيراد الذكي (OCR والتصوير واللصق)
  // -------------------------------------------------------------

  elements.btnOpenSmartImport?.addEventListener('click', () => {
    const courses = store.getCourses();
    if (!courses || courses.length === 0) {
      alert('تنبيه: أضيفي مادة دراسية أولاً في قسم "تخصصي وموادي" لكي تستوردي الشعب لها.');
      openCourseModal();
      return;
    }

    if (elements.smartImportCourseSelect) {
      elements.smartImportCourseSelect.innerHTML = courses.map(c => `
        <option value="${c.id}">${store.escapeHtml(c.name)} ${c.code ? `(${store.escapeHtml(c.code)})` : ''}</option>
      `).join('');
    }

    stagedParsedSections = [];
    renderParsedSectionsPreview();
    if (elements.ocrProgressBox) elements.ocrProgressBox.style.display = 'none';
    if (elements.smartPasteTextarea) elements.smartPasteTextarea.value = '';
    showModal(elements.smartImportModal);
  });

  // التبديل بين تبويب الصورة وتبويب النص
  elements.tabBtnImage?.addEventListener('click', () => {
    elements.tabBtnImage.classList.add('active');
    elements.tabBtnPaste.classList.remove('active');
    elements.importModeImage.style.display = 'block';
    elements.importModePaste.style.display = 'none';
  });

  elements.tabBtnPaste?.addEventListener('click', () => {
    elements.tabBtnPaste.classList.add('active');
    elements.tabBtnImage.classList.remove('active');
    elements.importModePaste.style.display = 'block';
    elements.importModeImage.style.display = 'none';
  });

  // معالجة اللصق السريع للنص
  elements.btnParsePastedText?.addEventListener('click', () => {
    const text = elements.smartPasteTextarea.value.trim();
    if (!text) {
      alert('الرجاء لصق نص من جدول التسجيل أولاً.');
      return;
    }

    const parsed = parseUniversityScheduleText(text);
    if (parsed.length === 0) {
      alert('لم يتم التعرف على أي أوقات شعب في النص المنسوخ. تأكدي من احتوائه على الأوقات مثل: 09:30 - 11:00');
      return;
    }

    stagedParsedSections = parsed;
    renderParsedSectionsPreview();
  });

  // معالجة اختيار أو سحب الصورة للـ OCR
  elements.ocrDropzone?.addEventListener('click', () => {
    elements.ocrFileInput.click();
  });

  elements.ocrDropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.ocrDropzone.classList.add('dragover');
  });

  elements.ocrDropzone?.addEventListener('dragleave', () => {
    elements.ocrDropzone.classList.remove('dragover');
  });

  elements.ocrDropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.ocrDropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleOcrImage(e.dataTransfer.files[0]);
    }
  });

  elements.ocrFileInput?.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleOcrImage(e.target.files[0]);
    }
  });

  // تشغيل القارئ البصري المحلي (Tesseract.js)
  async function handleOcrImage(file) {
    if (!window.Tesseract) {
      alert('تعذر تحميل محرك القراءة البصري. يمكنكِ التبديل لتبويب "📋 لصق نص الجدول" ونسخ النص من البوابة مباشرة دون مشاكل.');
      return;
    }

    elements.ocrProgressBox.style.display = 'block';
    elements.ocrStatusText.textContent = 'جارٍ تشغيل الماسح الضوئي وقراءة الأرقام...';
    elements.ocrPercentageText.textContent = '0%';
    elements.ocrProgressFill.style.width = '0%';

    try {
      const result = await window.Tesseract.recognize(
        file,
        'ara+eng', // يدعم قراءة النصوص العربية وأرقام ورموز الساعات بالإنجليزية
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              const p = Math.round((m.progress || 0) * 100);
              elements.ocrPercentageText.textContent = `${p}%`;
              elements.ocrProgressFill.style.width = `${p}%`;
              elements.ocrStatusText.textContent = `جارٍ استخراج وتفكيك نصوص الجدول (${p}%)...`;
            }
          }
        }
      );

      elements.ocrStatusText.textContent = 'اكتمل التحليل!';
      const extractedText = result.data.text;
      const parsed = parseUniversityScheduleText(extractedText);

      if (parsed.length === 0) {
        alert('تمت قراءة الصورة بنجاح ولكن لم يتم العثور على أوقات بصيغة واضحة (مثل: 09:30 - 11:00). يُرجى التأكد من وضوح أرقام الأوقات في لقطة الشاشة أو استخدام خيار اللصق السريع.');
        return;
      }

      stagedParsedSections = parsed;
      renderParsedSectionsPreview();

    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء قراءة الصورة. يمكنك استخدام تبويب "لصق نص الجدول" كبديل سريع ومباشر.');
    }
  }

  // عرض المعاينة للشعب المستخرجة وتأكيدها
  function renderParsedSectionsPreview() {
    if (!elements.importPreviewSection || !elements.parsedSectionsContainer) return;

    if (stagedParsedSections.length === 0) {
      elements.importPreviewSection.style.display = 'none';
      elements.btnConfirmSaveImported.style.display = 'none';
      return;
    }

    elements.importPreviewSection.style.display = 'block';
    elements.btnConfirmSaveImported.style.display = 'inline-flex';
    elements.parsedCountBadge.textContent = `${stagedParsedSections.length} شعبة مستخرجة`;

    elements.parsedSectionsContainer.innerHTML = stagedParsedSections.map((sec, idx) => {
      const meetDesc = sec.meetings.map(m => {
        const dayName = store.DAYS.find(d => d.id === m.day)?.name || m.day;
        return `${dayName} (${m.startTime}-${m.endTime})${m.isLab ? ' [مختبر]' : ''}`;
      }).join(' • ');

      return `
        <div class="parsed-preview-item" data-tmp-id="${sec.tempId}">
          <div>
            <strong>شعبة: </strong>
            <input type="text" class="form-input" value="${store.escapeHtml(sec.sectionNumber)}" style="width: 60px; padding: 2px 6px; font-size: 0.8rem; display: inline-block;" data-action="edit-parsed-num" data-idx="${idx}">
            <span style="color: var(--color-muted); font-size: 0.8rem; margin-right: 8px;">${store.escapeHtml(meetDesc)}</span>
          </div>
          <button type="button" class="icon-btn" data-action="remove-parsed-row" data-idx="${idx}" style="color: var(--color-danger);" title="حذف هذا السطر">✕</button>
        </div>`;
    }).join('');
  }

  // أحداث التعديل والحذف في المعاينة
  elements.parsedSectionsContainer?.addEventListener('input', (e) => {
    if (e.target.matches('[data-action="edit-parsed-num"]')) {
      const idx = parseInt(e.target.getAttribute('data-idx'), 10);
      if (stagedParsedSections[idx]) {
        stagedParsedSections[idx].sectionNumber = e.target.value.trim();
      }
    }
  });

  elements.parsedSectionsContainer?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="remove-parsed-row"]');
    if (!btn) return;
    const idx = parseInt(btn.getAttribute('data-idx'), 10);
    stagedParsedSections.splice(idx, 1);
    renderParsedSectionsPreview();
  });

  // حفظ جميع الشعب المستخرجة للمادة دفعة واحدة بنقرة زر
  elements.btnConfirmSaveImported?.addEventListener('click', () => {
    const courseId = elements.smartImportCourseSelect.value;
    if (!courseId) {
      alert('يرجى اختيار المادة المراد إضافة الشعب لها.');
      return;
    }

    if (stagedParsedSections.length === 0) return;

    let addedCount = 0;
    stagedParsedSections.forEach(sec => {
      const res = store.addSection({
        courseId: courseId,
        sectionNumber: sec.sectionNumber || '1',
        isPinned: sec.isPinned,
        meetings: sec.meetings
      });
      if (res.success) addedCount++;
    });

    hideModal(elements.smartImportModal);
    renderScheduleSectionsList();
    renderCourses();
    checkSavedScheduleStatus();
    alert(`تمت إضافة ${addedCount} شعبة بنجاح إلى المادة المختارة!`);
  });

  // -------------------------------------------------------------
  // إدارة الشعب اليدوية والمواد
  // -------------------------------------------------------------

  elements.btnOpenAddSection?.addEventListener('click', () => {
    const courses = store.getCourses();
    if (!courses || courses.length === 0) {
      alert('تنبيه: يجب إضافة مادة دراسية واحدة على الأقل أولاً لكي تتمكني من ربط الشعبة ومواعيدها بها.');
      openCourseModal();
      return;
    }

    const select = document.getElementById('select-section-course');
    if (select) {
      select.innerHTML = courses.map(c => `<option value="${c.id}">${store.escapeHtml(c.name)}</option>`).join('');
    }

    elements.sectionForm?.reset();
    const cont = document.getElementById('meetings-rows-container');
    if (cont) {
      cont.innerHTML = '';
      addMeetingRow();
    }
    showModal(elements.sectionModal);
  });

  function addMeetingRow() {
    const cont = document.getElementById('meetings-rows-container');
    if (!cont) return;
    const idx = cont.children.length;
    const div = document.createElement('div');
    div.className = 'meeting-input-row';
    div.style.cssText = 'background:var(--color-bg); border:1px solid var(--color-border); padding:8px; border-radius:6px; margin-bottom:8px; display:flex; flex-direction:column; gap:6px;';
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.8rem; font-weight:bold; color:var(--color-accent);">لقاء (${idx + 1})</span>
        ${idx > 0 ? `<button type="button" class="btn btn-danger btn-sm" data-action="remove-row" style="padding:2px 6px; font-size:0.75rem;">حذف اللقاء</button>` : ''}
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

    div.querySelector('[data-action="remove-row"]')?.addEventListener('click', () => div.remove());
    cont.appendChild(div);
  }

  document.getElementById('btn-add-meeting-row')?.addEventListener('click', addMeetingRow);

  elements.sectionForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const rows = document.querySelectorAll('.meeting-input-row');
    const meetings = [];
    rows.forEach(r => {
      const day = r.querySelector('.m-day')?.value;
      const start = r.querySelector('.m-start')?.value;
      const end = r.querySelector('.m-end')?.value;
      const loc = r.querySelector('.m-loc')?.value || '';
      const type = r.querySelector('.m-type')?.value || 'in_person';
      const isLab = r.querySelector('.m-is-lab')?.checked || false;
      if (day && start && end) {
        meetings.push({ day, startTime: start, endTime: end, location: loc, type, isLab });
      }
    });

    const res = store.addSection({
      courseId: document.getElementById('select-section-course')?.value,
      sectionNumber: document.getElementById('input-section-number')?.value,
      isPinned: document.getElementById('check-pin-section')?.checked || false,
      meetings
    });

    if (!res.success) {
      alert(res.error);
      return;
    }
    hideModal(elements.sectionModal);
    renderScheduleSectionsList();
    renderCourses();
  });

  // عرض بطاقات المواد والشعب
  function renderCourses() {
    const allCourses = store.getCourses();
    if (!elements.coursesGrid) return;

    if (allCourses.length === 0) {
      elements.coursesGrid.innerHTML = `
        <div class="empty-state">
          <h3 class="empty-state-title">دليلك الدراسي فارغ حاليًا</h3>
          <p class="empty-state-desc">أضف أول مادة دراسية للبدء بتنظيم شعبها ومصادرها ومواعيد الدوام.</p>
          <button type="button" class="btn btn-primary" id="btn-empty-add-course">+ أضف أول مادة</button>
        </div>`;
      document.getElementById('btn-empty-add-course')?.addEventListener('click', () => openCourseModal());
      renderScheduleCoursePicker();
      return;
    }

    let html = '';
    allCourses.forEach(c => {
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
              <span class="badge-meta" style="color:var(--color-primary);">${sections.length} شُعب متاحة</span>
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

  function renderScheduleCoursePicker() {
    const courses = store.getCourses();
    if (!elements.coursePickerList) return;

    if (courses.length === 0) {
      elements.coursePickerList.innerHTML = '<p style="color:var(--color-muted); font-size:0.85rem;">لا توجد مواد مضافة بعد. أضيفي موادك أولاً من قسم "تخصصي وموادي" بالأسفل.</p>';
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
      elements.sectionsManagerList.innerHTML = '<p style="color:var(--color-muted); font-size:0.85rem;">لم تُضف أي شعب بعد. استخدمي زر التصوير الذكي 📷 أو الإضافة اليدوية بالأعلى.</p>';
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

  // توليد الجداول
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

    store.setSchedulePreferences({
      minimizeDays: elements.prefMinDays?.checked ?? true,
      minimizeGaps: elements.prefMinGaps?.checked ?? true,
      preferredDayOff: elements.prefDayOff?.value || ''
    });

    const selectedCourseIds = [];
    document.querySelectorAll('input[name="schedule-course-select"]:checked').forEach(cb => {
      selectedCourseIds.push(cb.value);
    });

    if (elements.conflictReportBox) elements.conflictReportBox.style.display = 'none';
    if (elements.scheduleResultsContainer) elements.scheduleResultsContainer.style.display = 'none';

    const result = store.generateSchedules(selectedCourseIds);

    if (!result.success) {
      if (elements.conflictReportBox) {
        elements.conflictReportBox.style.display = 'block';
        if (result.noSolution) {
          elements.conflictReportBox.innerHTML = `
            <h4>⚠ تعذر تكوين جدول متوافق</h4>
            <p style="color:#FECACA; font-size:0.9rem; margin-bottom:8px;">تم رصد التعارضات التالية:</p>
            <ul class="conflict-list">
              ${result.conflicts.map(c => `<li>${store.escapeHtml(c)}</li>`).join('')}
            </ul>`;
        } else {
          elements.conflictReportBox.innerHTML = `<h4>⚠️ تنبيه</h4><p style="color:#FECACA;">${store.escapeHtml(result.error)}</p>`;
        }
      }
      return;
    }

    currentGeneratedSchedules = result.schedules;
    currentActiveScheduleIndex = 0;
    renderScheduleResults();
    if (elements.scheduleResultsContainer) {
      elements.scheduleResultsContainer.style.display = 'block';
      elements.scheduleResultsContainer.scrollIntoView({ behavior: 'smooth' });
    }
  });

  function renderScheduleResults() {
    if (currentGeneratedSchedules.length === 0 || !elements.scheduleTabsContainer) return;

    elements.scheduleTabsContainer.innerHTML = currentGeneratedSchedules.map((s, idx) => `
      <button type="button" class="tab-btn ${idx === currentActiveScheduleIndex ? 'active' : ''}" data-tab-idx="${idx}">
        الجدول المقترح (${idx + 1}) ${idx === 0 ? '★ الأنسب' : ''}
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

    const daysStr = schedule.attendanceDayNames.join('، ');
    const hoursGap = (schedule.totalGapMinutes / 60).toFixed(1);
    if (elements.scheduleMetricsPills) {
      elements.scheduleMetricsPills.innerHTML = `
        <div class="metric-pill">📅 <strong>أيام الدوام:</strong> ${schedule.attendanceDaysCount} أيام (${store.escapeHtml(daysStr)})</div>
        <div class="metric-pill">⏳ <strong>مجموع الفراغات:</strong> ${schedule.totalGapMinutes} دقيقة (${hoursGap} ساعة)</div>
      `;
    }

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
    if (elements.timetableGridBody) elements.timetableGridBody.innerHTML = desktopHtml;

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
    if (elements.timetableMobileList) elements.timetableMobileList.innerHTML = mobileHtml;
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
      if (elements.savedScheduleWarning) elements.savedScheduleWarning.style.display = 'none';
      return;
    }
    if (elements.savedScheduleWarning) {
      elements.savedScheduleWarning.style.display = store.isSavedScheduleOutdated() ? 'flex' : 'none';
    }
  }

  // إضافة وحذف مادة
  function openCourseModal() {
    if (elements.courseForm) elements.courseForm.reset();
    showModal(elements.courseModal);
  }

  elements.openAddCourseBtn?.addEventListener('click', () => openCourseModal());

  elements.courseForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const res = store.addCourse({
      name: document.getElementById('input-course-name')?.value,
      code: document.getElementById('input-course-code')?.value,
      hours: document.getElementById('input-course-hours')?.value,
      year: document.getElementById('select-course-year')?.value,
      semester: document.getElementById('select-course-semester')?.value,
      classification: document.getElementById('select-course-class')?.value,
      description: document.getElementById('input-course-desc')?.value,
      isCurrentSemester: document.getElementById('check-course-current')?.checked,
      isFavorite: document.getElementById('check-course-favorite')?.checked
    });
    if (!res.success) { alert(res.error); return; }
    hideModal(elements.courseModal);
    renderCourses();
  });

  function confirmDeleteCourse(id) {
    const c = store.getCourse(id);
    if (!c) return;
    elements.deleteMessage.textContent = `هل أنت متأكد من حذف مادة "${c.name}"؟`;
    deleteAction = () => {
      store.deleteCourse(id);
      renderCourses();
      checkSavedScheduleStatus();
      hideModal(elements.deleteModal);
    };
    showModal(elements.deleteModal);
  }

  elements.deleteConfirmBtn?.addEventListener('click', () => {
    if (deleteAction) deleteAction();
  });

  // فترات ممنوعة
  elements.btnOpenAddBlocked?.addEventListener('click', () => {
    elements.blockedForm?.reset();
    showModal(elements.blockedModal);
  });

  elements.blockedForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const res = store.addBlockedTime({
      title: document.getElementById('input-blocked-title')?.value,
      day: document.getElementById('select-blocked-day')?.value,
      startTime: document.getElementById('input-blocked-start')?.value,
      endTime: document.getElementById('input-blocked-end')?.value
    });
    if (!res.success) { alert(res.error); return; }
    hideModal(elements.blockedModal);
    renderBlockedTimes();
  });

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

  // تهيئة عامة
  renderStudentProfile();
  renderCourses();
  renderScheduleCoursePicker();
  renderBlockedTimes();
  checkSavedScheduleStatus();

})();