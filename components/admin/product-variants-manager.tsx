'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UploadButton } from '@/lib/uploadthing';
import { createProductVariant, deleteProductVariant } from '@/lib/actions/product.action';
import { PRODUCT_SIZES, PRODUCT_COLORS } from '@/lib/constants';
import { ProductVariant } from '@/types';

interface ProductVariantsManagerProps {
  productId: string;
  initialVariants: ProductVariant[];
}

const emptyForm = {
  color: '',
  size: '',
  price: '',
  stock: '',
  image: '',
};

const ProductVariantsManager = ({
  productId,
  initialVariants,
}: ProductVariantsManagerProps) => {
  const [variants, setVariants] = useState<ProductVariant[]>(initialVariants);
  const [form, setForm] = useState(emptyForm);
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    if (!form.color || !form.size || !form.price || !form.stock || !form.image) {
      toast.error('Please fill in all fields and upload an image');
      return;
    }

    startTransition(async () => {
      const res = await createProductVariant({
        productId,
        color: form.color,
        size: form.size,
        price: form.price,
        stock: Number(form.stock),
        image: form.image,
      });

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success(res.message);
      // Refresh variants list by re-fetching — for simplicity, reload page
      window.location.reload();
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteProductVariant(id);

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success(res.message);
      setVariants((prev) => prev.filter((v) => v.id !== id));
    });
  };

  // Color dot helper
  const colorMap: Record<string, string> = {
    Black: '#000000', White: '#FFFFFF', Red: '#EF4444', Green: '#22C55E',
    Blue: '#3B82F6', Yellow: '#EAB308', Orange: '#F97316', Purple: '#A855F7',
    Pink: '#EC4899', Brown: '#92400E', Gray: '#6B7280', Navy: '#1E3A5F',
    Beige: '#D4B896', Teal: '#14B8A6',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Variants</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Existing variants table */}
        {variants.length > 0 && (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b'>
                  <th className='text-left pb-2'>Image</th>
                  <th className='text-left pb-2'>Color</th>
                  <th className='text-left pb-2'>Size</th>
                  <th className='text-left pb-2'>Price</th>
                  <th className='text-left pb-2'>Stock</th>
                  <th className='text-left pb-2'></th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => (
                  <tr key={v.id} className='border-b last:border-0'>
                    <td className='py-2'>
                      <Image
                        src={v.image}
                        alt={`${v.color} ${v.size}`}
                        width={48}
                        height={48}
                        className='w-12 h-12 object-cover rounded'
                      />
                    </td>
                    <td className='py-2'>
                      <div className='flex items-center gap-2'>
                        <span
                          className='w-4 h-4 rounded-full border border-gray-300 inline-block'
                          style={{ backgroundColor: colorMap[v.color] ?? v.color }}
                        />
                        {v.color}
                      </div>
                    </td>
                    <td className='py-2'>{v.size}</td>
                    <td className='py-2'>${v.price}</td>
                    <td className='py-2'>{v.stock}</td>
                    <td className='py-2'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        disabled={isPending}
                        onClick={() => handleDelete(v.id)}
                      >
                        <Trash2 className='w-4 h-4 text-red-500' />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add variant form */}
        <div className='border rounded-lg p-4 space-y-4'>
          <p className='font-medium text-sm'>Add New Variant</p>
          <div className='grid grid-cols-2 gap-3'>
            {/* Color */}
            <div className='space-y-1'>
              <label className='text-sm font-medium'>Color</label>
              <Select
                value={form.color}
                onValueChange={(val) => setForm((f) => ({ ...f, color: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select color' />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_COLORS.map((c) => (
                    <SelectItem key={c} value={c}>
                      <div className='flex items-center gap-2'>
                        <span
                          className='w-3 h-3 rounded-full border border-gray-300 inline-block'
                          style={{ backgroundColor: colorMap[c] ?? '#ccc' }}
                        />
                        {c}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Size */}
            <div className='space-y-1'>
              <label className='text-sm font-medium'>Size</label>
              <Select
                value={form.size}
                onValueChange={(val) => setForm((f) => ({ ...f, size: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select size' />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_SIZES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price */}
            <div className='space-y-1'>
              <label className='text-sm font-medium'>Price</label>
              <Input
                placeholder='e.g. 29.99'
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>

            {/* Stock */}
            <div className='space-y-1'>
              <label className='text-sm font-medium'>Stock</label>
              <Input
                type='number'
                min={0}
                placeholder='e.g. 10'
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              />
            </div>
          </div>

          {/* Image upload */}
          <div className='space-y-1'>
            <label className='text-sm font-medium'>Variant Image</label>
            <div className='flex items-center gap-4'>
              {form.image && (
                <Image
                  src={form.image}
                  alt='variant preview'
                  width={64}
                  height={64}
                  className='w-16 h-16 object-cover rounded border'
                />
              )}
              <UploadButton
                endpoint='imageUploader'
                onClientUploadComplete={(res: { url: string }[]) => {
                  setForm((f) => ({ ...f, image: res[0].url }));
                  toast.success('Image uploaded');
                }}
                onUploadError={(error: Error) => {
                  toast.error(`Upload error: ${error.message}`);
                }}
              />
            </div>
          </div>

          <Button
            type='button'
            disabled={isPending}
            onClick={handleAdd}
            className='w-full'
          >
            <Plus className='w-4 h-4 mr-2' />
            {isPending ? 'Adding...' : 'Add Variant'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductVariantsManager;
