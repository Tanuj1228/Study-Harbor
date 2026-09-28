// frontend/src/components/AnimatedBackground.jsx
import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
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
  // FIX 1: Increased opacity from 'opacity-10' to 'opacity-20' for better visibility
  <div className="fixed inset-0 overflow-hidden opacity-20 pointer-events-none z-0">
   <div className="w-full h-full transform scale-150">
    <Lottie 
     // 5. Use the fetched animationData
     animationData={animationData} 
     loop={true} 
          // FIX 2: Used 100% for width/height within the scaled parent div
     style={{ width: '100%', height: '100%' }}
    />
   </div>
  </div>
 );
};

export default AnimatedBackground;