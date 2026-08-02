import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
  import { getOrderSummary } from '@/lib/actions/order.actions';
  import { formatCurrency, formatDateTime, formatNumber } from '@/lib/utils';
  import { BadgeDollarSign, Barcode, CreditCard, Users } from 'lucide-react';
  import { Metadata } from 'next';
  import Link from 'next/link';
  import Charts from './charts';
  import { requireAdmin } from '@/lib/auth-guard';
  
  export const metadata: Metadata = {
    title: 'Admin Dashboard',
  };
  
  const AdminOverviewPage = async () => {
    await requireAdmin();
  
    const summary = await getOrderSummary();
  
    return (
      <div className='space-y-2'>
        <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold'>Dashboard</h1>
        <div className='grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs sm:text-sm font-medium'>Total Revenue</CardTitle>
              <BadgeDollarSign className='size-4 sm:size-5' />
            </CardHeader>
            <CardContent>
              <div className='text-lg sm:text-2xl font-bold'>
                {formatCurrency(
                  summary.totalSales._sum.totalPrice?.toString() || 0
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs sm:text-sm font-medium'>Sales</CardTitle>
              <CreditCard className='size-4 sm:size-5' />
            </CardHeader>
            <CardContent>
              <div className='text-lg sm:text-2xl font-bold'>
                {formatNumber(summary.ordersCount)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs sm:text-sm font-medium'>Customers</CardTitle>
              <Users className='size-4 sm:size-5' />
            </CardHeader>
            <CardContent>
              <div className='text-lg sm:text-2xl font-bold'>
                {formatNumber(summary.usersCount)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs sm:text-sm font-medium'>Products</CardTitle>
              <Barcode className='size-4 sm:size-5' />
            </CardHeader>
            <CardContent>
              <div className='text-lg sm:text-2xl font-bold'>
                {formatNumber(summary.productsCount)}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className='grid gap-4 lg:grid-cols-7'>
          <Card className='lg:col-span-4'>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className='px-2 sm:px-6'>
              <Charts
                data={{
                  salesData: summary.salesData,
                }}
              />
            </CardContent>
          </Card>
          <Card className='lg:col-span-3'>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>BUYER</TableHead>
                    <TableHead className='hidden sm:table-cell'>DATE</TableHead>
                    <TableHead>TOTAL</TableHead>
                    <TableHead>ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.latestSales.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        {order?.user?.name ? order.user.name : 'Deleted User'}
                      </TableCell>
                      <TableCell className='hidden sm:table-cell'>
                        {formatDateTime(order.createdAt).dateOnly}
                      </TableCell>
                      <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                      <TableCell>
                        <Link href={`/order/${order.id}`}>
                          <span className='px-2'>Details</span>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };
  
  export default AdminOverviewPage;