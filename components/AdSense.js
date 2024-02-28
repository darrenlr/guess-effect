import { useEffect } from "react";

const AdSense = ({ adSlot }) => {
//   useEffect(() => {
//     if (window) {
//       (window.adsbygoogle = window.adsbygoogle || []).push({});
//     }
//   }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-8029294264481349"
      data-ad-slot={adSlot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  );
};

export default AdSense;