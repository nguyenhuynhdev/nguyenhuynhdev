'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  usage?: {
    blogs: number;
    works: number;
    projects: number;
    total: number;
  };
}

export default function TagsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editDialog, setEditDialog] = useState<{ open: boolean; tag?: Tag }>({ open: false });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; tagId?: number }>({ open: false });
  const [newTag, setNewTag] = useState({ name: '', slug: '' });

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{
        success: boolean;
        data: Tag[];
      }>(`/tags?include_usage=true${search ? `&search=${encodeURIComponent(search)}` : ''}`);
      setTags(response.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    // Debounce search
    setTimeout(() => {
      loadTags();
    }, 300);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleCreateTag = async () => {
    if (!newTag.name) {
      toast.error('Tag name is required');
      return;
    }

    try {
      const slug = newTag.slug || generateSlug(newTag.name);
      await apiClient.post('/tags', { name: newTag.name, slug });
      toast.success('Tag created successfully');
      setNewTag({ name: '', slug: '' });
      loadTags();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create tag');
    }
  };

  const handleUpdateTag = async () => {
    if (!editDialog.tag || !editDialog.tag.name) {
      toast.error('Tag name is required');
      return;
    }

    try {
      const slug = editDialog.tag.slug || generateSlug(editDialog.tag.name);
      await apiClient.put(`/tags/${editDialog.tag.id}`, {
        name: editDialog.tag.name,
        slug,
      });
      toast.success('Tag updated successfully');
      setEditDialog({ open: false });
      loadTags();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update tag');
    }
  };

  const handleDeleteTag = async () => {
    if (!deleteDialog.tagId) return;

    try {
      await apiClient.delete(`/tags/${deleteDialog.tagId}`);
      toast.success('Tag deleted successfully');
      setDeleteDialog({ open: false });
      loadTags();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete tag');
    }
  };

  const canEdit = user?.role === 'admin' || user?.role === 'editor';

  return (
    <>
      <PageHeader
        title="Tags"
        description="Manage tags for blogs, works, and projects"
        action={
          canEdit
            ? {
                label: 'New Tag',
                onClick: () => setEditDialog({ open: true }),
                icon: <Plus className="mr-2 h-4 w-4" />,
              }
            : undefined
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Tags' },
        ]}
      />

      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tags..."
            value={search}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>

        {/* Tags Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Blogs</TableHead>
                <TableHead>Works</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Created</TableHead>
                {canEdit && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={canEdit ? 8 : 7} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : tags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canEdit ? 8 : 7} className="text-center py-8 text-muted-foreground">
                    No tags found
                  </TableCell>
                </TableRow>
              ) : (
                tags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell className="font-medium">{tag.name}</TableCell>
                    <TableCell className="text-muted-foreground">{tag.slug}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{tag.usage?.total || 0}</Badge>
                    </TableCell>
                    <TableCell>{tag.usage?.blogs || 0}</TableCell>
                    <TableCell>{tag.usage?.works || 0}</TableCell>
                    <TableCell>{tag.usage?.projects || 0}</TableCell>
                    <TableCell>
                      {new Date(tag.created_at).toLocaleDateString()}
                    </TableCell>
                    {canEdit && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditDialog({ open: true, tag })}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteDialog({ open: true, tagId: tag.id })}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={editDialog.open}
        onOpenChange={(open) => {
          setEditDialog({ open });
          if (!open) {
            setEditDialog({ open: false });
            setNewTag({ name: '', slug: '' });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editDialog.tag ? 'Edit Tag' : 'Create New Tag'}</DialogTitle>
            <DialogDescription>
              {editDialog.tag
                ? 'Update the tag name and slug.'
                : 'Create a new tag for blogs, works, and projects.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Name</Label>
              <Input
                id="tag-name"
                value={editDialog.tag ? editDialog.tag.name : newTag.name}
                onChange={(e) => {
                  if (editDialog.tag) {
                    setEditDialog({
                      open: true,
                      tag: {
                        ...editDialog.tag,
                        name: e.target.value,
                        slug: editDialog.tag.slug || generateSlug(e.target.value),
                      },
                    });
                  } else {
                    setNewTag({
                      name: e.target.value,
                      slug: newTag.slug || generateSlug(e.target.value),
                    });
                  }
                }}
                placeholder="Tag name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag-slug">Slug</Label>
              <Input
                id="tag-slug"
                value={editDialog.tag ? editDialog.tag.slug : newTag.slug}
                onChange={(e) => {
                  if (editDialog.tag) {
                    setEditDialog({
                      open: true,
                      tag: { ...editDialog.tag, slug: e.target.value },
                    });
                  } else {
                    setNewTag({ ...newTag, slug: e.target.value });
                  }
                }}
                placeholder="tag-slug"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialog({ open: false });
                setNewTag({ name: '', slug: '' });
              }}
            >
              Cancel
            </Button>
            <Button onClick={editDialog.tag ? handleUpdateTag : handleCreateTag}>
              {editDialog.tag ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tag</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this tag? This action cannot be undone.
              The tag will be removed from all associated blogs, works, and projects.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTag}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


