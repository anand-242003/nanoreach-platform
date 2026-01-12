import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion';

export default function ContainerScroll({ titleComponent, children }) {
  const containerRef = useRef(null);
  const scrollYMotion = useMotionValue(0);
  
  useEffect(() => {
    const handleScroll = () => {
      scrollYMotion.set(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollYMotion]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const rotate = useTransform(scrollYMotion, [0, 480], [20, 0]);
  const scaleDimensions = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const translateY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      className="h-[80rem] flex items-center justify-center relative"
      ref={containerRef}
    >
      <div className="w-full relative" style={{ perspective: '1000px' }}>
        <motion.div style={{ translateY }} className="max-w-5xl mx-auto text-center">
          {titleComponent}
        </motion.div>
        <motion.div
          style={{ 
            rotateX: rotate,
            scale: scaleDimensions 
          }}
          className="max-w-5xl mx-auto h-[40rem] md:h-[50rem] w-full p-2 md:p-6"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
