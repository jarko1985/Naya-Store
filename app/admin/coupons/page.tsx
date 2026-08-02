import { requireAdmin } from '@/lib/auth-guard';
import { getAllCoupons, deleteCoupon } from '@/lib/actions/coupon.actions';
import { formatDateTime, formatId } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import DeleteDialog from '@/components/shared/delete-dialog';
import CouponFormDialog from '@/components/admin/coupon-form-dialog';

const AdminCouponsPage = async () => {
  await requireAdmin();

  const coupons = await getAllCoupons();

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold'>Coupons</h1>
        <div className='sm:shrink-0'>
          <CouponFormDialog />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='hidden sm:table-cell'>ID</TableHead>
            <TableHead>CODE</TableHead>
            <TableHead>DISCOUNT</TableHead>
            <TableHead className='hidden sm:table-cell'>USES</TableHead>
            <TableHead className='hidden md:table-cell'>WINDOW</TableHead>
            <TableHead>STATUS</TableHead>
            <TableHead className='w-[110px]'>ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className='text-center text-muted-foreground py-8'>
                No coupons yet — create one to get started.
              </TableCell>
            </TableRow>
          )}
          {coupons.map((coupon) => (
            <TableRow key={coupon.id}>
              <TableCell className='hidden sm:table-cell'>{formatId(coupon.id)}</TableCell>
              <TableCell className='font-mono font-medium'>{coupon.code}</TableCell>
              <TableCell>
                {coupon.type === 'percent' ? `${coupon.value}% off` : `$${coupon.value} off`}
              </TableCell>
              <TableCell className='hidden sm:table-cell'>
                {coupon.usedCount}
                {coupon.maxUses ? ` / ${coupon.maxUses}` : ''}
              </TableCell>
              <TableCell className='hidden md:table-cell text-xs text-muted-foreground'>
                {coupon.startsAt ? formatDateTime(new Date(coupon.startsAt)).dateOnly : 'Any time'}
                {' – '}
                {coupon.expiresAt ? formatDateTime(new Date(coupon.expiresAt)).dateOnly : 'No expiry'}
              </TableCell>
              <TableCell>
                <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className='flex gap-1'>
                <CouponFormDialog coupon={coupon} />
                <DeleteDialog id={coupon.id} action={deleteCoupon} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminCouponsPage;
