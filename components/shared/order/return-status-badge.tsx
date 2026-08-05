import { Badge } from '@/components/ui/badge';
import { RETURN_STATUS_LABELS, ReturnStatus } from '@/lib/constants';

const VARIANT: Record<ReturnStatus, 'secondary' | 'default' | 'destructive' | 'outline'> = {
  requested: 'secondary',
  approved: 'default',
  rejected: 'destructive',
  resolved: 'outline',
};

const ReturnStatusBadge = ({ status }: { status: string }) => (
  <Badge variant={VARIANT[status as ReturnStatus] ?? 'secondary'}>
    {RETURN_STATUS_LABELS[status as ReturnStatus] ?? status}
  </Badge>
);

export default ReturnStatusBadge;
