import '../styles/globals.css'
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next";
import Head from 'next/head';
import AdSense from "../components/AdSense";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <title>Guess Effect (Beta)</title>
      <Head>
        <link rel="canonical" href="https://guesseffect.wtf" />
      </Head>
      <Component {...pageProps} />
      <SpeedInsights />
      <Analytics />
      {/* <AdSense adSlot="7606066193" /> */}
    </>
  )
}

export default MyApp
