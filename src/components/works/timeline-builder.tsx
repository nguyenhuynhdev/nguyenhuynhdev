'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GripVertical, Plus, Trash2, Edit, X } from 'lucide-react';

export interface TimelineItem {
  id?: number;
  date_range_start?: string;
  date_range_end?: string;
  title: string;
  description?: string;
  tasks: string[];
  tech: string[];
  media: Array<{ id: number; url: string; alt_text?: string }>;
  display_order: number;
}

interface TimelineBuilderProps {
  items: TimelineItem[];
  onChange: (items: TimelineItem[]) => void;
}

export function TimelineBuilder({ items, onChange }: TimelineBuilderProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<TimelineItem>>({
    title: '',
    description: '',
    date_range_start: '',
    date_range_end: '',
    tasks: [],
    tech: [],
    media: [],
  });

  const openEditDialog = (index: number | null) => {
    if (index !== null && items[index]) {
      setFormData(items[index]);
    } else {
      setFormData({
        title: '',
        description: '',
        date_range_start: '',
        date_range_end: '',
        tasks: [],
        tech: [],
        media: [],
      });
    }
    setEditingIndex(index);
    setEditDialogOpen(true);
  };

  const saveTimelineItem = () => {
    if (!formData.title) {
      return;
    }

    const newItems = [...items];
    const newItem: TimelineItem = {
      ...formData,
      title: formData.title!,
      description: formData.description || '',
      date_range_start: formData.date_range_start || '',
      date_range_end: formData.date_range_end || '',
      tasks: formData.tasks || [],
      tech: formData.tech || [],
      media: formData.media || [],
      display_order: editingIndex !== null ? items[editingIndex!].display_order : items.length,
    };

    if (editingIndex !== null) {
      newItems[editingIndex] = newItem;
    } else {
      newItems.push(newItem);
    }

    onChange(newItems);
    setEditDialogOpen(false);
    setEditingIndex(null);
  };

  const deleteItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    // Reorder
    newItems.forEach((item, i) => {
      item.display_order = i;
    });
    onChange(newItems);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === items.length - 1)
    ) {
      return;
    }

    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    newItems.forEach((item, i) => {
      item.display_order = i;
    });
    onChange(newItems);
  };

  const addTask = () => {
    setFormData({
      ...formData,
      tasks: [...(formData.tasks || []), ''],
    });
  };

  const updateTask = (index: number, value: string) => {
    const tasks = [...(formData.tasks || [])];
    tasks[index] = value;
    setFormData({ ...formData, tasks });
  };

  const removeTask = (index: number) => {
    const tasks = formData.tasks?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, tasks });
  };

  const addTech = () => {
    setFormData({
      ...formData,
      tech: [...(formData.tech || []), ''],
    });
  };

  const updateTech = (index: number, value: string) => {
    const tech = [...(formData.tech || [])];
    tech[index] = value;
    setFormData({ ...formData, tech });
  };

  const removeTech = (index: number) => {
    const tech = formData.tech?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, tech });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Timeline</Label>
        <Button type="button" variant="outline" size="sm" onClick={() => openEditDialog(null)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Timeline Item
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-md">
          No timeline items yet. Click "Add Timeline Item" to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    {(item.date_range_start || item.date_range_end) && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.date_range_start && new Date(item.date_range_start).toLocaleDateString()}
                        {item.date_range_start && item.date_range_end && ' - '}
                        {item.date_range_end && new Date(item.date_range_end).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                    >
                      <GripVertical className="h-4 w-4 rotate-90" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === items.length - 1}
                    >
                      <GripVertical className="h-4 w-4 -rotate-90" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(index)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {item.description && (
                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                )}
                {item.tasks.length > 0 && (
                  <div className="mb-3">
                    <Label className="text-xs text-muted-foreground">Tasks</Label>
                    <ul className="list-disc list-inside text-sm mt-1">
                      {item.tasks.map((task, i) => (
                        <li key={i}>{task}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {item.tech.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tech.map((t, i) => (
                      <Badge key={i} variant="secondary">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? 'Edit Timeline Item' : 'Add Timeline Item'}
            </DialogTitle>
            <DialogDescription>
              Add details about a milestone or phase in your work timeline.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timeline-title">Title *</Label>
              <Input
                id="timeline-title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Planning Phase"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeline-start">Start Date</Label>
                <Input
                  id="timeline-start"
                  type="date"
                  value={formData.date_range_start || ''}
                  onChange={(e) => setFormData({ ...formData, date_range_start: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeline-end">End Date</Label>
                <Input
                  id="timeline-end"
                  type="date"
                  value={formData.date_range_end || ''}
                  onChange={(e) => setFormData({ ...formData, date_range_end: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeline-description">Description</Label>
              <Textarea
                id="timeline-description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Describe this phase..."
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Tasks</Label>
                <Button type="button" variant="outline" size="sm" onClick={addTask}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
              {formData.tasks && formData.tasks.length > 0 ? (
                <div className="space-y-2">
                  {formData.tasks.map((task, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={task}
                        onChange={(e) => updateTask(index, e.target.value)}
                        placeholder="Enter a task..."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTask(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No tasks added yet.</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Technologies</Label>
                <Button type="button" variant="outline" size="sm" onClick={addTech}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tech
                </Button>
              </div>
              {formData.tech && formData.tech.length > 0 ? (
                <div className="space-y-2">
                  {formData.tech.map((tech, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={tech}
                        onChange={(e) => updateTech(index, e.target.value)}
                        placeholder="e.g., React, TypeScript"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTech(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No technologies added yet.</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveTimelineItem} disabled={!formData.title}>
              {editingIndex !== null ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

