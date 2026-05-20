import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useLanguage } from '../../context/LanguageContext';

const PaperWritingGuidePage = () => {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const checklist = isZh
    ? ['開首清晰定位題目角色與語境。', '每段以主題句開展，避免內容重複。', '結尾回扣任務要求與觀點深度。']
    : [
        'Open with clear task positioning and context alignment.',
        'Start each paragraph with a topic sentence to avoid repetition.',
        'Close by reconnecting to task requirements and argument depth.',
      ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pb-16 pt-28">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          {isZh ? 'Paper 2 寫作' : 'Paper 2 Writing'}
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-white md:text-5xl">
          {isZh ? 'HKDSE 英文寫作提分指南' : 'HKDSE English Writing Score Boost Guide'}
        </h1>
        <p className="mt-5 text-slate-600 dark:text-slate-300">
          {isZh
            ? '從任務分析、段落設計到語言精煉，本頁整理 Paper 2 高分寫作的核心流程。'
            : 'From task analysis to paragraph structure and language polish, this page maps the core Paper 2 workflow for stronger results.'}
        </p>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#1a110a]">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isZh ? '快速檢查清單' : 'Fast Quality Checklist'}
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            {checklist.map((item) => (
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

export default PaperWritingGuidePage;
