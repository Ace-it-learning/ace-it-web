import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useLanguage } from '../../context/LanguageContext';

const timelineEn = [
  {
    phase: 'Weeks 12-9',
    goal: 'Foundation reset',
    focus: 'Rebuild weak grammar, core vocabulary, and one paper routine per week.',
  },
  {
    phase: 'Weeks 8-5',
    goal: 'Paper execution',
    focus: 'Run timed practice cycles for Paper 1 to Paper 4 and tag recurring mistakes.',
  },
  {
    phase: 'Weeks 4-2',
    goal: 'Score stabilization',
    focus: 'Prioritize weak areas, reduce avoidable errors, and tighten exam pacing.',
  },
  {
    phase: 'Final 7 days',
    goal: 'Exam readiness',
    focus: 'Light review, template recall, and confidence-building simulations.',
  },
];

const timelineZh = [
  {
    phase: '第 12-9 週',
    goal: '基礎重整',
    focus: '重建弱項文法、核心詞彙，並每週固定一份卷目流程。',
  },
  {
    phase: '第 8-5 週',
    goal: '卷目實戰',
    focus: 'Paper 1 至 Paper 4 進行限時循環，標記重複錯誤。',
  },
  {
    phase: '第 4-2 週',
    goal: '分數穩定',
    focus: '集中補強弱項、減少可避免失分，優化節奏。',
  },
  {
    phase: '最後 7 天',
    goal: '臨場準備',
    focus: '輕量複習、模板回憶與信心模擬。',
  },
];

const checklistEn = [
  'Paper 1: completed two timed reading sets this week.',
  'Paper 2: wrote one full essay and revised with feedback.',
  'Paper 3: practiced one listening-integrated set with structured notes.',
  'Paper 4: completed at least two speaking rounds with self-review.',
  'Updated one mistake log and selected next week priority drills.',
];

const checklistZh = [
  'Paper 1：本週完成兩次限時閱讀練習。',
  'Paper 2：完成一篇全文寫作並根據回饋修訂。',
  'Paper 3：完成一次聆聽綜合訓練並套用筆記框架。',
  'Paper 4：完成至少兩輪口語訓練並作自評。',
  '更新錯誤紀錄，並設定下週優先訓練項目。',
];

const EnglishRevisionCalendarPage = () => {
  const { language } = useLanguage();
  const isZh = language === 'zh';
  const timeline = isZh ? timelineZh : timelineEn;
  const checklist = isZh ? checklistZh : checklistEn;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Header />
      <main className="mx-auto max-w-5xl px-6 pb-16 pt-28">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          {isZh ? '英文科備試時間表' : 'English Revision Calendar'}
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-white md:text-5xl">
          {isZh ? 'HKDSE 英文 12 週備試時間表（相對時間版）' : 'HKDSE English 12-Week Revision Calendar (Relative Timeline)'}
        </h1>
        <p className="mt-5 text-slate-600 dark:text-slate-300">
          {isZh
            ? '此頁以相對時間設計，不依賴官方實際考期。你可直接按距離考試的剩餘週數套用。'
            : 'This calendar uses a relative timeline, so you can apply it based on weeks remaining before your exam without relying on official date updates.'}
        </p>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#1a110a]">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isZh ? '階段時間表' : 'Phase Timeline'}
          </h2>
          <div className="mt-4 space-y-4">
            {timeline.map((item) => (
              <article key={item.phase} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">{item.phase}</p>
                <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">{item.goal}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.focus}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#1a110a]">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isZh ? '每週修訂檢查清單' : 'Weekly Revision Checklist'}
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            {checklist.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-3xl bg-primary/5 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {isZh ? '使用方式' : 'How to Use This'}
          </h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
            {isZh
              ? '先找出你距離考試還有多少週，直接對應相同階段並執行本週清單。每 7 天按表檢查完成度，再調整下週重點。'
              : 'Find how many weeks remain, map yourself to the matching phase, and run the weekly checklist. Review completion every 7 days and adjust focus for the next cycle.'}
          </p>
          <Link to="/hkdse-english" className="mt-4 inline-flex text-sm font-bold text-primary">
            {isZh ? '返回英文科資源中心' : 'Back to English resource hub'}
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default EnglishRevisionCalendarPage;
