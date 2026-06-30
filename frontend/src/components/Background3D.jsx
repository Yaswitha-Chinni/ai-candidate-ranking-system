import React, { useEffect, useRef } from 'react';

export default function Background3D() {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 40;
      const y = (e.clientY / window.innerHeight - 0.5) * 40;
      
      const elements = containerRef.current.children;
      for (let i = 0; i < elements.length; i++) {
        const depth = (i + 1) * 3;
        elements[i].style.transform = `translate3d(${x * depth}px, ${y * depth}px, ${depth * 10}px) rotateX(${y}deg) rotateY(${x}deg)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -2,
        overflow: 'hidden',
        pointerEvents: 'none',
        perspective: '1000px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div className="bg-shape shape-1" />
      <div className="bg-shape shape-2" />
      <div className="bg-shape shape-3" />
      <div className="bg-shape shape-4" />
    </div>
  );
}
