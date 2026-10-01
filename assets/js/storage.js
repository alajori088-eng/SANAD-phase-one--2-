/**
 * سند الطالب | SANAD — وحدة البيانات والتخزين والمحرك المشترك (v4 المستقر)
 * تحديث الخطة الجديدة لتخصص أمن المعلومات والفضاء الإلكتروني
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
    { id: 'cyber_security', name: 'أمن المعلومات والفضاء الإلكتروني' },
    { id: 'virtual_reality', name: 'الواقع الافتراضي' },
    { id: 'ai_robotics', name: 'الذكاء الاصطناعي والروبوتات' },
    { id: 'digital_forensics', name: 'التحقيقات الجنائية الرقمية' },
    { id: 'data_science', name: 'علم البيانات والذكاء الاصطناعي' },
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

  // قاعدة بيانات الخطط الشجرية (القديمة والجديدة)
  const CURRICULUM_DATA = {
    // -------------------------------------------------------------
    // أمن المعلومات والفضاء الإلكتروني
    // -------------------------------------------------------------
    cyber_security: {
      old: [
        { id: 'cs_skills_1', name: 'مهارات الحاسوب والتعليم الالكتروني', hours: 3, level: 1, prereq: [], coreq: ['cs_skills_2'], hasLab: false },
        { id: 'cs_skills_2', name: 'مهارات الحاسوب (2) علمية (مختبر ++C)', hours: 3, level: 1, prereq: [], coreq: ['cs_skills_1'], hasLab: true },
        { id: 'unix_intro', name: 'مقدمة الى يونكس', hours: 3, level: 1, prereq: [], coreq: [], hasLab: false },
        { id: 'digital_logic', name: 'تصميم المنطق الرقمي', hours: 3, level: 1, prereq: [], coreq: [], hasLab: true },
        { id: 'calc_1', name: 'التفاضل والتكامل (1)', hours: 3, level: 1, prereq: [], coreq: [], hasLab: false },
        { id: 'ar_app', name: 'لغة عربية تطبيقية', hours: 3, level: 1, prereq: [], coreq: [], hasLab: false },
        { id: 'en_app_1', name: 'لغة انجليزية تطبيقية (1)', hours: 3, level: 1, prereq: [], coreq: [], hasLab: false },
        { id: 'oop', name: 'البرمجة الموجهة للكائنات', hours: 3, level: 2, prereq: ['cs_skills_2'], coreq: [], hasLab: true },
        { id: 'sec_foundations', name: 'مبادئ امن المعلومات والفضاء الالكتروني', hours: 3, level: 2, prereq: ['cs_skills_2'], coreq: [], hasLab: false },
        { id: 'net_1', name: 'شبكات الحاسوب (1)', hours: 3, level: 2, prereq: ['unix_intro'], coreq: [], hasLab: true },
        { id: 'calc_2', name: 'التفاضل والتكامل (2)', hours: 3, level: 2, prereq: ['calc_1'], coreq: [], hasLab: false },
        { id: 'prob_stat', name: 'الاحتمالات والاحصاء', hours: 3, level: 2, prereq: ['calc_1'], coreq: [], hasLab: false },
        { id: 'discrete_math', name: 'الهياكل والرياضيات المنفصلة', hours: 3, level: 2, prereq: ['calc_1'], coreq: [], hasLab: false },
        { id: 'en_app_2', name: 'لغة انجليزية تطبيقية (2)', hours: 3, level: 2, prereq: ['en_app_1'], coreq: [], hasLab: false },
        { id: 'net_2', name: 'شبكات الحاسوب (2)', hours: 3, level: 3, prereq: ['net_1'], coreq: [], hasLab: true },
        { id: 'num_theory', name: 'مقدمة في نظرية الاعداد', hours: 3, level: 3, prereq: ['discrete_math'], coreq: [], hasLab: false },
        { id: 'crypto_intro', name: 'اساسيات التشفير', hours: 3, level: 3, prereq: ['sec_foundations', 'num_theory'], coreq: [], hasLab: false },
        { id: 'crypto_adv', name: 'التشفير المتقدم', hours: 3, level: 3, prereq: ['crypto_intro'], coreq: [], hasLab: false },
        { id: 'ai_intro', name: 'مقدمة في الذكاء الاصطناعي', hours: 3, level: 3, prereq: ['discrete_math'], coreq: [], hasLab: false },
        { id: 'ai_prog', name: 'برمجة الذكاء الاصطناعي', hours: 3, level: 3, prereq: ['ai_intro'], coreq: [], hasLab: false },
        { id: 'machine_learning', name: 'تعلم الآلة', hours: 3, level: 3, prereq: ['ai_intro'], coreq: [], hasLab: true },
        { id: 'data_structures', name: 'هياكل البيانات', hours: 3, level: 3, prereq: ['oop'], coreq: [], hasLab: false },
        { id: 'secure_sw_eng', name: 'هندسة البرمجيات الامنة', hours: 3, level: 3, prereq: ['data_structures'], coreq: [], hasLab: false },
        { id: 'scripting', name: 'البرمجة النصية', hours: 3, level: 3, prereq: ['data_structures'], coreq: [], hasLab: false },
        { id: 'mobile_dev', name: 'تطوير تطبيقات الهاتف المحمول', hours: 3, level: 3, prereq: ['data_structures'], coreq: [], hasLab: false },
        { id: 'db_1', name: 'تصميم وادارة قواعد بيانات (1)', hours: 3, level: 3, prereq: ['data_structures'], coreq: [], hasLab: true },
        { id: 'eng_os', name: 'نظم التشغيل الهندسة', hours: 3, level: 3, prereq: ['data_structures'], coreq: [], hasLab: false },
        { id: 'algorithms', name: 'تصميم وتحليل الخوارزميات', hours: 3, level: 3, prereq: ['data_structures'], coreq: [], hasLab: true },
        { id: 'sys_analysis', name: 'تحليل وتصميم النظم', hours: 3, level: 3, prereq: ['data_structures'], coreq: [], hasLab: false },
        { id: 'net_sec', name: 'أمن شبكات', hours: 3, level: 3, prereq: ['net_2'], coreq: [], hasLab: true },
        { id: 'cyber_law', name: 'قانون واخلاقيات الفضاء الالكتروني', hours: 3, level: 4, prereq: ['net_sec'], coreq: [], hasLab: false },
        { id: 'risk_mgmt', name: 'ادارة مخاطر', hours: 3, level: 4, prereq: ['cyber_law'], coreq: [], hasLab: false },
        { id: 'digital_forensics_course', name: 'تحقيقات جنائية الرقمية', hours: 3, level: 4, prereq: ['cyber_law'], coreq: [], hasLab: false },
        { id: 'penetration_testing', name: 'اختبار اختراق', hours: 3, level: 4, prereq: ['cyber_law'], coreq: [], hasLab: true },
        { id: 'web_prog', name: 'برمجة الويب', hours: 3, level: 4, prereq: ['cyber_law'], coreq: [], hasLab: true },
        { id: 'sec_policy_design', name: 'تصميم وتحليل السياسيات', hours: 3, level: 4, prereq: ['net_sec'], coreq: [], hasLab: false, isElective: true },
        { id: 'iot_sec', name: 'انترنت الاشياء وامنها', hours: 3, level: 4, prereq: ['net_sec'], coreq: [], hasLab: false, isElective: true },
        { id: 'cloud_sec', name: 'امن الحوسبة السحابية', hours: 3, level: 4, prereq: ['net_sec'], coreq: [], hasLab: false, isElective: true },
        { id: 'web_sec', name: 'امن الويب', hours: 3, level: 4, prereq: ['web_prog'], coreq: [], hasLab: false, isElective: true },
        { id: 'cyber_intel_audit', name: 'استخبارات الفضاء الالكتروني والتدقيق', hours: 3, level: 4, prereq: ['cyber_law'], coreq: [], hasLab: false, isElective: true }
      ],
      new: [
        // المستوى 1
        { id: 'n_calc_1', name: 'التفاضل والتكامل 1', hours: 3, level: 1, prereq: [], coreq: [], hasLab: false },
        { id: 'n_infra_sec_unix', name: 'امن البنية التحتية باستخدام يونكس (مختبر)', hours: 3, level: 1, prereq: [], coreq: [], hasLab: true },
        { id: 'n_cyber_foundations', name: 'مبادئ الامن السيبراني', hours: 3, level: 1, prereq: [], coreq: [], hasLab: false },
        { id: 'n_oop_lab', name: 'برمجة موجهة للكائنات (مختبر)', hours: 3, level: 1, prereq: [], coreq: [], hasLab: true },

        // المستوى 2
        { id: 'n_calc_2', name: 'التفاضل والتكامل 2', hours: 3, level: 2, prereq: ['n_calc_1'], coreq: [], hasLab: false },
        { id: 'n_linear_algebra', name: 'الجبر الخطى', hours: 3, level: 2, prereq: ['n_calc_1'], coreq: [], hasLab: false },
        { id: 'n_prob_stat', name: 'الاحتمالات والاحصاء', hours: 3, level: 2, prereq: ['n_calc_1'], coreq: [], hasLab: false },
        { id: 'n_discrete_math', name: 'الهياكل الرياضيات المنفصلة', hours: 3, level: 2, prereq: ['n_calc_1'], coreq: [], hasLab: false },
        { id: 'n_penetration_test', name: 'اختبار الاختراق (مختبر)', hours: 3, level: 2, prereq: ['n_infra_sec_unix'], coreq: [], hasLab: true },
        { id: 'n_computer_networks', name: 'شبكات حاسوب (مختبر)', hours: 3, level: 2, prereq: ['n_cyber_foundations'], coreq: [], hasLab: true },
        { id: 'n_data_structures', name: 'هياكل بيانات (مختبر)', hours: 3, level: 2, prereq: ['n_oop_lab'], coreq: [], hasLab: true },

        // المستوى 3
        { id: 'n_digital_logic', name: 'تصميم المنطق الرقمي', hours: 3, level: 3, prereq: ['n_discrete_math'], coreq: [], hasLab: false },
        { id: 'n_net_sec', name: 'امن شبكات', hours: 3, level: 3, prereq: ['n_computer_networks'], coreq: [], hasLab: false },
        { id: 'n_algo', name: 'تصميم وتحليل خوارزميات', hours: 3, level: 3, prereq: ['n_data_structures'], coreq: [], hasLab: false },
        { id: 'n_db_sec', name: 'قواعد بيانات وامنها (مختبر)', hours: 3, level: 3, prereq: ['n_data_structures'], coreq: [], hasLab: true },
        { id: 'n_web_prog', name: 'برمجة الويب (مختبر)', hours: 3, level: 3, prereq: ['n_data_structures'], coreq: [], hasLab: true },

        // المستوى 4
        { id: 'n_crypto_basics', name: 'اساسيات التشفير', hours: 3, level: 4, prereq: ['n_digital_logic'], coreq: [], hasLab: false },
        { id: 'n_os', name: 'نظم تشغيل', hours: 3, level: 4, prereq: ['n_digital_logic'], coreq: [], hasLab: false },
        { id: 'n_risk_ethics', name: 'ادارة المخاطر والاخلاقيات', hours: 3, level: 4, prereq: ['n_net_sec'], coreq: [], hasLab: false },
        { id: 'n_cyber_intel', name: 'الاستخبارات الامنية', hours: 3, level: 4, prereq: ['n_net_sec'], coreq: [], hasLab: false },
        { id: 'n_defense_sec', name: 'الامن الدفاعي', hours: 3, level: 4, prereq: ['n_net_sec'], coreq: [], hasLab: false },
        { id: 'n_digital_forensics', name: 'تحقيقات جنائية الرقمية', hours: 3, level: 4, prereq: ['n_net_sec'], coreq: [], hasLab: false },
        { id: 'n_telecom_protocols', name: 'بروتوكولات الاتصالات الامنية', hours: 3, level: 4, prereq: ['n_net_sec'], coreq: [], hasLab: false },
        { id: 'n_web_apps_sec', name: 'امن الويب والتطبيقات', hours: 3, level: 4, prereq: ['n_web_prog'], coreq: [], hasLab: false }
      ]
    },

    // بقية التخصصات (تمتلك الخطة القديمة، والخطة الجديدة فارغة مؤقتاً)
    virtual_reality: {
      old: [
        { id: 'cs_skills_1', name: 'مهارات حاسوب وتعلم الكتروني', hours: 3, level: 1, prereq: [], coreq: ['cs_skills_2'], hasLab: false },
        { id: 'cs_skills_2', name: 'مهارات حاسوب (2) للكليات العلمية (مختبر)', hours: 3, level: 1, prereq: [], coreq: ['cs_skills_1'], hasLab: true },
        { id: 'calc_1', name: 'التفاضل والتكامل (1)', hours: 3, level: 1, prereq: [], coreq: [], hasLab: false },
        { id: 'math_for_graphics', name: 'الرياضيات للرسم بالحاسوب', hours: 3, level: 1, prereq: [], coreq: [], hasLab: false },
        { id: 'vr_intro', name: 'مقدمة الى الواقع الافتراضي', hours: 3, level: 1, prereq: [], coreq: [], hasLab: false },
        { id: 'unix_intro', name: 'مقدمة الى يونكس', hours: 3, level: 1, prereq: [], coreq: [], hasLab: false },
        { id: 'ar_app', name: 'لغة عربية تطبيقية', hours: 3, level: 1, prereq: [], coreq: [], hasLab: false },
        { id: 'en_app_1', name: 'لغة انجليزية تطبيقية (1)', hours: 3, level: 1, prereq: [], coreq: [], hasLab: false },
        { id: 'en_app_2', name: 'لغة انجليزية تطبيقية (2)', hours: 3, level: 2, prereq: ['en_app_1'], coreq: [], hasLab: false },
        { id: 'calc_2', name: 'التفاضل والتكامل (2)', hours: 3, level: 2, prereq: ['calc_1'], coreq: [], hasLab: false },
        { id: 'discrete_math', name: 'هياكل رياضيات منفصلة', hours: 3, level: 2, prereq: ['calc_1'], coreq: [], hasLab: false },
        { id: 'intermediate_analysis', name: 'مبادئ التحليل الوسطي', hours: 3, level: 2, prereq: ['calc_2', 'math_for_graphics'], coreq: [], hasLab: false },
        { id: 'storyboard_design', name: 'تصميم القصة المصورة للواقع الافتراضي والمعزز', hours: 3, level: 2, prereq: ['vr_intro'], coreq: [], hasLab: false },
        { id: 'oop', name: 'البرمجة الموجهة للكائنات (مختبر)', hours: 3, level: 2, prereq: ['cs_skills_2'], coreq: [], hasLab: true },
        { id: 'ai_intro', name: 'مقدمة في الذكاء الاصطناعي', hours: 3, level: 2, prereq: ['discrete_math'], coreq: [], hasLab: false },
        { id: 'hci', name: 'تفاعل الانسان والحاسوب', hours: 3, level: 3, prereq: ['storyboard_design'], coreq: [], hasLab: false },
        { id: 'ux_design', name: 'تصميم تجربة المستخدم', hours: 3, level: 3, prereq: ['hci'], coreq: [], hasLab: false, isElective: true },
        { id: 'computer_graphics', name: 'الرسم بالحاسوب', hours: 3, level: 3, prereq: ['hci', 'intermediate_analysis'], coreq: [], hasLab: false },
        { id: 'image_processing', name: 'معالجة الصور', hours: 3, level: 3, prereq: ['computer_graphics'], coreq: [], hasLab: false },
        { id: 'multimedia', name: 'الوسائط المتعددة', hours: 3, level: 3, prereq: ['computer_graphics'], coreq: [], hasLab: false },
        { id: 'data_structures_algo', name: 'هياكل بيانات وخوارزميات (مختبر)', hours: 3, level: 3, prereq: ['oop'], coreq: [], hasLab: true },
        { id: 'ai_prog', name: 'برمجة الذكاء الاصطناعي', hours: 3, level: 3, prereq: ['ai_intro'], coreq: [], hasLab: false },
        { id: 'machine_learning', name: 'تعلم الآلة', hours: 3, level: 3, prereq: ['ai_intro', 'data_structures_algo'], coreq: [], hasLab: false },
        { id: 'computer_vision', name: 'رؤية الكمبيوتر', hours: 3, level: 3, prereq: ['machine_learning', 'image_processing'], coreq: [], hasLab: false },
        { id: 'animation_2d', name: 'رسوم متحركة ثنائية الابعاد (مختبر)', hours: 3, level: 3, prereq: ['multimedia'], coreq: [], hasLab: true },
        { id: 'modeling_3d', name: 'تصميم النماذج ثلاثية الابعاد', hours: 3, level: 3, prereq: ['multimedia'], coreq: [], hasLab: false },
        { id: 'sculpting', name: 'نسخ الرسوم والنحت', hours: 3, level: 3, prereq: ['modeling_3d'], coreq: [], hasLab: false, isElective: true },
        { id: 'digital_movies', name: 'تصميم افلام رقمية', hours: 3, level: 4, prereq: ['sculpting'], coreq: [], hasLab: false, isElective: true },
        { id: 'game_design_dev', name: 'تصميم وتطوير الالعاب الالكترونية (مختبر)', hours: 3, level: 4, prereq: ['animation_2d'], coreq: [], hasLab: true },
        { id: 'game_ai', name: 'الذكاء الاصطناعي للالعاب الالكترونية', hours: 3, level: 4, prereq: ['game_design_dev'], coreq: [], hasLab: false, isElective: true },
        { id: 'vr_systems_design', name: 'تصميم وبناء انظمة الواقع الافتراضي', hours: 3, level: 4, prereq: ['modeling_3d'], coreq: [], hasLab: false },
        { id: 'haptics_intro', name: 'المقدمة الى تكنولوجيا الهابتك', hours: 3, level: 4, prereq: ['vr_systems_design'], coreq: [], hasLab: false },
        { id: 'mobile_vr', name: 'الواقع الافتراضي على منصات الجوال', hours: 3, level: 4, prereq: ['vr_systems_design', 'computer_vision'], coreq: [], hasLab: false },
        { id: 'adv_prog', name: 'برمجة متقدمة', hours: 3, level: 4, prereq: ['data_structures_algo'], coreq: [], hasLab: false },
        { id: 'db_1', name: 'تصميم وادارة قواعد البيانات (1) (مختبر)', hours: 3, level: 4, prereq: ['data_structures_algo'], coreq: [], hasLab: true },
        { id: 'web_app_prog', name: 'برمجة تطبيقات الانترنت', hours: 3, level: 4, prereq: ['db_1'], coreq: [], hasLab: false },
        { id: 'systems_analysis_design', name: 'تحليل وتصميم النظم', hours: 3, level: 4, prereq: [], coreq: [], hasLab: false, isElective: true },
        { id: 'gis', name: 'انظمة المعلومات الجغرافية', hours: 3, level: 4, prereq: [], coreq: [], hasLab: false, isElective: true },
        { id: 'special_topics_vr', name: 'موضوعات خاصة في الواقع الافتراضي', hours: 3, level: 4, prereq: [], coreq: [], hasLab: false, isElective: true },
        { id: 'parallel_computing', name: 'الحوسبة المتوازنة', hours: 3, level: 4, prereq: [], coreq: [], hasLab: false, isElective: true },
        { id: 'iot', name: 'انترنت الاشياء', hours: 3, level: 4, prereq: [], coreq: [], hasLab: false, isElective: true }
      ],
      new: []
    },

    ai_robotics: {
      old: [
        { id: 'cs_skills_1', name: 'مهارات الحاسوب والتعليم الالكتروني', hours: 3, level: 1, prereq: [], coreq: ['cs_skills_2'], hasLab: false },
        { id: 'cs_skills_2', name: 'مهارات الحاسوب (2) علمية (مختبر ++C)', hours: 3, level: 1, prereq: [], coreq: ['cs_skills_1'], hasLab: true },
        { id: 'calc_1', name: 'التفاضل والتكامل (1)', hours: 3, level: 1, prereq: [], coreq: [], hasLab: false },
        { id: 'unix_intro', name: 'مقدمة الى يونكس', hours: 3, level: 1, prereq: [], coreq: [], hasLab: false },
        { id: 'digital_logic', name: 'تصميم المنطق الرقمي', hours: 3, level: 1, prereq: [], coreq: [], hasLab: true },
        { id: 'ar_app', name: 'لغة عربية تطبيقية', hours: 3, level: 1, prereq: [], coreq: [], hasLab: false },
        { id: 'en_app_1', name: 'لغة انجليزية تطبيقية (1)', hours: 3, level: 1, prereq: [], coreq: [], hasLab: false },
        { id: 'oop', name: 'البرمجة الموجهة للكائنات', hours: 3, level: 2, prereq: ['cs_skills_2'], coreq: [], hasLab: true },
        { id: 'calc_2', name: 'التفاضل والتكامل (2)', hours: 3, level: 2, prereq: ['calc_1'], coreq: [], hasLab: false },
        { id: 'linear_algebra', name: 'الجبر الخطي', hours: 3, level: 2, prereq: ['calc_1'], coreq: [], hasLab: false },
        { id: 'prob_stat', name: 'الاحتمالات والاحصاء', hours: 3, level: 2, prereq: ['calc_1'], coreq: [], hasLab: false },
        { id: 'arch', name: 'معمارية الحاسوب', hours: 3, level: 2, prereq: ['digital_logic'], coreq: [], hasLab: false },
        { id: 'kinematics_dynamics', name: 'أساسيات الحركية والديناميكا للروبوتات', hours: 3, level: 2, prereq: ['calc_2'], coreq: [], hasLab: false },
        { id: 'en_app_2', name: 'لغة انجليزية تطبيقية (2)', hours: 3, level: 2, prereq: ['en_app_1'], coreq: [], hasLab: false },
        { id: 'data_structures', name: 'هياكل البيانات', hours: 3, level: 3, prereq: ['oop'], coreq: [], hasLab: false },
        { id: 'ai_intro', name: 'مقدمة في الذكاء الاصطناعي', hours: 3, level: 3, prereq: ['oop'], coreq: [], hasLab: false },
        { id: 'eng_os', name: 'نظم التشغيل الهندسية', hours: 3, level: 3, prereq: ['arch'], coreq: [], hasLab: false },
        { id: 'circuits_electronics', name: 'الدوائر والالكترونيات للروبوتات', hours: 3, level: 3, prereq: ['kinematics_dynamics'], coreq: [], hasLab: false },
        { id: 'algorithms', name: 'تصميم وتحليل الخوارزميات', hours: 3, level: 3, prereq: ['data_structures'], coreq: [], hasLab: true },
        { id: 'ai_prog', name: 'برمجة الذكاء الاصطناعي', hours: 3, level: 3, prereq: ['ai_intro'], coreq: [], hasLab: false },
        { id: 'machine_learning', name: 'تعلم الآلة', hours: 3, level: 3, prereq: ['ai_intro', 'prob_stat'], coreq: [], hasLab: false },
        { id: 'sw_eng', name: 'هندسة البرمجيات', hours: 3, level: 3, prereq: ['ai_intro'], coreq: [], hasLab: false },
        { id: 'embedded_systems', name: 'الأنظمة المضمنة', hours: 3, level: 3, prereq: ['eng_os'], coreq: [], hasLab: false },
        { id: 'auto_control_robots', name: 'أنظمة التحكم الآلي للروبوتات', hours: 3, level: 4, prereq: ['embedded_systems'], coreq: [], hasLab: true },
        { id: 'mobile_robots', name: 'مقدمة الروبوتات المتنقلة', hours: 3, level: 4, prereq: ['machine_learning'], coreq: [], hasLab: false },
        { id: 'knowledge_rep', name: 'تمثيل المعرفة والاستدلال', hours: 3, level: 4, prereq: ['machine_learning'], coreq: [], hasLab: false },
        { id: 'nlp', name: 'معالجة اللغة الطبيعية', hours: 3, level: 4, prereq: ['machine_learning'], coreq: [], hasLab: false },
        { id: 'robot_vision', name: 'روبورت الرؤية', hours: 3, level: 4, prereq: ['mobile_robots'], coreq: [], hasLab: false },
        { id: 'cognitive_robots', name: 'ريبوتات الادراك (مختبر 1 و 2)', hours: 3, level: 4, prereq: ['mobile_robots'], coreq: [], hasLab: true },
        { id: 'hri', name: 'تفاعل الانسان والروبوت', hours: 3, level: 4, prereq: ['cognitive_robots'], coreq: [], hasLab: false },
        { id: 'opt_intro', name: 'مقدمة إلى التحسين', hours: 3, level: 4, prereq: ['circuits_electronics'], coreq: [], hasLab: false, isElective: true },
        { id: 'fuzzy_systems', name: 'الأنظمة المشوشة', hours: 3, level: 4, prereq: ['opt_intro'], coreq: [], hasLab: false, isElective: true },
        { id: 'deep_learning', name: 'التعلم العميق (مختبر ذكاء 1 و 2)', hours: 3, level: 4, prereq: ['fuzzy_systems'], coreq: [], hasLab: true, isElective: true },
        { id: 'text_mining', name: 'التنقيب الذكي عن النصوص', hours: 3, level: 4, prereq: ['nlp'], coreq: [], hasLab: false, isElective: true },
        { id: 'social_net_analysis', name: 'تحليل الشبكات والاجتماعية', hours: 3, level: 4, prereq: ['nlp'], coreq: [], hasLab: false, isElective: true },
        { id: 'speech_rec', name: 'التعرف على الكلام وفهمه', hours: 3, level: 4, prereq: ['nlp'], coreq: [], hasLab: false, isElective: true },
        { id: 'parallel_prog_ai', name: 'البرمجة المتوازية للتطبيقات الذكية', hours: 3, level: 4, prereq: ['algorithms'], coreq: [], hasLab: false, isElective: true }
      ],
      new: []
    },

    digital_forensics: {
      old: [
        { id: 'cs_skills_1', name: 'مهارات الحاسوب والتعليم الإلكتروني', hours: 3, level: 1, prereq: [], coreq: ['cs_skills_2'], hasLab: false },
        { id: 'cs_skills_2', name: 'مهارات الحاسوب (2) علمية (مختبر ++C)', hours: 3, level: 1, prereq: [], coreq: ['cs_skills_1'], hasLab: true },
        { id: 'calc_1', name: 'التفاضل والتكامل (1)', hours: 3, level: 1, prereq: [], coreq: [], hasLab: false },
        { id: 'unix_intro', name: 'مقدمة إلى يونكس', hours: 3, level: 1, prereq: [], coreq: [], hasLab: false },
        { id: 'digital_logic', name: 'تصميم المنطق الرقمي', hours: 3, level: 1, prereq: [], coreq: [], hasLab: true },
        { id: 'ar_app', name: 'لغة عربية تطبيقية', hours: 3, level: 1, prereq: [], coreq: [], hasLab: false },
        { id: 'en_app_1', name: 'لغة إنجليزية تطبيقية (1)', hours: 3, level: 1, prereq: [], coreq: [], hasLab: false },
        { id: 'oop', name: 'البرمجة الموجهة للكائنات', hours: 3, level: 2, prereq: ['cs_skills_2'], coreq: [], hasLab: true },
        { id: 'sec_foundations', name: 'مبادئ أمن المعلومات والفضاء الإلكتروني', hours: 3, level: 2, prereq: ['cs_skills_2'], coreq: [], hasLab: false },
        { id: 'calc_2', name: 'التفاضل والتكامل (2)', hours: 3, level: 2, prereq: ['calc_1'], coreq: [], hasLab: false },
        { id: 'discrete_math', name: 'الهياكل والرياضيات المنفصلة', hours: 3, level: 2, prereq: ['calc_1'], coreq: [], hasLab: false },
        { id: 'prob_stat', name: 'الاحتمالات والإحصاء', hours: 3, level: 2, prereq: ['calc_1'], coreq: [], hasLab: false },
        { id: 'en_app_2', name: 'لغة إنجليزية تطبيقية (2)', hours: 3, level: 2, prereq: ['en_app_1'], coreq: [], hasLab: false },
        { id: 'os_df', name: 'نظم التشغيل للتحقيقات الجنائية', hours: 3, level: 2, prereq: ['unix_intro', 'digital_logic'], coreq: [], hasLab: false },
        { id: 'data_structures', name: 'هياكل بيانات', hours: 3, level: 3, prereq: ['oop'], coreq: [], hasLab: false },
        { id: 'net_1', name: 'شبكات الحاسوب 1', hours: 3, level: 3, prereq: ['sec_foundations'], coreq: [], hasLab: true },
        { id: 'crypto_intro', name: 'أساسيات التشفير', hours: 3, level: 3, prereq: ['sec_foundations'], coreq: [], hasLab: false },
        { id: 'ai_intro', name: 'مقدمة في الذكاء الاصطناعي', hours: 3, level: 3, prereq: ['discrete_math'], coreq: [], hasLab: false },
        { id: 'df_os', name: 'التحقيقات الرقمية لأنظمة التشغيل', hours: 3, level: 3, prereq: ['os_df'], coreq: [], hasLab: false },
        { id: 'db_1', name: 'تصميم وإدارة قواعد البيانات (1)', hours: 3, level: 3, prereq: ['data_structures'], coreq: [], hasLab: true },
        { id: 'algorithms', name: 'تصميم وتحليل الخوارزميات', hours: 3, level: 3, prereq: ['data_structures'], coreq: [], hasLab: true },
        { id: 'net_sec', name: 'أمن شبكات', hours: 3, level: 3, prereq: ['net_1'], coreq: [], hasLab: true },
        { id: 'data_recovery', name: 'استعادة البيانات', hours: 3, level: 4, prereq: ['df_os'], coreq: [], hasLab: true },
        { id: 'df_networks', name: 'تحقيقات جنائية في الشبكات', hours: 3, level: 4, prereq: ['net_sec'], coreq: [], hasLab: false },
        { id: 'df_databases', name: 'تحقيقات جنائية قواعد البيانات', hours: 3, level: 4, prereq: ['db_1'], coreq: [], hasLab: false },
        { id: 'df_privacy', name: 'خصوصية وحماية بيانات', hours: 3, level: 4, prereq: ['crypto_intro'], coreq: [], hasLab: false },
        { id: 'ml_intro', name: 'تعلم الآلة', hours: 3, level: 4, prereq: ['ai_intro', 'prob_stat'], coreq: [], hasLab: true },
        { id: 'ai_prog', name: 'برمجة الذكاء الاصطناعي', hours: 3, level: 4, prereq: ['ai_intro'], coreq: [], hasLab: false },
        { id: 'df_mobile', name: 'تحقيقات الأجهزة النقالة', hours: 3, level: 4, prereq: ['df_networks'], coreq: [], hasLab: false },
        { id: 'df_justice', name: 'التحقيقات الجنائية الرقمية والعدالة', hours: 3, level: 4, prereq: ['df_networks'], coreq: [], hasLab: false },
        { id: 'df_fraud', name: 'تدقيق الاحتيال الرقمي', hours: 3, level: 4, prereq: ['df_networks'], coreq: [], hasLab: false, isElective: true },
        { id: 'law_intro', name: 'مدخل إلى علم قانون', hours: 3, level: 4, prereq: [], coreq: [], hasLab: false, isElective: true },
        { id: 'penal_code', name: 'قانون العقوبات قسم عام', hours: 3, level: 4, prereq: ['law_intro'], coreq: [], hasLab: false, isElective: true },
        { id: 'cyber_crime_laws', name: 'القوانين الوطنية للجرائم الإلكترونية', hours: 3, level: 4, prereq: ['df_os'], coreq: [], hasLab: false, isElective: true },
        { id: 'threats_counter', name: 'التهديدات الأمنية ومكافحتها', hours: 3, level: 4, prereq: ['df_os'], coreq: [], hasLab: false, isElective: true },
        { id: 'sec_policies', name: 'تحليل مخاطر السياسات الأمنية', hours: 3, level: 4, prereq: ['df_databases'], coreq: [], hasLab: false, isElective: true },
        { id: 'it_crimes', name: 'جرائم تكنولوجيا المعلومات', hours: 3, level: 4, prereq: ['df_databases'], coreq: [], hasLab: false, isElective: true }
      ],
      new: []
    },

    data_science: {
      old: [
        { id: 'cs_skills_1', name: 'مهارات الحاسوب والتعليم الالكتروني', hours: 3, level: 1, prereq: [], coreq: ['cs_skills_2'], hasLab: false },
        { id: 'cs_skills_2', name: 'مهارات الحاسوب (2) لطلبة الكليات العلمية (مختبر)', hours: 3, level: 1, prereq: [], coreq: ['cs_skills_1'], hasLab: true },
        { id: 'calc_1', name: 'التفاضل والتكامل (1)', hours: 3, level: 1, prereq: [], coreq: [], hasLab: false },
        { id: 'unix_intro', name: 'مقدمة الى يونكس', hours: 3, level: 1, prereq: [], coreq: [], hasLab: false },
        { id: 'ar_app', name: 'لغة عربية تطبيقية', hours: 3, level: 1, prereq: [], coreq: [], hasLab: false },
        { id: 'en_app_1', name: 'لغة انجليزية تطبيقية (1)', hours: 3, level: 1, prereq: [], coreq: [], hasLab: false },
        { id: 'oop', name: 'البرمجة الموجهة للكائنات (مختبر)', hours: 3, level: 2, prereq: ['cs_skills_2'], coreq: [], hasLab: true },
        { id: 'sec_foundations', name: 'امن الحاسوب والشبكات', hours: 3, level: 2, prereq: ['cs_skills_2'], coreq: [], hasLab: false },
        { id: 'calc_2', name: 'التفاضل والتكامل (2)', hours: 3, level: 2, prereq: ['calc_1'], coreq: [], hasLab: false },
        { id: 'discrete_math', name: 'الهياكل والرياضيات المنفصلة', hours: 3, level: 2, prereq: ['calc_1'], coreq: [], hasLab: false },
        { id: 'ai_intro', name: 'مقدمة في الذكاء الاصطناعي', hours: 3, level: 2, prereq: ['discrete_math'], coreq: [], hasLab: false },
        { id: 'ds_foundations', name: 'اساسيات علم البيانات (مختبر)', hours: 3, level: 2, prereq: ['unix_intro'], coreq: [], hasLab: true },
        { id: 'en_app_2', name: 'لغة انجليزية تطبيقية (2)', hours: 3, level: 2, prereq: ['en_app_1'], coreq: [], hasLab: false },
        { id: 'data_structures', name: 'هياكل بيانات', hours: 3, level: 3, prereq: ['oop'], coreq: [], hasLab: false },
        { id: 'db_1', name: 'تصميم وادارة قواعد بيانات (1) (مختبر)', hours: 3, level: 3, prereq: ['oop'], coreq: [], hasLab: true },
        { id: 'algorithms', name: 'تصميم وتحليل الخوارزميات', hours: 3, level: 3, prereq: ['data_structures'], coreq: [], hasLab: true },
        { id: 'adv_data_structures', name: 'هياكل بيانات متقدمة (مختبر)', hours: 3, level: 3, prereq: ['data_structures'], coreq: [], hasLab: true },
        { id: 'data_mining', name: 'تنقيب البيانات (مختبر)', hours: 3, level: 3, prereq: ['data_structures'], coreq: [], hasLab: true },
        { id: 'data_analysis', name: 'تحليل البيانات', hours: 3, level: 3, prereq: ['discrete_math'], coreq: [], hasLab: false },
        { id: 'prob_stat', name: 'الاحتمالات والاحصاء (مختبر)', hours: 3, level: 3, prereq: ['calc_2'], coreq: [], hasLab: true },
        { id: 'intermediate_analysis', name: 'مبادئ التحليل الوسطي', hours: 3, level: 3, prereq: ['calc_2'], coreq: [], hasLab: false },
        { id: 'ai_prog', name: 'برمجة الذكاء الاصطناعي', hours: 3, level: 3, prereq: ['ai_intro'], coreq: [], hasLab: false },
        { id: 'cloud_computing', name: 'الحوسبة السحابية', hours: 3, level: 3, prereq: ['ds_foundations'], coreq: [], hasLab: false },
        { id: 'iot', name: 'انترنت الاشياء', hours: 3, level: 3, prereq: ['ds_foundations'], coreq: [], hasLab: false },
        { id: 'se_for_ds', name: 'هندسة البرمجيات لعلم البيانات', hours: 3, level: 3, prereq: ['ds_foundations'], coreq: [], hasLab: false, isElective: true },
        { id: 'ds_prog_langs', name: 'لغات برمجة علم البيانات (مختبر)', hours: 3, level: 3, prereq: ['ds_foundations'], coreq: [], hasLab: true, isElective: true },
        { id: 'machine_learning', name: 'تعلم الآلة (مختبر)', hours: 3, level: 4, prereq: ['intermediate_analysis', 'prob_stat'], coreq: [], hasLab: true },
        { id: 'computer_vision', name: 'الرؤية بالحاسوب', hours: 3, level: 4, prereq: ['machine_learning'], coreq: [], hasLab: false },
        { id: 'sentiment_analysis', name: 'تحليل الميول للبيانات الضخمة', hours: 3, level: 4, prereq: ['data_analysis'], coreq: [], hasLab: false },
        { id: 'big_data_analysis', name: 'تحليل البيانات الضخمة', hours: 3, level: 4, prereq: ['data_analysis'], coreq: [], hasLab: false },
        { id: 'parallel_computing', name: 'الحوسبة المتوازية', hours: 3, level: 4, prereq: ['data_structures'], coreq: [], hasLab: false },
        { id: 'pattern_recognition', name: 'التعرف على الانماط', hours: 3, level: 4, prereq: ['adv_data_structures'], coreq: [], hasLab: false },
        { id: 'data_warehouses', name: 'مخازن البيانات', hours: 3, level: 4, prereq: ['adv_data_structures'], coreq: [], hasLab: false },
        { id: 'ir_systems', name: 'نظام استرجاع المعلومات', hours: 3, level: 4, prereq: ['adv_data_structures'], coreq: [], hasLab: false },
        { id: 'db_2', name: 'تصميم وادارة قواعد بيانات (2)', hours: 3, level: 4, prereq: ['db_1'], coreq: [], hasLab: false },
        { id: 'web_apps', name: 'برمجة تطبيقات الانترنت', hours: 3, level: 4, prereq: ['db_1'], coreq: [], hasLab: false },
        { id: 'mobile_apps', name: 'برمجة تطبيقات الموبايل (مختبر)', hours: 3, level: 4, prereq: ['web_apps'], coreq: [], hasLab: true },
        { id: 'social_net_analysis', name: 'تحليل الشبكات الاجتماعية', hours: 3, level: 4, prereq: ['ds_prog_langs'], coreq: [], hasLab: false, isElective: true },
        { id: 'nlp', name: 'معالجة اللغة الطبيعية', hours: 3, level: 4, prereq: ['mobile_apps'], coreq: [], hasLab: false, isElective: true }
      ],
      new: []
    },

    software_eng: { old: [], new: [] },
    computer_science: { old: [], new: [] }
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
      student: { firstName: '', majorId: 'cyber_security', planYear: '2023' },
      courses: [],
      topics: [],
      resources: [],
      sections: [],
      passedCurriculumCourses: [],
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
          dailyStartTime: '16:00',
          dailyEndTime: '22:00',
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
      passedCurriculumCourses: Array.isArray(oldData.passedCurriculumCourses) ? oldData.passedCurriculumCourses : [],
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
      let parsed = JSON.parse(raw);
      if (!validateSchema(parsed)) {
        isCorrupted = true;
        corruptionDetails = 'بنية البيانات غير مطابقة.';
        return { success: false, corrupted: true };
      }
      state = migrateData(parsed);
      isCorrupted = false;
      save();
      return { success: true, data: state };
    } catch (e) {
      isCorrupted = true;
      corruptionDetails = 'تعذر قراءة البيانات المحفوظة.';
      return { success: false, error: e.message };
    }
  }

  function save() {
    if (isCorrupted) return { success: false, error: 'تم تجميد الحفظ لحماية البيانات.' };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'تعذر الحفظ في مساحة التخزين.' };
    }
  }

  function resetFactory() {
    localStorage.removeItem(STORAGE_KEY);
    state = createDefaultState();
    isCorrupted = false;
    corruptionDetails = null;
    save();
    return { success: true };
  }

  function getStudent() { return { ...state.student }; }
  function setStudent(data) {
    state.student = { firstName: (data.firstName || '').trim(), majorId: (data.majorId || 'cyber_security').trim(), planYear: (data.planYear || '2023').trim() };
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

  function deleteCourse(id) {
    state.courses = state.courses.filter(c => c.id !== id);
    state.topics = state.topics.filter(t => t.courseId !== id);
    state.resources = state.resources.filter(r => r.courseId !== id);
    state.sections = state.sections.filter(s => s.courseId !== id);
    state.studyPlan.tasks = state.studyPlan.tasks.filter(t => t.courseId !== id);
    state.studyPlan.sessions = state.studyPlan.sessions.filter(s => s.courseId !== id);

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
    const taskIds = state.studyPlan.tasks.filter(t => t.topicId === id).map(t => t.id);
    state.topics = state.topics.filter(t => t.id !== id);
    state.resources = state.resources.filter(r => r.topicId !== id);
    state.studyPlan.tasks = state.studyPlan.tasks.filter(t => t.topicId !== id);
    state.studyPlan.sessions = state.studyPlan.sessions.filter(s => !taskIds.includes(s.taskId));
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

  function togglePinSection(id) {
    const sec = state.sections.find(s => s.id === id);
    if (!sec) return { success: false, error: 'الشعبة غير موجودة.' };
    sec.isPinned = !sec.isPinned;
    sec.updatedAt = Date.now();
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
    if (!state.savedSchedule || !state.savedSchedule.schedule || !Array.isArray(state.savedSchedule.schedule.sections)) return false;
    const savedTime = state.savedSchedule.savedAt;
    for (const savedSec of state.savedSchedule.schedule.sections) {
      const cur = state.sections.find(s => s.id === savedSec.id);
      if (!cur || cur.updatedAt > savedTime) return true;
    }
    return false;
  }

  function generateSchedules(selectedCourseIds) {
    if (!selectedCourseIds || selectedCourseIds.length === 0) return { success: false, error: 'اختر مادة واحدة على الأقل.' };
    const constraints = state.scheduleConstraints;
    const preferences = state.schedulePreferences || { minimizeDays: true, minimizeGaps: true, preferredDayOff: '' };
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
            detectedConflicts.add(`مادة "${course.name}" تقع خارج أوقات الدوام المسموح.`);
            valid = false; break;
          }
          if (constraints.forbiddenDays.includes(meeting.day)) {
            detectedConflicts.add(`مادة "${course.name}" تقع في يوم ممنوع الحضور فيه.`);
            valid = false; break;
          }

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

    validSchedules.sort((a, b) => a.penaltyScore - b.penaltyScore);
    return { success: true, schedules: validSchedules.slice(0, 3) };
  }

  function evaluateSchedule(sectionsList, preferences = {}) {
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

    let penaltyScore = 0;
    if (preferences.minimizeDays) penaltyScore += attendanceDaysCount * 200;
    if (preferences.minimizeGaps) penaltyScore += totalGapMinutes * 1;
    if (preferences.preferredDayOff && dayMap[preferences.preferredDayOff]?.length > 0) penaltyScore += 500;

    return {
      sections: JSON.parse(JSON.stringify(sectionsList)),
      attendanceDaysCount,
      attendanceDayNames,
      totalGapMinutes,
      dailyTimes,
      dayMap,
      penaltyScore
    };
  }

  function getStudyPlan() { return JSON.parse(JSON.stringify(state.studyPlan)); }
  function setStudyPlanSettings(newSettings) {
    state.studyPlan.settings = { ...state.studyPlan.settings, ...newSettings };
    if (newSettings.dailyStartTime && newSettings.dailyEndTime) {
      const dStart = newSettings.dailyStartTime;
      const dEnd = newSettings.dailyEndTime;
      const avail = state.studyPlan.settings.dailyAvailability;
      ['sun', 'mon', 'tue', 'wed', 'thu'].forEach(day => {
        avail[day] = [{ start: dStart, end: dEnd }];
      });
    }
    return save();
  }

  function addStudyTask(taskData) {
    const course = getCourse(taskData.courseId);
    if (!course) return { success: false, error: 'المادة غير موجودة.' };
    const est = parseInt(taskData.estimatedMinutes, 10) || 60;
    const rev = parseInt(taskData.reviewMinutesRequired, 10) || 0;

    let finalTopicId = taskData.topicId || '';
    if (!finalTopicId && taskData.topicTitle) {
      const addedTopic = addTopic({
        courseId: taskData.courseId,
        title: taskData.topicTitle,
        status: taskData.understandingLevel === 'mastered' ? 'completed' : 'in_progress'
      });
      if (addedTopic.success) finalTopicId = addedTopic.topic.id;
    }

    const newTask = {
      id: generateId('st'),
      courseId: taskData.courseId,
      courseName: course.name,
      topicId: finalTopicId,
      topicTitle: taskData.topicTitle,
      workType: taskData.workType || 'theory',
      difficulty: taskData.difficulty || 'medium',
      priority: taskData.priority || 'medium',
      understandingLevel: taskData.understandingLevel || 'not_started',
      totalEstimatedMinutes: est,
      remainingMinutes: est,
      examDate: taskData.examDate || '',
      examTime: taskData.examTime || '23:59',
      reviewMinutesRequired: rev
    };
    state.studyPlan.tasks.push(newTask);
    save();
    return { success: true, task: newTask };
  }

  function deleteStudyTask(taskId) {
    state.studyPlan.tasks = state.studyPlan.tasks.filter(t => t.id !== taskId);
    state.studyPlan.sessions = state.studyPlan.sessions.filter(s => s.taskId !== taskId);
    return save();
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
        const busyStart = Math.max(0, lec.startMin - (lec.type === 'in_person' ? transit : 0));
        const busyEnd = lec.endMin + (lec.type === 'in_person' ? transit : 0);
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

    const todayStr = formatLocalDate(new Date());
    const effectiveStartStr = settings.startDate < todayStr ? todayStr : settings.startDate;
    const startObj = parseLocalDate(effectiveStartStr);
    const endObj = parseLocalDate(settings.endDate);

    const activeTasks = state.studyPlan.tasks
      .map(t => {
        const copy = { ...t };
        if (!copy.examDate && copy.reviewMinutesRequired > 0) {
          copy.remainingMinutes += copy.reviewMinutesRequired;
          copy.reviewMinutesRequired = 0;
        }
        return copy;
      })
      .filter(t => t.remainingMinutes > 0 || t.reviewMinutesRequired > 0);

    if (activeTasks.length === 0) return { success: false, error: 'لا توجد موضوعات متبقية لجدولتها.' };

    const priorityWeight = { high: 3, medium: 2, low: 1 };
    const diffWeight = { hard: 3, medium: 2, easy: 1 };
    const undWeight = { not_started: 3, needs_review: 2, mastered: 1 };

    activeTasks.sort((a, b) => {
      const aDate = a.examDate ? `${a.examDate}T${a.examTime || '23:59'}` : '9999-12-31';
      const bDate = b.examDate ? `${b.examDate}T${b.examTime || '23:59'}` : '9999-12-31';
      if (aDate !== bDate) return aDate.localeCompare(bDate);

      const pDiff = (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1);
      if (pDiff !== 0) return pDiff;

      const dDiff = (diffWeight[b.difficulty] || 1) - (diffWeight[a.difficulty] || 1);
      if (dDiff !== 0) return dDiff;

      return (undWeight[b.understandingLevel] || 1) - (undWeight[a.understandingLevel] || 1);
    });

    const dateRangeList = [];
    let curObj = new Date(startObj);
    while (curObj <= endObj) {
      dateRangeList.push(formatLocalDate(curObj));
      curObj.setDate(curObj.getDate() + 1);
    }

    const dailyAvailableMap = {};
    dateRangeList.forEach(dStr => { dailyAvailableMap[dStr] = computeAvailableIntervalsForDate(dStr); });

    const preservedSessions = state.studyPlan.sessions.filter(s => s.status === 'completed' || s.status === 'partial');
    
    preservedSessions.forEach(ps => {
      if (dailyAvailableMap[ps.date]) {
        const psStart = timeToMinutes(ps.startTime);
        const psEnd = timeToMinutes(ps.endTime);
        const nextFree = [];
        dailyAvailableMap[ps.date].forEach(w => {
          if (psEnd <= w.start || psStart >= w.end) {
            nextFree.push(w);
          } else {
            if (psStart > w.start) nextFree.push({ start: w.start, end: psStart });
            if (psEnd < w.end) nextFree.push({ start: psEnd, end: w.end });
          }
        });
        dailyAvailableMap[ps.date] = nextFree;
      }
    });

    const newScheduledSessions = [];
    const affectedTasksDeficit = [];
    let totalUnscheduledMinutes = 0;

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
                status: 'pending',
                completedMinutes: 0
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
              status: 'pending',
              completedMinutes: 0
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

    state.studyPlan.sessions = [...preservedSessions, ...newScheduledSessions];
    state.studyPlan.lastGeneratedAt = Date.now();
    state.studyPlan.lastDeficit = deficitReport;
    save();

    return { success: true, sessions: state.studyPlan.sessions, deficit: deficitReport };
  }

  function markSessionComplete(sessionId, completedMinutes = null) {
    const sess = state.studyPlan.sessions.find(s => s.id === sessionId);
    if (!sess) return { success: false };
    const task = state.studyPlan.tasks.find(t => t.id === sess.taskId);
    const full = sess.durationMinutes;
    const prevCompleted = sess.completedMinutes || 0;

    let newlyDeducted = 0;
    if (completedMinutes === null || completedMinutes >= full) {
      sess.status = 'completed';
      sess.completedMinutes = full;
      newlyDeducted = full - prevCompleted;
    } else {
      const comp = Math.max(0, parseInt(completedMinutes, 10) || 0);
      sess.status = comp > 0 ? 'partial' : 'pending';
      sess.completedMinutes = comp;
      newlyDeducted = comp - prevCompleted;
    }

    if (task && newlyDeducted > 0) {
      if (sess.isReview) {
        task.reviewMinutesRequired = Math.max(0, (task.reviewMinutesRequired || 0) - newlyDeducted);
      } else {
        task.remainingMinutes = Math.max(0, task.remainingMinutes - newlyDeducted);
      }
      task.updatedAt = Date.now();
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
      if (sess.isReview) {
        task.reviewMinutesRequired = (task.reviewMinutesRequired || 0) + uncompleted;
      } else {
        task.remainingMinutes += uncompleted;
      }
      task.updatedAt = Date.now();
    }
    state.studyPlan.sessions.splice(sessIndex, 1);
    return save();
  }

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
    state.studyPlan.tasks.forEach(t => {
      totalNeededMinutes += (t.totalEstimatedMinutes + (t.reviewMinutesRequired || 0));
    });
    state.studyPlan.sessions.forEach(s => {
      if (s.status === 'completed') completedMinutes += s.durationMinutes;
      else if (s.status === 'partial') completedMinutes += s.completedMinutes || 0;
    });
    const pct = totalNeededMinutes > 0 ? Math.min(100, Math.round((completedMinutes / totalNeededMinutes) * 100)) : 0;
    return { totalNeededMinutes, completedMinutes, percentage: pct, tasksCount: state.studyPlan.tasks.length };
  }

  // -------------------------------------------------------------
  // محرك شجرة المتطلبات لجميع التخصصات والخطط (Curriculum Engine)
  // -------------------------------------------------------------
  function getCurriculumTree(majorId = 'cyber_security', era = 'old') {
    const majorPlans = CURRICULUM_DATA[majorId] || CURRICULUM_DATA.cyber_security;
    const list = majorPlans[era] || [];
    const passed = new Set(state.passedCurriculumCourses || []);

    return list.map(item => {
      const isPassed = passed.has(item.id);
      let isAvailable = false;
      let missingPrereqs = [];

      if (!isPassed) {
        missingPrereqs = (item.prereq || []).filter(pid => !passed.has(pid));
        isAvailable = (missingPrereqs.length === 0);
      }

      return {
        ...item,
        status: isPassed ? 'passed' : (isAvailable ? 'available' : 'locked'),
        missingPrereqs
      };
    });
  }

  function toggleCurriculumCoursePassed(courseId) {
    if (!state.passedCurriculumCourses) state.passedCurriculumCourses = [];
    const idx = state.passedCurriculumCourses.indexOf(courseId);
    if (idx > -1) {
      state.passedCurriculumCourses.splice(idx, 1);
    } else {
      state.passedCurriculumCourses.push(courseId);
    }
    save();
    return { success: true, passed: state.passedCurriculumCourses };
  }

  function getDependentCurriculumCourses(courseId, majorId = 'cyber_security', era = 'old') {
    const majorPlans = CURRICULUM_DATA[majorId] || CURRICULUM_DATA.cyber_security;
    const list = majorPlans[era] || [];
    const dependents = new Set();

    function findChildren(parentId) {
      list.forEach(c => {
        if (c.prereq && c.prereq.includes(parentId)) {
          if (!dependents.has(c.id)) {
            dependents.add(c.id);
            findChildren(c.id);
          }
        }
      });
    }

    findChildren(courseId);
    return Array.from(dependents);
  }

  function globalSearch(query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) return { courses: [], count: 0 };
    const courses = state.courses.filter(c => c.name.toLowerCase().includes(q) || (c.code && c.code.toLowerCase().includes(q)));
    return { courses, count: courses.length };
  }

  window.SanadStore = {
    load, save, resetFactory,
    isCorrupted: () => isCorrupted,
    getCorruptionDetails: () => corruptionDetails,
    DAYS, MAJORS, TOPIC_STATUSES, CLASSIFICATIONS, RESOURCE_TYPES,
    formatLocalDate, parseLocalDate, getDayIdFromDate, escapeHtml,
    getStudent, setStudent,
    getCourses, getCourse, addCourse, deleteCourse,
    getTopicsByCourse, addTopic, updateTopic, deleteTopic,
    getResourcesByTopic, addResource, deleteResource,
    getSections, getSectionsByCourse, addSection, deleteSection, togglePinSection,
    getScheduleConstraints, setScheduleConstraints, addBlockedTime, deleteBlockedTime,
    getSavedSchedule, saveSelectedSchedule, isSavedScheduleOutdated, generateSchedules,
    getStudyPlan, setStudyPlanSettings, addStudyTask, deleteStudyTask, planStudySchedule,
    markSessionComplete, postponeSession, editSessionTime,
    getStudyProgressStats, isStudyPlanScheduleOutdated,
    getCurriculumTree, toggleCurriculumCoursePassed, getDependentCurriculumCourses,
    globalSearch
  };

})(window);