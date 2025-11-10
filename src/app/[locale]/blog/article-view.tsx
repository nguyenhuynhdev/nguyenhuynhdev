'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FaCalendarAlt,
  FaUser,
  FaTag,
  FaArrowLeft,
  FaEye,
  FaClock,
  FaShare,
  FaPrint,
  FaMinus,
  FaPlus,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaLink,
  FaComment,
  FaPaperPlane,
  FaBookmark,
  FaBookmark as FaBookmarkSolid
} from 'react-icons/fa';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface Blog {
  id: number;
  title: string;
  slug: string;
  summary: string;
  excerpt?: string;
  content?: string;
  cover_image?: string;
  author_name: string;
  author_avatar?: string;
  publish_date?: string;
  created_at: string;
  category_name?: string;
  category_slug?: string;
  tags: Array<{ id: number; name: string; slug: string }>;
  reading_time?: number;
  view_count?: number;
  featured: number;
}

interface Comment {
  id: number;
  content: string;
  author_name: string;
  author_avatar?: string;
  created_at: string;
  parent_id?: number;
  replies?: Comment[];
}

interface ArticleViewProps {
  slug: string;
  locale: string;
  onClose: () => void;
}

export default function ArticleView({ slug, locale, onClose }: ArticleViewProps) {
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(16);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [recentArticles, setRecentArticles] = useState<Blog[]>([]);
  const [mostArticles, setMostArticles] = useState<Blog[]>([]);
  const [randomArticles, setRandomArticles] = useState<Blog[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);

  // Load bookmark state from localStorage
  useEffect(() => {
    if (blog) {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      setIsBookmarked(bookmarks.includes(blog.id));
    }
  }, [blog]);

  // Fetch blog detail
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<{
          success: boolean;
          data: Blog;
        }>(`/blogs/slug/${slug}`);
        
        if (response.success && response.data) {
          setBlog(response.data);
        } else {
          setError('Blog not found');
        }
      } catch (err: any) {
        console.error('Failed to load blog:', err);
        setError(err.message || 'Failed to load blog');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  // Fetch related articles
  useEffect(() => {
    const fetchRelatedArticles = async () => {
      try {
        // Recent articles
        const recentRes = await apiClient.get<{
          success: boolean;
          data: Blog[];
        }>(`/blogs?page=1&limit=5&sortBy=publish_date`);
        if (recentRes.success) {
          setRecentArticles(recentRes.data.filter(b => b.slug !== slug).slice(0, 5));
        }

        // Most viewed articles
        const mostRes = await apiClient.get<{
          success: boolean;
          data: Blog[];
        }>(`/blogs?page=1&limit=5&sortBy=view_count`);
        if (mostRes.success) {
          setMostArticles(mostRes.data.filter(b => b.slug !== slug).slice(0, 5));
        }

        // Random articles (we'll shuffle the recent ones)
        if (recentRes.success) {
          const shuffled = [...recentRes.data.filter(b => b.slug !== slug)].sort(() => 0.5 - Math.random());
          setRandomArticles(shuffled.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load related articles:', err);
      }
    };

    fetchRelatedArticles();
  }, [slug]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!blog) return;
      
      try {
        setLoadingComments(true);
        // TODO: Replace with actual comments API endpoint
        // const response = await apiClient.get<{ success: boolean; data: Comment[] }>(`/blogs/${blog.id}/comments`);
        // if (response.success) {
        //   setComments(response.data || []);
        // }
        // For now, use empty array
        setComments([]);
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [blog]);

  // Scroll progress tracking
  useEffect(() => {
    if (!blog) return;
    
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
      
      setScrollProgress(Math.min(100, Math.max(0, scrollPercent)));
    };

    handleScroll(); // Initial calculation
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [blog]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = (platform: string) => {
    if (!blog) return;
    
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = blog.title;
    const text = blog.summary;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        setShareSheetOpen(false);
        break;
      case 'twitter':
      case 'x':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        setShareSheetOpen(false);
        break;
      case 'zalo':
        window.open(`https://zalo.me/share?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank');
        setShareSheetOpen(false);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        setShareSheetOpen(false);
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
        setShareSheetOpen(false);
        break;
    }
  };

  const handleBookmark = () => {
    if (!blog) return;
    
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const newIsBookmarked = !isBookmarked;
    
    if (newIsBookmarked) {
      // Add to bookmarks
      if (!bookmarks.includes(blog.id)) {
        bookmarks.push(blog.id);
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        toast.success('Added to bookmarks');
      }
    } else {
      // Remove from bookmarks
      const filteredBookmarks = bookmarks.filter((id: number) => id !== blog.id);
      localStorage.setItem('bookmarks', JSON.stringify(filteredBookmarks));
      toast.success('Removed from bookmarks');
    }
    
    setIsBookmarked(newIsBookmarked);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow popups to print');
        return;
      }
      
      if (!blog) return;
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${blog.title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
              h1 { color: #333; }
              img { max-width: 100%; height: auto; }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <h1>${blog.title}</h1>
            ${blog.cover_image ? `<img src="${blog.cover_image}" alt="${blog.title}" />` : ''}
            ${blog.summary ? `<p><em>${blog.summary}</em></p>` : ''}
            ${blog.content || ''}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print();
        printWindow.onafterprint = () => printWindow.close();
      }, 250);
    }
  };

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(24, prev + 2));
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(12, prev - 2));
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!blog || !commentContent.trim() || !commentAuthor.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmittingComment(true);
      // TODO: Replace with actual comments API endpoint
      // await apiClient.post(`/blogs/${blog.id}/comments`, {
      //   content: commentContent,
      //   author_name: commentAuthor,
      //   author_email: commentEmail,
      // });
      
      // For now, just show success message
      toast.success('Comment submitted successfully');
      setCommentContent('');
      setCommentAuthor('');
      setCommentEmail('');
      
      // Refresh comments
      // const response = await apiClient.get<{ success: boolean; data: Comment[] }>(`/blogs/${blog.id}/comments`);
      // if (response.success) {
      //   setComments(response.data || []);
      // }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 mt-20">
        <h1 className="text-2xl font-bold mb-4">Blog Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'The blog you are looking for does not exist.'}</p>
        <Button onClick={onClose}>
          <FaArrowLeft className="mr-2" />
          Back to Blog
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent mt-20">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-secondary/20">
        <Progress value={scrollProgress} className="h-1 rounded-none" />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-8">
            {/* Back Button - Not sticky, at top of article */}
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={onClose}
              >
                <FaArrowLeft className="mr-2" />
                Back to Blog
              </Button>
            </div>
            {/* Cover Image */}
            {blog.cover_image && (
              <div className="mb-8 rounded-lg overflow-hidden">
                <img
                  src={blog.cover_image}
                  alt={blog.title}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}

            {/* Title */}
            <h1 
              className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent"
              style={{ fontSize: `${fontSize + 8}px` }}
            >
              {blog.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
              {blog.publish_date && (
                <div className="flex items-center gap-1">
                  <FaCalendarAlt className="w-4 h-4" />
                  {formatDate(blog.publish_date)}
                </div>
              )}
              {blog.author_name && (
                <div className="flex items-center gap-2">
                  <FaUser className="w-4 h-4" />
                  {blog.author_name}
                </div>
              )}
              {blog.reading_time && (
                <div className="flex items-center gap-1">
                  <FaClock className="w-4 h-4" />
                  {blog.reading_time} min read
                </div>
              )}
              {blog.view_count !== undefined && (
                <div className="flex items-center gap-1">
                  <FaEye className="w-4 h-4" />
                  {blog.view_count} views
                </div>
              )}
            </div>

            {/* Featured Badge and Category */}
            <div className="flex flex-wrap gap-2 mb-6">
              {blog.featured === 1 && (
                <Badge variant="default" className="bg-indigo-500 text-white">
                  Featured
                </Badge>
              )}
              {blog.category_name && (
                <Badge variant="secondary">{blog.category_name}</Badge>
              )}
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {blog.tags.map((tag) => (
                  <Badge 
                    key={tag.id} 
                    variant="outline" 
                    className="flex items-center gap-1 cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => {
                      router.push(`/${locale}/blog?tag=${tag.slug}`);
                    }}
                  >
                    <FaTag className="w-3 h-3" />
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Summary */}
            {blog.summary && (
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed italic border-l-4 border-indigo-500 pl-4">
                {blog.summary}
              </p>
            )}

            {/* Content */}
            <div 
              id="article-content"
              className="prose prose-lg dark:prose-invert max-w-none mb-8"
              style={{ fontSize: `${fontSize}px` }}
            >
              {blog.content && (
                <div dangerouslySetInnerHTML={{ __html: String(blog.content) }} />
              )}
            </div>

            {/* Share Buttons */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Share this article</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleShare('facebook')}
                    className="flex items-center gap-2"
                  >
                    <FaFacebook className="h-4 w-4 text-blue-600" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleShare('x')}
                    className="flex items-center gap-2"
                  >
                    <FaTwitter className="h-4 w-4" />
                    X (Twitter)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleShare('zalo')}
                    className="flex items-center gap-2"
                  >
                    <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">Z</span>
                    </div>
                    Zalo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleShare('copy')}
                    className="flex items-center gap-2"
                  >
                    <FaLink className="h-4 w-4" />
                    Copy Link
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaComment className="h-5 w-5" />
                  Comments ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Comment Form */}
                <form onSubmit={handleSubmitComment} className="space-y-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="comment-author">Name *</Label>
                    <Input
                      id="comment-author"
                      value={commentAuthor}
                      onChange={(e) => setCommentAuthor(e.target.value)}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comment-email">Email</Label>
                    <Input
                      id="comment-email"
                      type="email"
                      value={commentEmail}
                      onChange={(e) => setCommentEmail(e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comment-content">Comment *</Label>
                    <Textarea
                      id="comment-content"
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Write your comment here..."
                      rows={4}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={submittingComment}>
                    <FaPaperPlane className="mr-2 h-4 w-4" />
                    {submittingComment ? 'Submitting...' : 'Post Comment'}
                  </Button>
                </form>

                {/* Comments List */}
                {loadingComments ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                    No comments yet. Be the first to comment!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <FaUser className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{comment.author_name}</span>
                              <span className="text-xs text-gray-500">
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </article>

          {/* Controls Bar - Vertical, sticky, between article and sidebar */}
          <div className="hidden lg:flex lg:col-span-1 justify-center">
            <div className="sticky top-28 h-fit flex flex-col items-center gap-3 bg-background/90 backdrop-blur-md border rounded-lg p-3 shadow-sm">
              {/* Font Size Controls */}
              <div className="flex flex-col items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={increaseFontSize}
                  disabled={fontSize >= 24}
                  className="h-9 w-9"
                  title="Increase font size"
                >
                  <FaPlus className="h-4 w-4" />
                </Button>
                <div className="text-xs text-center px-2 py-1 text-muted-foreground font-medium">
                  {fontSize}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={decreaseFontSize}
                  disabled={fontSize <= 12}
                  className="h-9 w-9"
                  title="Decrease font size"
                >
                  <FaMinus className="h-4 w-4" />
                </Button>
              </div>

              <div className="w-8 border-t border-border"></div>

              {/* Bookmark Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleBookmark}
                className="h-9 w-9"
                title="Bookmark"
              >
                {isBookmarked ? (
                  <FaBookmarkSolid className="h-4 w-4 fill-current" />
                ) : (
                  <FaBookmark className="h-4 w-4" />
                )}
              </Button>

              {/* Share Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShareSheetOpen(true)}
                className="h-9 w-9"
                title="Share"
              >
                <FaShare className="h-4 w-4" />
              </Button>

              {/* Print Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrint}
                className="h-9 w-9"
                title="Print"
              >
                <FaPrint className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-6 sticky top-28 h-fit">
            {/* Recent Articles */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Articles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentArticles.length === 0 ? (
                  <p className="text-sm text-gray-500">No recent articles</p>
                ) : (
                  recentArticles.map((article) => (
                    <div
                      key={article.id}
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          const url = `/${locale}/blog?post=${article.slug}`.replace(/\/blog\/\?/, '/blog?');
                          window.location.href = url;
                        }
                      }}
                    >
                      <h3 className="text-sm font-semibold line-clamp-2 mb-1">
                        {article.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {article.publish_date && formatDate(article.publish_date)}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Most Viewed Articles */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Most Viewed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mostArticles.length === 0 ? (
                  <p className="text-sm text-gray-500">No articles</p>
                ) : (
                  mostArticles.map((article) => (
                    <div
                      key={article.id}
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          const url = `/${locale}/blog?post=${article.slug}`.replace(/\/blog\/\?/, '/blog?');
                          window.location.href = url;
                        }
                      }}
                    >
                      <h3 className="text-sm font-semibold line-clamp-2 mb-1">
                        {article.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {article.view_count || 0} views
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Random Articles */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">You May Like</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {randomArticles.length === 0 ? (
                  <p className="text-sm text-gray-500">No articles</p>
                ) : (
                  randomArticles.map((article) => (
                    <div
                      key={article.id}
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          const url = `/${locale}/blog?post=${article.slug}`.replace(/\/blog\/\?/, '/blog?');
                          window.location.href = url;
                        }
                      }}
                    >
                      <h3 className="text-sm font-semibold line-clamp-2 mb-1">
                        {article.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {article.reading_time || 5} min read
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Tags Navigation */}
            {blog.tags && blog.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => {
                          const url = `/${locale}/blog?tag=${tag.slug}`.replace(/\/blog\/\?/, '/blog?');
                          window.location.href = url;
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </div>

      {/* Share Bottom Sheet */}
      <Sheet open={shareSheetOpen} onOpenChange={setShareSheetOpen}>
        <SheetContent 
          side="bottom" 
          className="h-auto p-0 border-t rounded-t-2xl"
        >
          <div className="mx-auto max-w-md px-4 md:px-5 py-4 md:py-4">
            <SheetHeader className="pb-2 text-center">
              <SheetTitle className="text-base">Share this article</SheetTitle>
            </SheetHeader>
            <div className="flex flex-wrap justify-center gap-2.5 mt-3">
              {/* Copy Link */}
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center gap-1 h-12 w-16 px-2 hover:bg-accent transition-colors"
                onClick={() => handleShare('copy')}
              >
                <FaLink className="h-4 w-4" />
                <span className="text-xs">Copy</span>
              </Button>

              {/* Facebook */}
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center gap-1 h-12 w-16 px-2 hover:bg-accent transition-colors"
                onClick={() => handleShare('facebook')}
              >
                <FaFacebook className="h-4 w-4 text-blue-600" />
                <span className="text-xs">Facebook</span>
              </Button>

              {/* Zalo */}
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center gap-1 h-12 w-16 px-2 hover:bg-accent transition-colors"
                onClick={() => handleShare('zalo')}
              >
                <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">Z</span>
                </div>
                <span className="text-xs">Zalo</span>
              </Button>

              {/* X (Twitter) */}
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center gap-1 h-12 w-16 px-2 hover:bg-accent transition-colors"
                onClick={() => handleShare('x')}
              >
                <FaTwitter className="h-4 w-4" />
                <span className="text-xs">X</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

