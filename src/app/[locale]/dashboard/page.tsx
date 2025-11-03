'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { FileText, FolderKanban, Eye, Users } from 'lucide-react';

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [stats, setStats] = useState({
    blogs: 0,
    projects: 0,
    views: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push(`/${locale}/dashboard/login`);
      return;
    }

    // Fetch stats
    Promise.all([
      apiClient.get<{ pagination?: { total: number } }>('/blogs?limit=1').catch(() => ({ pagination: { total: 0 } })),
      apiClient.get<{ pagination?: { total: number } }>('/projects?limit=1').catch(() => ({ pagination: { total: 0 } })),
      user.role === 'admin'
        ? apiClient.get<{ pagination?: { total: number } }>('/users?limit=1').catch(() => ({ pagination: { total: 0 } }))
        : Promise.resolve({ pagination: { total: 0 } }),
    ]).then(([blogs, projects, users]) => {
      setStats({
        blogs: blogs.pagination?.total || 0,
        projects: projects.pagination?.total || 0,
        views: 0, // Would need a separate endpoint
        users: users.pagination?.total || 0,
      });
      setLoading(false);
    });
  }, [user, router, locale]);

  if (!user) return null;

  const statCards = [
    { title: 'Blogs', value: stats.blogs, icon: FileText, href: `/${locale}/dashboard/blogs` },
    { title: 'Projects', value: stats.projects, icon: FolderKanban, href: `/${locale}/dashboard/projects` },
    { title: 'Total Views', value: stats.views, icon: Eye, href: `/${locale}/dashboard/analytics` },
    ...(user.role === 'admin' ? [{ title: 'Users', value: stats.users, icon: Users, href: `/${locale}/dashboard/users` }] : []),
  ];

  return (
    <>
      <PageHeader
        title="Dashboard Overview"
        description={`Welcome back, ${user.name}. Here's what's happening with your content.`}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

