/**
 * سند الطالب | SANAD — وحدة البيانات والتخزين والمحرك المشترك
 * المرحلة الرابعة: ترقية البنية (v4) وإضافة خوارزمية «خطة الدراسة» المحلية
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

  // دوال التاريخ المحلي لمنع انزياح التوقيت (UTC Day Shift)
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

      // المرحلة الرابعة: خطة الدراسة
      studyPlan: {
        settings: {
          startDate: formatLocalDate(today),
          endDate: formatLocalDate(defaultEnd),
          sessionDuration: 50, // دقيقة
          breakDuration: 10,   // دقيقة
          reviewBufferMinutes: 120, // وقت المراجعة قبل الامتحان
          transitBuffer: 15,   // وقت الراحة والانتقال بعد المحاضرات
          dailyAvailability: {
            sun: [{ start: '16:00', end: '22:00' }],
            mon: [{ start: '16:00', end: '22:00' }],
            tue: [{ start: '16:00', end: '22:00' }],
            wed: [{ start: '16:00', end: '22:00' }],
            thu: [{ start: '16:00', end: '22:00' }],
            fri: [{ start: '10:00', end: '22:00' }],
            sat: [{ start: '10:00', end: '22:00' }]
          },
          customDays: {} // تاريخ محدد => فترات فراغ مخصصة
        },
        tasks: [],     // موضوعات ومهام الدراسة
        sessions: [],  // جلسات الجدول الزمني المجدولة
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
    if (!data.student || typeof data.student !== 'object') return false;
    if (!Array.isArray(data.courses)) return false;
    if (!Array.isArray(data.topics)) return false;
    return true;
  }

  function migrateData(oldData) {
    const base = createDefaultState();
    const migrated = {
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
        settings: {
          ...base.studyPlan.settings,
          ...((oldData.studyPlan && oldData.studyPlan.settings) || {})
        },
        tasks: Array.isArray(oldData.studyPlan?.tasks) ? oldData.studyPlan.tasks : [],
        sessions: Array.isArray(oldData.studyPlan?.sessions) ? oldData.studyPlan.sessions : []
      }
    };
    return migrated;
  }

  function load() {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        for (const oldKey of OLD_STORAGE_KEYS) {
          const oldRaw = localStorage.getItem(oldKey);
          if (oldRaw) {
            raw = oldRaw;
            break;
          }
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
      } catch (parseErr) {
        isCorrupted = true;
        corruptionDetails = 'تعذر قراءة ملف البيانات المحفوظة بصيغة JSON غير صحيحة.';
        return { success: false, corrupted: true, error: corruptionDetails };
      }

      if (!validateSchema(parsed)) {
        isCorrupted = true;
        corruptionDetails = 'بنية البيانات المحفوظة غير متوافقة.';
        return { success: false, corrupted: true, error: corruptionDetails };
      }

      state = migrateData(parsed);
      isCorrupted = false;
      save();
      return { success: true, data: state };
    } catch (e) {
      isCorrupted = true;
      corruptionDetails = 'تعذر الوصول إلى التخزين المحلي للمتصفح.';
      return { success: false, error: e.message };
    }
  }

  function save() {
    if (isCorrupted) {
      return { success: false, error: 'تم إيقاف الحفظ التلقائي لحماية البيانات السابقة من الاستبدال.' };
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'تعذر الحفظ في التخزين المحلي.' };
    }
  }

  // إدارة الطالب والمواد
  function getStudent() { return { ...state.student }; }
  function setStudent(data) {
    state.student = {
      firstName: (data.firstName || '').trim(),
      majorId: (data.majorId || '').trim(),
      planYear: (data.planYear || '').trim()
    };
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
      hours: courseData.hours ? parseInt(courseData.hours, 10) || 0 : 0,
      year: (courseData.year || '').trim(),
      semester: (courseData.semester || '').trim(),
      classification: courseData.classification || 'unspecified',
      majors: Array.isArray(courseData.majors) ? courseData.majors : [],
      description: (courseData.description || '').trim(),
      isCurrentSemester: Boolean(courseData.isCurrentSemester),
      isFavorite: Boolean(courseData.isFavorite),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    state.courses.push(newCourse);
    const saveRes = save();
    if (!saveRes.success) return saveRes;
    return { success: true, course: newCourse };
  }

  function updateCourse(id, courseData) {
    const index = state.courses.findIndex(c => c.id === id);
    if (index === -1) return { success: false, error: 'المادة غير موجودة.' };
    const name = (courseData.name || '').trim();
    if (!name) return { success: false, error: 'اسم المادة إلزامي.' };
    const current = state.courses[index];
    state.courses[index] = {
      ...current,
      name: name,
      code: (courseData.code !== undefined ? courseData.code : current.code).trim().toUpperCase(),
      hours: courseData.hours !== undefined ? parseInt(courseData.hours, 10) || 0 : current.hours,
      classification: courseData.classification || current.classification,
      isCurrentSemester: courseData.isCurrentSemester !== undefined ? Boolean(courseData.isCurrentSemester) : current.isCurrentSemester,
      isFavorite: courseData.isFavorite !== undefined ? Boolean(courseData.isFavorite) : current.isFavorite,
      updatedAt: Date.now()
    };
    const saveRes = save();
    if (!saveRes.success) return saveRes;
    return { success: true, course: state.courses[index] };
  }

  function deleteCourse(id) {
    const courseIndex = state.courses.findIndex(c => c.id === id);
    if (courseIndex === -1) return { success: false, error: 'المادة غير موجودة.' };
    state.courses.splice(courseIndex, 1);
    state.topics = state.topics.filter(t => t.courseId !== id);
    state.resources = state.resources.filter(r => r.courseId !== id);
    state.sections = state.sections.filter(s => s.courseId !== id);
    state.studyPlan.tasks = state.studyPlan.tasks.filter(st => st.courseId !== id);
    state.studyPlan.sessions = state.studyPlan.sessions.filter(sess => sess.courseId !== id);
    return save();
  }

  function toggleCourseFavorite(id) {
    const course = state.courses.find(c => c.id === id);
    if (!course) return { success: false, error: 'المادة غير موجودة.' };
    course.isFavorite = !course.isFavorite;
    course.updatedAt = Date.now();
    return save();
  }

  function toggleCourseCurrentSemester(id) {
    const course = state.courses.find(c => c.id === id);
    if (!course) return { success: false, error: 'المادة غير موجودة.' };
    course.isCurrentSemester = !course.isCurrentSemester;
    course.updatedAt = Date.now();
    return save();
  }

  // الموضوعات والمصادر
  function getTopicsByCourse(courseId) { return state.topics.filter(t => t.courseId === courseId); }
  function addTopic(topicData) {
    const title = (topicData.title || '').trim();
    if (!title) return { success: false, error: 'عنوان الموضوع إلزامي.' };
    if (!topicData.courseId || !getCourse(topicData.courseId)) return { success: false, error: 'المادة غير صالحة.' };
    const newTopic = {
      id: generateId('t'),
      courseId: topicData.courseId,
      title: title,
      description: (topicData.description || '').trim(),
      status: TOPIC_STATUSES[topicData.status] ? topicData.status : 'not_started',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    state.topics.push(newTopic);
    const saveRes = save();
    if (!saveRes.success) return saveRes;
    return { success: true, topic: newTopic };
  }

  function updateTopic(id, topicData) {
    const topic = state.topics.find(t => t.id === id);
    if (!topic) return { success: false, error: 'الموضوع غير موجود.' };
    if (topicData.title !== undefined) topic.title = String(topicData.title).trim();
    if (topicData.status && TOPIC_STATUSES[topicData.status]) topic.status = topicData.status;
    topic.updatedAt = Date.now();
    return save();
  }

  function deleteTopic(id) {
    const index = state.topics.findIndex(t => t.id === id);
    if (index === -1) return { success: false, error: 'الموضوع غير موجود.' };
    state.topics.splice(index, 1);
    state.resources = state.resources.filter(r => r.topicId !== id);
    state.studyPlan.tasks = state.studyPlan.tasks.filter(t => t.topicId !== id);
    return save();
  }

  function getResourcesByTopic(topicId) { return state.resources.filter(r => r.topicId === topicId); }
  function addResource(resData) {
    const title = (resData.title || '').trim();
    const url = (resData.url || '').trim();
    if (!title || !isValidHttpUrl(url)) return { success: false, error: 'رابط المصدر غير صالح.' };
    const newRes = {
      id: generateId('r'),
      courseId: resData.courseId,
      topicId: resData.topicId || '',
      title: title,
      type: RESOURCE_TYPES[resData.type] ? resData.type : 'other',
      url: url,
      createdAt: Date.now()
    };
    state.resources.push(newRes);
    const saveRes = save();
    if (!saveRes.success) return saveRes;
    return { success: true, resource: newRes };
  }

  function deleteResource(id) {
    const index = state.resources.findIndex(r => r.id === id);
    if (index === -1) return { success: false, error: 'المصدر غير موجود.' };
    state.resources.splice(index, 1);
    return save();
  }

  // الشعب والجدول الدراسي (المرحلة الثالثة)
  function getSections() { return [...state.sections]; }
  function getSectionsByCourse(courseId) { return state.sections.filter(s => s.courseId === courseId); }
  function addSection(data) {
    if (!data.courseId || !getCourse(data.courseId)) return { success: false, error: 'مادة غير صالحة.' };
    const secNumber = (data.sectionNumber || '').trim();
    if (!secNumber) return { success: false, error: 'رقم الشعبة مطلوب.' };
    if (!Array.isArray(data.meetings) || data.meetings.length === 0) return { success: false, error: 'يجب إضافة لقاء واحد على الأقل.' };

    const newSec = {
      id: generateId('sec'),
      courseId: data.courseId,
      sectionNumber: secNumber,
      isPinned: Boolean(data.isPinned),
      meetings: data.meetings.map(m => ({
        id: m.id || generateId('m'),
        day: m.day,
        startTime: m.startTime,
        endTime: m.endTime,
        location: (m.location || '').trim(),
        type: m.type === 'online' ? 'online' : 'in_person',
        isLab: Boolean(m.isLab)
      })),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    state.sections.push(newSec);
    const saveRes = save();
    if (!saveRes.success) return saveRes;
    return { success: true, section: newSec };
  }

  function deleteSection(id) {
    const index = state.sections.findIndex(s => s.id === id);
    if (index === -1) return { success: false, error: 'الشعبة غير موجودة.' };
    state.sections.splice(index, 1);
    return save();
  }

  function togglePinSection(id) {
    const sec = state.sections.find(s => s.id === id);
    if (!sec) return { success: false, error: 'الشعبة غير موجودة.' };
    sec.isPinned = !sec.isPinned;
    sec.updatedAt = Date.now();
    return save();
  }

  function getScheduleConstraints() { return JSON.parse(JSON.stringify(state.scheduleConstraints)); }
  function setScheduleConstraints(data) {
    state.scheduleConstraints = { ...state.scheduleConstraints, ...data };
    return save();
  }
  function addBlockedTime(bData) {
    const item = { id: generateId('blk'), ...bData };
    state.scheduleConstraints.blockedTimes.push(item);
    return save();
  }
  function deleteBlockedTime(id) {
    state.scheduleConstraints.blockedTimes = state.scheduleConstraints.blockedTimes.filter(b => b.id !== id);
    return save();
  }
  function getSchedulePreferences() { return JSON.parse(JSON.stringify(state.schedulePreferences)); }
  function setSchedulePreferences(data) {
    state.schedulePreferences = { ...state.schedulePreferences, ...data };
    return save();
  }

  function getSavedSchedule() {
    return state.savedSchedule ? JSON.parse(JSON.stringify(state.savedSchedule)) : null;
  }
  function saveSelectedSchedule(scheduleObj) {
    state.savedSchedule = {
      id: generateId('sched'),
      savedAt: Date.now(),
      schedule: scheduleObj
    };
    return save();
  }
  function isSavedScheduleOutdated() {
    if (!state.savedSchedule || !state.savedSchedule.schedule) return false;
    const savedTime = state.savedSchedule.savedAt;
    for (const s of state.savedSchedule.schedule.sections) {
      const cur = state.sections.find(sec => sec.id === s.id);
      if (!cur || cur.updatedAt > savedTime) return true;
    }
    return false;
  }

  // -------------------------------------------------------------
  // محرك رتّب دوامي (المرحلة الثالثة)
  // -------------------------------------------------------------
  function generateSchedules(selectedCourseIds) {
    if (!Array.isArray(selectedCourseIds) || selectedCourseIds.length === 0) {
      return { success: false, error: 'يرجى اختيار مادة واحدة على الأقل لتوليد الجدول.' };
    }

    const constraints = state.scheduleConstraints;
    const preferences = state.schedulePreferences;
    const earliestMin = timeToMinutes(constraints.earliestStart);
    const latestMin = timeToMinutes(constraints.latestEnd);

    const coursesPool = [];
    for (const cId of selectedCourseIds) {
      const course = getCourse(cId);
      if (!course) continue;
      let sections = getSectionsByCourse(cId);
      if (sections.length === 0) {
        return { success: false, error: `المادة "${course.name}" لا تحتوي على أي شُعب مدخلة.` };
      }
      const pinned = sections.find(s => s.isPinned);
      if (pinned) sections = [pinned];
      coursesPool.push({ course, sections });
    }

    const validSchedules = [];
    const detectedConflicts = new Set();
    let iterationCount = 0;
    const MAX_ITERATIONS = 40000;

    function backtrack(idx, current) {
      if (iterationCount++ >= MAX_ITERATIONS) return;
      if (idx === coursesPool.length) {
        validSchedules.push(evaluateSchedule(current, preferences));
        return;
      }
      const { course, sections } = coursesPool[idx];
      for (const section of sections) {
        let valid = true;
        for (const meeting of section.meetings) {
          const sMin = timeToMinutes(meeting.startTime);
          const eMin = timeToMinutes(meeting.endTime);
          if (sMin < earliestMin || eMin > latestMin) {
            detectedConflicts.add(`مادة "${course.name}" (شعبة ${section.sectionNumber}) خارج حدود الدوام.`);
            valid = false; break;
          }
          if (constraints.forbiddenDays.includes(meeting.day)) {
            detectedConflicts.add(`مادة "${course.name}" (شعبة ${section.sectionNumber}) تقع في يوم محظور.`);
            valid = false; break;
          }
          for (const blk of constraints.blockedTimes) {
            if (blk.day === meeting.day) {
              const bs = timeToMinutes(blk.startTime);
              const be = timeToMinutes(blk.endTime);
              if (Math.max(sMin, bs) < Math.min(eMin, be)) {
                detectedConflicts.add(`مادة "${course.name}" (شعبة ${section.sectionNumber}) تتعارض مع فترة "${blk.title}".`);
                valid = false; break;
              }
            }
          }
          if (!valid) break;

          for (const exSec of current) {
            const exCourse = getCourse(exSec.courseId);
            for (const exM of exSec.meetings) {
              if (exM.day === meeting.day) {
                const exS = timeToMinutes(exM.startTime);
                const exE = timeToMinutes(exM.endTime);
                if (Math.max(sMin, exS) < Math.min(eMin, exE)) {
                  detectedConflicts.add(`تعارض بين "${course.name}" (شعبة ${section.sectionNumber}) و "${exCourse?.name}" (شعبة ${exSec.sectionNumber}).`);
                  valid = false; break;
                }
                if (constraints.travelBuffer > 0 && meeting.type === 'in_person' && exM.type === 'in_person') {
                  if ((eMin <= exS && exS < eMin + constraints.travelBuffer) || (exE <= sMin && sMin < exE + constraints.travelBuffer)) {
                    detectedConflicts.add(`وقت انتقال غير كافٍ بين "${course.name}" و "${exCourse?.name}".`);
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

    if (validSchedules.length === 0) {
      return { success: false, noSolution: true, conflicts: Array.from(detectedConflicts), error: 'تعذر العثور على أي جدول متوافق بعد فحص جميع التوافيق.' };
    }

    validSchedules.sort((a, b) => a.penaltyScore - b.penaltyScore);
    return { success: true, schedules: validSchedules.slice(0, 3) };
  }

  function evaluateSchedule(sectionsList, preferences) {
    const dayMap = {};
    DAYS.forEach(d => { dayMap[d.id] = []; });
    sectionsList.forEach(sec => {
      const course = getCourse(sec.courseId);
      sec.meetings.forEach(m => {
        dayMap[m.day].push({
          ...m,
          courseName: course ? course.name : 'مادة',
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

    const unmetPreferences = [];
    if (preferences.preferredDayOff && dayMap[preferences.preferredDayOff].length > 0) {
      const pName = DAYS.find(d => d.id === preferences.preferredDayOff)?.name || preferences.preferredDayOff;
      unmetPreferences.push(`لم يتحقق تفضيل يوم الإجازة (${pName}).`);
    }

    let penaltyScore = 0;
    if (preferences.minimizeDays) penaltyScore += attendanceDaysCount * 200;
    if (preferences.minimizeGaps) penaltyScore += totalGapMinutes * 1;
    if (preferences.preferredDayOff && dayMap[preferences.preferredDayOff].length > 0) penaltyScore += 500;

    return {
      sections: JSON.parse(JSON.stringify(sectionsList)),
      attendanceDaysCount,
      attendanceDayNames,
      totalGapMinutes,
      dailyTimes,
      dayMap,
      unmetPreferences,
      penaltyScore
    };
  }

  // -------------------------------------------------------------
  // المرحلة الرابعة: محرك خطة الدراسة الحتمي (Study Planner Engine)
  // -------------------------------------------------------------

  function getStudyPlan() {
    return JSON.parse(JSON.stringify(state.studyPlan));
  }

  function setStudyPlanSettings(newSettings) {
    state.studyPlan.settings = {
      ...state.studyPlan.settings,
      ...newSettings
    };
    return save();
  }

  function addStudyTask(taskData) {
    const course = getCourse(taskData.courseId);
    if (!course) return { success: false, error: 'المادة المحددة غير موجودة.' };

    const topicTitle = (taskData.topicTitle || '').trim();
    if (!topicTitle) return { success: false, error: 'عنوان الموضوع أو المهمة إلزامي.' };

    const estMinutes = parseInt(taskData.estimatedMinutes, 10);
    if (!estMinutes || estMinutes <= 0) return { success: false, error: 'يجب تحديد وقت دراسة تقديري بالدقائق أكبر من صفر.' };

    // إذا كان موضوعاً جديداً غير مسجل، نضيفه لقائمة موضوعات المادة لتوثيقه
    let topicId = taskData.topicId || '';
    if (!topicId) {
      const addedTopic = addTopic({
        courseId: taskData.courseId,
        title: topicTitle,
        status: taskData.understandingLevel === 'mastered' ? 'completed' : 'in_progress'
      });
      if (addedTopic.success) topicId = addedTopic.topic.id;
    }

    const newTask = {
      id: generateId('st'),
      courseId: taskData.courseId,
      courseName: course.name,
      topicId: topicId,
      topicTitle: topicTitle,
      workType: taskData.workType === 'practical' ? 'practical' : 'theory',
      difficulty: taskData.difficulty || 'medium', // easy, medium, hard
      priority: taskData.priority || 'medium',     // high, medium, low
      understandingLevel: taskData.understandingLevel || 'not_started', // not_started, needs_review, mastered
      totalEstimatedMinutes: estMinutes,
      remainingMinutes: estMinutes,
      examDate: (taskData.examDate || '').trim(), // YYYY-MM-DD
      examTime: (taskData.examTime || '23:59').trim(), // HH:MM
      reviewMinutesRequired: parseInt(taskData.reviewMinutesRequired, 10) || 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    state.studyPlan.tasks.push(newTask);
    const saveRes = save();
    if (!saveRes.success) return saveRes;
    return { success: true, task: newTask };
  }

  function updateStudyTask(id, taskData) {
    const task = state.studyPlan.tasks.find(t => t.id === id);
    if (!task) return { success: false, error: 'المهمة غير موجودة.' };

    if (taskData.topicTitle !== undefined) task.topicTitle = String(taskData.topicTitle).trim();
    if (taskData.workType !== undefined) task.workType = taskData.workType;
    if (taskData.difficulty !== undefined) task.difficulty = taskData.difficulty;
    if (taskData.priority !== undefined) task.priority = taskData.priority;
    if (taskData.understandingLevel !== undefined) task.understandingLevel = taskData.understandingLevel;
    if (taskData.examDate !== undefined) task.examDate = taskData.examDate;
    if (taskData.examTime !== undefined) task.examTime = taskData.examTime;
    if (taskData.reviewMinutesRequired !== undefined) task.reviewMinutesRequired = parseInt(taskData.reviewMinutesRequired, 10) || 0;
    if (taskData.remainingMinutes !== undefined) task.remainingMinutes = Math.max(0, parseInt(taskData.remainingMinutes, 10) || 0);

    task.updatedAt = Date.now();
    return save();
  }

  function deleteStudyTask(id) {
    state.studyPlan.tasks = state.studyPlan.tasks.filter(t => t.id !== id);
    // إزالة الجلسات غير المنجزة المرتبطة بها
    state.studyPlan.sessions = state.studyPlan.sessions.filter(s => s.taskId !== id || s.status === 'completed');
    return save();
  }

  // فحص ما إذا كانت الخطة بحاجة لإعادة فحص بعد تغيير جدول المحاضرات
  function isStudyPlanScheduleOutdated() {
    if (!state.studyPlan.lastGeneratedAt) return false;
    if (!state.savedSchedule) return false;
    return state.savedSchedule.savedAt > state.studyPlan.lastGeneratedAt;
  }

  // استخراج فترات الفراغ الحقيقية لكل يوم مع استبعاد المحاضرات والالتزامات
  function computeAvailableIntervalsForDate(dateStr) {
    const settings = state.studyPlan.settings;
    const dateObj = parseLocalDate(dateStr);
    const dayId = getDayIdFromDate(dateObj);

    // 1. الفترات الأساسية لليوم (سواء من الأيام المخصصة أو الجدول الأسبوعي)
    let baseIntervals = [];
    if (settings.customDays && settings.customDays[dateStr]) {
      baseIntervals = JSON.parse(JSON.stringify(settings.customDays[dateStr]));
    } else if (settings.dailyAvailability && settings.dailyAvailability[dayId]) {
      baseIntervals = JSON.parse(JSON.stringify(settings.dailyAvailability[dayId]));
    }

    if (baseIntervals.length === 0) return [];

    // تحويل الفترات لدقائق
    let freeWindows = baseIntervals.map(inv => ({
      start: timeToMinutes(inv.start),
      end: timeToMinutes(inv.end)
    })).filter(w => w.end > w.start);

    // 2. حجز أوقات المحاضرات من الجدول المحفوظ (إن وجد)
    const busyWindows = [];
    if (state.savedSchedule && state.savedSchedule.schedule && state.savedSchedule.schedule.dayMap) {
      const dayLectures = state.savedSchedule.schedule.dayMap[dayId] || [];
      const transit = settings.transitBuffer || 15;
      dayLectures.forEach(lec => {
        busyWindows.push({
          start: Math.max(0, lec.startMin - (lec.type === 'in_person' ? transit : 0)),
          end: lec.endMin + (lec.type === 'in_person' ? transit : 0),
          label: `محاضرة: ${lec.courseName}`
        });
      });
    }

    // 3. حجز الفترات الممنوعة (Blocked Times)
    if (state.scheduleConstraints && Array.isArray(state.scheduleConstraints.blockedTimes)) {
      state.scheduleConstraints.blockedTimes.forEach(blk => {
        if (blk.day === dayId) {
          busyWindows.push({
            start: timeToMinutes(blk.startTime),
            end: timeToMinutes(blk.endTime),
            label: blk.title
          });
        }
      });
    }

    // خصم الأوقات المشغولة من الفترات المتاحة
    busyWindows.forEach(busy => {
      const nextFree = [];
      freeWindows.forEach(free => {
        if (busy.end <= free.start || busy.start >= free.end) {
          nextFree.push(free);
        } else {
          if (busy.start > free.start) {
            nextFree.push({ start: free.start, end: busy.start });
          }
          if (busy.end < free.end) {
            nextFree.push({ start: busy.end, end: free.end });
          }
        }
      });
      freeWindows = nextFree;
    });

    return freeWindows.filter(w => w.end - w.start >= 20); // استبعاد الفترات الأقل من 20 دقيقة
  }

  // خوارزمية التوزيع الحتمية المحلية (Deterministic Rule-Based Scheduler)
  function planStudySchedule(options = {}) {
    const isDryRun = Boolean(options.dryRun);
    const settings = state.studyPlan.settings;
    const sessionLen = settings.sessionDuration || 50;
    const breakLen = settings.breakDuration || 10;

    const startObj = parseLocalDate(settings.startDate);
    const endObj = parseLocalDate(settings.endDate);

    if (endObj < startObj) {
      return { success: false, error: 'تاريخ نهاية الخطة يجب أن يكون مساوياً أو بعد تاريخ البداية.' };
    }

    // فرز المهام حسب القواعد:
    // 1. الأقرب موعد امتحان/تسليم
    // 2. الأولوية (high=3, medium=2, low=1)
    // 3. الصعوبة (hard=3, medium=2, easy=1)
    // 4. مستوى الفهم (not_started > needs_review > mastered)
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    const diffWeight = { hard: 3, medium: 2, easy: 1 };
    const undWeight = { not_started: 3, needs_review: 2, mastered: 1 };

    // نأخذ فقط المهام التي ما زال فيها وقت متبقي
    const activeTasks = state.studyPlan.tasks
      .filter(t => t.remainingMinutes > 0 || t.reviewMinutesRequired > 0)
      .map(t => ({ ...t }));

    if (activeTasks.length === 0) {
      return { success: false, error: 'لا توجد موضوعات دراسية تحتوي على وقت متبقٍ لجدولتها.' };
    }

    activeTasks.sort((a, b) => {
      // 1. تاريخ الامتحان
      const aDate = a.examDate ? `${a.examDate}T${a.examTime || '23:59'}` : '9999-12-31';
      const bDate = b.examDate ? `${b.examDate}T${b.examTime || '23:59'}` : '9999-12-31';
      if (aDate !== bDate) return aDate.localeCompare(bDate);

      // 2. الأولوية
      const pDiff = (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1);
      if (pDiff !== 0) return pDiff;

      // 3. الصعوبة
      const dDiff = (diffWeight[b.difficulty] || 1) - (diffWeight[a.difficulty] || 1);
      if (dDiff !== 0) return dDiff;

      // 4. الفهم
      return (undWeight[b.understandingLevel] || 1) - (undWeight[a.understandingLevel] || 1);
    });

    // بناء قائمة الأيام المتاحة
    const dateRangeList = [];
    let curObj = new Date(startObj);
    while (curObj <= endObj) {
      dateRangeList.push(formatLocalDate(curObj));
      curObj.setDate(curObj.getDate() + 1);
    }

    // إعداد فترات الفراغ لكل يوم
    const dailyAvailableMap = {};
    dateRangeList.forEach(dStr => {
      dailyAvailableMap[dStr] = computeAvailableIntervalsForDate(dStr);
    });

    // الحفاظ على الجلسات المكتملة مسبقاً
    const completedSessions = state.studyPlan.sessions.filter(s => s.status === 'completed');
    const newScheduledSessions = [];

    // حجز أوقات الجلسات المكتملة مسبقاً في الأيام لتفادي التداخل معها
    completedSessions.forEach(cs => {
      if (dailyAvailableMap[cs.date]) {
        const csStart = timeToMinutes(cs.startTime);
        const csEnd = timeToMinutes(cs.endTime);
        const nextFree = [];
        dailyAvailableMap[cs.date].forEach(w => {
          if (csEnd <= w.start || csStart >= w.end) {
            nextFree.push(w);
          } else {
            if (csStart > w.start) nextFree.push({ start: w.start, end: csStart });
            if (csEnd < w.end) nextFree.push({ start: csEnd, end: w.end });
          }
        });
        dailyAvailableMap[cs.date] = nextFree;
      }
    });

    const affectedTasksDeficit = [];
    let totalUnscheduledMinutes = 0;

    // أولاً: حجز أوقات المراجعة المخصصة قبل الامتحان مباشرة (Dedicated Review Sessions)
    activeTasks.forEach(task => {
      if (task.reviewMinutesRequired > 0 && task.examDate) {
        let revNeeded = task.reviewMinutesRequired;
        const examDateStr = task.examDate;
        const examEndMin = timeToMinutes(task.examTime || '23:59');

        // نبحث عن أقرب وقت متاح قبل موعد الامتحان (من الأيام السابقة للامتحان حتى يوم الامتحان قبل بدايته)
        const candidateDates = dateRangeList.filter(d => d <= examDateStr).reverse();

        for (const cDate of candidateDates) {
          if (revNeeded <= 0) break;
          const windows = dailyAvailableMap[cDate] || [];

          for (let wi = windows.length - 1; wi >= 0; wi--) {
            if (revNeeded <= 0) break;
            const win = windows[wi];
            let usableEnd = win.end;
            if (cDate === examDateStr && usableEnd > examEndMin) {
              usableEnd = examEndMin;
            }
            if (usableEnd - win.start < 20) continue;

            const availLen = usableEnd - win.start;
            const sessLen = Math.min(revNeeded, sessionLen, availLen);
            const sessStart = usableEnd - sessLen;
            const sessEnd = usableEnd;

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
              endTime: minutesToTime(sessEnd),
              durationMinutes: sessLen,
              status: 'pending',
              completedMinutes: 0
            });

            revNeeded -= sessLen;

            // تحديث نافذة الفراغ باقتطاع وقت الجلسة والاستراحة
            win.end = Math.max(win.start, sessStart - breakLen);
          }
        }

        if (revNeeded > 0) {
          totalUnscheduledMinutes += revNeeded;
          affectedTasksDeficit.push({
            taskTitle: `${task.courseName}: ${task.topicTitle} (مراجعة)`,
            unscheduledMinutes: revNeeded,
            reason: 'لم يتوفر وقت مراجعة كافٍ قبل موعد الامتحان المحدد.'
          });
        }
      }
    });

    // ثانياً: جدولة جلسات الدراسة العادية في الفترات المتاحة
    activeTasks.forEach(task => {
      let needed = task.remainingMinutes;
      const examDateStr = task.examDate || '9999-12-31';
      const examEndMin = timeToMinutes(task.examTime || '23:59');

      for (const dStr of dateRangeList) {
        if (needed <= 0) break;
        if (dStr > examDateStr) break; // لا نضع أي جلسة بعد موعد الامتحان

        const windows = dailyAvailableMap[dStr] || [];

        for (let wi = 0; wi < windows.length; wi++) {
          if (needed <= 0) break;
          const win = windows[wi];
          let usableEnd = win.end;
          if (dStr === examDateStr && usableEnd > examEndMin) {
            usableEnd = examEndMin;
          }
          if (usableEnd - win.start < 20) continue;

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
              status: 'pending',
              completedMinutes: 0
            });

            needed -= sessLen;
            win.start = sessEnd + breakLen; // احتساب وقت الاستراحة
          }
        }
      }

      if (needed > 0) {
        totalUnscheduledMinutes += needed;
        affectedTasksDeficit.push({
          taskTitle: `${task.courseName}: ${task.topicTitle}`,
          unscheduledMinutes: needed,
          reason: task.examDate ? 'انتهاء الوقت المتاح قبل موعد الامتحان.' : 'انتهاء المدى الزمني للخطة.'
        });
      }
    });

    // ترتيب الجداول الناتجة زمنياً
    newScheduledSessions.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    });

    const deficitReport = totalUnscheduledMinutes > 0 ? {
      totalUnscheduledMinutes,
      affectedTasks: affectedTasksDeficit
    } : null;

    if (isDryRun) {
      return {
        success: true,
        dryRun: true,
        previewSessions: newScheduledSessions,
        deficit: deficitReport,
        totalTasksCount: activeTasks.length,
        scheduledCount: newScheduledSessions.length
      };
    }

    // حفظ الخطة الناتجة
    state.studyPlan.sessions = [...completedSessions, ...newScheduledSessions];
    state.studyPlan.lastGeneratedAt = Date.now();
    state.studyPlan.lastDeficit = deficitReport;
    if (state.savedSchedule) {
      state.studyPlan.scheduleSavedAtRef = state.savedSchedule.savedAt;
    }

    save();

    return {
      success: true,
      sessions: state.studyPlan.sessions,
      deficit: deficitReport
    };
  }

  // تسجيل الإنجاز (كامل أو جزئي)
  function markSessionComplete(sessionId, completedMinutes = null) {
    const sess = state.studyPlan.sessions.find(s => s.id === sessionId);
    if (!sess) return { success: false, error: 'الجلسة غير موجودة.' };

    const task = state.studyPlan.tasks.find(t => t.id === sess.taskId);
    const fullDuration = sess.durationMinutes;

    if (completedMinutes === null || completedMinutes >= fullDuration) {
      // إنجاز كامل
      sess.status = 'completed';
      sess.completedMinutes = fullDuration;
      if (task) {
        task.remainingMinutes = Math.max(0, task.remainingMinutes - fullDuration);
        task.updatedAt = Date.now();
      }
    } else {
      // إنجاز جزئي
      const comp = Math.max(0, parseInt(completedMinutes, 10) || 0);
      sess.status = 'partial';
      sess.completedMinutes = comp;
      const uncompleted = fullDuration - comp;
      if (task) {
        task.remainingMinutes = Math.max(0, task.remainingMinutes - comp);
        task.updatedAt = Date.now();
      }
    }

    return save();
  }

  // تأجيل جلسة وإعادة وقتها للمهمة
  function postponeSession(sessionId) {
    const sessIndex = state.studyPlan.sessions.findIndex(s => s.id === sessionId);
    if (sessIndex === -1) return { success: false, error: 'الجلسة غير موجودة.' };
    const sess = state.studyPlan.sessions[sessIndex];

    const task = state.studyPlan.tasks.find(t => t.id === sess.taskId);
    if (task && sess.status !== 'completed') {
      const leftover = sess.durationMinutes - (sess.completedMinutes || 0);
      task.remainingMinutes += leftover;
      task.updatedAt = Date.now();
    }

    // إزالة الجلسة المؤجلة من المخطط ليعاد توزيعها لاحقاً
    state.studyPlan.sessions.splice(sessIndex, 1);
    return save();
  }

  // تعديل وقت وموعد جلسة يدوياً مع التحقق من التعارض والموعد النهائي
  function editSessionTime(sessionId, newDate, newStart, newEnd) {
    const sess = state.studyPlan.sessions.find(s => s.id === sessionId);
    if (!sess) return { success: false, error: 'الجلسة غير موجودة.' };

    const task = state.studyPlan.tasks.find(t => t.id === sess.taskId);
    const sMin = timeToMinutes(newStart);
    const eMin = timeToMinutes(newEnd);

    if (eMin <= sMin) return { success: false, error: 'وقت النهاية يجب أن يكون بعد وقت البداية.' };

    // 1. التحقق من عدم تجاوز الموعد النهائي للامتحان
    if (task && task.examDate) {
      if (newDate > task.examDate || (newDate === task.examDate && eMin > timeToMinutes(task.examTime || '23:59'))) {
        return { success: false, error: 'لا يمكن تحديد موعد الجلسة بعد موعد الامتحان المحدد للمهمة.' };
      }
    }

    // 2. التحقق من التعارض مع المحاضرات
    const dayId = getDayIdFromDate(parseLocalDate(newDate));
    if (state.savedSchedule && state.savedSchedule.schedule && state.savedSchedule.schedule.dayMap) {
      const lectures = state.savedSchedule.schedule.dayMap[dayId] || [];
      for (const lec of lectures) {
        if (Math.max(sMin, lec.startMin) < Math.min(eMin, lec.endMin)) {
          return { success: false, error: `يتعارض هذا التوقيت مع محاضرة "${lec.courseName}" (${lec.startTime} - ${lec.endTime}).` };
        }
      }
    }

    // 3. التحقق من التعارض مع جلسات دراسية أخرى في نفس اليوم
    for (const other of state.studyPlan.sessions) {
      if (other.id !== sessionId && other.date === newDate) {
        const oS = timeToMinutes(other.startTime);
        const oE = timeToMinutes(other.endTime);
        if (Math.max(sMin, oS) < Math.min(eMin, oE)) {
          return { success: false, error: `يتعارض هذا التوقيت مع جلسة دراسية أخرى: "${other.topicTitle}".` };
        }
      }
    }

    sess.date = newDate;
    sess.startTime = newStart;
    sess.endTime = newEnd;
    sess.durationMinutes = eMin - sMin;

    return save();
  }

  // حساب نسبة التقدم والإنجاز الحقيقي
  function getStudyProgressStats() {
    let totalNeededMinutes = 0;
    let completedMinutes = 0;

    state.studyPlan.tasks.forEach(t => {
      totalNeededMinutes += t.totalEstimatedMinutes;
    });

    state.studyPlan.sessions.forEach(s => {
      if (s.status === 'completed') {
        completedMinutes += s.durationMinutes;
      } else if (s.status === 'partial') {
        completedMinutes += s.completedMinutes || 0;
      }
    });

    const pct = totalNeededMinutes > 0 ? Math.min(100, Math.round((completedMinutes / totalNeededMinutes) * 100)) : 0;

    return {
      totalNeededMinutes,
      completedMinutes,
      percentage: pct,
      tasksCount: state.studyPlan.tasks.length,
      sessionsCount: state.studyPlan.sessions.length
    };
  }

  // البحث الشامل
  function globalSearch(query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) return { courses: [], topics: [], resources: [], count: 0 };
    const courses = state.courses.filter(c => c.name.toLowerCase().includes(q) || (c.code && c.code.toLowerCase().includes(q)));
    const topics = state.topics.filter(t => t.title.toLowerCase().includes(q)).map(t => {
      const c = getCourse(t.courseId);
      return { ...t, courseName: c ? c.name : '' };
    });
    return { courses, topics, resources: [], count: courses.length + topics.length };
  }

  window.SanadStore = {
    load, save,
    isCorrupted: () => isCorrupted,
    getCorruptionDetails: () => corruptionDetails,
    DAYS, MAJORS, TOPIC_STATUSES, CLASSIFICATIONS, RESOURCE_TYPES,
    escapeHtml, isValidHttpUrl, timeToMinutes, minutesToTime,
    formatLocalDate, parseLocalDate, getDayIdFromDate,
    getStudent, setStudent,
    getCourses, getCourse, addCourse, updateCourse, deleteCourse,
    toggleCourseFavorite, toggleCourseCurrentSemester,
    getTopicsByCourse, addTopic, updateTopic, deleteTopic,
    getResourcesByTopic, addResource, deleteResource,
    getSections, getSectionsByCourse, addSection, deleteSection, togglePinSection,
    getScheduleConstraints, setScheduleConstraints, addBlockedTime, deleteBlockedTime,
    getSchedulePreferences, setSchedulePreferences,
    getSavedSchedule, saveSelectedSchedule, isSavedScheduleOutdated,
    generateSchedules,
    // واجهات خطة الدراسة (المرحلة الرابعة)
    getStudyPlan, setStudyPlanSettings,
    addStudyTask, updateStudyTask, deleteStudyTask,
    planStudySchedule, markSessionComplete, postponeSession, editSessionTime,
    getStudyProgressStats, isStudyPlanScheduleOutdated,
    computeAvailableIntervalsForDate,
    globalSearch
  };

})(window);