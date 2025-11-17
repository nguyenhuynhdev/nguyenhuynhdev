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
import { TimelineBuilder, TimelineItem } from '@/components/works/timeline-builder';

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

export default function EditWorkPageClient() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const workId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    full_content: '',
    cover_image_id: '',
    tags: [] as number[],
    status: 'draft',
    featured: false,
    privacy_policy: '',
  });

  const [tags, setTags] = useState<any[]>([]);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
      router.push(`/${locale}/dashboard/works`);
      return;
    }

    Promise.all([
      apiClient.get<{ success: boolean; data: any[] }>('/tags'),
      apiClient.get<{ success: boolean; data: any }>(`/works/${workId}`),
      apiClient.get<{ success: boolean; data: TimelineItem[] }>(`/works/${workId}/timeline`),
    ]).then(([tagsRes, workRes, timelineRes]) => {
      setTags(tagsRes.data || []);
      const work = workRes.data;
      setFormData({
        title: work.title || '',
        slug: work.slug || '',
        summary: work.summary || '',
        full_content: work.full_content || '',
        cover_image_id: work.cover_image_id ? String(work.cover_image_id) : '',
        tags: (work.tags || []).map((t: any) => t.id),
        status: work.status || 'draft',
        featured: work.featured === 1,
        privacy_policy: work.privacy_policy || '',
      });
      setTimelineItems(timelineRes.data || []);
      setLoading(false);
    }).catch((error) => {
      toast.error(error.message || 'Failed to load work');
      setLoading(false);
    });
  }, [user, router, locale, workId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Save work data
      await apiClient.put(`/works/${workId}`, {
        ...formData,
        cover_image_id: formData.cover_image_id ? parseInt(formData.cover_image_id) : null,
        privacy_policy: formData.privacy_policy?.trim() || null,
      });

      // Save timeline items
      // First, get existing timeline items
      const existingTimeline = await apiClient.get<{ success: boolean; data: TimelineItem[] }>(
        `/works/${workId}/timeline`
      );
      const existingIds = new Set((existingTimeline.data || []).map((item) => item.id).filter(Boolean));

      // Delete timeline items that were removed
      for (const existingItem of existingTimeline.data || []) {
        if (existingItem.id && !timelineItems.find((item) => item.id === existingItem.id)) {
          await apiClient.delete(`/works/${workId}/timeline/${existingItem.id}`);
        }
      }

      // Update or create timeline items
      for (let i = 0; i < timelineItems.length; i++) {
        const item = timelineItems[i];
        const itemData = {
          date_range_start: item.date_range_start || null,
          date_range_end: item.date_range_end || null,
          title: item.title,
          description: item.description || null,
          tasks: item.tasks || [],
          tech: item.tech || [],
          media: item.media?.map((m) => m.id) || [],
          display_order: i,
        };

        if (item.id && existingIds.has(item.id)) {
          // Update existing item
          await apiClient.put(`/works/${workId}/timeline/${item.id}`, itemData);
        } else {
          // Create new item
          await apiClient.post(`/works/${workId}/timeline`, itemData);
        }
      }

      toast.success('Work updated successfully');
      router.push(`/${locale}/dashboard/works`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update work');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
    return null;
  }

  return (
    <>
      <PageHeader
        title="Edit Work"
        breadcrumbs={[
          { label: 'Dashboard', href: `/${locale}/dashboard` },
          { label: 'Works', href: `/${locale}/dashboard/works` },
          { label: 'Edit' },
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
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                <div className="space-y-2">
                  <Label htmlFor="privacy_policy">Privacy Policy</Label>
                  <RichTextEditor
                    content={formData.privacy_policy}
                    onChange={(content) => setFormData({ ...formData, privacy_policy: content })}
                    placeholder="Enter privacy policy content for this work (optional)..."
                  />
                  <p className="text-sm text-muted-foreground">
                    This privacy policy will be displayed in a dialog when users click the Privacy Policy button.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <TimelineBuilder items={timelineItems} onChange={setTimelineItems} />
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
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
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

