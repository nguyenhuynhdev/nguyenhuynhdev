"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { 
  FaCode,
  FaMobile,
  FaDesktop,
  FaGlobe,
  FaCalendarAlt,
  FaUser,
  FaTag,
  FaArrowRight,
  FaEye,
  FaHeart
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import WorkArticleView from "../works/article-view";

interface Work {
  id: number;
  title: string;
  slug: string;
  summary: string;
  full_content?: string;
  cover_image_url?: string;
  author_name: string;
  published_at?: string;
  created_at: string;
  tags: Array<{ id: number; name: string; slug: string }>;
  featured: number;
  view_count?: number;
  likes_count?: number;
  gallery?: Array<{ id: number; url: string; alt_text?: string; caption?: string }>;
  timeline?: Array<any>;
}

export default function WorksSection({ t, locale }: { t: any; locale?: string }) {
  const bp = useBreakpoint();
  const router = useRouter();
  
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [postSlug, setPostSlug] = useState<string | null>(null);

  // Get post slug from URL query parameter
  useEffect(() => {
    const checkUrlParams = () => {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('post');
        setPostSlug(slug);
      }
    };
    
    checkUrlParams();
    // Listen for popstate events (back/forward button)
    window.addEventListener('popstate', checkUrlParams);
    // Also check on hashchange and focus
    window.addEventListener('hashchange', checkUrlParams);
    window.addEventListener('focus', checkUrlParams);
    return () => {
      window.removeEventListener('popstate', checkUrlParams);
      window.removeEventListener('hashchange', checkUrlParams);
      window.removeEventListener('focus', checkUrlParams);
    };
  }, []);

  // Fetch works
  useEffect(() => {
    const fetchWorks = async () => {
      try {
        setLoading(true);
        // For public access, API will only return published works
        let url = `/works?page=${page}&limit=6&sortBy=published_at`;
        
        if (selectedCategory !== "all") {
          // Filter by tag/category if needed
          url += `&tag=${selectedCategory}`;
        }

        const response = await apiClient.get<{
          success: boolean;
          data: Work[];
          pagination: { page: number; totalPages: number; total: number };
        }>(url);
        
        if (response.success) {
          setWorks(response.data || []);
          setTotalPages(response.pagination?.totalPages || 1);
        }
      } catch (error: any) {
        console.error('Failed to load works:', error);
        setWorks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorks();
  }, [page, selectedCategory]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "web": return <FaGlobe className="w-4 h-4" />;
      case "mobile": return <FaMobile className="w-4 h-4" />;
      case "desktop": return <FaDesktop className="w-4 h-4" />;
      default: return <FaCode className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const closeWorkDetail = () => {
    const workLocale = locale || 'en';
    // Update URL without query parameter - use router to navigate
    setPostSlug(null);
    router.push(`/${workLocale}/works`);
  };

  // If postSlug is present, show full article view instead of works list
  if (postSlug) {
    return (
      <WorkArticleView 
        slug={postSlug} 
        locale={locale || 'en'} 
        onClose={closeWorkDetail}
      />
    );
  }

  return (
    <section className="relative bg-transparent overflow-hidden py-16 lg:py-20 px-6 md:px-10">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
            {t.worksLabel}
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent mb-4 leading-tight py-2">
            {t.worksTitle}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t.worksSubtitle}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <Button
            key="all"
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setSelectedCategory("all");
              setPage(1);
            }}
            className="flex items-center gap-2"
          >
            <FaCode />
            {t.allWorks || "All Works"}
          </Button>
          {/* Add more category filters if needed */}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading works...</p>
          </div>
        )}

        {/* Works Grid */}
        {!loading && (
          <>
            {works.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">{t.noWorks || "No works found"}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {works.map((work) => (
                  <div
                    key={work.id}
                    className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-2 hover:scale-[1.02] cursor-pointer"
                    onClick={() => {
                      const workLocale = locale || 'en';
                      const url = `/${workLocale}/works?post=${work.slug}`.replace(/\/works\/\?/, '/works?');
                      if (typeof window !== 'undefined') {
                        window.history.pushState({}, '', url);
                        setPostSlug(work.slug);
                      }
                      router.push(url);
                    }}
                  >
                    {/* Featured Badge */}
                    {work.featured === 1 && (
                      <div className="absolute top-4 left-4 z-10">
                        <Badge variant="default" className="bg-indigo-500 text-white">
                          {t.featured || "Featured"}
                        </Badge>
                      </div>
                    )}

                    {/* Project Image */}
                    <div className="relative h-48 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 overflow-hidden">
                      {work.cover_image_url ? (
                        <img
                          src={work.cover_image_url}
                          alt={work.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FaCode className="w-12 h-12 text-indigo-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                    </div>

                    {/* Project Content */}
                    <div className="p-6">
                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3 flex-wrap">
                        {work.published_at && (
                          <span>{formatDate(work.published_at)}</span>
                        )}
                        {work.author_name && (
                          <span>{work.author_name}</span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent group-hover:from-indigo-500 group-hover:to-purple-500 transition-all duration-300 mb-3 leading-tight py-1">
                        {work.title}
                      </h3>

                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                        {work.summary || ''}
                      </p>

                      {/* Technologies/Tags */}
                      {work.tags && work.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {work.tags.slice(0, 4).map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 flex items-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            const workLocale = locale || 'en';
                            const url = `/${workLocale}/works?post=${work.slug}`.replace(/\/works\/\?/, '/works?');
                            if (typeof window !== 'undefined') {
                              window.history.pushState({}, '', url);
                              setPostSlug(work.slug);
                            }
                            router.push(url);
                          }}
                        >
                          {t.viewDetails || "View Details"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            )}

            {/* View More Button */}
            <div className="text-center mt-12">
              <Button
                variant="outline"
                size="lg"
                className="px-8"
                onClick={() => {
                  const workLocale = locale || 'en';
                  router.push(`/${workLocale}/works`);
                }}
              >
                {t.viewMoreWorks || "View More Works"}
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
