import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useLanguage } from '../../context/LanguageContext';
import { getEnglishGeoGuideBySlug } from '../../data/englishGeoGuides';

const EnglishGeoGuidePage = () => {
  const { slug } = useParams();
  const { language } = useLanguage();
  const guide = getEnglishGeoGuideBySlug(slug);

  if (!guide) {
    return <Navigate to="/hkdse-english" replace />;
  }

  const isZh = language === 'zh';
  const title = isZh ? guide.titleZh : guide.titleEn;
  const summary = isZh ? guide.summaryZh : guide.summaryEn;
  const points = isZh ? guide.pointsZh : guide.pointsEn;
  const faqItems = isZh ? guide.faqZh : guide.faqEn;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pb-16 pt-28">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          {isZh ? '英文科應試指南' : 'HKDSE English Guide'}
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-white md:text-5xl">{title}</h1>
        <p className="mt-5 text-slate-600 dark:text-slate-300">{summary}</p>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#1a110a]">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isZh ? '重點執行清單' : 'Execution Checklist'}
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            {points.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-3xl bg-primary/5 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {isZh ? '下一步建議' : 'Recommended Next Step'}
          </h3>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
            {isZh
              ? '完成本頁後，請到英文科資源中心選擇另一份 Paper 指南，建立完整備試節奏。'
              : 'After this guide, pick one additional paper strategy from the English hub to build a complete revision rhythm.'}
          </p>
          <Link to="/hkdse-english" className="mt-4 inline-flex text-sm font-bold text-primary">
            {isZh ? '返回英文科資源中心' : 'Back to English resource hub'}
          </Link>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#1a110a]">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isZh ? '常見問題' : 'Frequently Asked Questions'}
          </h2>
          <div className="mt-4 space-y-4">
            {faqItems.map((faq) => (
              <article key={faq.question} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{faq.question}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default EnglishGeoGuidePage;
