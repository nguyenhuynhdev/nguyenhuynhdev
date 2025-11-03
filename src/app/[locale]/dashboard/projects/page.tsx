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
import { Edit, Trash2, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface Project {
  id: number;
  title: string;
  slug: string;
  status: string;
  featured: number;
  created_at: string;
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; projectId?: number }>({
    open: false,
  });

  useEffect(() => {
    loadProjects();
  }, [page]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{
        success: boolean;
        data: Project[];
        pagination: { page: number; totalPages: number };
      }>(`/projects?page=${page}&limit=20`);
      setProjects(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.projectId) return;
    try {
      await apiClient.delete(`/projects/${deleteDialog.projectId}`);
      toast.success('Project deleted successfully');
      setDeleteDialog({ open: false });
      loadProjects();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete project');
    }
  };

  const canEdit = user?.role === 'admin' || user?.role === 'editor';

  return (
    <>
      <PageHeader
        title="Projects"
        description="Manage your projects and works"
        action={
          canEdit
            ? {
                label: 'New Project',
                onClick: () => router.push(`/${locale}/dashboard/projects/new`),
                icon: <Plus className="mr-2 h-4 w-4" />,
              }
            : undefined
        }
        breadcrumbs={[
          { label: 'Dashboard', href: `/${locale}/dashboard` },
          { label: 'Projects' },
        ]}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No projects found
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    {project.featured && <Badge variant="secondary" className="mr-2">Featured</Badge>}
                    {project.title}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        project.status === 'published'
                          ? 'default'
                          : project.status === 'draft'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(project.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {canEdit && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/${locale}/dashboard/projects/${project.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setDeleteDialog({ open: true, projectId: project.id })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
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

