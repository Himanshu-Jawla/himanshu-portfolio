// BootScreen with XP boot sound
import React, { useEffect, useState } from 'react';
import { Howl } from 'howler';

export default function BootScreen() {
  useEffect(() => {
    const sound = new Howl({ src: ['/sounds/boot.mp3'] });
    sound.play();
    const timer = setTimeout(() => setLoaded(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const [loaded, setLoaded] = useState(false);

  if (loaded) return <div>Desktop Loading...</div>;

  return (
    <div className="boot-screen">
      <img src="/icons/xp-boot.gif" alt="Booting..." />
      <p>Starting Windows XP...</p>
    </div>
  );
}