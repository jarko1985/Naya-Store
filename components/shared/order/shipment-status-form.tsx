'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  SHIPMENT_STATUSES,
  SHIPMENT_STATUS_LABELS,
  SHIPMENT_STATUS_RANK,
  ShipmentStatus,
} from '@/lib/constants';
import { Shipment } from '@/types';
import { updateShipmentStatus } from '@/lib/actions/shipment.actions';

const ShipmentStatusForm = ({ orderId, shipment }: { orderId: string; shipment: Shipment }) => {
  const [status, setStatus] = useState<ShipmentStatus>(shipment.status as ShipmentStatus);
  const [carrier, setCarrier] = useState(shipment.carrier ?? '');
  const [trackingNumber, setTrackingNumber] = useState(shipment.trackingNumber ?? '');
  const [isPending, startTransition] = useTransition();

  const currentRank = SHIPMENT_STATUS_RANK[shipment.status as ShipmentStatus];
  const selectableStatuses = SHIPMENT_STATUSES.filter(
    (s) => SHIPMENT_STATUS_RANK[s] >= currentRank
  );

  return (
    <div className='space-y-3'>
      <div>
        <label className='text-xs text-muted-foreground'>Status</label>
        <Select value={status} onValueChange={(val) => setStatus(val as ShipmentStatus)}>
          <SelectTrigger className='w-full'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {selectableStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {SHIPMENT_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className='text-xs text-muted-foreground'>Carrier</label>
        <Input
          value={carrier}
          onChange={(e) => setCarrier(e.target.value)}
          placeholder='e.g. UPS, FedEx, DHL'
        />
      </div>
      <div>
        <label className='text-xs text-muted-foreground'>Tracking Number</label>
        <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
      </div>
      <Button
        type='button'
        size='sm'
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const res = await updateShipmentStatus({ orderId, status, carrier, trackingNumber });
            if (res.success) {
              toast.success(res.message);
            } else {
              toast.error(res.message);
            }
          })
        }
      >
        {isPending ? 'Saving...' : 'Update Shipment'}
      </Button>
    </div>
  );
};

export default ShipmentStatusForm;
