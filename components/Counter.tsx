'use client';

import React, { useEffect } from 'react';
import { motion, useSpring, useTransform, MotionValue } from 'framer-motion';

interface NumberProps {
  mv: MotionValue<number>;
  number: number;
  height: number;
}

function Number({ mv, number, height }: NumberProps) {
  const y = useTransform(mv, (latest) => {
    const placeValue = latest % 10;
    let offset = (10 + number - placeValue) % 10;
    let memo = offset * height;
    if (offset > 5) {
      memo -= 10 * height;
    }
    return memo;
  });

  return (
    <motion.span style={{ y }} className='absolute inset-0 flex items-center justify-center'>
      {number}
    </motion.span>
  );
}

interface DigitProps {
  place: number;
  value: number;
  height: number;
  digitStyle?: React.CSSProperties;
}

function Digit({ place, value, height, digitStyle }: DigitProps) {
  const valueRoundedToPlace = Math.floor(value / place);
  const animatedValue = useSpring(valueRoundedToPlace, { mass: 0.6, stiffness: 200, damping: 22 });

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  return (
    <div style={{ height, ...digitStyle }} className='relative w-[1ch] tabular-nums overflow-hidden'>
      {Array.from({ length: 10 }, (_, i) => (
        <Number key={i} mv={animatedValue} number={i} height={height} />
      ))}
    </div>
  );
}

interface CounterProps {
  value: number;
  places?: number[];
  fontSize?: number;
  gap?: number;
  textColor?: string;
  fontWeight?: React.CSSProperties['fontWeight'];
  containerStyle?: React.CSSProperties;
  counterStyle?: React.CSSProperties;
  digitStyle?: React.CSSProperties;
  className?: string;
}

export default function Counter({
  value,
  places = [10, 1],
  fontSize = 30,
  gap = 0,
  textColor = 'inherit',
  fontWeight = 'bold',
  containerStyle,
  counterStyle,
  digitStyle,
  className,
}: CounterProps) {
  const height = fontSize;

  return (
    <div style={{ position: 'relative', display: 'inline-block', ...containerStyle }} className={className}>
      <div
        style={{
          fontSize,
          display: 'flex',
          gap,
          overflow: 'hidden',
          lineHeight: 1,
          color: textColor,
          fontWeight,
          ...counterStyle,
        }}
      >
        {places.map((place) => (
          <Digit key={place} place={place} value={value} height={height} digitStyle={digitStyle} />
        ))}
      </div>
    </div>
  );
}
