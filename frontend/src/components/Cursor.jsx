import React, { useEffect, useState, useRef } from 'react';

const NUM_DOTS = 8; // Number of trailing dots

export default function Cursor() {
  const [clicked, setClicked] = useState(false);
  
  const dotRefs = useRef([]);
  const headRef = useRef(null);
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const history = useRef([]);
  
  const dotsData = useRef(
    Array(NUM_DOTS).fill(0).map(() => ({ x: window.innerWidth / 2, y: window.innerHeight / 2 }))
  );

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseDown = () => setClicked(true);
    const handleMouseUp = () => setClicked(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    let animationFrameId;
    const render = () => {
      let { x, y } = mouseRef.current;

      // Update head position directly for zero latency
      if (headRef.current) {
        headRef.current.style.left = `${x}px`;
        headRef.current.style.top = `${y}px`;
      }

      // Maintain a history of positions for perfect spacing
      history.current.unshift({ x, y });
      if (history.current.length > NUM_DOTS * 5) {
        history.current.pop();
      }

      // Update trailing dots by pulling from history with an offset
      dotsData.current.forEach((dot, index) => {
        // Offset in history array creates the exact physical space between dots
        const historyIndex = (index + 1) * 3; 
        const targetPos = history.current[historyIndex] || history.current[history.current.length - 1];
        
        if (targetPos) {
          // Fast interpolation towards history target
          dot.x += (targetPos.x - dot.x) * 0.8;
          dot.y += (targetPos.y - dot.y) * 0.8;
        }

        const el = dotRefs.current[index];
        if (el) {
          el.style.left = `${dot.x}px`;
          el.style.top = `${dot.y}px`;
          
          // Scale down the tail dots
          const scale = 1 - (index / NUM_DOTS);
          el.style.transform = `translate(-50%, -50%) scale(${scale})`;
          el.style.opacity = scale * 0.6; // Fade out slightly
        }
      });
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {dotsData.current.map((_, index) => (
        <div
          key={index}
          ref={(el) => (dotRefs.current[index] = el)}
          className="custom-cursor-trail"
        />
      ))}
      <div 
        ref={headRef}
        className={`custom-cursor-head ${clicked ? 'clicked' : ''}`}
      />
    </>
  );
}
