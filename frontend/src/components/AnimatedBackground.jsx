// frontend/src/components/AnimatedBackground.jsx
import React from 'react';
import Lottie from 'lottie-react';
// IMPORTANT: You must download a simple, subtle Lottie JSON file and place it in public/
// Search for "subtle animated shapes lottie json"
import subtleBgAnimation from '/public/bg-animation.json'; // Placeholder path

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
      <div className="w-full h-full transform scale-150">
        <Lottie 
          animationData={subtleBgAnimation} 
          loop={true} 
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};

export default AnimatedBackground;