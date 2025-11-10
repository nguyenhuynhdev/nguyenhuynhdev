'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { PageHeader } from '@/components/dashboard/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { RichTextEditor } from '@/components/editor/rich-text-editor';

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

export default function NewWorkPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    full_content: '',
    cover_image_id: '',
    tags: [] as number[],
    status: 'draft',
    featured: false,
  });

  const [tags, setTags] = useState<any[]>([]);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
      router.push(`/${locale}/dashboard/works`);
      return;
    }

    apiClient.get<{ success: boolean; data: any[] }>('/tags').then((tagsRes) => {
      setTags(tagsRes.data || []);
    });
  }, [user, router, locale]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (value: string) => {
    setFormData({ ...formData, title: value, slug: generateSlug(value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.post<{ success: boolean; data: { id: number } }>('/works', {
        ...formData,
        cover_image_id: formData.cover_image_id ? parseInt(formData.cover_image_id) : null,
      });
      toast.success('Work created successfully');
      // Redirect to edit page with the new work ID to set up timeline
      const workId = response.data.id;
      router.push(`/${locale}/dashboard/works/${workId}/edit`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create work');
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
    return null;
  }

  return (
    <>
      <PageHeader
        title="New Work"
        breadcrumbs={[
          { label: 'Dashboard', href: `/${locale}/dashboard` },
          { label: 'Works', href: `/${locale}/dashboard/works` },
          { label: 'New' },
        ]}
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                    placeholder="Slug will be generated from title and ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    rows={3}
                    placeholder="Brief summary of the work..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full_content">Content *</Label>
                  <RichTextEditor
                    content={formData.full_content}
                    onChange={(content) => setFormData({ ...formData, full_content: content })}
                    placeholder="Start writing about your work..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publish</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, featured: checked === true })
                    }
                  />
                  <Label htmlFor="featured" className="cursor-pointer">
                    Featured Work
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cover_image_id">Cover Image ID</Label>
                  <Input
                    id="cover_image_id"
                    value={formData.cover_image_id}
                    onChange={(e) => setFormData({ ...formData, cover_image_id: e.target.value })}
                    placeholder="Media ID"
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {tags.map((tag) => (
                      <div key={tag.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag.id}`}
                          checked={formData.tags.includes(tag.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                tags: [...formData.tags, tag.id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                tags: formData.tags.filter((t) => t !== tag.id),
                              });
                            }
                          }}
                        />
                        <Label htmlFor={`tag-${tag.id}`} className="cursor-pointer">
                          {tag.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Work'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

