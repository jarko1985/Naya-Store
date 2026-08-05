import { PackageCheck, Truck, Navigation, CheckCircle2 } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { SHIPMENT_STATUS_RANK, ShipmentStatus } from '@/lib/constants';
import { Shipment } from '@/types';
import { cn } from '@/lib/utils';

const STEPS: { key: ShipmentStatus; label: string; icon: typeof PackageCheck }[] = [
  { key: 'pending', label: 'Placed', icon: PackageCheck },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Navigation },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

const ShipmentTimeline = ({
  shipment,
  placedAt,
}: {
  shipment: Shipment | null;
  placedAt: Date;
}) => {
  const currentRank = shipment ? SHIPMENT_STATUS_RANK[shipment.status as ShipmentStatus] : 0;

  const dateFor = (key: ShipmentStatus) => {
    if (key === 'pending') return placedAt;
    if (!shipment) return null;
    if (key === 'shipped') return shipment.shippedAt;
    if (key === 'out_for_delivery') return shipment.outForDeliveryAt;
    return shipment.deliveredAt;
  };

  return (
    <div className='flex items-start justify-between gap-1'>
      {STEPS.map((step, i) => {
        const stepRank = SHIPMENT_STATUS_RANK[step.key];
        const complete = stepRank <= currentRank;
        const date = dateFor(step.key);
        const Icon = step.icon;

        return (
          <div key={step.key} className='flex flex-1 flex-col items-center text-center'>
            <div className='flex w-full items-center'>
              <div
                className={cn(
                  'h-0.5 flex-1',
                  i === 0 ? 'invisible' : complete ? 'bg-primary' : 'bg-muted'
                )}
              />
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  complete ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}
              >
                <Icon className='w-4 h-4' />
              </span>
              <div
                className={cn(
                  'h-0.5 flex-1',
                  i === STEPS.length - 1 ? 'invisible' : complete ? 'bg-primary' : 'bg-muted'
                )}
              />
            </div>
            <p className={cn('mt-2 text-xs font-medium', !complete && 'text-muted-foreground')}>
              {step.label}
            </p>
            {date && (
              <p className='text-[11px] text-muted-foreground'>{formatDateTime(date).dateTime}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ShipmentTimeline;
