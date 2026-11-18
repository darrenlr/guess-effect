import "../styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Head from "next/head";
import Script from "next/script";
import { Inter, JetBrains_Mono, Press_Start_2P } from "next/font/google";

// Self-hosted by Next at build time: no render-blocking requests to Google
// Fonts and no layout shift while they load.
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});
const sans = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const logo = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-press-start",
  display: "swap",
});

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="keywords"
          content="daily video game guessing game, video game guesser, guess the game, gaming challenge, endless video game guesser"
        />
        <meta property="og:site_name" content="Guess Effect" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://guesseffect.wtf/images/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://guesseffect.wtf/images/logo.png" />
        <meta name="twitter:site" content="@guesseffectwtf" />
      </Head>

      <div className={`app ${mono.variable} ${sans.variable} ${logo.variable}`}>
        <Component {...pageProps} />
      </div>

      <Analytics />
      <SpeedInsights />

      <Script src="https://www.googletagmanager.com/gtag/js?id=G-RRKN0TJDML" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-RRKN0TJDML');
        `}
      </Script>
      {/* Advertising and conversion pixels aren't needed to play, so they wait
          until the page is idle. */}
      <Script id="twitter-pixel" strategy="lazyOnload">
        {`
          !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
          },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
          a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
          twq('config','ou7tq');
        `}
      </Script>
      <Script
        strategy="lazyOnload"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
        async
      />
    </>
  );
}

export default MyApp;
