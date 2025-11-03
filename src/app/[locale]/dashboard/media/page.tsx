'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/dashboard/page-header';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface Media {
  id: number;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  url: string;
  created_at: string;
}

export default function MediaPage() {
  const { user } = useAuth();
  const params = useParams();
  const locale = params.locale as string;
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ success: boolean; data: Media[] }>('/media');
      setMedia(response.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this media?')) return;
    try {
      await apiClient.delete(`/media/${id}`);
      toast.success('Media deleted successfully');
      loadMedia();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete media');
    }
  };

  const canEdit = user?.role === 'admin' || user?.role === 'editor';

  return (
    <>
      <PageHeader
        title="Media Library"
        description="Manage your uploaded media files"
        breadcrumbs={[
          { label: 'Dashboard', href: `/${locale}/dashboard` },
          { label: 'Media' },
        ]}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8">Loading...</div>
        ) : media.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No media found
          </div>
        ) : (
          media.map((item) => (
            <div key={item.id} className="relative group border rounded-lg overflow-hidden">
              {item.file_type.startsWith('image/') ? (
                <img src={item.url} alt={item.original_filename} className="w-full aspect-square object-cover" />
              ) : (
                <div className="w-full aspect-square bg-muted flex items-center justify-center">
                  <span className="text-sm">{item.file_type}</span>
                </div>
              )}
              {canEdit && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="p-2 text-xs truncate">{item.original_filename}</div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

