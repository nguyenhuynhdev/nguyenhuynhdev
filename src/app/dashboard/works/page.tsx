'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageHeader } from '@/components/dashboard/page-header';
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
import { Input } from '@/components/ui/input';
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
import { Edit, Trash2, Eye, Plus, Search } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface Work {
  id: number;
  title: string;
  slug: string;
  summary: string;
  status: string;
  view_count: number;
  likes_count: number;
  published_at?: string;
  author_name: string;
  author_id?: number;
  tags?: Array<{ id: number; name: string; slug: string }>;
  featured?: number;
}

export default function WorksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; workId?: number }>({
    open: false,
  });

  useEffect(() => {
    loadWorks();
  }, [page, statusFilter]);

  const loadWorks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);

      const response = await apiClient.get<{
        success: boolean;
        data: Work[];
        pagination: { page: number; totalPages: number; total: number };
      }>(`/works?${params.toString()}`);
      setWorks(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load works');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.workId) return;
    try {
      await apiClient.delete(`/works/${deleteDialog.workId}`);
      toast.success('Work deleted successfully');
      setDeleteDialog({ open: false });
      loadWorks();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete work');
    }
  };

  const canEdit = user?.role === 'admin' || user?.role === 'editor';

  return (
    <>
      <PageHeader
        title="Works"
        description="Manage your portfolio works and case studies"
        action={
          canEdit
            ? {
                label: 'New Work',
                onClick: () => router.push(`/${locale}/dashboard/works/new`),
                icon: <Plus className="mr-2 h-4 w-4" />,
              }
            : undefined
        }
        breadcrumbs={[
          { label: 'Dashboard', href: `/${locale}/dashboard` },
          { label: 'Works' },
        ]}
      />

      <div className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search works..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  loadWorks();
                }
              }}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <Button onClick={loadWorks} variant="outline">
            Filter
          </Button>
        </div>

        {/* Works Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Likes</TableHead>
                <TableHead>Published</TableHead>
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
              ) : works.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No works found
                  </TableCell>
                </TableRow>
              ) : (
                works.map((work) => (
                  <TableRow key={work.id}>
                    <TableCell className="font-medium">
                      {work.featured && <Badge variant="secondary" className="mr-2">Featured</Badge>}
                      <span className="truncate">{work.title}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          work.status === 'published'
                            ? 'default'
                            : work.status === 'draft'
                              ? 'secondary'
                              : work.status === 'pending'
                                ? 'outline'
                                : 'outline'
                        }
                      >
                        {work.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {work.tags && work.tags.length > 0 ? (
                          work.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag.id} variant="outline" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                        {work.tags && work.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{work.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{work.view_count || 0}</TableCell>
                    <TableCell>{work.likes_count || 0}</TableCell>
                    <TableCell>
                      {work.published_at
                        ? new Date(work.published_at).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/dashboard/works/${work.id}`)}
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canEdit && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/${locale}/dashboard/works/${work.id}/edit`)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {(user?.role === 'admin' || work.author_id === user?.id) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteDialog({ open: true, workId: work.id })}
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
          <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
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
      </div>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Work</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this work? This action cannot be undone.
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


