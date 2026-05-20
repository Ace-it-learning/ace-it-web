import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useLanguage } from '../../context/LanguageContext';

const PaperSpeakingGuidePage = () => {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const structure = isZh
    ? ['先定立場，再給一個具體例子。', '回應隊友時先承接，再補充。', '結尾用一句總結收束討論。']
    : [
        'State a clear stance first, then support with one concrete example.',
        'When responding to peers, acknowledge before adding your extension.',
        'Close with a concise summary statement to anchor your view.',
      ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pb-16 pt-28">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          {isZh ? 'Paper 4 口語' : 'Paper 4 Speaking'}
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-white md:text-5xl">
          {isZh ? 'HKDSE 英文口語應試技巧' : 'HKDSE English Speaking Tactics'}
        </h1>
        <p className="mt-5 text-slate-600 dark:text-slate-300">
          {isZh
            ? '聚焦個人回應與小組討論的高效表達方式，提升流暢度與論點清晰度。'
            : 'Focus on both individual response and group discussion techniques to improve fluency and argument clarity.'}
        </p>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#1a110a]">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isZh ? '實戰回應結構' : 'Practical Response Structure'}
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            {structure.map((item) => (
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

export default PaperSpeakingGuidePage;
