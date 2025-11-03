'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageHeader } from '@/components/dashboard/page-header';
import { i18n, type Locale } from "@/i18n/i18n-config";
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Edit, Trash2, Eye, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

interface Blog {
  id: number;
  title: string;
  slug: string;
  status: string;
  view_count: number;
  reading_time: number;
  publish_date?: string;
  author_name: string;
  author_id?: number;
  category_name?: string;
  featured: number;
}

export default function BlogsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; blogId?: number }>({
    open: false,
  });

  useEffect(() => {
    loadBlogs();
  }, [page]);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{
        success: boolean;
        data: Blog[];
        pagination: { page: number; totalPages: number };
      }>(`/blogs?page=${page}&limit=20`);
      setBlogs(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.blogId) return;
    try {
      await apiClient.delete(`/blogs/${deleteDialog.blogId}`);
      toast.success('Blog deleted successfully');
      setDeleteDialog({ open: false });
      loadBlogs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete blog');
    }
  };

  const canEdit = user?.role === 'admin' || user?.role === 'editor';

  return (
    <>
      <PageHeader
        title="Blogs"
        description="Manage your blog posts"
        action={
          canEdit
            ? {
                label: 'New Blog Post',
                onClick: () => router.push(`/${locale}/dashboard/blogs/new`),
                icon: <Plus className="mr-2 h-4 w-4" />,
              }
            : undefined
        }
        breadcrumbs={[
          { label: 'Dashboard', href: `/${locale}/dashboard` },
          { label: 'Blogs' },
        ]}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Reading Time</TableHead>
              <TableHead>Publish Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No blogs found
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell className="font-medium">
                    {blog.featured && <Badge variant="secondary" className="mr-2">Featured</Badge>}
                    {blog.title}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        blog.status === 'published'
                          ? 'default'
                          : blog.status === 'draft'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {blog.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{blog.category_name || '-'}</TableCell>
                  <TableCell>{blog.view_count || 0}</TableCell>
                  <TableCell>{blog.reading_time} min</TableCell>
                  <TableCell>
                    {blog.publish_date
                      ? new Date(blog.publish_date).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/${locale}/dashboard/blogs/${blog.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canEdit && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/${locale}/dashboard/blogs/${blog.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {(user?.role === 'admin' || blog.author_id === user?.id) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setDeleteDialog({ open: true, blogId: blog.id })
                              }
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this blog post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

