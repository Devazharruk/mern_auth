import { useEffect, useRef } from 'react';

const StarryCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;

    // Generate stars
    const stars = Array(100).fill().map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2,
      alpha: Math.random(),
      speed: Math.random() * 0.05 + 0.05
    }));

    const drawStars = () => {
      ctx.clearRect(0, 0, width, height);
      stars.forEach(star => {
        star.alpha += star.speed * (Math.random() > 0.5 ? 1 : -1);
        if (star.alpha < 0 || star.alpha > 1) {
          star.alpha = Math.random();
        }

        ctx.globalAlpha = star.alpha;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const animate = () => {
      drawStars();
      requestAnimationFrame(animate);
    };

    animate(); // Start the animation

    const resizeHandler = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawStars();
    };

    window.addEventListener('resize', resizeHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: -1 }} />;
};

export default StarryCanvas;
