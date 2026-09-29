/**
 * سند الطالب | SANAD — وحدة البيانات والتخزين والمحرك المشترك (v4 النهائي)
 * معالجة القيود الكاملة، منع الأخطاء الحسابية، وحظر التعارضات المزدوجة
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'sanad_student_data_v4';
  const OLD_STORAGE_KEYS = ['sanad_student_data_v3', 'sanad_student_data_v2'];
  const SCHEMA_VERSION = 4;

  const DAYS = [
    { id: 'sun', name: 'الأحد' },
    { id: 'mon', name: 'الإثنين' },
    { id: 'tue', name: 'الثلاثاء' },
    { id: 'wed', name: 'الأربعاء' },
    { id: 'thu', name: 'الخميس' },
    { id: 'fri', name: 'الجمعة' },
    { id: 'sat', name: 'السبت' }
  ];

  const MAJORS = [
    { id: 'ai_robotics', name: 'الذكاء الاصطناعي والروبوتات' },
    { id: 'data_science', name: 'علم البيانات والذكاء الاصطناعي' },
    { id: 'cyber_security', name: 'الأمن السيبراني' },
    { id: 'software_eng', name: 'هندسة البرمجيات' },
    { id: 'computer_science', name: 'علم الحاسوب' }
  ];

  const TOPIC_STATUSES = {
    not_started: { label: 'لم أبدأ', color: 'muted' },
    in_progress: { label: 'قيد الدراسة', color: 'primary' },
    completed: { label: 'مكتمل', color: 'accent' },
    needs_review: { label: 'بحاجة مراجعة', color: 'warning' }
  };

  const CLASSIFICATIONS = {
    univ_req: 'متطلب جامعة',
    college_req: 'متطلب كلية',
    major_req: 'متطلب تخصص',
    elective: 'مادة اختيارية',
    unspecified: 'غير محدد'
  };

  const RESOURCE_TYPES = {
    explanation: 'شرح',
    summary: 'ملخص',
    practical: 'تدريب عملي',
    reference: 'مرجع',
    slides: 'سلايدات',
    questions: 'أسئلة وامتحانات',
    other: 'أخرى'
  };

  function formatLocalDate(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function parseLocalDate(str) {
    if (!str || typeof str !== 'string') return new Date();
    const parts = str.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
  }

  function getDayIdFromDate(dateObj) {
    const map = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return map[dateObj.getDay()];
  }

  function createDefaultState() {
    const today = new Date();
    const defaultEnd = new Date();
    defaultEnd.setDate(today.getDate() + 14);

    return {
      schemaVersion: SCHEMA_VERSION,
      student: { firstName: '', majorId: '', planYear: '' },
      courses: [],
      topics: [],
      resources: [],
      sections: [],
      scheduleConstraints: {
        earliestStart: '08:00',
        latestEnd: '18:00',
        forbiddenDays: [],
        travelBuffer: 10,
        blockedTimes: []
      },
      schedulePreferences: {
        minimizeDays: true,
        minimizeGaps: true,
        preferredDayOff: ''
      },
      savedSchedule: null,
      studyPlan: {
        settings: {
          startDate: formatLocalDate(today),
          endDate: formatLocalDate(defaultEnd),
          sessionDuration: 50,
          breakDuration: 10,
          reviewBufferMinutes: 120,
          transitBuffer: 15,
          dailyAvailability: {
            sun: [{ start: '16:00', end: '22:00' }],
            mon: [{ start: '16:00', end: '22:00' }],
            tue: [{ start: '16:00', end: '22:00' }],
            wed: [{ start: '16:00', end: '22:00' }],
            thu: [{ start: '16:00', end: '22:00' }],
            fri: [{ start: '10:00', end: '22:00' }],
            sat: [{ start: '10:00', end: '22:00' }]
          },
          customDays: {}
        },
        tasks: [],
        sessions: [],
        lastGeneratedAt: null,
        scheduleSavedAtRef: null,
        lastDeficit: null
      }
    };
  }

  function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;
  }

  function isValidHttpUrl(string) {
    if (!string || typeof string !== 'string') return false;
    try {
      const url = new URL(string.trim());
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function timeToMinutes(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    const parts = timeStr.split(':');
    return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
  }

  function minutesToTime(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  let state = createDefaultState();
  let isCorrupted = false;
  let corruptionDetails = null;

  function validateSchema(data) {
    if (!data || typeof data !== 'object') return false;
    if (typeof data.schemaVersion !== 'number' || data.schemaVersion < 1) return false;
    return true;
  }

  function migrateData(oldData) {
    const base = createDefaultState();
    return {
      ...base,
      ...oldData,
      schemaVersion: SCHEMA_VERSION,
      sections: Array.isArray(oldData.sections) ? oldData.sections : [],
      scheduleConstraints: { ...base.scheduleConstraints, ...(oldData.scheduleConstraints || {}) },
      schedulePreferences: { ...base.schedulePreferences, ...(oldData.schedulePreferences || {}) },
      savedSchedule: oldData.savedSchedule || null,
      studyPlan: {
        ...base.studyPlan,
        ...(oldData.studyPlan || {}),
        settings: { ...base.studyPlan.settings, ...((oldData.studyPlan && oldData.studyPlan.settings) || {}) },
        tasks: Array.isArray(oldData.studyPlan?.tasks) ? oldData.studyPlan.tasks : [],
        sessions: Array.isArray(oldData.studyPlan?.sessions) ? oldData.studyPlan.sessions : []
      }
    };
  }

  function load() {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        for (const oldKey of OLD_STORAGE_KEYS) {
          const oldRaw = localStorage.getItem(oldKey);
          if (oldRaw) { raw = oldRaw; break; }
        }
      }
      if (!raw) {
        state = createDefaultState();
        isCorrupted = false;
        return { success: true, isNew: true };
      }
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        isCorrupted = true;
        corruptionDetails = 'تعذر قراءة البيانات المحفوظة بصيغة JSON صحيحة.';
        return { success: false, corrupted: true };
      }
      if (!validateSchema(parsed)) {
        isCorrupted = true;
        corruptionDetails = 'بنية البيانات السابقة غير متطابقة مع الإصدار الحالي.';
        return { success: false, corrupted: true };
      }
      state = migrateData(parsed);
      isCorrupted = false;
      save();
      return { success: true, data: state };
    } catch (e) {
      isCorrupted = true;
      corruptionDetails = 'تعذر الوصول إلى مساحة التخزين في المتصفح.';
      return { success: false, error: e.message };
    }
  }

  function save() {
    if (isCorrupted) return { success: false, error: 'تم تجميد الحفظ لحماية البيانات من التلف.' };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'تعذر الحفظ في مساحة التخزين المحلية.' };
    }
  }

  // إدارة الطالب والمواد
  function getStudent() { return { ...state.student }; }
  function setStudent(data) {
    state.student = { firstName: (data.firstName || '').trim(), majorId: (data.majorId || '').trim(), planYear: (data.planYear || '').trim() };
    return save();
  }

  function getCourses() { return [...state.courses]; }
  function getCourse(id) { return state.courses.find(c => c.id === id) || null; }

  function addCourse(courseData) {
    const name = (courseData.name || '').trim();
    if (!name) return { success: false, error: 'اسم المادة إلزامي.' };
    const newCourse = {
      id: generateId('c'),
      name: name,
      code: (courseData.code || '').trim().toUpperCase(),
      hours: parseInt(courseData.hours, 10) || 3,
      classification: courseData.classification || 'unspecified',
      isCurrentSemester: Boolean(courseData.isCurrentSemester),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    state.courses.push(newCourse);
    save();
    return { success: true, course: newCourse };
  }

  // طرد أشباح المحاضرات والمهام عند حذف المادة
  function deleteCourse(id) {
    state.courses = state.courses.filter(c => c.id !== id);
    state.topics = state.topics.filter(t => t.courseId !== id);
    state.resources = state.resources.filter(r => r.courseId !== id);
    state.sections = state.sections.filter(s => s.courseId !== id);
    state.studyPlan.tasks = state.studyPlan.tasks.filter(t => t.courseId !== id);
    state.studyPlan.sessions = state.studyPlan.sessions.filter(s => s.courseId !== id);

    // تنظيف الجدول المحفوظ فوراً من شُعب هذه المادة
    if (state.savedSchedule && state.savedSchedule.schedule && Array.isArray(state.savedSchedule.schedule.sections)) {
      const remainingSections = state.savedSchedule.schedule.sections.filter(s => s.courseId !== id);
      if (remainingSections.length === 0) {
        state.savedSchedule = null;
      } else {
        state.savedSchedule.schedule = evaluateSchedule(remainingSections);
        state.savedSchedule.savedAt = Date.now();
      }
    }

    return save();
  }

  function getTopicsByCourse(courseId) { return state.topics.filter(t => t.courseId === courseId); }
  function addTopic(topicData) {
    const title = (topicData.title || '').trim();
    if (!title) return { success: false, error: 'عنوان الموضوع إلزامي.' };
    const newTopic = {
      id: generateId('t'),
      courseId: topicData.courseId,
      title: title,
      status: topicData.status || 'not_started',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    state.topics.push(newTopic);
    save();
    return { success: true, topic: newTopic };
  }

  function updateTopic(id, topicData) {
    const topic = state.topics.find(t => t.id === id);
    if (!topic) return { success: false, error: 'الموضوع غير موجود.' };
    if (topicData.title !== undefined) topic.title = String(topicData.title).trim();
    if (topicData.status !== undefined && TOPIC_STATUSES[topicData.status]) topic.status = topicData.status;
    topic.updatedAt = Date.now();
    return save();
  }

  function deleteTopic(id) {
    state.topics = state.topics.filter(t => t.id !== id);
    state.resources = state.resources.filter(r => r.topicId !== id);
    state.studyPlan.tasks = state.studyPlan.tasks.filter(t => t.topicId !== id);
    return save();
  }

  function getResourcesByTopic(topicId) { return state.resources.filter(r => r.topicId === topicId); }
  function addResource(resData) {
    const newRes = { id: generateId('r'), ...resData, createdAt: Date.now() };
    state.resources.push(newRes);
    save();
    return { success: true, resource: newRes };
  }

  function deleteResource(id) {
    state.resources = state.resources.filter(r => r.id !== id);
    return save();
  }

  // الشعب والجدول الدراسي
  function getSections() { return [...state.sections]; }
  function getSectionsByCourse(courseId) { return state.sections.filter(s => s.courseId === courseId); }
  function addSection(data) {
    const newSec = {
      id: generateId('sec'),
      courseId: data.courseId,
      sectionNumber: data.sectionNumber,
      isPinned: Boolean(data.isPinned),
      meetings: data.meetings,
      updatedAt: Date.now()
    };
    state.sections.push(newSec);
    save();
    return { success: true, section: newSec };
  }

  function deleteSection(id) {
    state.sections = state.sections.filter(s => s.id !== id);
    return save();
  }

  function getScheduleConstraints() { return JSON.parse(JSON.stringify(state.scheduleConstraints)); }
  function setScheduleConstraints(data) { state.scheduleConstraints = { ...state.scheduleConstraints, ...data }; return save(); }
  function addBlockedTime(bData) { state.scheduleConstraints.blockedTimes.push({ id: generateId('blk'), ...bData }); return save(); }
  function deleteBlockedTime(id) { state.scheduleConstraints.blockedTimes = state.scheduleConstraints.blockedTimes.filter(b => b.id !== id); return save(); }

  function getSavedSchedule() { return state.savedSchedule ? JSON.parse(JSON.stringify(state.savedSchedule)) : null; }
  function saveSelectedSchedule(scheduleObj) {
    state.savedSchedule = { id: generateId('sched'), savedAt: Date.now(), schedule: scheduleObj };
    return save();
  }

  function isSavedScheduleOutdated() {
    if (!state.savedSchedule || !state.savedSchedule.schedule) return false;
    const savedTime = state.savedSchedule.savedAt;
    return state.sections.some(s => s.updatedAt > savedTime);
  }

  function generateSchedules(selectedCourseIds) {
    if (!selectedCourseIds || selectedCourseIds.length === 0) return { success: false, error: 'اختر مادة واحدة على الأقل.' };
    const constraints = state.scheduleConstraints;
    const earliestMin = timeToMinutes(constraints.earliestStart);
    const latestMin = timeToMinutes(constraints.latestEnd);
    const coursesPool = [];

    for (const cId of selectedCourseIds) {
      const course = getCourse(cId);
      if (!course) continue;
      let sections = getSectionsByCourse(cId);
      if (sections.length === 0) return { success: false, error: `المادة "${course.name}" لا تحتوي على أي شعب.` };
      const pinned = sections.find(s => s.isPinned);
      coursesPool.push({ course, sections: pinned ? [pinned] : sections });
    }

    const validSchedules = [];
    const detectedConflicts = new Set();
    let iterationCount = 0;

    function backtrack(idx, current) {
      if (iterationCount++ >= 35000) return;
      if (idx === coursesPool.length) {
        validSchedules.push(evaluateSchedule(current));
        return;
      }
      const { course, sections } = coursesPool[idx];
      for (const section of sections) {
        let valid = true;
        for (const meeting of section.meetings) {
          const sMin = timeToMinutes(meeting.startTime);
          const eMin = timeToMinutes(meeting.endTime);

          if (sMin < earliestMin || eMin > latestMin) {
            detectedConflicts.add(`مادة "${course.name}" تقع خارج أوقات الدوام المسموح.`);
            valid = false; break;
          }
          if (constraints.forbiddenDays.includes(meeting.day)) {
            detectedConflicts.add(`مادة "${course.name}" تقع في يوم ممنوع الحضور فيه.`);
            valid = false; break;
          }

          // فحص الفترات الممنوعة (Blocked Times)
          for (const blk of constraints.blockedTimes) {
            if (blk.day === meeting.day) {
              const bStart = timeToMinutes(blk.startTime);
              const bEnd = timeToMinutes(blk.endTime);
              if (Math.max(sMin, bStart) < Math.min(eMin, bEnd)) {
                detectedConflicts.add(`مادة "${course.name}" تتعارض مع التزام "${blk.title}".`);
                valid = false; break;
              }
            }
          }
          if (!valid) break;

          // فحص التعارض ووقت الانتقال بين المحاضرات
          for (const exSec of current) {
            const exCourse = getCourse(exSec.courseId);
            for (const exM of exSec.meetings) {
              if (exM.day === meeting.day) {
                const exS = timeToMinutes(exM.startTime);
                const exE = timeToMinutes(exM.endTime);
                if (Math.max(sMin, exS) < Math.min(eMin, exE)) {
                  detectedConflicts.add(`تعارض في اليوم (${meeting.day}) بين "${course.name}" و "${exCourse ? exCourse.name : ''}".`);
                  valid = false; break;
                }
                if (constraints.travelBuffer > 0 && meeting.type === 'in_person' && exM.type === 'in_person') {
                  if ((eMin <= exS && exS < eMin + constraints.travelBuffer) || (exE <= sMin && sMin < exE + constraints.travelBuffer)) {
                    detectedConflicts.add(`وقت انتقال غير كافٍ بين "${course.name}" و "${exCourse ? exCourse.name : ''}".`);
                    valid = false; break;
                  }
                }
              }
            }
            if (!valid) break;
          }
          if (!valid) break;
        }

        if (valid) {
          current.push(section);
          backtrack(idx + 1, current);
          current.pop();
        }
      }
    }

    backtrack(0, []);
    if (validSchedules.length === 0) return { success: false, conflicts: Array.from(detectedConflicts), error: 'تعذر تكوين جدول خالٍ من التعارضات وفق قيودك الحالية.' };
    return { success: true, schedules: validSchedules.slice(0, 3) };
  }

  function evaluateSchedule(sectionsList) {
    const dayMap = {};
    DAYS.forEach(d => { dayMap[d.id] = []; });
    sectionsList.forEach(sec => {
      const course = getCourse(sec.courseId);
      sec.meetings.forEach(m => {
        dayMap[m.day].push({
          ...m,
          courseName: course ? course.name : '',
          sectionNumber: sec.sectionNumber,
          startMin: timeToMinutes(m.startTime),
          endMin: timeToMinutes(m.endTime)
        });
      });
    });

    let attendanceDaysCount = 0;
    const attendanceDayNames = [];
    let totalGapMinutes = 0;
    const dailyTimes = {};

    DAYS.forEach(d => {
      const meets = dayMap[d.id];
      if (meets.length > 0) {
        attendanceDaysCount++;
        attendanceDayNames.push(d.name);
        meets.sort((a, b) => a.startMin - b.startMin);
        dailyTimes[d.id] = { start: meets[0].startTime, end: meets[meets.length - 1].endTime };
        for (let i = 0; i < meets.length - 1; i++) {
          const gap = meets[i + 1].startMin - meets[i].endMin;
          if (gap > 0) totalGapMinutes += gap;
        }
      }
    });

    return {
      sections: JSON.parse(JSON.stringify(sectionsList)),
      attendanceDaysCount,
      attendanceDayNames,
      totalGapMinutes,
      dailyTimes,
      dayMap
    };
  }

  // -------------------------------------------------------------
  // محرك خطة الدراسة الحتمي (Study Plan Engine)
  // -------------------------------------------------------------

  function getStudyPlan() { return JSON.parse(JSON.stringify(state.studyPlan)); }
  function setStudyPlanSettings(newSettings) { state.studyPlan.settings = { ...state.studyPlan.settings, ...newSettings }; return save(); }

  function addStudyTask(taskData) {
    const course = getCourse(taskData.courseId);
    if (!course) return { success: false, error: 'المادة غير موجودة.' };
    const est = parseInt(taskData.estimatedMinutes, 10) || 60;
    const newTask = {
      id: generateId('st'),
      courseId: taskData.courseId,
      courseName: course.name,
      topicTitle: taskData.topicTitle,
      workType: taskData.workType || 'theory',
      difficulty: taskData.difficulty || 'medium',
      priority: taskData.priority || 'medium',
      understandingLevel: taskData.understandingLevel || 'not_started',
      totalEstimatedMinutes: est,
      remainingMinutes: est,
      examDate: taskData.examDate || '',
      examTime: taskData.examTime || '23:59',
      reviewMinutesRequired: parseInt(taskData.reviewMinutesRequired, 10) || 0
    };
    state.studyPlan.tasks.push(newTask);
    save();
    return { success: true, task: newTask };
  }

  function isStudyPlanScheduleOutdated() {
    if (!state.studyPlan.lastGeneratedAt || !state.savedSchedule) return false;
    return state.savedSchedule.savedAt > state.studyPlan.lastGeneratedAt;
  }

  function computeAvailableIntervalsForDate(dateStr) {
    const settings = state.studyPlan.settings;
    const dateObj = parseLocalDate(dateStr);
    const dayId = getDayIdFromDate(dateObj);
    let baseIntervals = settings.dailyAvailability[dayId] || [];
    let freeWindows = baseIntervals.map(inv => ({ start: timeToMinutes(inv.start), end: timeToMinutes(inv.end) }));

    if (state.savedSchedule && state.savedSchedule.schedule && state.savedSchedule.schedule.dayMap) {
      const lectures = state.savedSchedule.schedule.dayMap[dayId] || [];
      const transit = settings.transitBuffer || 15;
      lectures.forEach(lec => {
        const busyStart = Math.max(0, lec.startMin - transit);
        const busyEnd = lec.endMin + transit;
        const nextFree = [];
        freeWindows.forEach(free => {
          if (busyEnd <= free.start || busyStart >= free.end) nextFree.push(free);
          else {
            if (busyStart > free.start) nextFree.push({ start: free.start, end: busyStart });
            if (busyEnd < free.end) nextFree.push({ start: busyEnd, end: free.end });
          }
        });
        freeWindows = nextFree;
      });
    }

    return freeWindows.filter(w => w.end - w.start >= 20);
  }

  function planStudySchedule(options = {}) {
    const isDryRun = Boolean(options.dryRun);
    const settings = state.studyPlan.settings;
    const sessionLen = settings.sessionDuration || 50;
    const breakLen = settings.breakDuration || 10;
    const startObj = parseLocalDate(settings.startDate);
    const endObj = parseLocalDate(settings.endDate);

    const activeTasks = state.studyPlan.tasks
      .filter(t => t.remainingMinutes > 0 || t.reviewMinutesRequired > 0)
      .map(t => ({ ...t }));

    if (activeTasks.length === 0) return { success: false, error: 'لا توجد موضوعات متبقية لجدولتها.' };

    const dateRangeList = [];
    let curObj = new Date(startObj);
    while (curObj <= endObj) {
      dateRangeList.push(formatLocalDate(curObj));
      curObj.setDate(curObj.getDate() + 1);
    }

    const dailyAvailableMap = {};
    dateRangeList.forEach(dStr => { dailyAvailableMap[dStr] = computeAvailableIntervalsForDate(dStr); });

    const completedSessions = state.studyPlan.sessions.filter(s => s.status === 'completed');
    const newScheduledSessions = [];
    const affectedTasksDeficit = [];
    let totalUnscheduledMinutes = 0;

    // 1. جدولة جلسات المراجعة
    activeTasks.forEach(task => {
      if (task.reviewMinutesRequired > 0 && task.examDate) {
        let revNeeded = task.reviewMinutesRequired;
        const examDateStr = task.examDate;
        const examEndMin = timeToMinutes(task.examTime || '23:59');
        const candidateDates = dateRangeList.filter(d => d <= examDateStr).reverse();

        for (const cDate of candidateDates) {
          if (revNeeded <= 0) break;
          const windows = dailyAvailableMap[cDate] || [];
          for (let wi = windows.length - 1; wi >= 0; wi--) {
            if (revNeeded <= 0) break;
            const win = windows[wi];
            while (revNeeded > 0) {
              let usableEnd = win.end;
              if (cDate === examDateStr && usableEnd > examEndMin) usableEnd = examEndMin;
              if (usableEnd - win.start < 20) break;

              const availLen = usableEnd - win.start;
              const sessLen = Math.min(revNeeded, sessionLen, availLen);
              const sessStart = usableEnd - sessLen;

              newScheduledSessions.push({
                id: generateId('sess'),
                taskId: task.id,
                courseId: task.courseId,
                courseName: task.courseName,
                topicTitle: task.topicTitle,
                workType: task.workType,
                isReview: true,
                date: cDate,
                startTime: minutesToTime(sessStart),
                endTime: minutesToTime(usableEnd),
                durationMinutes: sessLen,
                status: 'pending'
              });

              revNeeded -= sessLen;
              win.end = Math.max(win.start, sessStart - breakLen);
            }
          }
        }
        if (revNeeded > 0) {
          totalUnscheduledMinutes += revNeeded;
          affectedTasksDeficit.push({ taskTitle: `${task.courseName}: مراجعة ${task.topicTitle}`, unscheduledMinutes: revNeeded });
        }
      }
    });

    // 2. جدولة الجلسات العادية
    activeTasks.forEach(task => {
      let needed = task.remainingMinutes;
      const examDateStr = task.examDate || '9999-12-31';
      const examEndMin = timeToMinutes(task.examTime || '23:59');

      for (const dStr of dateRangeList) {
        if (needed <= 0 || dStr > examDateStr) break;
        const windows = dailyAvailableMap[dStr] || [];

        for (let wi = 0; wi < windows.length; wi++) {
          if (needed <= 0) break;
          const win = windows[wi];
          let usableEnd = win.end;
          if (dStr === examDateStr && usableEnd > examEndMin) usableEnd = examEndMin;

          while (win.start + 20 <= usableEnd && needed > 0) {
            const availLen = usableEnd - win.start;
            const sessLen = Math.min(needed, sessionLen, availLen);
            const sessStart = win.start;
            const sessEnd = sessStart + sessLen;

            newScheduledSessions.push({
              id: generateId('sess'),
              taskId: task.id,
              courseId: task.courseId,
              courseName: task.courseName,
              topicTitle: task.topicTitle,
              workType: task.workType,
              isReview: false,
              date: dStr,
              startTime: minutesToTime(sessStart),
              endTime: minutesToTime(sessEnd),
              durationMinutes: sessLen,
              status: 'pending'
            });

            needed -= sessLen;
            win.start = sessEnd + breakLen;
          }
        }
      }
      if (needed > 0) {
        totalUnscheduledMinutes += needed;
        affectedTasksDeficit.push({ taskTitle: `${task.courseName}: ${task.topicTitle}`, unscheduledMinutes: needed });
      }
    });

    const deficitReport = totalUnscheduledMinutes > 0 ? { totalUnscheduledMinutes, affectedTasks: affectedTasksDeficit } : null;

    if (isDryRun) {
      return { success: true, previewSessions: newScheduledSessions, deficit: deficitReport, scheduledCount: newScheduledSessions.length };
    }

    state.studyPlan.sessions = [...completedSessions, ...newScheduledSessions];
    state.studyPlan.lastGeneratedAt = Date.now();
    state.studyPlan.lastDeficit = deficitReport;
    save();

    return { success: true, sessions: state.studyPlan.sessions, deficit: deficitReport };
  }

  // حل الكارثة الحسابية بخصم الفرق الفعلي فقط
  function markSessionComplete(sessionId, completedMinutes = null) {
    const sess = state.studyPlan.sessions.find(s => s.id === sessionId);
    if (!sess) return { success: false };
    const task = state.studyPlan.tasks.find(t => t.id === sess.taskId);
    const full = sess.durationMinutes;
    const prevCompleted = sess.completedMinutes || 0;

    if (completedMinutes === null || completedMinutes >= full) {
      sess.status = 'completed';
      sess.completedMinutes = full;
      const newlyDeducted = full - prevCompleted;
      if (task && newlyDeducted > 0) {
        task.remainingMinutes = Math.max(0, task.remainingMinutes - newlyDeducted);
      }
    } else {
      const comp = Math.max(0, parseInt(completedMinutes, 10) || 0);
      sess.status = comp > 0 ? 'partial' : 'pending';
      sess.completedMinutes = comp;
      const newlyDeducted = comp - prevCompleted;
      if (task && newlyDeducted > 0) {
        task.remainingMinutes = Math.max(0, task.remainingMinutes - newlyDeducted);
      }
    }
    return save();
  }

  function postponeSession(sessionId) {
    const sessIndex = state.studyPlan.sessions.findIndex(s => s.id === sessionId);
    if (sessIndex === -1) return { success: false };
    const sess = state.studyPlan.sessions[sessIndex];
    const task = state.studyPlan.tasks.find(t => t.id === sess.taskId);

    if (task && sess.status === 'partial') {
      const uncompleted = sess.durationMinutes - (sess.completedMinutes || 0);
      task.remainingMinutes += uncompleted;
    }
    state.studyPlan.sessions.splice(sessIndex, 1);
    return save();
  }

  // منع حجز جلستي مذاكرة في نفس الوقت يدوياً
  function editSessionTime(sessionId, newDate, newStart, newEnd) {
    const sess = state.studyPlan.sessions.find(s => s.id === sessionId);
    if (!sess) return { success: false, error: 'الجلسة غير موجودة.' };

    const task = state.studyPlan.tasks.find(t => t.id === sess.taskId);
    const sMin = timeToMinutes(newStart);
    const eMin = timeToMinutes(newEnd);

    if (eMin <= sMin) return { success: false, error: 'وقت النهاية يجب أن يكون بعد وقت البداية.' };

    if (task && task.examDate) {
      if (newDate > task.examDate || (newDate === task.examDate && eMin > timeToMinutes(task.examTime || '23:59'))) {
        return { success: false, error: 'لا يمكن تحديد موعد الجلسة بعد موعد الامتحان المحدد.' };
      }
    }

    const dayId = getDayIdFromDate(parseLocalDate(newDate));
    if (state.savedSchedule && state.savedSchedule.schedule && state.savedSchedule.schedule.dayMap) {
      const lectures = state.savedSchedule.schedule.dayMap[dayId] || [];
      for (const lec of lectures) {
        if (Math.max(sMin, lec.startMin) < Math.min(eMin, lec.endMin)) {
          return { success: false, error: `يتعارض هذا التوقيت مع محاضرة "${lec.courseName}".` };
        }
      }
    }

    // فحص التعارض مع جلسات المذاكرة الأخرى
    for (const other of state.studyPlan.sessions) {
      if (other.id !== sessionId && other.date === newDate) {
        const oS = timeToMinutes(other.startTime);
        const oE = timeToMinutes(other.endTime);
        if (Math.max(sMin, oS) < Math.min(eMin, oE)) {
          return { success: false, error: `يتعارض هذا التوقيت مع جلسة مذاكرة أخرى: "${other.topicTitle}" (${other.startTime} - ${other.endTime}).` };
        }
      }
    }

    sess.date = newDate;
    sess.startTime = newStart;
    sess.endTime = newEnd;
    sess.durationMinutes = eMin - sMin;
    return save();
  }

  function getStudyProgressStats() {
    let totalNeededMinutes = 0;
    let completedMinutes = 0;
    state.studyPlan.tasks.forEach(t => { totalNeededMinutes += t.totalEstimatedMinutes; });
    state.studyPlan.sessions.forEach(s => {
      if (s.status === 'completed') completedMinutes += s.durationMinutes;
      else if (s.status === 'partial') completedMinutes += s.completedMinutes || 0;
    });
    const pct = totalNeededMinutes > 0 ? Math.min(100, Math.round((completedMinutes / totalNeededMinutes) * 100)) : 0;
    return { totalNeededMinutes, completedMinutes, percentage: pct, tasksCount: state.studyPlan.tasks.length };
  }

  function globalSearch(query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) return { courses: [], count: 0 };
    const courses = state.courses.filter(c => c.name.toLowerCase().includes(q) || (c.code && c.code.toLowerCase().includes(q)));
    return { courses, count: courses.length };
  }

  // تصدير واجهة الدوال كاملة
  window.SanadStore = {
    load, save,
    isCorrupted: () => isCorrupted,
    getCorruptionDetails: () => corruptionDetails,
    DAYS, MAJORS, TOPIC_STATUSES, CLASSIFICATIONS, RESOURCE_TYPES,
    formatLocalDate, parseLocalDate, getDayIdFromDate, escapeHtml,
    getStudent, setStudent,
    getCourses, getCourse, addCourse, deleteCourse,
    getTopicsByCourse, addTopic, updateTopic, deleteTopic,
    getResourcesByTopic, addResource, deleteResource,
    getSections, getSectionsByCourse, addSection, deleteSection,
    getScheduleConstraints, setScheduleConstraints, addBlockedTime, deleteBlockedTime,
    getSavedSchedule, saveSelectedSchedule, isSavedScheduleOutdated, generateSchedules,
    getStudyPlan, setStudyPlanSettings, addStudyTask, planStudySchedule,
    markSessionComplete, postponeSession, editSessionTime,
    getStudyProgressStats, isStudyPlanScheduleOutdated,
    globalSearch
  };

})(window);