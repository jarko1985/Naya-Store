import { Metadata } from 'next';
import Link from 'next/link';
import { listMyReturns } from '@/lib/actions/return.actions';
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Pagination from '@/components/shared/pagination';
import ReturnStatusBadge from '@/components/shared/order/return-status-badge';

export const metadata: Metadata = {
  title: 'My Returns',
};

const ReturnsPage = async (props: { searchParams: Promise<{ page: string }> }) => {
  const { page } = await props.searchParams;

  const returns = await listMyReturns({ page: Number(page) || 1 });

  return (
    <div className='space-y-2'>
      <h2 className='h2-bold'>Returns</h2>
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>ORDER</TableHead>
              <TableHead>DATE</TableHead>
              <TableHead>ITEMS</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead>REFUND</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {returns.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className='text-center text-muted-foreground'>
                  No return requests yet.
                </TableCell>
              </TableRow>
            )}
            {returns.data.map((ret) => (
              <TableRow key={ret.id}>
                <TableCell>{formatId(ret.id)}</TableCell>
                <TableCell>
                  <Link href={`/order/${ret.orderId}`} className='underline'>
                    {formatId(ret.orderId)}
                  </Link>
                </TableCell>
                <TableCell>{formatDateTime(ret.createdAt).dateTime}</TableCell>
                <TableCell>{ret.items.length}</TableCell>
                <TableCell>
                  <ReturnStatusBadge status={ret.status} />
                </TableCell>
                <TableCell>
                  {ret.status === 'resolved' && ret.refundAmount
                    ? formatCurrency(ret.refundAmount, ret.order?.currency)
                    : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {returns.totalPages > 1 && (
          <Pagination page={Number(page) || 1} totalPages={returns.totalPages} />
        )}
      </div>
    </div>
  );
};

export default ReturnsPage;
