'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';

interface EditorialFashionNavigationProps {
  onPrev: () => void;
  onNext: () => void;
  showDragHint?: boolean;
}

const EditorialFashionNavigation = ({ onPrev, onNext, showDragHint = true }: EditorialFashionNavigationProps) => {
  return (
    <div className="flex items-center gap-6">
      {showDragHint && (
        <span className="hidden text-[11px] uppercase tracking-[0.2em] opacity-50 md:inline-block">Drag to explore</span>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous collection"
          className="group -m-3 p-3 transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-current focus-visible:outline-offset-4"
        >
          <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Next collection"
          className="group -m-3 p-3 transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-current focus-visible:outline-offset-4"
        >
          <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default EditorialFashionNavigation;
