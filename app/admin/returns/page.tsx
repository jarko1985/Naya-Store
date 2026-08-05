import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { listAllReturns } from '@/lib/actions/return.actions';
import { formatDateTime, formatId } from '@/lib/utils';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Pagination from '@/components/shared/pagination';
import { requireAdmin } from '@/lib/auth-guard';
import ReturnStatusBadge from '@/components/shared/order/return-status-badge';

export const metadata: Metadata = {
  title: 'Admin Returns',
};

const AdminReturnsPage = async (props: {
  searchParams: Promise<{ page: string; query: string }>;
}) => {
  const { page = '1', query: searchText } = await props.searchParams;

  await requireAdmin();

  const returns = await listAllReturns({
    page: Number(page),
    query: searchText,
  });

  return (
    <div className='space-y-2'>
      <div className='flex flex-wrap items-center gap-3'>
        <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold'>Returns</h1>
        {searchText && (
          <div className='text-sm'>
            Filtered by <i>&quot;{searchText}&quot;</i>{' '}
            <Link href='/admin/returns'>
              <Button variant='outline' size='sm'>
                Remove Filter
              </Button>
            </Link>
          </div>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='hidden sm:table-cell'>ID</TableHead>
            <TableHead>ORDER</TableHead>
            <TableHead>BUYER</TableHead>
            <TableHead>DATE</TableHead>
            <TableHead className='hidden md:table-cell'>ITEMS</TableHead>
            <TableHead>STATUS</TableHead>
            <TableHead>ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {returns.data.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className='text-center text-muted-foreground'>
                No return requests.
              </TableCell>
            </TableRow>
          )}
          {returns.data.map((ret) => (
            <TableRow key={ret.id}>
              <TableCell className='hidden sm:table-cell'>{formatId(ret.id)}</TableCell>
              <TableCell>
                <Link href={`/order/${ret.orderId}`} className='underline'>
                  {formatId(ret.orderId)}
                </Link>
              </TableCell>
              <TableCell>{ret.order?.user.name}</TableCell>
              <TableCell>{formatDateTime(ret.createdAt).dateTime}</TableCell>
              <TableCell className='hidden md:table-cell'>{ret.items.length}</TableCell>
              <TableCell>
                <ReturnStatusBadge status={ret.status} />
              </TableCell>
              <TableCell>
                <Button asChild variant='outline' size='sm'>
                  <Link href={`/admin/returns/${ret.id}`}>Review</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {returns.totalPages > 1 && (
        <Pagination page={Number(page) || 1} totalPages={returns.totalPages} />
      )}
    </div>
  );
};

export default AdminReturnsPage;
