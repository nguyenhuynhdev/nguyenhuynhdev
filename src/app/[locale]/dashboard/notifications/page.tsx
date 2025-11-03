'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/dashboard/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: number;
  created_at: string;
}

export default function NotificationsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ success: boolean; data: Notification[] }>(
        '/notifications'
      );
      setNotifications(response.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await apiClient.put('/notifications', { ids: [id], read: true });
      loadNotifications();
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.put('/notifications', { ids: [], read: true });
      loadNotifications();
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark all as read');
    }
  };

  const unreadCount = notifications.filter((n) => n.read === 0).length;

  return (
    <>
      <PageHeader
        title="Notifications"
        description={`You have ${unreadCount} unread notifications`}
        action={
          unreadCount > 0
            ? {
                label: 'Mark All as Read',
                onClick: markAllAsRead,
              }
            : undefined
        }
        breadcrumbs={[
          { label: 'Dashboard', href: `/${locale}/dashboard` },
          { label: 'Notifications' },
        ]}
      />

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No notifications found
          </div>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={notification.read === 0 ? 'border-primary' : ''}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{notification.title}</h3>
                      {notification.read === 0 && (
                        <Badge variant="default" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  {notification.read === 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
}

