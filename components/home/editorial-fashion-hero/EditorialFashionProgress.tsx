'use client';

import { useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

interface EditorialFashionProgressProps {
  index: number;
  total: number;
  isPlaying: boolean;
  duration: number;
  compact?: boolean;
}

const EditorialFashionProgress = ({ index, total, isPlaying, duration, compact = false }: EditorialFashionProgressProps) => {
  const controls = useAnimationControls();

  // Reset the fill whenever the active slide changes.
  useEffect(() => {
    controls.set({ scaleX: 0 });
  }, [index, controls]);

  // Drive (or freeze) the fill based on autoplay pause state.
  useEffect(() => {
    if (!isPlaying) {
      controls.stop();
      return;
    }
    controls.start({ scaleX: 1, transition: { duration: duration / 1000, ease: 'linear' } });
  }, [index, isPlaying, duration, controls]);

  return (
    <div className="flex items-center gap-4 text-[11px] font-medium tracking-[0.2em]" aria-hidden="true">
      {!compact && <span className="tabular-nums">{String(index + 1).padStart(2, '0')}</span>}
      <div className={`relative h-px overflow-hidden bg-current opacity-25 ${compact ? 'w-full' : 'w-20 sm:w-32'}`}>
        <motion.div className="absolute inset-y-0 left-0 w-full origin-left bg-current" initial={{ scaleX: 0 }} animate={controls} />
      </div>
      {!compact && <span className="tabular-nums opacity-50">{String(total).padStart(2, '0')}</span>}
    </div>
  );
};

export default EditorialFashionProgress;
