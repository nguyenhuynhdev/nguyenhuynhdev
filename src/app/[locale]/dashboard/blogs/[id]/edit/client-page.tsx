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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { Link2, Copy, Check, ExternalLink } from 'lucide-react';

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

export default function EditBlogPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const blogId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    cover_image: '',
    meta_title: '',
    meta_description: '',
    category_id: '',
    tags: [] as number[],
    status: 'draft',
    featured: false,
    publish_date: '',
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
      router.push(`/${locale}/dashboard/blogs`);
      return;
    }

    Promise.all([
      apiClient.get<{ success: boolean; data: any[] }>('/categories'),
      apiClient.get<{ success: boolean; data: any[] }>('/tags'),
      apiClient.get<{ success: boolean; data: any }>(`/blogs/${blogId}`),
    ]).then(([catsRes, tagsRes, blogRes]) => {
      setCategories(catsRes.data || []);
      setTags(tagsRes.data || []);
      const blog = blogRes.data;
      // Extract slug without ID for editing (slug format: title-slug-id)
      const slugWithoutId = blog.slug ? blog.slug.replace(/-?\d+$/, '') : '';
      setFormData({
        title: blog.title || '',
        slug: slugWithoutId,
        summary: blog.summary || blog.excerpt || '',
        content: blog.content || '',
        cover_image: blog.cover_image || '',
        meta_title: blog.meta_title || '',
        meta_description: blog.meta_description || '',
        category_id: blog.category_id ? String(blog.category_id) : '',
        tags: (blog.tags || []).map((t: any) => t.id),
        status: blog.status || 'draft',
        featured: blog.featured === 1,
        publish_date: blog.publish_date
          ? new Date(blog.publish_date).toISOString().slice(0, 16)
          : '',
      });
      setLoading(false);
    });
  }, [user, router, locale, blogId]);

  const getFullUrl = () => {
    if (!formData.slug) return '';
    // Extract slug without ID (in case it already has ID)
    const slugWithoutId = formData.slug.replace(/-?\d+$/, '');
    const fullSlug = `${slugWithoutId}-${blogId}`;
    return `/${locale}/blog/${fullSlug}`;
  };

  const copyUrl = () => {
    const fullUrl = getFullUrl();
    if (typeof window !== 'undefined') {
      const absoluteUrl = `${window.location.origin}${fullUrl}`;
      navigator.clipboard.writeText(absoluteUrl);
      setUrlCopied(true);
      toast.success('URL copied to clipboard');
      setTimeout(() => setUrlCopied(false), 2000);
    }
  };

  const openBlogUrl = () => {
    const fullUrl = getFullUrl();
    if (typeof window !== 'undefined') {
      window.open(`${window.location.origin}${fullUrl}`, '_blank');
    }
  };

  const handleSlugChange = (value: string) => {
    // Remove ID from slug if user is editing (keep only the base slug)
    const cleanSlug = value
      .toLowerCase()
      .replace(/-?\d+$/, '') // Remove trailing ID if present
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '');
    setFormData({ ...formData, slug: cleanSlug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Ensure slug doesn't have ID when updating (API will add it)
      const slugWithoutId = formData.slug.replace(/-?\d+$/, '');
      await apiClient.put(`/blogs/${blogId}`, {
        ...formData,
        slug: slugWithoutId,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        publish_date: formData.publish_date || null,
      });
      toast.success('Blog updated successfully');
      // Reload to get updated slug with ID
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update blog');
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
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Edit Blog Post"
        description="Edit your blog post with full editor"
        breadcrumbs={[
          { label: 'Dashboard', href: `/${locale}/dashboard` },
          { label: 'Blogs', href: `/${locale}/dashboard/blogs` },
          { label: 'Edit' },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Main Content Area - Takes 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title and Slug with URL Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Title and URL slug for your blog post</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter blog post title..."
                    className="text-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <div className="space-y-2">
                    <Input
                      id="slug"
                      value={formData.slug.replace(/-?\d+$/, '')}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="url-slug"
                      required
                    />
                    {formData.slug && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-md border">
                          <Link2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground flex-1 font-mono">
                            {getFullUrl()}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={copyUrl}
                            className="h-8"
                          >
                            {urlCopied ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={openBlogUrl}
                            className="h-8"
                            title="Open blog post"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Full URL: <code className="bg-muted px-1 rounded">{getFullUrl()}</code>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="summary">Summary / Excerpt</Label>
                  <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    rows={3}
                    placeholder="Brief summary of the blog post..."
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Full-View Editor */}
            <Card className="min-h-[600px]">
              <CardHeader>
                <CardTitle>Content Editor</CardTitle>
                <CardDescription>Write your blog post content with rich text editor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <div className="min-h-[500px]">
                    <RichTextEditor
                      content={formData.content}
                      onChange={(content) => setFormData({ ...formData, content })}
                      placeholder="Start writing your blog post... Use the toolbar above to format your text."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO Section */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>Optimize your blog post for search engines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    placeholder="SEO title (optional)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) =>
                      setFormData({ ...formData, meta_description: e.target.value })
                    }
                    rows={3}
                    placeholder="SEO description (optional)"
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Takes 1 column */}
          <div className="space-y-6">
            {/* Publish Settings */}
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
                {formData.status === 'scheduled' && (
                  <div className="space-y-2">
                    <Label htmlFor="publish_date">Publish Date</Label>
                    <Input
                      id="publish_date"
                      type="datetime-local"
                      value={formData.publish_date}
                      onChange={(e) =>
                        setFormData({ ...formData, publish_date: e.target.value })
                      }
                    />
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, featured: checked === true })
                    }
                  />
                  <Label htmlFor="featured" className="cursor-pointer">
                    Featured Article
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Category and Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Categories & Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-3">
                    {tags.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No tags available</p>
                    ) : (
                      tags.map((tag) => (
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
                          <Label htmlFor={`tag-${tag.id}`} className="cursor-pointer text-sm">
                            {tag.name}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cover Image */}
            <Card>
              <CardHeader>
                <CardTitle>Cover Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cover_image">Cover Image URL</Label>
                  <Input
                    id="cover_image"
                    value={formData.cover_image}
                    onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                    placeholder="https://..."
                  />
                  {formData.cover_image && (
                    <div className="mt-2 rounded-md overflow-hidden border">
                      <img
                        src={formData.cover_image}
                        alt="Cover preview"
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 sticky top-6">
              <Button type="submit" disabled={saving} size="lg" className="w-full">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
                size="lg"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

