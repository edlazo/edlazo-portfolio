import React from 'react';

interface PhoneFrameProps {
  imageSrc: string;
  altText?: string;
  className?: string;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  imageSrc,
  altText = 'Mobile app interface',
  className = '',
}) => {
  return (
    <div className={`relative mx-auto my-4 flex items-center justify-center ${className}`}>
      {/* Smartphone Outer Shell */}
      <div className="relative w-[240px] sm:w-[260px] h-[500px] sm:h-[530px] bg-slate-950 rounded-[3rem] p-3 border-4 border-slate-800 shadow-2xl shadow-amber-500/10 ring-1 ring-slate-700/60">
        
        {/* Hardware Side Buttons */}
        <div className="absolute -left-[7px] top-24 w-[3px] h-10 bg-slate-700 rounded-l-md" /> {/* Volume Up */}
        <div className="absolute -left-[7px] top-[9.5rem] w-[3px] h-10 bg-slate-700 rounded-l-md" /> {/* Volume Down */}
        <div className="absolute -right-[7px] top-28 w-[3px] h-14 bg-slate-700 rounded-r-md" /> {/* Power Button */}

        {/* Screen Bezel & Inner Container */}
        <div className="relative w-full h-full bg-slate-950 rounded-[2.25rem] overflow-hidden border border-slate-900 flex flex-col">
          
          {/* Top Notch / Camera Pill */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full z-20 flex items-center justify-center gap-2 border border-slate-800/60">
            <span className="w-2 h-2 rounded-full bg-slate-950 border border-slate-800" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
          </div>

          {/* Screenshot Content Container */}
          <div className="relative w-full h-full pt-6 bg-[#181412] overflow-hidden">
            <img
              src={imageSrc}
              alt={altText}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-top"
            />

            {/* Subtle Screen Glass Reflection Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-600/60 rounded-full z-20" />
        </div>
      </div>
    </div>
  );
};
