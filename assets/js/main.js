/**
 * سند الطالب | SANAD — منطق الواجهة وتجربة المستخدم
 * المرحلة الثالثة: استيراد ذكي مجاني 100% (تحسين تباين الصور محلياً + لصق فوري) وتوليد تلقائي
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

    // البحث والمواد
    globalSearchInput: document.getElementById('global-search-input'),
    searchResultsPanel: document.getElementById('search-results-panel'),
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
    openAddCourseBtn: document.getElementById('btn-open-add-course'),

    // عناصر «رتّب دوامي»
    savedScheduleWarning: document.getElementById('saved-schedule-outdated-alert'),
    coursePickerList: document.getElementById('schedule-course-picker'),
    sectionsManagerList: document.getElementById('schedule-sections-list'),
    btnOpenAddSection: document.getElementById('btn-open-add-section'),
    btnOpenSmartImport: document.getElementById('btn-open-smart-import'),
    btnHeroSmartImport: document.getElementById('btn-hero-smart-import'),
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

    // قيود وتفضيلات
    earliestInput: document.getElementById('constraint-earliest'),
    latestInput: document.getElementById('constraint-latest'),
    travelBufferInput: document.getElementById('constraint-travel-buffer'),
    prefMinDays: document.getElementById('pref-min-days'),
    prefMinGaps: document.getElementById('pref-min-gaps'),
    prefDayOff: document.getElementById('pref-day-off'),
    blockedTimesList: document.getElementById('blocked-times-list'),
    btnOpenAddBlocked: document.getElementById('btn-open-add-blocked'),

    // عناصر الاستيراد الذكي المجاني
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

  let currentGeneratedSchedules = [];
  let currentActiveScheduleIndex = 0;
  let stagedExtractedData = [];
  let deleteAction = null;

  // إدارة النوافذ المنبثقة
  function showModal(m) { if (m) m.style.display = 'flex'; }
  function hideModal(m) { if (m) m.style.display = 'none'; }

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

  // -------------------------------------------------------------
  // محرك التحليل والتفكيك لنصوص جداول الجامعات الأردنية (Parser)
  // -------------------------------------------------------------

  function parseUniversityScheduleRaw(rawText) {
    if (!rawText || typeof rawText !== 'string') return [];

    // تنظيف الأرقام والرموز
    const clean = rawText
      .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
      .replace(/[ـ_]/g, ' ')
      .replace(/[\r\n]+/g, '\n');

    const lines = clean.split('\n');
    const results = [];
    let currentAutoCourseIndex = 1;
    let fallbackCourseName = '';

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.length < 5) return;

      // 1. استخراج الوقت (HH:MM - HH:MM)
      const timeRegex = /(\d{1,2})[:.](\d{2})\s*(?:-|–|إلى|to)\s*(\d{1,2})[:.](\d{2})/i;
      const timeMatch = trimmed.match(timeRegex);
      if (!timeMatch) return;

      let startH = parseInt(timeMatch[1], 10);
      const startM = timeMatch[2];
      let endH = parseInt(timeMatch[3], 10);
      const endM = timeMatch[4];

      // تحويل أوقات ما بعد الظهر بنظام 12 ساعة تلقائياً (مثلاً 01:00 إلى 02:30 تصبح 13:00 إلى 14:30)
      if (startH >= 1 && startH <= 7) startH += 12;
      if (endH >= 1 && endH <= 7) endH += 12;
      if (endH < startH) endH += 12;

      const formattedStart = `${String(startH).padStart(2, '0')}:${startM}`;
      const formattedEnd = `${String(endH).padStart(2, '0')}:${endM}`;

      // 2. استخراج الأيام (ح ث خ / ن ر / الأيام المكتوبة)
      const days = [];
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
        days.push('sun', 'tue', 'thu'); // الافتراضي إن لم يُذكر
      }

      // 3. فحص ما إذا كان اللقاء مختبراً
      const isLab = /مختبر|عملي|lab/i.test(trimmed);

      // 4. استخراج اسم المادة ورقم الشعبة
      let courseName = '';
      const courseMatch = trimmed.match(/([^\d\t–-]+(?:ذكاء|بيانات|أمن|برمجة|حاسوب|رياضيات|فيزياء|نظم|شبكات|هندسة|علم|[A-Za-z\u0600-\u06FF\s]+))/i);
      
      const beforeTime = trimmed.split(timeMatch[0])[0].trim();
      const words = beforeTime.split(/\s+/).filter(w => !/^\d+$/.test(w) && !/ح|ث|خ|ن|ر/.test(w));
      
      if (words.length > 0) {
        courseName = words.slice(0, 4).join(' ');
      } else {
        if (!fallbackCourseName) {
          fallbackCourseName = `مادة دراسية (${currentAutoCourseIndex++})`;
        }
        courseName = fallbackCourseName;
      }

      const secMatch = trimmed.match(/شعبة\s*[:#-]?\s*(\d+)/i) || trimmed.match(/\b(\d{1,2})\b/);
      const secNumber = secMatch ? secMatch[1] : '1';

      results.push({
        courseName: courseName.trim(),
        sectionNumber: secNumber,
        meetings: days.map(d => ({
          day: d,
          startTime: formattedStart,
          endTime: formattedEnd,
          location: isLab ? 'المختبر' : 'قاعة جامعية',
          type: /عن\s*بُعد|اونلاين|online/i.test(trimmed) ? 'online' : 'in_person',
          isLab: isLab
        }))
      });
    });

    return results;
  }

  // -------------------------------------------------------------
  // منطق الاستيراد الذكي (اللصق الفوري + تحسين تباين الصور بالكانفاس)
  // -------------------------------------------------------------

  function openSmartImportModal() {
    stagedExtractedData = [];
    renderParsedPreview();
    if (elements.ocrProgressBox) elements.ocrProgressBox.style.display = 'none';
    if (elements.smartPasteTextarea) elements.smartPasteTextarea.value = '';
    showModal(elements.smartImportModal);
  }

  elements.btnOpenSmartImport?.addEventListener('click', openSmartImportModal);
  elements.btnHeroSmartImport?.addEventListener('click', openSmartImportModal);

  // التبديل بين اللصق ورفع الصورة
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

  // تحليل النص المنسوخ (فوري)
  elements.btnParsePastedText?.addEventListener('click', () => {
    const text = elements.smartPasteTextarea.value.trim();
    if (!text) {
      alert('الرجاء لصق نص أسطر الجدول من بوابة التسجيل أولاً.');
      return;
    }
    const extracted = parseUniversityScheduleRaw(text);
    if (extracted.length === 0) {
      alert('لم يتم العثور على أوقات واضحة في النص. تأكدي من احتوائه على أوقات المحاضرات مثل: 09:30 - 11:00');
      return;
    }
    stagedExtractedData = extracted;
    renderParsedPreview();
  });

  // معالجة الصورة وفلترة التباين عبر HTML5 Canvas
  elements.ocrDropzone?.addEventListener('click', () => {
    elements.ocrFileInput.click();
  });

  elements.ocrFileInput?.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      enhanceAndScanImage(e.target.files[0]);
    }
  });

  async function enhanceAndScanImage(file) {
    if (!window.Tesseract) {
      alert('محرك القراءة جارٍ تجهيزه. يمكنكِ استخدام خيار "📋 لصق نص الجدول" فهو فوري وأدق بنسبة 100%.');
      return;
    }

    elements.ocrProgressBox.style.display = 'block';
    elements.ocrStatusText.textContent = 'جارٍ مضاعفة تباين الصورة وتحسين وضوح الأرقام...';
    elements.ocrPercentageText.textContent = '10%';
    elements.ocrProgressFill.style.width = '10%';

    // فلترة الصورة عبر Canvas لزيادة وضوح الحروف الداكنة وإزالة الخلفيات الباهتة
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = async () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // تطبيق فلتر التباين والرمادي
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        // زيادة التباين (Contrast Stretched)
        const contrast = v < 140 ? 0 : 255;
        data[i] = contrast;
        data[i + 1] = contrast;
        data[i + 2] = contrast;
      }
      ctx.putImageData(imgData, 0, 0);

      elements.ocrStatusText.textContent = 'جارٍ مسح الأرقام والأيام واستخراج الشعب...';

      try {
        const result = await window.Tesseract.recognize(canvas, 'ara+eng', {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              const p = Math.round((m.progress || 0) * 100);
              elements.ocrPercentageText.textContent = `${p}%`;
              elements.ocrProgressFill.style.width = `${p}%`;
            }
          }
        });

        const rawText = result.data.text;
        const extracted = parseUniversityScheduleRaw(rawText);

        if (extracted.length === 0) {
          alert('تم مسح الصورة، لكن خط البوابة غير واضح بما يكفي. جربي تحديد جدول الشعب بالفأرة من البوابة ولصقه في تبويب "📋 لصق نص الجدول"؛ سيعمل فوراً وبدقة تامة!');
          return;
        }

        stagedExtractedData = extracted;
        renderParsedPreview();

      } catch (err) {
        console.error(err);
        alert('حدث خطأ أثناء قراءة الصورة. استخدمي خيار "لصق نص الجدول" المباشر.');
      }
    };

    img.src = URL.createObjectURL(file);
  }

  // عرض المعاينة
  function renderParsedPreview() {
    if (!elements.importPreviewSection || !elements.parsedSectionsContainer) return;

    if (stagedExtractedData.length === 0) {
      elements.importPreviewSection.style.display = 'none';
      elements.btnConfirmSaveImported.style.display = 'none';
      return;
    }

    elements.importPreviewSection.style.display = 'block';
    elements.btnConfirmSaveImported.style.display = 'inline-flex';
    elements.parsedCountBadge.textContent = `${stagedExtractedData.length} شعبة جاهزة`;

    elements.parsedSectionsContainer.innerHTML = stagedExtractedData.map((item, idx) => {
      const meetDesc = item.meetings.map(m => {
        const d = store.DAYS.find(day => day.id === m.day)?.name || m.day;
        return `${d} (${m.startTime}-${m.endTime})${m.isLab ? ' [مختبر]' : ''}`;
      }).join(' • ');

      return `
        <div class="parsed-preview-item" style="display:flex; justify-content:space-between; align-items:center; background:var(--color-bg); padding:6px 10px; border-radius:6px; border:1px solid var(--color-border); font-size:0.85rem;">
          <div>
            <strong>${store.escapeHtml(item.courseName)}</strong> — شعبة ${store.escapeHtml(item.sectionNumber)}:
            <span style="color:var(--color-muted); font-size:0.8rem; margin-right:6px;">${store.escapeHtml(meetDesc)}</span>
          </div>
          <button type="button" class="icon-btn" data-action="remove-parsed" data-idx="${idx}" style="color:var(--color-danger);">✕</button>
        </div>`;
    }).join('');
  }

  elements.parsedSectionsContainer?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="remove-parsed"]');
    if (!btn) return;
    const idx = parseInt(btn.getAttribute('data-idx'), 10);
    stagedExtractedData.splice(idx, 1);
    renderParsedPreview();
  });

  // الاعتماد التلقائي وبناء الجدول فوراً بنقرة زر واحدة
  elements.btnConfirmSaveImported?.addEventListener('click', () => {
    if (stagedExtractedData.length === 0) return;

    const autoSelectedCourseIds = [];

    stagedExtractedData.forEach(item => {
      // 1. البحث عن المادة أو إنشاؤها تلقائياً
      let course = store.getCourses().find(c => c.name.toLowerCase() === item.courseName.toLowerCase());
      let courseId = course ? course.id : null;

      if (!course) {
        const addRes = store.addCourse({
          name: item.courseName,
          isCurrentSemester: true,
          hours: 3
        });
        if (addRes.success) courseId = addRes.course.id;
      } else {
        store.updateCourse(course.id, { isCurrentSemester: true });
      }

      if (courseId) {
        if (!autoSelectedCourseIds.includes(courseId)) {
          autoSelectedCourseIds.push(courseId);
        }

        // 2. إضافة الشعبة
        store.addSection({
          courseId: courseId,
          sectionNumber: item.sectionNumber || '1',
          meetings: item.meetings
        });
      }
    });

    hideModal(elements.smartImportModal);
    renderCourses();
    renderScheduleCoursePicker();

    // 3. بناء الجدول تلقائياً والتمرير إليه مباشرة
    triggerAutoScheduleGeneration(autoSelectedCourseIds);
  });

  function triggerAutoScheduleGeneration(selectedIds) {
    if (!selectedIds || selectedIds.length === 0) return;

    document.querySelectorAll('input[name="schedule-course-select"]').forEach(cb => {
      cb.checked = selectedIds.includes(cb.value);
    });

    const result = store.generateSchedules(selectedIds);

    if (!result.success) {
      if (elements.conflictReportBox) {
        elements.conflictReportBox.style.display = 'block';
        elements.conflictReportBox.innerHTML = `
          <h4>⚠️ تم استيراد الشعب بنجاح، لكن ظهر تعارض في أوقاتها:</h4>
          <p style="color:#FECACA; font-size:0.9rem; margin-bottom:8px;">${store.escapeHtml(result.error)}</p>
          ${result.conflicts ? `<ul class="conflict-list">${result.conflicts.map(c => `<li>${store.escapeHtml(c)}</li>`).join('')}</ul>` : ''}
        `;
        elements.conflictReportBox.scrollIntoView({ behavior: 'smooth' });
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
  }

  // -------------------------------------------------------------
  // توليد الجداول يدوياً وعرض المقاييس
  // -------------------------------------------------------------

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
  });

  elements.btnPrintSchedule?.addEventListener('click', () => {
    window.print();
  });

  // إدارة المواد والشعب اليدوية
  function renderCourses() {
    const allCourses = store.getCourses();
    if (!elements.coursesGrid) return;

    if (allCourses.length === 0) {
      elements.coursesGrid.innerHTML = `
        <div class="empty-state">
          <h3 class="empty-state-title">دليلك الدراسي فارغ حالياً</h3>
          <p class="empty-state-desc">يمكنك استخدام زر "⚡ استيراد شُعبك" لاستيراد المواد والشعب فوراً!</p>
        </div>`;
      renderScheduleCoursePicker();
      return;
    }

    let html = '';
    allCourses.forEach(c => {
      const sections = store.getSectionsByCourse(c.id);
      html += `
        <article class="course-card" data-id="${c.id}">
          <div>
            <div class="course-card-top">
              <span class="course-code">${c.code ? store.escapeHtml(c.code) : 'مادة'}</span>
              <button type="button" class="icon-btn" data-action="delete-course" data-id="${c.id}">🗑</button>
            </div>
            <h3 class="course-title">${store.escapeHtml(c.name)}</h3>
            <div class="course-meta">
              <span class="badge-meta" style="color:var(--color-primary);">${sections.length} شُعب مضافة</span>
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
      elements.coursePickerList.innerHTML = '<p style="color:var(--color-muted); font-size:0.85rem;">استوردي شُعبك بالأعلى أو أضيفي موادك للبدء.</p>';
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
      elements.sectionsManagerList.innerHTML = '<p style="color:var(--color-muted); font-size:0.85rem;">لا توجد شعب بعد. استخدمي زر "استيراد ذكي" ⚡ بالأعلى.</p>';
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

  elements.coursesGrid?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="delete-course"]');
    if (!btn) return;
    store.deleteCourse(btn.getAttribute('data-id'));
    renderCourses();
  });

  // إضافة شعبة يدوية
  elements.btnOpenAddSection?.addEventListener('click', () => {
    const courses = store.getCourses();
    if (!courses || courses.length === 0) {
      alert('أضيفي مادة دراسية أولاً أو استخدمي زر الاستيراد السريع.');
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
    div.className = 'meeting-input-row';
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
    const rows = document.querySelectorAll('.meeting-input-row');
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

  // إضافة مادة يدوية
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
      isCurrentSemester: true
    });
    hideModal(elements.courseModal);
    renderCourses();
  });

  // تهيئة عامة
  renderCourses();
  renderScheduleCoursePicker();

})();