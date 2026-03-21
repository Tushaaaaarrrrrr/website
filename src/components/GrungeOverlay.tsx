import React from 'react';

const GrungeOverlay = () => {
  return (
    <>
      <div className="grunge-noise" aria-hidden="true" />
      <div className="fixed inset-0 pointer-events-none z-[9998] opacity-10 mix-blend-overlay">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-black" />
      </div>
    </>
  );
};

export default GrungeOverlay;
