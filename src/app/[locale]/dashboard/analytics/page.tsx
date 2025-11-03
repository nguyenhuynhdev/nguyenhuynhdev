'use client';

import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams } from 'next/navigation';
import { i18n, type Locale } from "@/i18n/i18n-config";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export default function AnalyticsPage() {
  const params = useParams();
  const locale = params.locale as string;

  // Placeholder analytics data
  const analytics = {
    totalViews: 1234,
    uniqueVisitors: 567,
    averageTime: '3:24',
    bounceRate: '42%',
    topPosts: [
      { title: 'Getting Started with Next.js', views: 234 },
      { title: 'Advanced TypeScript Tips', views: 189 },
      { title: 'Building with Cloudflare', views: 156 },
    ],
  };

  return (
    <>
      <PageHeader
        title="Analytics"
        description="View your content performance metrics"
        breadcrumbs={[
          { label: 'Dashboard', href: `/${locale}/dashboard` },
          { label: 'Analytics' },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalViews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.uniqueVisitors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Average Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageTime}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.bounceRate}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Top Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topPosts.map((post, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{post.title}</span>
                <span className="text-sm font-medium">{post.views} views</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

