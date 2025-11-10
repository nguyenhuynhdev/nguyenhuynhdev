'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { FileText, FolderKanban, Eye, Users, Tags, Bell, BarChart3 } from 'lucide-react';

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    blogs: 0,
    works: 0,
    projects: 0,
    views: 0,
    users: 0,
    tags: 0,
    pendingRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/dashboard/login');
      return;
    }

    // Fetch stats
    Promise.all([
      apiClient.get<{ pagination?: { total: number } }>('/blogs?limit=1').catch(() => ({ pagination: { total: 0 } })),
      apiClient.get<{ pagination?: { total: number } }>('/works?limit=1').catch(() => ({ pagination: { total: 0 } })),
      apiClient.get<{ pagination?: { total: number } }>('/projects?limit=1').catch(() => ({ pagination: { total: 0 } })),
      apiClient.get<{ data?: any[] }>('/tags').catch(() => ({ data: [] })),
      user.role === 'admin'
        ? apiClient.get<{ pagination?: { total: number } }>('/users?limit=1').catch(() => ({ pagination: { total: 0 } }))
        : Promise.resolve({ pagination: { total: 0 } }),
      (user.role === 'admin' || user.role === 'editor')
        ? apiClient.get<{ pagination?: { total: number } }>('/publish-requests?status=pending&limit=1').catch(() => ({ pagination: { total: 0 } }))
        : Promise.resolve({ pagination: { total: 0 } }),
    ]).then(([blogs, works, projects, tags, users, requests]) => {
      setStats({
        blogs: blogs.pagination?.total || 0,
        works: works.pagination?.total || 0,
        projects: projects.pagination?.total || 0,
        views: 0, // Would need a separate analytics endpoint
        users: users.pagination?.total || 0,
        tags: Array.isArray(tags.data) ? tags.data.length : 0,
        pendingRequests: requests.pagination?.total || 0,
      });
      setLoading(false);
    });
  }, [user, router]);

  if (!user) return null;

  const statCards = [
    { title: 'Blogs', value: stats.blogs, icon: FileText, href: '/dashboard/blogs' },
    { title: 'Works', value: stats.works, icon: FolderKanban, href: '/dashboard/works' },
    { title: 'Projects', value: stats.projects, icon: FolderKanban, href: '/dashboard/projects' },
    { title: 'Tags', value: stats.tags, icon: Tags, href: '/dashboard/tags' },
    { title: 'Total Views', value: stats.views, icon: Eye, href: '/dashboard/analytics' },
    ...(user.role === 'admin' || user.role === 'editor'
      ? [
          {
            title: 'Pending Requests',
            value: stats.pendingRequests,
            icon: Bell,
            href: '/dashboard/requests',
          },
        ]
      : []),
    ...(user.role === 'admin' ? [{ title: 'Users', value: stats.users, icon: Users, href: '/dashboard/users' }] : []),
  ];

  return (
    <>
      <PageHeader
        title="Dashboard Overview"
        description={`Welcome back, ${user.name}. Here's what's happening with your content.`}
      />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(card.href)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                ) : (
                  <div className="text-2xl font-bold">{card.value}</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}

