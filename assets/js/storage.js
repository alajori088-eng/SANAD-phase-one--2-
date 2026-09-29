/**
 * سند الطالب | SANAD — وحدة البيانات والتخزين المشتركة
 * المرحلة الثانية: تخزين محلي، بنية موحدة، وتحقق من صحة البيانات
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'sanad_student_data_v2';
  const SCHEMA_VERSION = 2;

  // قائمة التخصصات الخمسة المعتمدة لكلية الذكاء الاصطناعي في البلقاء التطبيقية
  const MAJORS = [
    { id: 'ai_robotics', name: 'الذكاء الاصطناعي والروبوتات' },
    { id: 'data_science', name: 'علم البيانات والذكاء الاصطناعي' },
    { id: 'cyber_security', name: 'الأمن السيبراني' },
    { id: 'software_eng', name: 'هندسة البرمجيات' },
    { id: 'computer_science', name: 'علم الحاسوب' }
  ];

  // الحالات المعتمدة للموضوعات
  const TOPIC_STATUSES = {
    not_started: { label: 'لم أبدأ', color: 'muted' },
    in_progress: { label: 'قيد الدراسة', color: 'primary' },
    completed: { label: 'مكتمل', color: 'accent' },
    needs_review: { label: 'بحاجة مراجعة', color: 'warning' }
  };

  // تصنيفات المواد
  const CLASSIFICATIONS = {
    univ_req: 'متطلب جامعة',
    college_req: 'متطلب كلية',
    major_req: 'متطلب تخصص',
    elective: 'مادة اختيارية',
    unspecified: 'غير محدد'
  };

  // أنواع المصادر
  const RESOURCE_TYPES = {
    explanation: 'شرح',
    summary: 'ملخص',
    practical: 'تدريب عملي',
    reference: 'مرجع',
    slides: 'سلايدات',
    questions: 'أسئلة وامتحانات',
    other: 'أخرى'
  };

  // البنية الافتراضية الأولية
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
      resources: []
    };
  }

  // توليد معرفات فريدة ثابتة
  function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;
  }

  // التحقق من صحة الرابط (http أو https فقط)
  function isValidHttpUrl(string) {
    if (!string || typeof string !== 'string') return false;
    try {
      const url = new URL(string.trim());
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  // تطهير النصوص للحماية من ثغرات الحقن XSS
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  let state = createDefaultState();
  let isCorrupted = false;
  let corruptionDetails = null;

  // التحقق من البنية
  function validateSchema(data) {
    if (!data || typeof data !== 'object') return false;
    if (typeof data.schemaVersion !== 'number' || data.schemaVersion < 1) return false;
    if (!data.student || typeof data.student !== 'object') return false;
    if (!Array.isArray(data.courses)) return false;
    if (!Array.isArray(data.topics)) return false;
    if (!Array.isArray(data.resources)) return false;
    return true;
  }

  // تحميل البيانات من التخزين المحلي
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
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
        corruptionDetails = 'تعذر قراءة ملف البيانات المحفوظة لصيغة JSON غير صحيحة.';
        return { success: false, corrupted: true, error: corruptionDetails };
      }

      if (!validateSchema(parsed)) {
        isCorrupted = true;
        corruptionDetails = 'بنية البيانات المحفوظة غير متوافقة أو مفقودة.';
        return { success: false, corrupted: true, error: corruptionDetails };
      }

      state = parsed;
      isCorrupted = false;
      return { success: true, data: state };
    } catch (e) {
      isCorrupted = true;
      corruptionDetails = 'تعذر الوصول إلى التخزين المحلي للمتصفح.';
      return { success: false, error: e.message };
    }
  }

  // حفظ البيانات مع التعامل مع أخطاء الحفظ وتفادي الكتابة فوق البيانات التالفة
  function save() {
    if (isCorrupted) {
      return {
        success: false,
        error: 'تم إيقاف الحفظ التلقائي لأن البيانات المحفوظة سلفًا في المتصفح تالفة، وذلك لحمايتها من الاستبدال.'
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

  // دوال بيانات الطالب
  function getStudent() {
    return { ...state.student };
  }

  function setStudent(data) {
    state.student = {
      firstName: (data.firstName || '').trim(),
      majorId: (data.majorId || '').trim(),
      planYear: (data.planYear || '').trim()
    };
    return save();
  }

  // دوال المواد (Courses)
  function getCourses() {
    return [...state.courses];
  }

  function getCourse(id) {
    return state.courses.find(c => c.id === id) || null;
  }

  function addCourse(courseData) {
    const name = (courseData.name || '').trim();
    if (!name) {
      return { success: false, error: 'اسم المادة إلزامي.' };
    }

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

    // حذف المادة وموضوعاتها ومصادرها التابعة
    state.courses.splice(courseIndex, 1);
    state.topics = state.topics.filter(t => t.courseId !== id);
    state.resources = state.resources.filter(r => r.courseId !== id);

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

  // دوال الموضوعات (Topics)
  function getTopicsByCourse(courseId) {
    return state.topics.filter(t => t.courseId === courseId);
  }

  function addTopic(topicData) {
    const title = (topicData.title || '').trim();
    if (!title) return { success: false, error: 'عنوان الموضوع إلزامي.' };
    if (!topicData.courseId || !getCourse(topicData.courseId)) {
      return { success: false, error: 'المادة المرتبطة غير صالحة.' };
    }

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
    if (topicData.description !== undefined) {
      topic.description = String(topicData.description).trim();
    }
    if (topicData.status && TOPIC_STATUSES[topicData.status]) {
      topic.status = topicData.status;
    }
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

  // دوال المصادر (Resources)
  function getResourcesByTopic(topicId) {
    return state.resources.filter(r => r.topicId === topicId);
  }

  function getResourcesByCourse(courseId) {
    return state.resources.filter(r => r.courseId === courseId);
  }

  function addResource(resData) {
    const title = (resData.title || '').trim();
    const url = (resData.url || '').trim();

    if (!title) return { success: false, error: 'عنوان المصدر إلزامي.' };
    if (!url || !isValidHttpUrl(url)) {
      return { success: false, error: 'يجب توفير رابط صالح يبدأ بـ http:// أو https://' };
    }
    if (!resData.courseId || !getCourse(resData.courseId)) {
      return { success: false, error: 'المادة المرتبطة غير صالحة.' };
    }

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

  // البحث الشامل في المواد والموضوعات والمصادر
  function globalSearch(query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) {
      return { courses: [], topics: [], resources: [], count: 0 };
    }

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

    return {
      courses,
      topics,
      resources,
      count: courses.length + topics.length + resources.length
    };
  }

  // تصدير واجهة التخزين إلى النطاق العام
  window.SanadStore = {
    load,
    save,
    isCorrupted: () => isCorrupted,
    getCorruptionDetails: () => corruptionDetails,
    MAJORS,
    TOPIC_STATUSES,
    CLASSIFICATIONS,
    RESOURCE_TYPES,
    escapeHtml,
    isValidHttpUrl,
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
    getResourcesByCourse,
    addResource,
    deleteResource,
    globalSearch
  };

})(window);