import React from 'react';
import { useLocation } from 'react-router-dom';
import SeoHead from './SeoHead';
import { useLanguage } from '../context/LanguageContext';
import { getEnglishGeoGuideBySlug } from '../data/englishGeoGuides';

const resolveSeoConfig = (pathname) => {
  if (pathname === '/') {
    return {
      title: 'HKDSE English AI Tutor',
      description:
        'Ace It! supports HKDSE English learners with AI tutoring, mock exam practice, strategy coaching, and bilingual guidance.',
      path: '/',
      type: 'website',
      noIndex: false,
      includeDefaultSchema: true,
    };
  }

  if (pathname === '/login') {
    return {
      title: 'Sign In',
      description: 'Sign in to Ace It! and continue your HKDSE English learning journey.',
      path: '/login',
      noIndex: true,
    };
  }

  if (pathname === '/verify-success') {
    return {
      title: 'Account Verified',
      description: 'Your Ace It! account is verified. Continue onboarding to start your HKDSE English plan.',
      path: '/verify-success',
      noIndex: true,
    };
  }

  if (pathname === '/auth-error') {
    return {
      title: 'Sign In Error',
      description: 'There was a sign in error. Retry your login to continue using Ace It!.',
      path: '/auth-error',
      noIndex: true,
    };
  }

  if (pathname === '/hkdse-english') {
    return {
      title: 'HKDSE English Resource Hub',
      description:
        'Explore practical HKDSE English strategies for reading, writing, listening, and speaking with bilingual support.',
      path: '/hkdse-english',
      noIndex: false,
    };
  }

  if (pathname === '/hkdse-english/paper-1-reading') {
    return {
      title: 'HKDSE English Paper 1 Reading Guide',
      description: 'Improve HKDSE Paper 1 with reading tactics, question workflow, and time management.',
      path: '/hkdse-english/paper-1-reading',
      noIndex: false,
    };
  }

  if (pathname === '/hkdse-english/paper-2-writing') {
    return {
      title: 'HKDSE English Paper 2 Writing Guide',
      description: 'Learn high-scoring HKDSE Paper 2 writing structure, planning, and expression strategy.',
      path: '/hkdse-english/paper-2-writing',
      noIndex: false,
    };
  }

  if (pathname === '/hkdse-english/paper-3-listening') {
    return {
      title: 'HKDSE English Paper 3 Listening Guide',
      description: 'Prepare for HKDSE Paper 3 with listening workflow, note-taking tactics, and integrated skills tips.',
      path: '/hkdse-english/paper-3-listening',
      noIndex: false,
    };
  }

  if (pathname === '/hkdse-english/paper-4-speaking') {
    return {
      title: 'HKDSE English Paper 4 Speaking Guide',
      description: 'Build confidence in HKDSE Paper 4 with practical speaking structures and discussion tactics.',
      path: '/hkdse-english/paper-4-speaking',
      noIndex: false,
    };
  }

  if (pathname === '/hkdse-english/revision-calendar') {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is this calendar based on official HKDSE exam dates?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. This page uses a relative timeline model so students can apply it based on weeks remaining before the exam.',
          },
        },
        {
          '@type': 'Question',
          name: 'How often should I run the checklist?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Use it weekly, then adjust the next week priorities according to your weakest paper performance.',
          },
        },
      ],
    };

    return {
      title: 'HKDSE English Revision Calendar and Checklist',
      description:
        'Use a relative 12-week HKDSE English revision calendar and weekly checklist without relying on official exam date updates.',
      path: '/hkdse-english/revision-calendar',
      noIndex: false,
      additionalSchema: [faqSchema],
    };
  }

  if (pathname.startsWith('/hkdse-english/guides/')) {
    const slug = pathname.replace('/hkdse-english/guides/', '');
    const guide = getEnglishGeoGuideBySlug(slug);
    if (guide) {
      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: guide.faqEn.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      };
      return {
        title: guide.titleEn,
        description: guide.summaryEn,
        path: pathname,
        noIndex: false,
        additionalSchema: [faqSchema],
      };
    }
  }

  return {
    title: 'AI Learning Platform',
    description: 'Ace It! provides AI-powered exam preparation for HKDSE students.',
    path: pathname,
    noIndex: true,
  };
};

const RouteSeoManager = () => {
  const { pathname } = useLocation();
  const { language } = useLanguage();
  const seoConfig = resolveSeoConfig(pathname);
  const locale = language === 'zh' ? 'zh_HK' : 'en_HK';

  return <SeoHead {...seoConfig} locale={locale} />;
};

export default RouteSeoManager;
