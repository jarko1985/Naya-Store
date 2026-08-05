import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getReturnById } from '@/lib/actions/return.actions';
import { requireAdmin } from '@/lib/auth-guard';
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import ReturnStatusBadge from '@/components/shared/order/return-status-badge';
import ReturnDecisionForm from '@/components/shared/order/return-decision-form';

export const metadata: Metadata = {
  title: 'Review Return',
};

const AdminReturnDetailPage = async (props: { params: Promise<{ id: string }> }) => {
  await requireAdmin();

  const { id } = await props.params;
  const ret = await getReturnById(id);
  if (!ret) notFound();

  return (
    <div className='max-w-3xl mx-auto space-y-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl sm:text-2xl font-bold'>Return {formatId(ret.id)}</h1>
        <ReturnStatusBadge status={ret.status} />
      </div>

      <Card>
        <CardContent className='p-5 space-y-1'>
          <p className='text-sm'>
            Order{' '}
            <Link href={`/order/${ret.orderId}`} className='underline'>
              {formatId(ret.orderId)}
            </Link>
          </p>
          <p className='text-sm text-muted-foreground'>
            {ret.order?.user.name} &middot; {ret.order?.user.email}
          </p>
          <p className='text-sm text-muted-foreground'>
            Requested {formatDateTime(ret.createdAt).dateTime}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-5 space-y-3'>
          <h2 className='font-semibold'>Items</h2>
          {ret.items.map((item) => (
            <div key={item.id} className='flex items-center gap-3'>
              <Image
                src={item.orderItem.image}
                alt={item.orderItem.name}
                width={48}
                height={48}
                className='rounded-md border object-cover shrink-0'
              />
              <div className='flex-1 min-w-0'>
                <p className='text-sm truncate'>{item.orderItem.name}</p>
                <p className='text-xs text-muted-foreground'>
                  Qty {item.qty} &middot;{' '}
                  {formatCurrency(item.orderItem.price, ret.order?.currency)} each
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-5 space-y-1'>
          <h2 className='font-semibold mb-1'>Reason</h2>
          <p className='text-sm text-muted-foreground'>{ret.reason}</p>
        </CardContent>
      </Card>

      {ret.adminNote && (
        <Card>
          <CardContent className='p-5 space-y-1'>
            <h2 className='font-semibold mb-1'>Admin Note</h2>
            <p className='text-sm text-muted-foreground'>{ret.adminNote}</p>
          </CardContent>
        </Card>
      )}

      {ret.status === 'resolved' && ret.refundAmount && (
        <Card>
          <CardContent className='p-5 space-y-1'>
            <h2 className='font-semibold mb-1'>Refund</h2>
            <p className='text-sm text-muted-foreground'>
              {formatCurrency(ret.refundAmount, ret.order?.currency)} refunded
              {ret.refundedAt ? ` on ${formatDateTime(ret.refundedAt).dateTime}` : ''}
            </p>
          </CardContent>
        </Card>
      )}

      {(ret.status === 'requested' || ret.status === 'approved') && (
        <Card>
          <CardContent className='p-5'>
            <ReturnDecisionForm returnId={ret.id} status={ret.status} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminReturnDetailPage;
