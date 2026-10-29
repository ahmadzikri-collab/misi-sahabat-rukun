import React, { useState, useEffect } from 'react';

interface AntiCheatWatermarkProps {
  studentName: string;
  studentCode?: string;
  classCode?: string;
}

export const AntiCheatWatermark: React.FC<AntiCheatWatermarkProps> = ({
  studentName,
  studentCode = '',
  classCode = '2A',
}) => {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000); // per 30 detik
    return () => clearInterval(interval);
  }, []);

  const watermarkText = `SD INDONESIA EMAS • ${studentName.toUpperCase()}${
    studentCode ? ` (${studentCode})` : ''
  } • ${classCode} • ${timeString}`;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-20 overflow-hidden select-none opacity-40 mix-blend-multiply"
    >
      <div className="absolute inset-0 flex flex-col justify-around py-6 -rotate-12 scale-125">
        {[...Array(6)].map((_, rowIdx) => (
          <div
            key={rowIdx}
            className={`whitespace-nowrap text-[11px] sm:text-xs font-black tracking-widest text-slate-300 ${
              rowIdx % 2 === 0 ? 'translate-x-12' : '-translate-x-12'
            }`}
          >
            {`${watermarkText}       •       ${watermarkText}       •       ${watermarkText}`}
          </div>
        ))}
      </div>
    </div>
  );
};
