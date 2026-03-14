'use client';

import { toast } from 'sonner';
import { productDefaultValues, PRODUCT_SIZES, PRODUCT_COLORS } from '@/lib/constants';
import { insertProductSchema, updateProductSchema } from '@/lib/validators';
import { Product } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { ControllerRenderProps, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import slugify from 'slugify';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { createProduct, updateProduct, createProductVariant } from '@/lib/actions/product.action';
import { UploadButton } from '@/lib/uploadthing';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { useState } from 'react';
import { Trash2, Plus, Wand2, ImagePlus, X, Tag, DollarSign, Star, FileText, Layers } from 'lucide-react';

const colorMap: Record<string, string> = {
  Black: '#000000', White: '#FFFFFF', Red: '#EF4444', Green: '#22C55E',
  Blue: '#3B82F6', Yellow: '#EAB308', Orange: '#F97316', Purple: '#A855F7',
  Pink: '#EC4899', Brown: '#92400E', Gray: '#6B7280', Navy: '#1E3A5F',
  Beige: '#D4B896', Teal: '#14B8A6',
};

interface PendingVariant {
  color: string;
  size: string;
  price: string;
  stock: string;
  image: string;
}

const emptyVariantForm: PendingVariant = { color: '', size: '', price: '', stock: '', image: '' };

const ProductForm = ({
  type,
  product,
  productId,
  categories = [],
}: {
  type: 'Create' | 'Update';
  product?: Product;
  productId?: string;
  categories?: string[];
}) => {
  const router = useRouter();
  const [pendingVariants, setPendingVariants] = useState<PendingVariant[]>([]);
  const [variantForm, setVariantForm] = useState<PendingVariant>(emptyVariantForm);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<z.infer<typeof insertProductSchema>>({
    resolver: zodResolver(
      type === 'Update' ? updateProductSchema : insertProductSchema
    ) as any,
    defaultValues: product && type === 'Update' ? product : productDefaultValues,
  });

  const onSubmit: SubmitHandler<z.infer<typeof insertProductSchema>> = async (values) => {
    if (type === 'Create') {
      const res = await createProduct(values);
      if (!res.success) { toast.error(res.message); return; }

      if (pendingVariants.length > 0 && res.id) {
        for (const v of pendingVariants) {
          await createProductVariant({
            productId: res.id,
            color: v.color,
            size: v.size,
            price: v.price,
            stock: Number(v.stock),
            image: v.image,
          });
        }
      }

      toast.success(
        pendingVariants.length > 0
          ? `${res.message} with ${pendingVariants.length} variant(s)`
          : res.message + ' — add variants below'
      );
      router.push(`/admin/products/${res.id}`);
    }

    if (type === 'Update') {
      if (!productId) { router.push('/admin/products'); return; }
      const res = await updateProduct({ ...values, id: productId });
      if (!res.success) {
        toast.error(res.message);
      } else {
        toast.success(res.message);
        router.push('/admin/products');
      }
    }
  };

  const images = form.watch('images');
  const isFeatured = form.watch('isFeatured');
  const banner = form.watch('banner');

  const handleAddPendingVariant = () => {
    if (!variantForm.color || !variantForm.size || !variantForm.price || !variantForm.stock || !variantForm.image) {
      toast.error('Please fill in all variant fields and upload an image');
      return;
    }
    setPendingVariants((prev) => [...prev, variantForm]);
    setVariantForm(emptyVariantForm);
  };

  return (
    <Form {...form}>
      <form method='POST' onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>

        {/* ── Section 1: Basic Info ── */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Tag className='w-4 h-4 text-primary' />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Name */}
            <FormField
              control={form.control}
              name='name'
              render={({ field }: { field: ControllerRenderProps<z.infer<typeof insertProductSchema>, 'name'> }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. Classic Polo Shirt' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Slug — inline Generate button */}
            <FormField
              control={form.control}
              name='slug'
              render={({ field }: { field: ControllerRenderProps<z.infer<typeof insertProductSchema>, 'slug'> }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <div className='flex gap-2'>
                      <Input placeholder='auto-generated-slug' {...field} className='flex-1' />
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        className='shrink-0 gap-1.5'
                        onClick={() =>
                          form.setValue('slug', slugify(form.getValues('name'), { lower: true }))
                        }
                      >
                        <Wand2 className='w-3.5 h-3.5' />
                        Generate
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {/* Category — dropdown from DB */}
              <FormField
                control={form.control}
                name='category'
                render={({ field }: { field: ControllerRenderProps<z.infer<typeof insertProductSchema>, 'category'> }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <div className='space-y-2'>
                        {!showCustomCategory ? (
                          <Select

                            value={field.value}
                            onValueChange={(val) => {
                              if (val === '__custom__') {
                                setShowCustomCategory(true);
                                field.onChange('');
                              } else {
                                field.onChange(val);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='Select a category' />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                              <SelectItem value='__custom__'>
                                <span className='text-primary font-medium'>+ Add new category</span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className='flex gap-2'>
                            <Input
                              placeholder='Type new category name'
                              value={customCategory}
                              onChange={(e) => {
                                setCustomCategory(e.target.value);
                                field.onChange(e.target.value);
                              }}
                              className='flex-1'
                            />
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                setShowCustomCategory(false);
                                setCustomCategory('');
                                field.onChange('');
                              }}
                            >
                              <X className='w-4 h-4' />
                            </Button>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Brand */}
              <FormField
                control={form.control}
                name='brand'
                render={({ field }: { field: ControllerRenderProps<z.infer<typeof insertProductSchema>, 'brand'> }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. Nike' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Base Color + Base Size */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='color'
                render={({ field }: { field: ControllerRenderProps<z.infer<typeof insertProductSchema>, 'color'> }) => (
                  <FormItem>
                    <FormLabel>Base Color</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select base color'>
                            {field.value && (
                              <div className='flex items-center gap-2'>
                                <span
                                  className='w-3.5 h-3.5 rounded-full border border-border shrink-0'
                                  style={{ backgroundColor: colorMap[field.value] ?? '#ccc' }}
                                />
                                {field.value}
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCT_COLORS.map((c) => (
                            <SelectItem key={c} value={c}>
                              <div className='flex items-center gap-2'>
                                <span
                                  className='w-3 h-3 rounded-full border border-border shrink-0'
                                  style={{ backgroundColor: colorMap[c] ?? '#ccc' }}
                                />
                                {c}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='size'
                render={({ field }: { field: ControllerRenderProps<z.infer<typeof insertProductSchema>, 'size'> }) => (
                  <FormItem>
                    <FormLabel>Base Size</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select base size' />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCT_SIZES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Section 2: Pricing & Inventory ── */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <DollarSign className='w-4 h-4 text-primary' />
              Pricing & Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='price'
                render={({ field }: { field: ControllerRenderProps<z.infer<typeof insertProductSchema>, 'price'> }) => (
                  <FormItem>
                    <FormLabel>Base Price ($)</FormLabel>
                    <FormControl>
                      <Input placeholder='0.00' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='stock'
                render={({ field }: { field: ControllerRenderProps<z.infer<typeof insertProductSchema>, 'stock'> }) => (
                  <FormItem>
                    <FormLabel>
                      Stock
                      <span className='ml-1.5 text-xs text-muted-foreground font-normal'>(leave 0 if using variants)</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='0' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Section 3: Product Images ── */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <ImagePlus className='w-4 h-4 text-primary' />
              Product Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name='images'
              render={() => (
                <FormItem>
                  <FormControl>
                    <div className='space-y-3'>
                      {/* Existing images */}
                      {images.length > 0 && (
                        <div className='flex flex-wrap gap-3'>
                          {images.map((image: string, idx: number) => (
                            <div key={image} className='relative group'>
                              <Image
                                src={image}
                                alt={`product image ${idx + 1}`}
                                className='w-20 h-20 object-cover rounded-lg border border-border'
                                width={80}
                                height={80}
                              />
                              <button
                                type='button'
                                onClick={() =>
                                  form.setValue('images', images.filter((_: string, i: number) => i !== idx))
                                }
                                className='absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
                              >
                                <X className='w-3 h-3' />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upload button */}
                      <div className='upload-field border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center gap-2 bg-muted/30 hover:bg-muted/50 transition-colors'>
                        <ImagePlus className='w-8 h-8 text-muted-foreground' />
                        <p className='text-sm text-muted-foreground'>
                          {images.length === 0 ? 'Upload product images' : 'Add more images'}
                        </p>
                        <UploadButton
                          endpoint='imageUploader'
                          onClientUploadComplete={(res: { url: string }[]) => {
                            form.setValue('images', [...images, res[0].url]);
                            toast.success('Image uploaded');
                          }}
                          onUploadError={(error: Error) => {
                            toast.error(`Upload failed: ${error.message}`);
                          }}
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ── Section 4: Featured Product ── */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Star className='w-4 h-4 text-primary' />
              Featured Product
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='isFeatured'
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-center justify-between rounded-lg border p-4 bg-muted/20'>
                    <div>
                      <p className='font-medium text-sm'>Feature this product</p>
                      <p className='text-xs text-muted-foreground mt-0.5'>
                        Featured products appear on the homepage banner
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />

            {isFeatured && (
              <div className='space-y-3'>
                <p className='text-sm font-medium'>Banner Image</p>
                {banner ? (
                  <div className='relative group rounded-lg overflow-hidden border border-border'>
                    <Image
                      src={banner}
                      alt='banner image'
                      className='w-full object-cover object-center max-h-48'
                      width={1920}
                      height={680}
                    />
                    <button
                      type='button'
                      onClick={() => form.setValue('banner', '')}
                      className='absolute top-2 right-2 w-7 h-7 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
                    >
                      <X className='w-4 h-4' />
                    </button>
                  </div>
                ) : (
                  <div className='upload-field border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center gap-2 bg-muted/30'>
                    <ImagePlus className='w-8 h-8 text-muted-foreground' />
                    <p className='text-sm text-muted-foreground'>Upload banner image (recommended: 1920×680)</p>
                    <UploadButton
                      endpoint='imageUploader'
                      onClientUploadComplete={(res: { url: string }[]) => {
                        form.setValue('banner', res[0].url);
                        toast.success('Banner uploaded');
                      }}
                      onUploadError={(error: Error) => {
                        toast.error(`Upload failed: ${error.message}`);
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Section 5: Description ── */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <FileText className='w-4 h-4 text-primary' />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name='description'
              render={({ field }: { field: ControllerRenderProps<z.infer<typeof insertProductSchema>, 'description'> }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder='Describe your product — materials, fit, features...'
                      className='resize-none min-h-28'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ── Section 6: Variants (Create only) ── */}
        {type === 'Create' && (
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Layers className='w-4 h-4 text-primary' />
                Product Variants
                <Badge variant='secondary' className='ml-1 font-normal text-xs'>Optional</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-sm text-muted-foreground'>
                Add size/color variants now, or after saving. Each variant has its own price, stock, and image.
              </p>

              {/* Pending variants list */}
              {pendingVariants.length > 0 && (
                <div className='rounded-lg border overflow-hidden'>
                  <table className='w-full text-sm'>
                    <thead className='bg-muted/50'>
                      <tr>
                        <th className='text-left px-3 py-2 font-medium text-muted-foreground'>Image</th>
                        <th className='text-left px-3 py-2 font-medium text-muted-foreground'>Color</th>
                        <th className='text-left px-3 py-2 font-medium text-muted-foreground'>Size</th>
                        <th className='text-left px-3 py-2 font-medium text-muted-foreground'>Price</th>
                        <th className='text-left px-3 py-2 font-medium text-muted-foreground'>Stock</th>
                        <th className='px-3 py-2'></th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-border'>
                      {pendingVariants.map((v, i) => (
                        <tr key={i} className='bg-background hover:bg-muted/20 transition-colors'>
                          <td className='px-3 py-2'>
                            <Image
                              src={v.image}
                              alt={`${v.color} ${v.size}`}
                              width={36}
                              height={36}
                              className='w-9 h-9 object-cover rounded-md border border-border'
                            />
                          </td>
                          <td className='px-3 py-2'>
                            <div className='flex items-center gap-1.5'>
                              <span
                                className='w-3 h-3 rounded-full border border-border shrink-0'
                                style={{ backgroundColor: colorMap[v.color] ?? '#ccc' }}
                              />
                              {v.color}
                            </div>
                          </td>
                          <td className='px-3 py-2'>
                            <Badge variant='outline' className='text-xs'>{v.size}</Badge>
                          </td>
                          <td className='px-3 py-2 font-medium'>${v.price}</td>
                          <td className='px-3 py-2'>{v.stock}</td>
                          <td className='px-3 py-2'>
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              className='h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10'
                              onClick={() => setPendingVariants((prev) => prev.filter((_, idx) => idx !== i))}
                            >
                              <Trash2 className='w-3.5 h-3.5' />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add variant form */}
              <div className='rounded-lg border bg-muted/20 p-4 space-y-4'>
                <p className='text-sm font-medium'>Add a variant</p>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-1.5'>
                    <label className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>Color</label>
                    <Select
                      value={variantForm.color}
                      onValueChange={(val) => setVariantForm((f) => ({ ...f, color: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select color' />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_COLORS.map((c) => (
                          <SelectItem key={c} value={c}>
                            <div className='flex items-center gap-2'>
                              <span
                                className='w-3 h-3 rounded-full border border-border shrink-0'
                                style={{ backgroundColor: colorMap[c] ?? '#ccc' }}
                              />
                              {c}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-1.5'>
                    <label className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>Size</label>
                    <Select
                      value={variantForm.size}
                      onValueChange={(val) => setVariantForm((f) => ({ ...f, size: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select size' />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_SIZES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-1.5'>
                    <label className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>Price ($)</label>
                    <Input
                      placeholder='e.g. 29.99'
                      value={variantForm.price}
                      onChange={(e) => setVariantForm((f) => ({ ...f, price: e.target.value }))}
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <label className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>Stock</label>
                    <Input
                      type='number'
                      min={0}
                      placeholder='e.g. 10'
                      value={variantForm.stock}
                      onChange={(e) => setVariantForm((f) => ({ ...f, stock: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Variant image */}
                <div className='space-y-1.5'>
                  <label className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>Variant Image</label>
                  <div className='upload-field flex items-center gap-3'>
                    {variantForm.image ? (
                      <div className='relative group'>
                        <Image
                          src={variantForm.image}
                          alt='variant preview'
                          width={56}
                          height={56}
                          className='w-14 h-14 object-cover rounded-lg border border-border'
                        />
                        <button
                          type='button'
                          onClick={() => setVariantForm((f) => ({ ...f, image: '' }))}
                          className='absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
                        >
                          <X className='w-3 h-3' />
                        </button>
                      </div>
                    ) : (
                      <div className='w-14 h-14 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/30'>
                        <ImagePlus className='w-5 h-5 text-muted-foreground' />
                      </div>
                    )}
                    <UploadButton
                      endpoint='imageUploader'
                      onClientUploadComplete={(res: { url: string }[]) => {
                        setVariantForm((f) => ({ ...f, image: res[0].url }));
                      }}
                      onUploadError={(error: Error) => {
                        toast.error(`Upload error: ${error.message}`);
                      }}
                    />
                  </div>
                </div>

                <Button
                  type='button'
                  variant='outline'
                  onClick={handleAddPendingVariant}
                  className='w-full gap-2'
                >
                  <Plus className='w-4 h-4' />
                  Add Variant to List
                </Button>
              </div>

              {pendingVariants.length > 0 && (
                <p className='text-xs text-muted-foreground text-center'>
                  {pendingVariants.length} variant{pendingVariants.length > 1 ? 's' : ''} will be saved with the product
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Submit ── */}
        <div className='sticky bottom-4'>
          <Button
            type='submit'
            size='lg'
            disabled={form.formState.isSubmitting}
            className='w-full shadow-lg'
          >
            {form.formState.isSubmitting
              ? (type === 'Create' ? 'Creating product...' : 'Saving changes...')
              : (type === 'Create' ? 'Create Product' : 'Save Changes')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
