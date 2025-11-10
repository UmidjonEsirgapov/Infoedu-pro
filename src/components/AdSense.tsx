import React, { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any;
  }
}


interface AdSenseProps {
  client: string;
  slot: string;
  style?: React.CSSProperties;
}

const AdSense: React.FC<AdSenseProps> = ({ client, slot, style }) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={style || { display: 'block' }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
};

export default AdSense;