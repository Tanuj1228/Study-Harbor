// frontend/src/components/AnimatedBackground.jsx
import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
// 1. Corrected import path (We now have the URL string)
import subtleBgAnimationUrl from "/bg-animation.json?url"; 

const AnimatedBackground = () => {
  // 2. State to hold the fetched JSON data
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    // 3. Fetch the JSON content using the URL
    const fetchAnimation = async () => {
      try {
        const response = await fetch(subtleBgAnimationUrl);
        const data = await response.json();
        setAnimationData(data);
      } catch (e) {
        console.error("Failed to load Lottie animation:", e);
      }
    };
    fetchAnimation();
  }, []); // Run only once

  // 4. Don't render if data hasn't loaded yet
  if (!animationData) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
      <div className="w-full h-full transform scale-150">
        <Lottie 
          // 5. Use the fetched animationData
          animationData={animationData} 
          loop={true} 
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};

export default AnimatedBackground;