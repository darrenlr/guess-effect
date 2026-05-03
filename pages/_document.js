import Document, { Html, Head, Main, NextScript } from "next/document";

const siteWideSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://guesseffect.wtf/#org",
      "name": "Guess Effect",
      "url": "https://guesseffect.wtf",
      "logo": {
        "@type": "ImageObject",
        "url": "https://guesseffect.wtf/images/logo.png"
      },
      "sameAs": [
        "https://x.com/guesseffectwtf"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://guesseffect.wtf/#website",
      "url": "https://guesseffect.wtf",
      "name": "Guess Effect",
      "description": "Daily video game guessing game with endless mode.",
      "publisher": { "@id": "https://guesseffect.wtf/#org" },
      "inLanguage": "en"
    }
  ]
};

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link
            rel="preload"
            href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
            as="style"
          />
          <link
            rel="preload"
            href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
            as="style"
          />
          <link
            rel="preload"
            href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;900&family=Space+Mono:wght@400;700&family=Share+Tech+Mono&display=swap"
            as="style"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;900&family=Space+Mono:wght@400;700&family=Share+Tech+Mono&display=swap"
            rel="stylesheet"
          />

          {/* Site-wide Organization + WebSite schema — renders on every page */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(siteWideSchema) }}
          />

          {/* <script
            data-ad-client="ca-pub-8029294264481349"
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
          ></script> */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;