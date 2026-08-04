'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { createCategory } from '@/lib/actions/category.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface ParentOption {
  id: string;
  name: string;
  parentId: string | null;
}

export default function CreateCategoryForm({ parentOptions }: { parentOptions: ParentOption[] }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>('none');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }
    setSubmitting(true);
    const res = await createCategory({
      name: name.trim(),
      parentId: parentId === 'none' ? null : parentId,
    });
    setSubmitting(false);

    if (res.success) {
      toast.success(res.message);
      setName('');
      setParentId('none');
      router.refresh();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className='flex flex-col sm:flex-row gap-2 rounded-lg border bg-muted/20 p-3'>
      <Input
        placeholder='New category name'
        value={name}
        onChange={(e) => setName(e.target.value)}
        className='sm:flex-1'
      />
      <Select value={parentId} onValueChange={setParentId}>
        <SelectTrigger className='sm:w-56'>
          <SelectValue placeholder='Top-level category' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='none'>Top-level category</SelectItem>
          {parentOptions.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.parentId ? `— ${c.name}` : c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type='button' onClick={handleSubmit} disabled={submitting} className='gap-1.5'>
        <Plus className='w-4 h-4' />
        {submitting ? 'Creating...' : 'Create'}
      </Button>
    </div>
  );
}
