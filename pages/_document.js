import Document, { Html, Head, Main, NextScript } from "next/document";

const siteWideSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://guesseffect.wtf/#org",
      name: "Guess Effect",
      url: "https://guesseffect.wtf",
      logo: {
        "@type": "ImageObject",
        url: "https://guesseffect.wtf/images/logo.png",
      },
      sameAs: ["https://x.com/guesseffectwtf"],
    },
    {
      "@type": "WebSite",
      "@id": "https://guesseffect.wtf/#website",
      url: "https://guesseffect.wtf",
      name: "Guess Effect",
      description: "Daily video game guessing game with endless mode.",
      publisher: { "@id": "https://guesseffect.wtf/#org" },
      inLanguage: "en",
    },
  ],
};

// Applies the saved HUD colour before the first paint so the page never
// flashes the default green. Reads the same USER_SETTINGS key the settings
// window writes.
const applyHudColour = `try{var s=JSON.parse(localStorage.getItem('USER_SETTINGS')||'null');if(s&&/^#[0-9a-f]{6}$/i.test(s.hud_colour)){document.documentElement.style.setProperty('--hud-color',s.hud_colour)}}catch(e){}`;

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <script dangerouslySetInnerHTML={{ __html: applyHudColour }} />
          {/* Site-wide Organization + WebSite schema, rendered on every page */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(siteWideSchema) }}
          />
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
