import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
  import { deleteOrder, getAllOrders } from '@/lib/actions/order.actions';
  import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
  import { Metadata } from 'next';
  import { Button } from '@/components/ui/button';
  import Link from 'next/link';
  import Pagination from '@/components/shared/pagination';
  import DeleteDialog from '@/components/shared/delete-dialog';
  import { requireAdmin } from '@/lib/auth-guard';
  
  export const metadata: Metadata = {
    title: 'Admin Orders',
  };
  
  const AdminOrdersPage = async (props: {
    searchParams: Promise<{ page: string; query: string }>;
  }) => {
    const { page = '1', query: searchText } = await props.searchParams;
  
    await requireAdmin();
  
    const orders = await getAllOrders({
      page: Number(page),
      query: searchText,
    });
  
    return (
      <div className='space-y-2'>
        <div className='flex flex-wrap items-center gap-3'>
          <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold'>Orders</h1>
          {searchText && (
            <div className='text-sm'>
              Filtered by <i>&quot;{searchText}&quot;</i>{' '}
              <Link href='/admin/orders'>
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
              <TableHead>DATE</TableHead>
              <TableHead>BUYER</TableHead>
              <TableHead>TOTAL</TableHead>
              <TableHead className='hidden md:table-cell'>PAID</TableHead>
              <TableHead className='hidden md:table-cell'>DELIVERED</TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.data.map((order) => (
              <TableRow key={order.id}>
                <TableCell className='hidden sm:table-cell'>{formatId(order.id)}</TableCell>
                <TableCell>
                  {formatDateTime(order.createdAt).dateTime}
                </TableCell>
                <TableCell>{order.user.name}</TableCell>
                <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                <TableCell className='hidden md:table-cell'>
                  {order.isPaid && order.paidAt
                    ? formatDateTime(order.paidAt).dateTime
                    : 'Not Paid'}
                </TableCell>
                <TableCell className='hidden md:table-cell'>
                  {order.isDelivered && order.deliveredAt
                    ? formatDateTime(order.deliveredAt).dateTime
                    : 'Not Delivered'}
                </TableCell>
                <TableCell className='flex gap-1'>
                  <Button asChild variant='outline' size='sm'>
                    <Link href={`/order/${order.id}`}>Details</Link>
                  </Button>
                  <DeleteDialog id={order.id} action={deleteOrder} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {orders.totalPages > 1 && (
          <Pagination
            page={Number(page) || 1}
            totalPages={orders?.totalPages}
          />
        )}
      </div>
    );
  };
  
  export default AdminOrdersPage;