import '../styles/globals.css'
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <title>Guess Effect</title>
      <Component {...pageProps} />
      <SpeedInsights />
      <Analytics />
    </>
  )
}

export default MyApp
