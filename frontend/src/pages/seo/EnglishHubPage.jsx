import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useLanguage } from '../../context/LanguageContext';
import { englishGeoGuides } from '../../data/englishGeoGuides';

const EnglishHubPage = () => {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const cards = [
    {
      title: isZh ? 'Paper 1 閱讀策略' : 'Paper 1 Reading Strategy',
      description: isZh
        ? '掌握題型拆解、時間分配與精準定位技巧。'
        : 'Master question patterns, time allocation, and evidence-location tactics.',
      to: '/hkdse-english/paper-1-reading',
    },
    {
      title: isZh ? 'Paper 2 寫作框架' : 'Paper 2 Writing Framework',
      description: isZh
        ? '建立高分文章結構、內容深度與語言表達。'
        : 'Build high-scoring structure, content depth, and language control.',
      to: '/hkdse-english/paper-2-writing',
    },
    {
      title: isZh ? 'Paper 3 聆聽與綜合能力' : 'Paper 3 Listening & Integrated Skills',
      description: isZh
        ? '提升資訊提取、重點記錄與資料整合能力。'
        : 'Improve information extraction, note-taking, and data synthesis.',
      to: '/hkdse-english/paper-3-listening',
    },
    {
      title: isZh ? 'Paper 4 口語應試' : 'Paper 4 Speaking Techniques',
      description: isZh
        ? '強化小組互動、個人回應與即場思維。'
        : 'Strengthen group interaction, individual response, and real-time thinking.',
      to: '/hkdse-english/paper-4-speaking',
    },
    {
      title: isZh ? '12 週備試時間表與清單' : '12-Week Revision Calendar and Checklist',
      description: isZh
        ? '使用相對時間規劃，不依賴官方日期，快速建立每週節奏。'
        : 'Use a relative timeline plan without official-date dependency to build weekly revision rhythm.',
      to: '/hkdse-english/revision-calendar',
    },
  ];

  const geoCards = englishGeoGuides.slice(0, 8);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Header />
      <main className="mx-auto max-w-6xl px-6 pb-16 pt-28">
        <section className="rounded-3xl bg-white p-8 shadow-sm dark:bg-[#1a110a] md:p-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
            {isZh ? '英文科資源中心' : 'HKDSE English Resource Hub'}
          </p>
          <h1 className="mb-4 text-3xl font-black text-slate-900 dark:text-white md:text-5xl">
            {isZh ? 'HKDSE 英文科全方位應試指南' : 'HKDSE English Exam Prep Guide'}
          </h1>
          <p className="max-w-3xl text-base text-slate-600 dark:text-slate-300 md:text-lg">
            {isZh
              ? '此頁整合 Paper 1 至 Paper 4 的重點策略，協助你快速找到適合自己的備試路徑。內容聚焦英文科，並提供中英文介面以提升搜尋與閱讀體驗。'
              : 'This hub organizes practical strategies for Papers 1 to 4 so students can quickly choose the right prep path. Content focuses on English subject outcomes with bilingual accessibility for search and reading.'}
          </p>
        </section>

        <section className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          {cards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:border-primary/40 hover:shadow-md dark:border-white/10 dark:bg-[#1a110a]"
            >
              <h2 className="text-xl font-bold text-slate-900 group-hover:text-primary dark:text-white">
                {card.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{card.description}</p>
              <span className="mt-5 inline-flex text-sm font-bold text-primary">
                {isZh ? '查看詳情' : 'Explore guide'}
              </span>
            </Link>
          ))}
        </section>

        <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#1a110a] md:p-8">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {isZh ? '熱門問題與實戰指南' : 'Popular Questions and Practical Guides'}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {isZh
              ? '以下主題以常見搜尋問題為基礎，適合用作每天 15 至 20 分鐘的重點複習。'
              : 'These topics are built around common search intent and are ideal for focused 15-20 minute revision blocks.'}
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {geoCards.map((guide) => (
              <Link
                key={guide.slug}
                to={`/hkdse-english/guides/${guide.slug}`}
                className="rounded-2xl border border-slate-200 px-4 py-4 text-sm transition hover:border-primary/40 hover:shadow-sm dark:border-white/10"
              >
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {isZh ? guide.titleZh : guide.titleEn}
                </h3>
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                  {isZh ? guide.summaryZh : guide.summaryEn}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default EnglishHubPage;
