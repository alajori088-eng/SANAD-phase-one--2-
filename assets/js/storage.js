/**
 * سند الطالب | SANAD — وحدة البيانات والتخزين والمحرك المشترك
 * المرحلة الثالثة: ترقية البنية (v3) وإضافة محرك «رتّب دوامي»
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'sanad_student_data_v3';
  const OLD_STORAGE_KEY = 'sanad_student_data_v2';
  const SCHEMA_VERSION = 3;

  const DAYS = [
    { id: 'sun', name: 'الأحد' },
    { id: 'mon', name: 'الإثنين' },
    { id: 'tue', name: 'الثلاثاء' },
    { id: 'wed', name: 'الأربعاء' },
    { id: 'thu', name: 'الخميس' }
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

  function createDefaultState() {
    return {
      schemaVersion: SCHEMA_VERSION,
      student: {
        firstName: '',
        majorId: '',
        planYear: ''
      },
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
      savedSchedule: null
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
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return h * 60 + m;
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
    if (!Array.isArray(data.resources)) return false;
    return true;
  }

  function migrateData(oldData) {
    const base = createDefaultState();
    return {
      ...base,
      ...oldData,
      schemaVersion: SCHEMA_VERSION,
      sections: Array.isArray(oldData.sections) ? oldData.sections : [],
      scheduleConstraints: {
        ...base.scheduleConstraints,
        ...(oldData.scheduleConstraints || {})
      },
      schedulePreferences: {
        ...base.schedulePreferences,
        ...(oldData.schedulePreferences || {})
      },
      savedSchedule: oldData.savedSchedule || null
    };
  }

  function load() {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const v2Raw = localStorage.getItem(OLD_STORAGE_KEY);
        if (v2Raw) {
          raw = v2Raw;
        } else {
          state = createDefaultState();
          isCorrupted = false;
          return { success: true, isNew: true };
        }
      }

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (parseErr) {
        isCorrupted = true;
        corruptionDetails = 'تعذر قراءة ملف البيانات المحفوظة لصيغة JSON غير صحيحة.';
        return { success: false, corrupted: true, error: corruptionDetails };
      }

      if (!validateSchema(parsed)) {
        isCorrupted = true;
        corruptionDetails = 'بنية البيانات المحفوظة غير متوافقة أو مفقودة.';
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
      return {
        success: false,
        error: 'تم إيقاف الحفظ التلقائي لأن البيانات المحفوظة سلفًا تالفة، وذلك لحمايتها من الاستبدال.'
      };
    }
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, serialized);
      return { success: true };
    } catch (err) {
      let msg = 'تعذر حفظ البيانات في هذا المتصفح.';
      if (err.name === 'QuotaExceededError' || err.code === 22) {
        msg = 'تم تجاوز سعة التخزين المحلي المتاحة في المتصفح.';
      }
      return { success: false, error: msg };
    }
  }

  // دوال الطالب والمواد
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
      year: courseData.year !== undefined ? String(courseData.year).trim() : current.year,
      semester: courseData.semester !== undefined ? String(courseData.semester).trim() : current.semester,
      classification: courseData.classification || current.classification,
      majors: Array.isArray(courseData.majors) ? courseData.majors : current.majors,
      description: courseData.description !== undefined ? String(courseData.description).trim() : current.description,
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

  // دوال الموضوعات والمصادر
  function getTopicsByCourse(courseId) { return state.topics.filter(t => t.courseId === courseId); }
  function addTopic(topicData) {
    const title = (topicData.title || '').trim();
    if (!title) return { success: false, error: 'عنوان الموضوع إلزامي.' };
    if (!topicData.courseId || !getCourse(topicData.courseId)) return { success: false, error: 'المادة المرتبطة غير صالحة.' };

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
    if (topicData.title !== undefined) {
      const title = String(topicData.title).trim();
      if (!title) return { success: false, error: 'عنوان الموضوع لا يمكن أن يكون فارغاً.' };
      topic.title = title;
    }
    if (topicData.description !== undefined) topic.description = String(topicData.description).trim();
    if (topicData.status && TOPIC_STATUSES[topicData.status]) topic.status = topicData.status;
    topic.updatedAt = Date.now();
    return save();
  }

  function deleteTopic(id) {
    const index = state.topics.findIndex(t => t.id === id);
    if (index === -1) return { success: false, error: 'الموضوع غير موجود.' };
    state.topics.splice(index, 1);
    state.resources = state.resources.filter(r => r.topicId !== id);
    return save();
  }

  function getResourcesByTopic(topicId) { return state.resources.filter(r => r.topicId === topicId); }
  function addResource(resData) {
    const title = (resData.title || '').trim();
    const url = (resData.url || '').trim();
    if (!title) return { success: false, error: 'عنوان المصدر إلزامي.' };
    if (!url || !isValidHttpUrl(url)) return { success: false, error: 'يجب توفير رابط صالح يبدأ بـ http:// أو https://' };
    if (!resData.courseId || !getCourse(resData.courseId)) return { success: false, error: 'المادة غير صالحة.' };

    const newRes = {
      id: generateId('r'),
      courseId: resData.courseId,
      topicId: resData.topicId || '',
      title: title,
      type: RESOURCE_TYPES[resData.type] ? resData.type : 'other',
      url: url,
      sourceName: (resData.sourceName || '').trim(),
      updateDate: (resData.updateDate || '').trim(),
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

  // دوال الشعب (Sections)
  function getSections() { return [...state.sections]; }
  function getSectionsByCourse(courseId) { return state.sections.filter(s => s.courseId === courseId); }
  function getSection(id) { return state.sections.find(s => s.id === id) || null; }

  function addSection(data) {
    if (!data.courseId || !getCourse(data.courseId)) {
      return { success: false, error: 'يجب اختيار مادة صحيحة للشعبة.' };
    }
    const sectionNumber = (data.sectionNumber || '').trim();
    if (!sectionNumber) {
      return { success: false, error: 'رقم الشعبة مطلوب.' };
    }
    if (!Array.isArray(data.meetings) || data.meetings.length === 0) {
      return { success: false, error: 'يجب إضافة لقاء واحد على الأقل للشعبة (محاضرة أو مختبر).' };
    }

    for (let i = 0; i < data.meetings.length; i++) {
      const m = data.meetings[i];
      if (!m.day || !m.startTime || !m.endTime) {
        return { success: false, error: `اللقاء رقم (${i + 1}) غير مكتمل اليوم أو التوقيت.` };
      }
      if (timeToMinutes(m.startTime) >= timeToMinutes(m.endTime)) {
        return { success: false, error: `في اللقاء رقم (${i + 1}): وقت البداية يجب أن يكون قبل وقت النهاية.` };
      }
    }

    const newSection = {
      id: generateId('sec'),
      courseId: data.courseId,
      sectionNumber: sectionNumber,
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

    state.sections.push(newSection);
    const saveRes = save();
    if (!saveRes.success) return saveRes;
    return { success: true, section: newSection };
  }

  function updateSection(id, data) {
    const index = state.sections.findIndex(s => s.id === id);
    if (index === -1) return { success: false, error: 'الشعبة غير موجودة.' };

    const sectionNumber = (data.sectionNumber || '').trim();
    if (!sectionNumber) return { success: false, error: 'رقم الشعبة مطلوب.' };

    if (!Array.isArray(data.meetings) || data.meetings.length === 0) {
      return { success: false, error: 'يجب أن تحتوي الشعبة على لقاء واحد على الأقل.' };
    }

    for (let i = 0; i < data.meetings.length; i++) {
      const m = data.meetings[i];
      if (!m.day || !m.startTime || !m.endTime) {
        return { success: false, error: `اللقاء رقم (${i + 1}) غير مكتمل اليوم أو التوقيت.` };
      }
      if (timeToMinutes(m.startTime) >= timeToMinutes(m.endTime)) {
        return { success: false, error: `في اللقاء رقم (${i + 1}): وقت البداية يجب أن يكون قبل النهاية.` };
      }
    }

    const current = state.sections[index];
    state.sections[index] = {
      ...current,
      sectionNumber: sectionNumber,
      isPinned: data.isPinned !== undefined ? Boolean(data.isPinned) : current.isPinned,
      meetings: data.meetings.map(m => ({
        id: m.id || generateId('m'),
        day: m.day,
        startTime: m.startTime,
        endTime: m.endTime,
        location: (m.location || '').trim(),
        type: m.type === 'online' ? 'online' : 'in_person',
        isLab: Boolean(m.isLab)
      })),
      updatedAt: Date.now()
    };

    const saveRes = save();
    if (!saveRes.success) return saveRes;
    return { success: true, section: state.sections[index] };
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

  // القيود والتفضيلات
  function getScheduleConstraints() {
    return JSON.parse(JSON.stringify(state.scheduleConstraints));
  }

  function setScheduleConstraints(data) {
    state.scheduleConstraints = {
      earliestStart: data.earliestStart || '08:00',
      latestEnd: data.latestEnd || '18:00',
      forbiddenDays: Array.isArray(data.forbiddenDays) ? data.forbiddenDays : [],
      travelBuffer: typeof data.travelBuffer === 'number' ? data.travelBuffer : parseInt(data.travelBuffer, 10) || 0,
      blockedTimes: Array.isArray(data.blockedTimes) ? data.blockedTimes : []
    };
    return save();
  }

  function addBlockedTime(blockedData) {
    const title = (blockedData.title || '').trim();
    if (!title) return { success: false, error: 'عنوان الفترة الممنوعة مطلوب.' };
    if (!blockedData.day || !blockedData.startTime || !blockedData.endTime) {
      return { success: false, error: 'اليوم ووقت البداية والنهاية مطلوبان.' };
    }
    if (timeToMinutes(blockedData.startTime) >= timeToMinutes(blockedData.endTime)) {
      return { success: false, error: 'وقت البداية يجب أن يكون قبل وقت النهاية.' };
    }

    const item = {
      id: generateId('block'),
      title: title,
      day: blockedData.day,
      startTime: blockedData.startTime,
      endTime: blockedData.endTime
    };
    state.scheduleConstraints.blockedTimes.push(item);
    const saveRes = save();
    if (!saveRes.success) return saveRes;
    return { success: true, item };
  }

  function deleteBlockedTime(id) {
    const index = state.scheduleConstraints.blockedTimes.findIndex(b => b.id === id);
    if (index === -1) return { success: false, error: 'الفترة غير موجودة.' };
    state.scheduleConstraints.blockedTimes.splice(index, 1);
    return save();
  }

  function getSchedulePreferences() {
    return JSON.parse(JSON.stringify(state.schedulePreferences));
  }

  function setSchedulePreferences(data) {
    state.schedulePreferences = {
      minimizeDays: Boolean(data.minimizeDays),
      minimizeGaps: Boolean(data.minimizeGaps),
      preferredDayOff: data.preferredDayOff || ''
    };
    return save();
  }

  // حفظ واستعادة الجدول وفحص التعديل اللاحق
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

  function deleteSavedSchedule() {
    state.savedSchedule = null;
    return save();
  }

  function isSavedScheduleOutdated() {
    if (!state.savedSchedule || !state.savedSchedule.schedule) return false;
    const savedTime = state.savedSchedule.savedAt;
    const secIds = state.savedSchedule.schedule.sections.map(s => s.id);

    for (const sid of secIds) {
      const currentSec = state.sections.find(s => s.id === sid);
      if (!currentSec) return true; // حُذفت شعبة
      if (currentSec.updatedAt > savedTime) return true; // عُدلت شعبة
      const currentCourse = state.courses.find(c => c.id === currentSec.courseId);
      if (!currentCourse || currentCourse.updatedAt > savedTime) return true;
    }
    return false;
  }

  // -------------------------------------------------------------
  // محرك توليد الجداول والتحقق من القيود (Schedule Engine)
  // -------------------------------------------------------------

  function checkMeetingConflict(m1, m2, travelBuffer) {
    if (m1.day !== m2.day) return null;

    const s1 = timeToMinutes(m1.startTime);
    const e1 = timeToMinutes(m1.endTime);
    const s2 = timeToMinutes(m2.startTime);
    const e2 = timeToMinutes(m2.endTime);

    // تداخل مباشر
    if (Math.max(s1, s2) < Math.min(e1, e2)) {
      return `تداخل مباشر في التوقيت بين (${m1.startTime}-${m1.endTime}) و (${m2.startTime}-${m2.endTime})`;
    }

    // فحص وقت الانتقال بين اللقاءات الوجاهية فقط
    if (travelBuffer > 0 && m1.type === 'in_person' && m2.type === 'in_person') {
      if (e1 <= s2 && s2 < e1 + travelBuffer) {
        return `وقت انتقال غير كافٍ (${s2 - e1} دقيقة متاحة بينما المطلوب ${travelBuffer} دقيقة)`;
      }
      if (e2 <= s1 && s1 < e2 + travelBuffer) {
        return `وقت انتقال غير كافٍ (${s1 - e2} دقيقة متاحة بينما المطلوب ${travelBuffer} دقيقة)`;
      }
    }

    return null;
  }

  function generateSchedules(selectedCourseIds) {
    if (!Array.isArray(selectedCourseIds) || selectedCourseIds.length === 0) {
      return { success: false, error: 'يرجى اختيار مادة واحدة على الأقل لتوليد الجدول.' };
    }

    const constraints = state.scheduleConstraints;
    const preferences = state.schedulePreferences;
    const earliestMin = timeToMinutes(constraints.earliestStart);
    const latestMin = timeToMinutes(constraints.latestEnd);

    // تجهيز الشعب المتاحة لكل مادة مع احترام التثبيت
    const coursesPool = [];
    for (const cId of selectedCourseIds) {
      const course = getCourse(cId);
      if (!course) continue;

      let sections = getSectionsByCourse(cId);
      if (sections.length === 0) {
        return {
          success: false,
          error: `المادة "${course.name}" لا تحتوي على أي شعب مدخلة. يرجى إضافة شعب لها أولاً.`
        };
      }

      // إذا كانت هناك شعبة مثبتة، يُلزم المحرك بها فقط
      const pinnedSection = sections.find(s => s.isPinned);
      if (pinnedSection) {
        sections = [pinnedSection];
      }

      coursesPool.push({ course, sections });
    }

    const validSchedules = [];
    const detectedConflicts = new Set();
    let iterationCount = 0;
    const MAX_ITERATIONS = 40000;
    let hitTechnicalLimit = false;

    function backtrack(courseIdx, currentSections) {
      if (iterationCount >= MAX_ITERATIONS) {
        hitTechnicalLimit = true;
        return;
      }
      iterationCount++;

      if (courseIdx === coursesPool.length) {
        validSchedules.push(evaluateSchedule(currentSections, preferences));
        return;
      }

      const { course, sections } = coursesPool[courseIdx];

      for (const section of sections) {
        let sectionValid = true;

        // 1. فحص لقاءات الشعبة ضد نفسها والقيود الفردية
        for (const meeting of section.meetings) {
          const mStart = timeToMinutes(meeting.startTime);
          const mEnd = timeToMinutes(meeting.endTime);

          // فحص الحدود الزمنية المسموحة
          if (mStart < earliestMin || mEnd > latestMin) {
            detectedConflicts.add(
              `مادة "${course.name}" (شعبة ${section.sectionNumber}): موعدها (${meeting.startTime}-${meeting.endTime}) يقع خارج حدود الدوام المسموحة (${constraints.earliestStart}-${constraints.latestEnd}).`
            );
            sectionValid = false;
            break;
          }

          // فحص يوم الحضور المحظور
          if (constraints.forbiddenDays.includes(meeting.day)) {
            const dayName = DAYS.find(d => d.id === meeting.day)?.name || meeting.day;
            detectedConflicts.add(
              `مادة "${course.name}" (شعبة ${section.sectionNumber}): لقاؤها يقع في يوم (${dayName}) وهو يوم محظور الحضور لديك.`
            );
            sectionValid = false;
            break;
          }

          // فحص التداخل مع الفترات الممنوعة (العمل / الاستراحة)
          for (const blocked of constraints.blockedTimes) {
            if (blocked.day === meeting.day) {
              const bStart = timeToMinutes(blocked.startTime);
              const bEnd = timeToMinutes(blocked.endTime);
              if (Math.max(mStart, bStart) < Math.min(mEnd, bEnd)) {
                const dayName = DAYS.find(d => d.id === meeting.day)?.name || meeting.day;
                detectedConflicts.add(
                  `مادة "${course.name}" (شعبة ${section.sectionNumber}) تتعارض مع فترة "${blocked.title}" يوم ${dayName} (${blocked.startTime}-${blocked.endTime}).`
                );
                sectionValid = false;
                break;
              }
            }
          }
          if (!sectionValid) break;

          // فحص التعارض مع الشعب المختارة سلفاً في التفرع الحالي
          for (const existingSec of currentSections) {
            const existingCourse = getCourse(existingSec.courseId);
            for (const exMeeting of existingSec.meetings) {
              const conflictMsg = checkMeetingConflict(meeting, exMeeting, constraints.travelBuffer);
              if (conflictMsg) {
                const dayName = DAYS.find(d => d.id === meeting.day)?.name || meeting.day;
                detectedConflicts.add(
                  `تعارض يوم ${dayName} بين مادة "${course.name}" (شعبة ${section.sectionNumber}) ومادة "${existingCourse?.name}" (شعبة ${existingSec.sectionNumber}): ${conflictMsg}.`
                );
                sectionValid = false;
                break;
              }
            }
            if (!sectionValid) break;
          }
          if (!sectionValid) break;
        }

        if (sectionValid) {
          currentSections.push(section);
          backtrack(courseIdx + 1, currentSections);
          currentSections.pop();
        }
      }
    }

    backtrack(0, []);

    if (validSchedules.length === 0) {
      if (hitTechnicalLimit) {
        return {
          success: false,
          technicalLimit: true,
          error: 'توقف البحث مؤقتاً بسبب الوصول إلى الحد الأقصى من الاحتمالات المفحوصة (حد تقني لحماية استجابة المتصفح). هذا لا يعني بالضرورة عدم وجود حل، بل يعني وجود عدد كبير جداً من التوافيق. يُنصح بتثبيت بعض الشُعب أو تقليل المواد مؤقتاً.'
        };
      }
      return {
        success: false,
        noSolution: true,
        conflicts: Array.from(detectedConflicts),
        error: 'لم يتم العثور على أي جدول متوافق بعد فحص جميع التوافيق الممكنة.'
      };
    }

    // ترتيب الجداول وفق التفضيلات (أفضل ترتيب = أقل نقاط جزائية)
    validSchedules.sort((a, b) => a.penaltyScore - b.penaltyScore);

    // استخراج أفضل 3 جداول متميزة
    const topThree = validSchedules.slice(0, 3);

    return {
      success: true,
      totalFound: validSchedules.length,
      schedules: topThree
    };
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
          courseCode: course ? course.code : '',
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
      const meetings = dayMap[d.id];
      if (meetings.length > 0) {
        attendanceDaysCount++;
        attendanceDayNames.push(d.name);
        meetings.sort((a, b) => a.startMin - b.startMin);

        const firstStart = meetings[0].startTime;
        const lastEnd = meetings[meetings.length - 1].endTime;
        dailyTimes[d.id] = { start: firstStart, end: lastEnd };

        for (let i = 0; i < meetings.length - 1; i++) {
          const gap = meetings[i + 1].startMin - meetings[i].endMin;
          if (gap > 0) {
            totalGapMinutes += gap;
          }
        }
      }
    });

    const unmetPreferences = [];

    // فحص تفضيل يوم الإجازة
    if (preferences.preferredDayOff) {
      if (dayMap[preferences.preferredDayOff].length > 0) {
        const pName = DAYS.find(d => d.id === preferences.preferredDayOff)?.name || preferences.preferredDayOff;
        unmetPreferences.push(`لم يتحقق تفضيل يوم الإجازة (${pName}) لوجود محاضرات فيه.`);
      }
    }

    // حساب النقاط الجزائية للترتيب
    let penaltyScore = 0;
    if (preferences.minimizeDays) penaltyScore += attendanceDaysCount * 200;
    if (preferences.minimizeGaps) penaltyScore += totalGapMinutes * 1;
    if (preferences.preferredDayOff && dayMap[preferences.preferredDayOff].length > 0) {
      penaltyScore += 500;
    }

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

  function globalSearch(query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) return { courses: [], topics: [], resources: [], count: 0 };

    const courses = state.courses.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.code && c.code.toLowerCase().includes(q)) ||
      (c.description && c.description.toLowerCase().includes(q))
    );

    const topics = state.topics.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q))
    ).map(t => {
      const course = getCourse(t.courseId);
      return { ...t, courseName: course ? course.name : 'مادة غير معروفة' };
    });

    const resources = state.resources.filter(r =>
      r.title.toLowerCase().includes(q) ||
      (r.sourceName && r.sourceName.toLowerCase().includes(q))
    ).map(r => {
      const course = getCourse(r.courseId);
      return { ...r, courseName: course ? course.name : 'مادة غير معروفة' };
    });

    return { courses, topics, resources, count: courses.length + topics.length + resources.length };
  }

  window.SanadStore = {
    load,
    save,
    isCorrupted: () => isCorrupted,
    getCorruptionDetails: () => corruptionDetails,
    DAYS,
    MAJORS,
    TOPIC_STATUSES,
    CLASSIFICATIONS,
    RESOURCE_TYPES,
    escapeHtml,
    isValidHttpUrl,
    timeToMinutes,
    minutesToTime,
    getStudent,
    setStudent,
    getCourses,
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse,
    toggleCourseFavorite,
    toggleCourseCurrentSemester,
    getTopicsByCourse,
    addTopic,
    updateTopic,
    deleteTopic,
    getResourcesByTopic,
    addResource,
    deleteResource,
    getSections,
    getSectionsByCourse,
    getSection,
    addSection,
    updateSection,
    deleteSection,
    togglePinSection,
    getScheduleConstraints,
    setScheduleConstraints,
    addBlockedTime,
    deleteBlockedTime,
    getSchedulePreferences,
    setSchedulePreferences,
    getSavedSchedule,
    saveSelectedSchedule,
    deleteSavedSchedule,
    isSavedScheduleOutdated,
    generateSchedules,
    globalSearch
  };

})(window);