'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { ImagePlus, CheckCircle2, Loader2 } from 'lucide-react';
import { useUploadThing } from '@/lib/uploadthing';
import { upsertCategoryImage } from '@/lib/actions/category.actions';
import { Button } from '@/components/ui/button';

export default function CategoryImageForm({
  categoryName,
  currentImage,
}: {
  categoryName: string;
  currentImage?: string;
}) {
  const [image, setImage] = useState(currentImage);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing('imageUploader');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await startUpload([file]);
      const url = res?.[0]?.ufsUrl;
      if (!url) throw new Error('Upload failed');

      const result = await upsertCategoryImage(categoryName, url);
      if (result.success) {
        setImage(url);
        toast.success(`Image set for "${categoryName}"`);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className='flex items-center gap-4'>
      {/* Image preview */}
      {image ? (
        <div className='relative w-16 h-16 rounded-lg overflow-hidden border flex-shrink-0'>
          <Image src={image} alt={categoryName} fill className='object-cover' />
          <div className='absolute top-1 right-1'>
            <CheckCircle2 className='w-4 h-4 text-green-400 drop-shadow' />
          </div>
        </div>
      ) : (
        <div className='w-16 h-16 rounded-lg border border-dashed flex items-center justify-center bg-muted flex-shrink-0'>
          <ImagePlus className='w-5 h-5 text-muted-foreground' />
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={handleFileChange}
      />

      {/* Visible button */}
      <Button
        size='sm'
        variant='outline'
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <>
            <Loader2 className='w-3 h-3 mr-1.5 animate-spin' />
            Uploading…
          </>
        ) : image ? (
          'Replace Image'
        ) : (
          'Upload Image'
        )}
      </Button>
    </div>
  );
}
