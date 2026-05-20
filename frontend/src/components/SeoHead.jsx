import React from 'react';
import { Helmet } from 'react-helmet-async';

const DEFAULT_SITE_NAME = 'Ace It!';
const DEFAULT_DESCRIPTION = 'Ace It! helps HKDSE students improve English exam performance with AI tutoring, mock exam practice, and strategy guidance.';
const DEFAULT_IMAGE = '/ace-it-dse-logo-entra-banner.png';

const toAbsoluteUrl = (origin, value) => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  const normalized = value.startsWith('/') ? value : `/${value}`;
  return `${origin}${normalized}`;
};

const getOrigin = () => {
  const configured = import.meta.env.VITE_CANONICAL_ORIGIN;
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }

  return 'https://aceit-learning.com';
};

const buildLanguageUrls = (absoluteUrl) => {
  const enUrl = new URL(absoluteUrl);
  enUrl.searchParams.set('lang', 'en');

  const zhUrl = new URL(absoluteUrl);
  zhUrl.searchParams.set('lang', 'zh');

  return {
    en: enUrl.toString(),
    zh: zhUrl.toString(),
  };
};

const normalizePath = (path = '/') => {
  if (!path) return '/';
  return path.startsWith('/') ? path : `/${path}`;
};

const SeoHead = ({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = DEFAULT_IMAGE,
  locale = 'en_HK',
  type = 'website',
  noIndex = false,
  includeLanguageAlternates = true,
  includeDefaultSchema = false,
  additionalSchema = [],
}) => {
  const origin = getOrigin();
  const cleanPath = normalizePath(path);
  const canonicalUrl = `${origin}${cleanPath}`;
  const imageUrl = toAbsoluteUrl(origin, image);
  const languageUrls = includeLanguageAlternates ? buildLanguageUrls(canonicalUrl) : null;
  const robotsContent = noIndex ? 'noindex, nofollow' : 'index, follow';
  const pageTitle = title ? `${title} | ${DEFAULT_SITE_NAME}` : DEFAULT_SITE_NAME;

  const baseSchemaObjects = includeDefaultSchema
    ? [
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: DEFAULT_SITE_NAME,
          url: origin,
          logo: toAbsoluteUrl(origin, '/ace-it-dse-logo-transparent.png'),
          contactPoint: [
            {
              '@type': 'ContactPoint',
              email: 'info@aceit-learning.com',
              contactType: 'customer support',
              availableLanguage: ['English', 'Chinese'],
            },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: DEFAULT_SITE_NAME,
          url: origin,
          inLanguage: ['en-HK', 'zh-HK'],
        },
      ]
    : [];
  const schemaObjects = [...baseSchemaObjects, ...additionalSchema];

  return (
    <Helmet>
      <html lang={locale.startsWith('zh') ? 'zh-HK' : 'en-HK'} />
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />
      <meta name="theme-color" content="#ff6a00" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={DEFAULT_SITE_NAME} />
      <meta property="og:locale" content={locale} />
      <meta property="og:image" content={imageUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <link rel="canonical" href={canonicalUrl} />

      {languageUrls && (
        <>
          <link rel="alternate" hrefLang="en-HK" href={languageUrls.en} />
          <link rel="alternate" hrefLang="zh-HK" href={languageUrls.zh} />
          <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
          <meta property="og:locale:alternate" content={locale.startsWith('zh') ? 'en_HK' : 'zh_HK'} />
        </>
      )}

      {schemaObjects.map((schemaObject, index) => (
        <script key={`schema-${index}`} type="application/ld+json">
          {JSON.stringify(schemaObject)}
        </script>
      ))}
    </Helmet>
  );
};

export default SeoHead;
