import React from 'react';
import { Check, User, MapPin, CreditCard, PackageCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { label: 'User Login', icon: User },
  { label: 'Shipping Address', icon: MapPin },
  { label: 'Payment Method', icon: CreditCard },
  { label: 'Place Order', icon: PackageCheck },
];

const CheckoutSteps = ({ current = 0 }) => {
  return (
    <>
      {/* Mobile: compact segmented progress bar */}
      <div className='sm:hidden mb-8'>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-xs text-muted-foreground'>
            Step {current + 1} of {STEPS.length}
          </span>
          <span className='text-xs font-semibold text-primary'>{STEPS[current].label}</span>
        </div>
        <div className='flex items-center gap-1.5'>
          {STEPS.map((step, index) => (
            <div
              key={step.label}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                index <= current ? 'bg-primary' : 'bg-border'
              )}
            />
          ))}
        </div>
      </div>

      {/* Desktop: full icon stepper */}
      <div className='hidden sm:flex items-start justify-center mb-10 px-2'>
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isComplete = index < current;
          const isActive = index === current;

          return (
            <React.Fragment key={step.label}>
              <div className='flex flex-col items-center gap-1.5 shrink-0'>
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors shrink-0',
                    isComplete && 'bg-primary border-primary text-primary-foreground',
                    isActive && 'border-primary text-primary bg-primary/10 shadow-sm',
                    !isComplete && !isActive && 'border-border text-muted-foreground'
                  )}
                >
                  {isComplete ? <Check className='w-4 h-4' /> : <Icon className='w-4 h-4' />}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium whitespace-nowrap',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 w-10 sm:w-20 mt-4.5 mx-1 sm:mx-2 rounded-full transition-colors shrink-0',
                    isComplete ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
};

export default CheckoutSteps;
