import { useEffect, useRef } from 'react';

export default function AdSenseAd() {
  const insRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src =
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8879359130450193';
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('AdSense error:', error);
    }

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <ins
      ref={insRef}
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-8879359130450193"
      data-ad-slot="7793982659"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}