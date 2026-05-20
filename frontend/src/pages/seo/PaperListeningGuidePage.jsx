import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useLanguage } from '../../context/LanguageContext';

const PaperListeningGuidePage = () => {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const framework = isZh
    ? ['預覽題目先建立資訊欄位。', '聆聽時只記關鍵數據與語氣轉折。', '第二次播放前優先補齊高分值空格。']
    : [
        'Preview questions to pre-build answer fields.',
        'Capture only high-value data points and tone transitions while listening.',
        'Before second playback, prioritize high-mark blanks first.',
      ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pb-16 pt-28">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          {isZh ? 'Paper 3 聆聽' : 'Paper 3 Listening'}
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-white md:text-5xl">
          {isZh ? 'HKDSE 聆聽與綜合能力應試框架' : 'HKDSE Listening & Integrated Skills Framework'}
        </h1>
        <p className="mt-5 text-slate-600 dark:text-slate-300">
          {isZh
            ? '本頁整理 Paper 3 的聆聽流程、重點筆記方法與資料整合策略。'
            : 'This page summarizes Paper 3 listening flow, note-taking priorities, and integration strategy for stronger execution.'}
        </p>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#1a110a]">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isZh ? '三段流程' : 'Three-Stage Flow'}
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            {framework.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </section>

        <div className="mt-8">
          <Link to="/hkdse-english" className="text-sm font-bold text-primary">
            {isZh ? '返回英文科資源中心' : 'Back to English resource hub'}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaperListeningGuidePage;
