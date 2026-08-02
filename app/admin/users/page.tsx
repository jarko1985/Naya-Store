import { Metadata } from 'next';
import { getAllUsers, deleteUser } from '@/lib/actions/user.actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Pagination from '@/components/shared/pagination';
import { Badge } from '@/components/ui/badge';
import DeleteDialog from '@/components/shared/delete-dialog';
import { requireAdmin } from '@/lib/auth-guard';

export const metadata: Metadata = {
  title: 'Admin Users',
};

const AdminUserPage = async (props: {
  searchParams: Promise<{
    page: string;
    query: string;
  }>;
}) => {
  await requireAdmin();

  const { page = '1', query: searchText } = await props.searchParams;

  const users = await getAllUsers({ page: Number(page), query: searchText });

  return (
    <div className='space-y-2'>
      <div className='flex flex-wrap items-center gap-3'>
        <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold'>Users</h1>
        {searchText && (
          <div className='text-sm'>
            Filtered by <i>&quot;{searchText}&quot;</i>{' '}
            <Link href='/admin/users'>
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
            <TableHead>NAME</TableHead>
            <TableHead className='hidden sm:table-cell'>EMAIL</TableHead>
            <TableHead>ROLE</TableHead>
            <TableHead>ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.data.map((user) => (
            <TableRow key={user.id}>
              <TableCell className='hidden sm:table-cell'>{formatId(user.id)}</TableCell>
              <TableCell className='max-w-32 truncate sm:max-w-none sm:whitespace-nowrap'>
                {user.name}
              </TableCell>
              <TableCell className='hidden sm:table-cell'>{user.email}</TableCell>
              <TableCell>
                {user.role === 'user' ? (
                  <Badge variant='secondary'>User</Badge>
                ) : (
                  <Badge variant='default'>Admin</Badge>
                )}
              </TableCell>
              <TableCell className='flex gap-1'>
                <Button asChild variant='outline' size='sm'>
                  <Link href={`/admin/users/${user.id}`}>Edit</Link>
                </Button>
                <DeleteDialog id={user.id} action={deleteUser} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {users.totalPages > 1 && (
        <Pagination page={Number(page) || 1} totalPages={users?.totalPages} />
      )}
    </div>
  );
};

export default AdminUserPage;