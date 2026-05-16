// Comprehensive JUPAS University Programs Database
// Data source: Official university JUPAS pages (2024/25 academic year)
// Note: Median scores are approximate and based on publicly available cut-off data

export const JUPAS_PROGRAMS = [
    // =====================================================
    // 香港大學 (HKU) - JS6xxx
    // =====================================================
    // JS6107 = Dental Surgery (BDS); JS6456 = MBBS — do not swap codes
    { id: 'hku-dent', code: 'JS6107', name: '牙醫學士', university: '香港大學', faculty: '牙醫學院', median: 35, band_a: 37, category: 'medicine' },
    { id: 'hku-med', code: 'JS6456', name: '內外全科醫學士', university: '香港大學', faculty: '醫學院', median: 36, band_a: 38, category: 'medicine' },
    { id: 'hku-law', code: 'JS6070', name: '法學士', university: '香港大學', faculty: '法律學院', median: 32, band_a: 34, category: 'law' },
    { id: 'hku-bba-accfin', code: 'JS6781', name: '工商管理學學士(會計及財務)', university: '香港大學', faculty: '商學院', median: 35, band_a: 34, category: 'business' },
    { id: 'hku-qfin', code: 'JS6227', name: '計量金融學士', university: '香港大學', faculty: '商學院', median: 30, band_a: 32, category: 'business' },
    { id: 'hku-arch', code: 'JS6411', name: '建築學士', university: '香港大學', faculty: '建築學院', median: 29, band_a: 31, category: 'design' },
    { id: 'hku-econ', code: 'JS6767', name: '經濟學學士', university: '香港大學', faculty: '商學院', median: 35, band_a: 34, category: 'business' },
    { id: 'hku-bba-law', code: 'JS6808', name: '工商管理學學士(法學)及法學士', university: '香港大學', faculty: '商學院/法律學院', median: 37, band_a: 36, category: 'law' },
    { id: 'hku-eng-cs', code: 'JS6951', name: '工程學士(計算機科學)', university: '香港大學', faculty: '工程學院', median: 27, band_a: 29, category: 'engineering' },
    { id: 'hku-eng-civil', code: 'JS6963', name: '土木工程學士', university: '香港大學', faculty: '工程學院', median: 24, band_a: 26, category: 'engineering' },
    { id: 'hku-sci', code: 'JS6901', name: '理學士', university: '香港大學', faculty: '理學院', median: 24, band_a: 26, category: 'science' },
    { id: 'hku-nursing', code: 'JS6833', name: '護理學學士', university: '香港大學', faculty: '護理學院', median: 25, band_a: 27, category: 'medicine' },
    { id: 'hku-pharm', code: 'JS6494', name: '藥劑學學士', university: '香港大學', faculty: '醫學院', median: 30, band_a: 32, category: 'medicine' },
    { id: 'hku-arts', code: 'JS6054', name: '文學士', university: '香港大學', faculty: '文學院', median: 23, band_a: 25, category: 'arts' },
    { id: 'hku-socsc', code: 'JS6717', name: '社會科學學士', university: '香港大學', faculty: '社會科學學院', median: 24, band_a: 26, category: 'social_science' },

    // =====================================================
    // 香港中文大學 (CUHK) - JS4xxx
    // =====================================================
    { id: 'cuhk-med', code: 'JS4501', name: '內外全科醫學士', university: '香港中文大學', faculty: '醫學院', median: 35, band_a: 37, category: 'medicine' },
    { id: 'cuhk-law', code: 'JS4072', name: '法學士', university: '香港中文大學', faculty: '法律學院', median: 31, band_a: 33, category: 'law' },
    { id: 'cuhk-gbus', code: 'JS4202', name: '環球商業學', university: '香港中文大學', faculty: '商學院', median: 30, band_a: 32, category: 'business' },
    { id: 'cuhk-qfin', code: 'JS4262', name: '計量金融學', university: '香港中文大學', faculty: '商學院', median: 29, band_a: 31, category: 'business' },
    { id: 'cuhk-bba', code: 'JS4212', name: '工商管理學士', university: '香港中文大學', faculty: '商學院', median: 26, band_a: 28, category: 'business' },
    { id: 'cuhk-acc', code: 'JS4224', name: '專業會計學', university: '香港中文大學', faculty: '商學院', median: 27, band_a: 29, category: 'business' },
    { id: 'cuhk-cs', code: 'JS4412', name: '計算機科學', university: '香港中文大學', faculty: '工程學院', median: 26, band_a: 28, category: 'engineering' },
    { id: 'cuhk-ai', code: 'JS4468', name: '人工智能：系統與科技', university: '香港中文大學', faculty: '工程學院', median: 27, band_a: 29, category: 'engineering' },
    { id: 'cuhk-arch', code: 'JS4801', name: '建築學', university: '香港中文大學', faculty: '社會科學學院', median: 27, band_a: 29, category: 'design' },
    { id: 'cuhk-nursing', code: 'JS4513', name: '護理學', university: '香港中文大學', faculty: '醫學院', median: 24, band_a: 26, category: 'medicine' },
    { id: 'cuhk-pharm', code: 'JS4534', name: '藥劑學', university: '香港中文大學', faculty: '醫學院', median: 29, band_a: 31, category: 'medicine' },
    { id: 'cuhk-socsc', code: 'JS4812', name: '社會科學', university: '香港中文大學', faculty: '社會科學學院', median: 23, band_a: 25, category: 'social_science' },
    { id: 'cuhk-econ', code: 'JS4825', name: '經濟學', university: '香港中文大學', faculty: '社會科學學院', median: 25, band_a: 27, category: 'business' },
    { id: 'cuhk-psych', code: 'JS4838', name: '心理學', university: '香港中文大學', faculty: '社會科學學院', median: 26, band_a: 28, category: 'social_science' },

    // =====================================================
    // 香港科技大學 (HKUST) - JS5xxx
    // =====================================================
    { id: 'hkust-gbus', code: 'JS5331', name: '環球商業管理', university: '香港科技大學', faculty: '商學院', median: 29, band_a: 31, category: 'business' },
    { id: 'hkust-qfin', code: 'JS5313', name: '計量金融學', university: '香港科技大學', faculty: '商學院', median: 28, band_a: 30, category: 'business' },
    { id: 'hkust-bba', code: 'JS5312', name: '工商管理學士', university: '香港科技大學', faculty: '商學院', median: 27, band_a: 29, category: 'business' },
    { id: 'hkust-cs', code: 'JS5200', name: '計算機科學', university: '香港科技大學', faculty: '工程學院', median: 27, band_a: 29, category: 'engineering' },
    { id: 'hkust-dsct', code: 'JS5181', name: '數據科學與技術', university: '香港科技大學', faculty: '工程學院', median: 26, band_a: 28, category: 'engineering' },
    { id: 'hkust-eng', code: 'JS5200', name: '工程學', university: '香港科技大學', faculty: '工程學院', median: 25, band_a: 27, category: 'engineering' },
    { id: 'hkust-sci', code: 'JS5100', name: '理學士', university: '香港科技大學', faculty: '理學院', median: 24, band_a: 26, category: 'science' },
    { id: 'hkust-biotech', code: 'JS5102', name: '生物科技及商學', university: '香港科技大學', faculty: '理學院/商學院', median: 25, band_a: 27, category: 'science' },

    // =====================================================
    // 香港理工大學 (PolyU) - JS3xxx
    // =====================================================
    { id: 'polyu-med', code: 'JS3020', name: '眼科視光學', university: '香港理工大學', faculty: '醫療及社會科學院', median: 28, band_a: 30, category: 'medicine' },
    { id: 'polyu-pt', code: 'JS3636', name: '物理治療學', university: '香港理工大學', faculty: '醫療及社會科學院', median: 27, band_a: 29, category: 'medicine' },
    { id: 'polyu-ot', code: 'JS3612', name: '職業治療學', university: '香港理工大學', faculty: '醫療及社會科學院', median: 26, band_a: 28, category: 'medicine' },
    { id: 'polyu-nursing', code: 'JS3648', name: '護理學', university: '香港理工大學', faculty: '醫療及社會科學院', median: 23, band_a: 25, category: 'medicine' },
    { id: 'polyu-rad', code: 'JS3624', name: '放射學', university: '香港理工大學', faculty: '醫療及社會科學院', median: 26, band_a: 28, category: 'medicine' },
    { id: 'polyu-bba', code: 'JS3240', name: '會計及金融', university: '香港理工大學', faculty: '商學院', median: 24, band_a: 26, category: 'business' },
    { id: 'polyu-cs', code: 'JS3868', name: '計算機科學', university: '香港理工大學', faculty: '工程學院', median: 24, band_a: 26, category: 'engineering' },
    { id: 'polyu-design', code: 'JS3569', name: '設計學', university: '香港理工大學', faculty: '設計學院', median: 25, band_a: 27, category: 'design' },
    { id: 'polyu-hotel', code: 'JS3310', name: '酒店及旅遊管理(榮譽)理學士組合課程', university: '香港理工大學', faculty: '酒店及旅遊業管理學院', median: 22, band_a: 24, category: 'business' },

    // =====================================================
    // 香港城市大學 (CityU) - JS1xxx
    // =====================================================
    { id: 'cityu-vet', code: 'JS1205', name: '獸醫學', university: '香港城市大學', faculty: '獸醫學院', median: 30, band_a: 32, category: 'medicine' },
    { id: 'cityu-law', code: 'JS1801', name: '法律學', university: '香港城市大學', faculty: '法律學院', median: 29, band_a: 31, category: 'law' },
    { id: 'cityu-bba-acc', code: 'JS1102', name: '專業會計學', university: '香港城市大學', faculty: '商學院', median: 25, band_a: 27, category: 'business' },
    { id: 'cityu-bba', code: 'JS1100', name: '工商管理學士', university: '香港城市大學', faculty: '商學院', median: 24, band_a: 26, category: 'business' },
    { id: 'cityu-cs', code: 'JS1204', name: '計算機科學', university: '香港城市大學', faculty: '工程學院', median: 24, band_a: 26, category: 'engineering' },
    { id: 'cityu-ds', code: 'JS1222', name: '數據科學', university: '香港城市大學', faculty: '數據科學學院', median: 25, band_a: 27, category: 'engineering' },
    { id: 'cityu-media', code: 'JS1041', name: '創意媒體', university: '香港城市大學', faculty: '創意媒體學院', median: 22, band_a: 24, category: 'arts' },
    { id: 'cityu-socsc', code: 'JS1601', name: '社會科學學士', university: '香港城市大學', faculty: '社會科學學院', median: 21, band_a: 23, category: 'social_science' },

    // =====================================================
    // 香港浸會大學 (HKBU) - JS2xxx
    // =====================================================
    { id: 'bu-tcm', code: 'JS2330', name: '中醫學', university: '香港浸會大學', faculty: '中醫藥學院', median: 26, band_a: 28, category: 'medicine' },
    { id: 'bu-comm', code: 'JS2310', name: '傳理學學士', university: '香港浸會大學', faculty: '傳理學院', median: 24, band_a: 26, category: 'arts' },
    { id: 'bu-film', code: 'JS2420', name: '電影學', university: '香港浸會大學', faculty: '傳理學院', median: 23, band_a: 25, category: 'arts' },
    { id: 'bu-jour', code: 'JS2315', name: '新聞學', university: '香港浸會大學', faculty: '傳理學院', median: 23, band_a: 25, category: 'arts' },
    { id: 'bu-bba', code: 'JS2110', name: '工商管理學士', university: '香港浸會大學', faculty: '商學院', median: 22, band_a: 24, category: 'business' },
    { id: 'bu-music', code: 'JS2620', name: '音樂學', university: '香港浸會大學', faculty: '文學院', median: 21, band_a: 23, category: 'arts' },
    { id: 'bu-socsc', code: 'JS2810', name: '社會科學', university: '香港浸會大學', faculty: '社會科學學院', median: 21, band_a: 23, category: 'social_science' },

    // =====================================================
    // 香港教育大學 (EdUHK) - JS8xxx
    // =====================================================
    { id: 'eduhk-bed-pri', code: 'JS8361', name: '教育學學士(小學)', university: '香港教育大學', faculty: '教育學院', median: 22, band_a: 24, category: 'education' },
    { id: 'eduhk-bed-sec', code: 'JS8381', name: '教育學學士(中學)', university: '香港教育大學', faculty: '教育學院', median: 21, band_a: 23, category: 'education' },
    { id: 'eduhk-bed-eng', code: 'JS8234', name: '英國語文教育', university: '香港教育大學', faculty: '教育學院', median: 23, band_a: 25, category: 'education' },
    { id: 'eduhk-bed-chi', code: 'JS8225', name: '中國語文教育', university: '香港教育大學', faculty: '教育學院', median: 22, band_a: 24, category: 'education' },
    { id: 'eduhk-bed-math', code: 'JS8240', name: '數學教育', university: '香港教育大學', faculty: '教育學院', median: 22, band_a: 24, category: 'education' },
    { id: 'eduhk-ece', code: 'JS8312', name: '幼兒教育', university: '香港教育大學', faculty: '教育學院', median: 20, band_a: 22, category: 'education' },
    { id: 'eduhk-spec', code: 'JS8325', name: '特殊教育', university: '香港教育大學', faculty: '教育學院', median: 21, band_a: 23, category: 'education' },
    { id: 'eduhk-pe', code: 'JS8416', name: '體育教育', university: '香港教育大學', faculty: '教育學院', median: 21, band_a: 23, category: 'education' },

    // =====================================================
    // 嶺南大學 (LingnanU) - JS7xxx
    // =====================================================
    { id: 'lingnan-bba', code: 'JS7200', name: '工商管理學士', university: '嶺南大學', faculty: '商學院', median: 19, band_a: 21, category: 'business' },
    { id: 'lingnan-acc', code: 'JS7216', name: '會計學', university: '嶺南大學', faculty: '商學院', median: 20, band_a: 22, category: 'business' },
    { id: 'lingnan-arts', code: 'JS7100', name: '文學士', university: '嶺南大學', faculty: '文學院', median: 18, band_a: 20, category: 'arts' },
    { id: 'lingnan-socsc', code: 'JS7300', name: '社會科學學士', university: '嶺南大學', faculty: '社會科學學院', median: 18, band_a: 20, category: 'social_science' },
];

// Category labels for filtering
export const PROGRAM_CATEGORIES = {
    medicine: '醫療相關',
    law: '法律',
    business: '商科',
    engineering: '工程/科技',
    science: '理學',
    arts: '文學/傳媒',
    social_science: '社會科學',
    education: '教育',
    design: '設計/建築',
    health_science: '醫療科學'
};

// University shorthand names (English)
export const UNIVERSITY_SHORT_NAMES = {
    '香港大學': 'HKU',
    '香港中文大學': 'CUHK',
    '香港科技大學': 'HKUST',
    '香港理工大學': 'PolyU',
    '香港城市大學': 'CityU',
    '香港浸會大學': 'HKBU',
    '香港教育大學': 'EdUHK',
    '嶺南大學': 'LingnanU'
};

// University full names (Chinese)
export const UNIVERSITY_NAMES_ZH = {
    '香港大學': '香港大學',
    '香港中文大學': '香港中文大學',
    '香港科技大學': '香港科技大學',
    '香港理工大學': '香港理工大學',
    '香港城市大學': '香港城市大學',
    '香港浸會大學': '香港浸會大學',
    '香港教育大學': '香港教育大學',
    '嶺南大學': '嶺南大學'
};

export default JUPAS_PROGRAMS;
