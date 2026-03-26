export const iteData = {
  "meta": {
    "title": "أسبقيات مواد فرع الهندسة المعلوماتية ITE",
    "university": "SVU",
    "published": "2025-08-01",
    "term": "24F",
    "source": "هكرات مزنوقين",
    "rules": {
      "min_credits_per_term": 16,
      "max_credits_per_term": 36,
      "promotion_thresholds": [
        { "year": 2, "min_credits": 40 },
        { "year": 3, "min_credits": 100 },
        { "year": 4, "min_credits": 160 },
        { "year": 5, "min_credits": 220 }
      ],
      "specialization_required_at_credits": 160,
      "english_note": "يجب ترفيع مستوى الإنجليزي قبل تسجيل المستوى التالي (ليس فقط تسجيله)",
      "english_registration_credit": 1,
      "english_completion_credit": 3,
      "prerequisite_rule": "يكفي تسجيل الأسبقية (حتى لو رسب الطالب فيها) لفتح المادة التالية، ما عدا الإنجليزي"
    }
  },

  "specializations": [
    { "id": "AI",  "name_ar": "الذكاء الاصطناعي",          "tracks": ["ML", "IS"] },
    { "id": "SE",  "name_ar": "هندسة البرمجيات",            "tracks": ["DS", "SD"] },
    { "id": "SCN", "name_ar": "النظم والشبكات الحاسوبية",   "tracks": ["CS", "NS"] }
  ],

  "courses": {
    "BMA401": { "code": "BMA401", "name_ar": "تحليل رياضي 1",               "credits": 5, "year": 1, "type": "core",    "prereqs": [] },
    "BLA401": { "code": "BLA401", "name_ar": "الجبر الخطي",                  "credits": 5, "year": 1, "type": "core",    "prereqs": [] },
    "BAS401": { "code": "BAS401", "name_ar": "بني الجبرية",                  "credits": 5, "year": 1, "type": "core",    "prereqs": [] },
    "BPH401": { "code": "BPH401", "name_ar": "فيزياء",                       "credits": 5, "year": 1, "type": "core",    "prereqs": [] },
    "GCS301": { "code": "GCS301", "name_ar": "مهارات حاسوب",                 "credits": 4, "year": 1, "type": "general", "prereqs": [] },
    "GOE301": { "code": "GOE301", "name_ar": "مدخل للتعلم الإلكتروني",       "credits": 4, "year": 1, "type": "general", "prereqs": [] },
    "L1":     { "code": "L1",     "name_ar": "اللغة الإنجليزية 1",           "credits": 3, "year": 1, "type": "english", "prereqs": [], "english_must_pass": true },

    "BMA402": { "code": "BMA402", "name_ar": "تحليل رياضي 2",               "credits": 5, "year": 2, "type": "core",    "prereqs": ["BMA401"] },
    "BLC401": { "code": "BLC401", "name_ar": "الدارات المنطقية",             "credits": 5, "year": 2, "type": "core",    "prereqs": ["BLA401"] },
    "BCA501": { "code": "BCA501", "name_ar": "بنيان الحاسوب 1",              "credits": 6, "year": 2, "type": "core",    "prereqs": ["BLC401"] },
    "BPG401": { "code": "BPG401", "name_ar": "برمجة 1",                      "credits": 5, "year": 2, "type": "core",    "prereqs": [] },
    "GTW301": { "code": "GTW301", "name_ar": "مهارات التواصل والكتابة العلمية","credits": 5, "year": 2, "type": "general", "prereqs": ["GCS301"] },
    "L2":     { "code": "L2",     "name_ar": "اللغة الإنجليزية 2",           "credits": 3, "year": 2, "type": "english", "prereqs": ["L1"], "english_must_pass": true },

    "BNA401": { "code": "BNA401", "name_ar": "تحليل عددي",                   "credits": 5, "year": 3, "type": "core",    "prereqs": ["BLA401"] },
    "BSP501": { "code": "BSP501", "name_ar": "معالجة إشارة",                  "credits": 5, "year": 3, "type": "core",    "prereqs": ["BMA402"] },
    "BTS501": { "code": "BTS501", "name_ar": "نظم الاتصالات",                 "credits": 5, "year": 3, "type": "core",    "prereqs": ["BMA402"] },
    "BDM501": { "code": "BDM501", "name_ar": "الرياضيات المنقطعة",            "credits": 5, "year": 3, "type": "core",    "prereqs": ["BLC401"] },
    "BOS501": { "code": "BOS501", "name_ar": "نظم التشغيل 1",                 "credits": 4, "year": 3, "type": "core",    "prereqs": ["BCA501"] },
    "BPG402": { "code": "BPG402", "name_ar": "برمجة 2",                       "credits": 5, "year": 3, "type": "core",    "prereqs": ["BPG401"] },
    "BDA501": { "code": "BDA501", "name_ar": "بنى المعطيات والخوارزميات 1",   "credits": 6, "year": 3, "type": "core",    "prereqs": ["BPG402"] },
    "BEC401": { "code": "BEC401", "name_ar": "الدارات الإلكترونية",           "credits": 5, "year": 3, "type": "core",    "prereqs": ["BPH401"] },
    "L3":     { "code": "L3",     "name_ar": "اللغة الإنجليزية 3",           "credits": 3, "year": 3, "type": "english", "prereqs": ["L2"], "english_must_pass": true },

    "GMN401": { "code": "GMN401", "name_ar": "أساسيات الإدارة",              "credits": 4, "year": 4, "type": "general", "prereqs": [] },
    "BCG601": { "code": "BCG601", "name_ar": "البيانات",                      "credits": 6, "year": 4, "type": "core",    "prereqs": ["BNA401", "BSP501"] },
    "BNT501": { "code": "BNT501", "name_ar": "الشبكات الحاسوبية 1",           "credits": 6, "year": 4, "type": "core",    "prereqs": ["BTS501"] },
    "BPS601": { "code": "BPS601", "name_ar": "الاحتمالات والإحصاء",           "credits": 6, "year": 4, "type": "core",    "prereqs": ["BDM501"] },
    "BAU501": { "code": "BAU501", "name_ar": "أوتوماتا ولغات صورية",          "credits": 5, "year": 4, "type": "core",    "prereqs": ["BDM501"] },
    "BOSL501":{ "code": "BOSL501","name_ar": "مخبر نظم تشغيل 1",              "credits": 4, "year": 4, "type": "core",    "prereqs": ["BOS501"] },
    "BOS502": { "code": "BOS502", "name_ar": "نظم التشغيل 2 (تشغيل)",         "credits": 4, "year": 4, "type": "core",    "prereqs": ["BOS501"] },
    "BWP401": { "code": "BWP401", "name_ar": "برمجة الويب 1",                 "credits": 5, "year": 4, "type": "core",    "prereqs": ["BPG402"] },
    "BDB501": { "code": "BDB501", "name_ar": "نظم قواعد البيانات 1",          "credits": 4, "year": 4, "type": "core",    "prereqs": ["BDA501"] },
    "BDBI501":{ "code": "BDBI501","name_ar": "مخبر قواعد البيانات 1",         "credits": 4, "year": 4, "type": "core",    "prereqs": ["BDB501"] },
    "BAI501": { "code": "BAI501", "name_ar": "الذكاء الاصطناعي",              "credits": 6, "year": 4, "type": "core",    "prereqs": ["BDA501"] },
    "BPG601": { "code": "BPG601", "name_ar": "برمجة 3",                       "credits": 5, "year": 4, "type": "core",    "prereqs": ["BPG402"] },
    "BID601": { "code": "BID601", "name_ar": "تحليل وتصميم نظم المعلومات",   "credits": 6, "year": 4, "type": "core",    "prereqs": ["BDA501", "BDB501"] },
    "BCA601": { "code": "BCA601", "name_ar": "بنيان الحاسوب 2",               "credits": 6, "year": 4, "type": "core",    "prereqs": ["BCA501"] },
    "BIA601": { "code": "BIA601", "name_ar": "خوارزميات الذكية",              "credits": 5, "year": 4, "type": "core",    "prereqs": ["BAI501"] },
    "BIS601": { "code": "BIS601", "name_ar": "أمن نظم المعلومات",             "credits": 6, "year": 4, "type": "core",    "prereqs": ["BNT501"] },
    "BSE601": { "code": "BSE601", "name_ar": "هندسة البرمجيات 1",             "credits": 6, "year": 4, "type": "core",    "prereqs": ["BPG601"] },
    "GPM601": { "code": "GPM601", "name_ar": "إدارة المشاريع المعلوماتية",    "credits": 6, "year": 4, "type": "general", "prereqs": ["BID601"] },
    "L4":     { "code": "L4",     "name_ar": "اللغة الإنجليزية 4",           "credits": 3, "year": 4, "type": "english", "prereqs": ["L3"], "english_must_pass": true },

    "GAC501": { "code": "GAC501", "name_ar": "المحاسبة",                     "credits": 5, "year": 5, "type": "general", "prereqs": ["GMN401"] },
    "BMM601": { "code": "BMM601", "name_ar": "نظم الوسائط المتعددة",         "credits": 6, "year": 5, "type": "core",    "prereqs": ["BCG601"] },
    "BWP501": { "code": "BWP501", "name_ar": "برمجة الويب 2",                "credits": 5, "year": 5, "type": "core",    "prereqs": ["BWP401"] },
    "BCM601": { "code": "BCM601", "name_ar": "المترجمات",                    "credits": 6, "year": 5, "type": "core",    "prereqs": ["BAU501"] },
    "BMP601": { "code": "BMP601", "name_ar": "برمجة تطبيقات النقال",         "credits": 6, "year": 5, "type": "core",    "prereqs": ["BWP501"] },
    "GET601": { "code": "GET601", "name_ar": "أخلاقيات المهنة والمجتمع",     "credits": 6, "year": 5, "type": "general", "prereqs": ["GPM601"] },
    "GEP601": { "code": "GEP601", "name_ar": "نظرية المعرفة وعلوم الحاسب",  "credits": 4, "year": 5, "type": "general", "prereqs": [] },
    "BPR601": { "code": "BPR601", "name_ar": "مشروع 1",                      "credits": 6, "year": 5, "type": "project", "prereqs": ["BID601", "GPM601"] },
    "BSM601": { "code": "BSM601", "name_ar": "النمذجة والمحاكاة والتحقق",    "credits": 5, "year": 5, "type": "core",    "prereqs": ["BPR601"] },
    "L5":     { "code": "L5",     "name_ar": "اللغة الإنجليزية 5",           "credits": 3, "year": 5, "type": "english", "prereqs": ["L4"], "english_must_pass": true },

    "BPR602": { "code": "BPR602", "name_ar": "مشروع 2",                      "credits": 10,"year": 5, "type": "project", "prereqs": ["BPR601"] }
  },

  "specialization_courses": {
    "AI": {
      "name_ar": "الذكاء الاصطناعي",
      "prereqs_from_core": ["BPS601", "BAI501", "BIA601", "GPM601", "BCG601", "BDA501", "BDM501", "BWP501", "BMM601", "L4"],
      "tracks": {
        "ML": {
          "id": "ML", "name_ar": "مسار التعلم الآلي",
          "courses": {
            "AML601": { "code": "AML601", "name_ar": "تعلم الآلة",                "credits": 6, "prereqs": ["BPS601"] },
            "MDA601": { "code": "MDA601", "name_ar": "تحليل البيانات الضخمة",     "credits": 6, "prereqs": ["BAI501"] },
            "MBC601": { "code": "MBC601", "name_ar": "إنترنت الأشياء وسلاسل الكتل","credits": 6, "prereqs": ["BAI501"] },
            "MDL601": { "code": "MDL601", "name_ar": "التعلم العميق",              "credits": 6, "prereqs": ["BAI501", "BIA601"] },
            "ANN601": { "code": "ANN601", "name_ar": "الشبكات العصبونية والمنطق العلم","credits": 6, "prereqs": ["BAI501", "BIA601"] },
            "AIP601": { "code": "AIP601", "name_ar": "معالجة الصورة الرقمية (بالإنجليزية)","credits": 6, "prereqs": ["BAI501", "BIA601", "L4"] },
            "SIR601": { "code": "SIR601", "name_ar": "استرجاع المعلومات",          "credits": 6, "prereqs": ["BDA501", "BDM501"] },
            "ANL601": { "code": "ANL601", "name_ar": "معالجة اللغات الطبيعية",    "credits": 6, "prereqs": ["ANN601", "AIP601"] },
            "ACV601": { "code": "ACV601", "name_ar": "الرؤية الحاسوبية (بالإنجليزية)","credits": 6, "prereqs": ["AIP601", "ANN601"] },
            "SSW601": { "code": "SSW601", "name_ar": "الويب الدلالي",              "credits": 6, "prereqs": ["BWP501"] },
            "AVR601": { "code": "AVR601", "name_ar": "الواقع الافتراضي (بالإنجليزية)","credits": 6, "prereqs": ["ACV601"] }
          }
        },
        "IS": {
          "id": "IS", "name_ar": "مسار الأنظمة الذكية",
          "courses": {
            "AES601": { "code": "AES601", "name_ar": "النظم الخبيرة",              "credits": 6, "prereqs": ["GPM601"] },
            "AML601": { "code": "AML601", "name_ar": "تعلم الآلة",                "credits": 6, "prereqs": ["BPS601"] },
            "ANN601": { "code": "ANN601", "name_ar": "الشبكات العصبونية والمنطق العلم","credits": 6, "prereqs": ["BAI501"] },
            "AIP601": { "code": "AIP601", "name_ar": "معالجة الصورة الرقمية",     "credits": 6, "prereqs": ["BAI501", "L4"] },
            "SIR601": { "code": "SIR601", "name_ar": "استرجاع المعلومات",          "credits": 6, "prereqs": ["BDA501", "BDM501"] },
            "SSW601": { "code": "SSW601", "name_ar": "الويب الدلالي",              "credits": 6, "prereqs": ["BWP501"] },
            "ANL601": { "code": "ANL601", "name_ar": "معالجة اللغات الطبيعية",    "credits": 6, "prereqs": ["ANN601", "AIP601"] },
            "ACV601": { "code": "ACV601", "name_ar": "الرؤية الحاسوبية",           "credits": 6, "prereqs": ["AIP601", "ANN601"] },
            "AVR601": { "code": "AVR601", "name_ar": "الواقع الافتراضي",           "credits": 6, "prereqs": ["ACV601"] }
          }
        }
      }
    },
    "SE": {
      "name_ar": "هندسة البرمجيات",
      "prereqs_from_core": ["BPS601", "BIA601", "BCM601", "BDA501", "BDM501", "BDB501", "BWP501", "BPG601", "BID601", "GPM601", "L4"],
      "tracks": {
        "DS": {
          "id": "DS", "name_ar": "مسار علم البيانات",
          "courses": {
            "DSA601": { "code": "DSA601", "name_ar": "الإحصاء وتحليل البيانات",   "credits": 4, "prereqs": ["BPS601"] },
            "SDB601": { "code": "SDB601", "name_ar": "نظم قواعد البيانات 2",      "credits": 4, "prereqs": ["BIA601"] },
            "DNL601": { "code": "DNL601", "name_ar": "قواعد بيانات NoSQL",        "credits": 6, "prereqs": ["BDB501"] },
            "DOB601": { "code": "DOB601", "name_ar": "البيانات المفتوحة والبيانات الضخمة","credits": 6, "prereqs": ["BDB501"] },
            "SIR601": { "code": "SIR601", "name_ar": "استرجاع المعلومات",          "credits": 6, "prereqs": ["BDA501", "BDM501"] },
            "SSW601": { "code": "SSW601", "name_ar": "الويب الدلالي",              "credits": 6, "prereqs": ["BWP501"] },
            "DPD601": { "code": "DPD601", "name_ar": "برمجة خاصة بعلم البيانات",  "credits": 5, "prereqs": ["BPG601"] },
            "DDV601": { "code": "DDV601", "name_ar": "التمثل المرئي للبيانات",     "credits": 5, "prereqs": ["DSA601"] },
            "SDE601": { "code": "SDE601", "name_ar": "التنقب في البيانات",         "credits": 6, "prereqs": ["BID601", "DSA601", "SDB601"] },
            "DBD601": { "code": "DBD601", "name_ar": "مواضيع متقدمة في البيانات الضخمة","credits": 6, "prereqs": ["SDE601", "DNL601", "DOB601"] }
          }
        },
        "SD": {
          "id": "SD", "name_ar": "مسار تطوير البرمجيات",
          "courses": {
            "SSE602": { "code": "SSE602", "name_ar": "هندسة البرمجيات 2 (بالإنجليزية)","credits": 5, "prereqs": ["GPM601", "L4"] },
            "SDA601": { "code": "SDA601", "name_ar": "بنى المعطيات والخوارزميات 2","credits": 6, "prereqs": ["BIA601", "BCM601"] },
            "SDB601": { "code": "SDB601", "name_ar": "نظم قواعد البيانات 2",      "credits": 4, "prereqs": ["BIA601"] },
            "SDBL601":{ "code": "SDBL601","name_ar": "مخبر نظم قواعد البيانات 2", "credits": 4, "prereqs": ["SDB601"] },
            "SIR601": { "code": "SIR601", "name_ar": "استرجاع المعلومات",          "credits": 6, "prereqs": ["BDA501", "BDM501"] },
            "SSW601": { "code": "SSW601", "name_ar": "الويب الدلالي",              "credits": 6, "prereqs": ["BWP501"] },
            "SSQ601": { "code": "SSQ601", "name_ar": "جودة البرمجيات (بالإنجليزية)","credits": 5, "prereqs": ["SSE602"] },
            "SAD601": { "code": "SAD601", "name_ar": "تحليل وتصميم الخوارزميات",  "credits": 6, "prereqs": ["SDA601"] },
            "SDE601": { "code": "SDE601", "name_ar": "التنقب في البيانات",         "credits": 6, "prereqs": ["BID601"] },
            "SCP601": { "code": "SCP601", "name_ar": "مشروع مترجمات",             "credits": 6, "prereqs": ["SDA601", "BDB501"] }
          }
        }
      }
    },
    "SCN": {
      "name_ar": "النظم والشبكات الحاسوبية",
      "prereqs_from_core": ["GPM601", "BNT501", "BOS501", "BCA501", "BPG402", "BIA601", "BIS601", "L4"],
      "tracks": {
        "CS": {
          "id": "CS", "name_ar": "مسار الأمن السيبراني",
          "courses": {
            "CSM601": { "code": "CSM601", "name_ar": "إدارة الأمن",               "credits": 6, "prereqs": ["GPM601"] },
            "CIR601": { "code": "CIR601", "name_ar": "الاستجابة للأحداث الأمنية", "credits": 4, "prereqs": ["GPM601"] },
            "NOS601": { "code": "NOS601", "name_ar": "نظم التشغيل 2 (بالإنجليزية)","credits": 4, "prereqs": ["BOS501"] },
            "NDS601": { "code": "NDS601", "name_ar": "النظم الموزعة والسحابية (بالإنجليزية)","credits": 6, "prereqs": ["NOS601", "CIR601"] },
            "NNT601": { "code": "NNT601", "name_ar": "الشبكات الحاسوبية 2",       "credits": 6, "prereqs": ["BNT501"] },
            "CSO601": { "code": "CSO601", "name_ar": "أمن التشغيل",               "credits": 6, "prereqs": ["NOS601", "NNT601"] },
            "NSS601": { "code": "NSS601", "name_ar": "أمن الشبكات الحاسوبية",    "credits": 6, "prereqs": ["BIS601"] },
            "CCR601": { "code": "CCR601", "name_ar": "نظم التعمية",               "credits": 5, "prereqs": ["BPG601"] },
            "CEH601": { "code": "CEH601", "name_ar": "الاختراق الأخلاقي",         "credits": 6, "prereqs": ["CSO601"] },
            "CMS601": { "code": "CMS601", "name_ar": "الأمن في الأنظمة الحديثة", "credits": 6, "prereqs": ["NNT601", "CEH601"] }
          }
        },
        "NS": {
          "id": "NS", "name_ar": "مسار أنظمة الشبكات",
          "courses": {
            "NOS601": { "code": "NOS601", "name_ar": "نظم التشغيل 2",             "credits": 4, "prereqs": ["BOS501"] },
            "NOSL601":{ "code": "NOSL601","name_ar": "مخبر نظم التشغيل 2",        "credits": 4, "prereqs": ["NOS601"] },
            "NDS601": { "code": "NDS601", "name_ar": "النظم الموزعة والسحابية",   "credits": 6, "prereqs": ["NOS601"] },
            "NCA601": { "code": "NCA601", "name_ar": "بنيان الحاسوب 2",           "credits": 6, "prereqs": ["BCA501"] },
            "NNT601": { "code": "NNT601", "name_ar": "الشبكات الحاسوبية 2",       "credits": 6, "prereqs": ["BNT501"] },
            "NNP601": { "code": "NNP601", "name_ar": "برمجة التطبيقات الشبكية",  "credits": 5, "prereqs": ["BPG402"] },
            "NSS601": { "code": "NSS601", "name_ar": "أمن الشبكات الحاسوبية",    "credits": 6, "prereqs": ["BIS601"] },
            "NNS601": { "code": "NNS601", "name_ar": "خدمات شبكية",               "credits": 6, "prereqs": ["NNP601"] },
            "NNM601": { "code": "NNM601", "name_ar": "إدارة الشبكات",             "credits": 6, "prereqs": ["NNS601", "NNT601"] },
            "NRT601": { "code": "NRT601", "name_ar": "نظم الزمن الحقيقي",         "credits": 6, "prereqs": ["NNS601"] }
          }
        }
      }
    }
  }
};
