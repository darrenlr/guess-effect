import Head from "next/head";

const SITE = "https://guesseffect.wtf";

// Title, description, canonical, Open Graph, Twitter and JSON-LD for a page,
// in one place instead of copied into every page.
export default function SeoHead({ title, description, path, shareTitle, shareDescription, schema }) {
  const url = `${SITE}${path}`;
  const ogTitle = shareTitle || title;
  const ogDescription = shareDescription || description;
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      {schema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      )}
    </Head>
  );
}

export const breadcrumbs = (...crumbs) => ({
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map(([name, path], index) => ({
    "@type": "ListItem",
    position: index + 1,
    name,
    item: `${SITE}${path}`,
  })),
});

export const faqSchema = (items) => ({
  "@type": "FAQPage",
  mainEntity: items.map(([question, answer]) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
});

export const webApp = (name, path, description) => ({
  "@type": "WebApplication",
  name,
  url: `${SITE}${path}`,
  applicationCategory: "GameApplication",
  operatingSystem: "Any (browser-based)",
  description,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@id": `${SITE}/#org` },
});
