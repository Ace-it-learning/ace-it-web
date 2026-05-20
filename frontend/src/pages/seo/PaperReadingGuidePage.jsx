import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useLanguage } from '../../context/LanguageContext';

const PaperReadingGuidePage = () => {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const tips = isZh
    ? [
        '先掃描題目要求，再進行段落定位，避免盲目通讀。',
        '標記轉折詞與語氣詞，判斷作者立場與題目陷阱。',
        '遇到生字時先用上下文推斷，再回看選項。',
      ]
    : [
        'Scan question requirements first, then locate relevant paragraphs before full reading.',
        'Track discourse markers and tone shifts to identify author stance and traps.',
        'When unknown words appear, infer from context before checking options.',
      ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pb-16 pt-28">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          {isZh ? 'Paper 1 閱讀' : 'Paper 1 Reading'}
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-white md:text-5xl">
          {isZh ? 'HKDSE 英文閱讀高分策略' : 'HKDSE English Reading High-Score Strategy'}
        </h1>
        <p className="mt-5 text-slate-600 dark:text-slate-300">
          {isZh
            ? '本指南聚焦閱讀卷常見題型、時間管理與解題步驟，幫助你提升準確度與速度。'
            : 'This guide focuses on common Paper 1 question types, timing control, and answer workflows to raise both accuracy and speed.'}
        </p>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#1a110a]">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isZh ? '三步做題框架' : 'Three-Step Execution Framework'}
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            {tips.map((tip) => (
              <li key={tip}>- {tip}</li>
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

export default PaperReadingGuidePage;
