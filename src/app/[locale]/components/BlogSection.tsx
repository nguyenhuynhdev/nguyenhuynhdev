"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { 
  FaCalendarAlt,
  FaUser,
  FaTag,
  FaArrowRight,
  FaArrowLeft,
  FaCode,
  FaLightbulb,
  FaRocket,
  FaEye,
  FaClock
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import ArticleView from "../blog/article-view";

interface Blog {
  id: number;
  title: string;
  slug: string;
  summary: string;
  excerpt?: string;
  content?: string;
  cover_image?: string;
  author_name: string;
  publish_date?: string;
  created_at: string;
  category_name?: string;
  category_id?: number;
  tags: Array<{ id: number; name: string; slug: string }>;
  reading_time?: number;
  featured: number;
  view_count?: number;
}

export default function BlogSection({ t, locale }: { t: any; locale?: string }) {
  const bp = useBreakpoint();
  const router = useRouter();
  
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [postSlug, setPostSlug] = useState<string | null>(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get<{ success: boolean; data: any[] }>('/categories');
        if (response.success) {
          setCategories(response.data || []);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        // For public access, API will automatically filter to published only
        let url = `/blogs?page=${page}&limit=6&sortBy=publish_date`;
        
        if (searchQuery) {
          url += `&search=${encodeURIComponent(searchQuery)}`;
        }
        
        if (selectedCategory !== "all") {
          // Find category by name or id
          const category = categories.find(cat => 
            cat.id === parseInt(selectedCategory) || 
            cat.name.toLowerCase() === selectedCategory.toLowerCase() ||
            cat.slug === selectedCategory
          );
          if (category) {
            url += `&category_id=${category.id}`;
          }
        }

        const response = await apiClient.get<{
          success: boolean;
          data: Blog[];
          pagination: { page: number; totalPages: number; total: number };
        }>(url);
        
        if (response.success) {
          setBlogs(response.data || []);
          setTotalPages(response.pagination?.totalPages || 1);
        }
      } catch (error: any) {
        console.error('Failed to load blogs:', error);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    if (categories.length > 0 || selectedCategory === "all") {
      fetchBlogs();
    }
  }, [page, searchQuery, selectedCategory, categories]);

  // Get post slug from URL query parameter (check on every render for URL changes)
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "tutorial": return <FaCode className="w-4 h-4" />;
      case "tips": return <FaLightbulb className="w-4 h-4" />;
      case "project": return <FaRocket className="w-4 h-4" />;
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

  const closeBlogDetail = () => {
    const blogLocale = locale || 'en';
    // Update URL without query parameter - use router to navigate
    setPostSlug(null);
    router.push(`/${blogLocale}/blog`);
  };

  // If postSlug is present, show full article view instead of blog list
  if (postSlug) {
    return (
      <ArticleView 
        slug={postSlug} 
        locale={locale || 'en'} 
        onClose={closeBlogDetail}
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
            {t.blogLabel}
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent mb-4 leading-tight py-2">
            {t.blogTitle}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t.blogSubtitle}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder={t.searchPosts}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3">
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
              {t.allPosts || "All Posts"}
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === String(category.id) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedCategory(String(category.id));
                  setPage(1);
                }}
                className="flex items-center gap-2"
              >
                {getCategoryIcon(category.slug || category.name.toLowerCase())}
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading blogs...</p>
          </div>
        )}

        {/* Blog Posts Grid */}
        {!loading && (
          <>
            {blogs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">{t.noPosts || "No blog posts found"}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((post) => (
                  <article
                    key={post.id}
                    className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-2 hover:scale-[1.02] cursor-pointer"
                    onClick={() => {
                      const blogLocale = locale || 'en';
                      const url = `/${blogLocale}/blog?post=${post.slug}`.replace(/\/blog\/\?/, '/blog?');
                      if (typeof window !== 'undefined') {
                        window.history.pushState({}, '', url);
                        setPostSlug(post.slug);
                      }
                      router.push(url);
                    }}
                  >
                    {/* Featured Badge */}
                    {post.featured === 1 && (
                      <div className="absolute top-4 left-4 z-10">
                        <Badge variant="default" className="bg-indigo-500 text-white">
                          {t.featured || "Featured"}
                        </Badge>
                      </div>
                    )}

                    {/* Post Image */}
                    <div className="relative h-48 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 overflow-hidden">
                      {post.cover_image ? (
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          {getCategoryIcon(post.category_name?.toLowerCase() || '')}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                    </div>

                    {/* Post Content */}
                    <div className="p-6">
                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3 flex-wrap">
                        {post.publish_date && (
                          <div className="flex items-center gap-1">
                            <FaCalendarAlt className="w-3 h-3" />
                            {formatDate(post.publish_date)}
                          </div>
                        )}
                        {post.author_name && (
                          <div className="flex items-center gap-1">
                            <FaUser className="w-3 h-3" />
                            {post.author_name}
                          </div>
                        )}
                        {post.reading_time && (
                          <span>{post.reading_time} min read</span>
                        )}
                      </div>

                      {/* Category */}
                      {post.category_name && (
                        <div className="flex items-center gap-2 mb-3">
                          {getCategoryIcon(post.category_name.toLowerCase())}
                          <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {post.category_name}
                          </span>
                        </div>
                      )}

                      <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent group-hover:from-indigo-500 group-hover:to-purple-500 transition-all duration-300 mb-3 leading-tight py-1">
                        {post.title}
                      </h3>

                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                        {post.summary || post.excerpt || ''}
                      </p>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="text-xs flex items-center gap-1">
                              <FaTag className="w-2 h-2" />
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Read More Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center gap-2 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          const blogLocale = locale || 'en';
                          const url = `/${blogLocale}/blog?post=${post.slug}`.replace(/\/blog\/\?/, '/blog?');
                          if (typeof window !== 'undefined') {
                            window.history.pushState({}, '', url);
                            setPostSlug(post.slug);
                          }
                          router.push(url);
                        }}
                      >
                        {t.readMore || "Read More"}
                        <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </article>
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
                  const blogLocale = locale || 'en';
                  router.push(`/${blogLocale}/blog`);
                }}
              >
                {t.viewMorePosts || "View More Posts"}
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
