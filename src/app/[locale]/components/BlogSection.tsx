"use client";

import { useState } from "react";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { 
  FaCalendarAlt,
  FaUser,
  FaTag,
  FaArrowRight,
  FaCode,
  FaLightbulb,
  FaRocket
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function BlogSection({ t }: { t: any }) {
  const bp = useBreakpoint();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const blogData = [
    {
      id: 1,
      title: t.blog1Title,
      excerpt: t.blog1Excerpt,
      content: t.blog1Content,
      author: t.author,
      date: "2024-01-15",
      category: "tutorial",
      tags: ["React", "TypeScript", "Next.js"],
      readTime: "5 min read",
      featured: true,
      image: "/images/blog1.jpg"
    },
    {
      id: 2,
      title: t.blog2Title,
      excerpt: t.blog2Excerpt,
      content: t.blog2Content,
      author: t.author,
      date: "2024-01-10",
      category: "tips",
      tags: ["Flutter", "Mobile", "Performance"],
      readTime: "7 min read",
      featured: true,
      image: "/images/blog2.jpg"
    },
    {
      id: 3,
      title: t.blog3Title,
      excerpt: t.blog3Excerpt,
      content: t.blog3Content,
      author: t.author,
      date: "2024-01-05",
      category: "project",
      tags: ["C#", "Desktop", "WPF"],
      readTime: "10 min read",
      featured: false,
      image: "/images/blog3.jpg"
    },
    {
      id: 4,
      title: t.blog4Title,
      excerpt: t.blog4Excerpt,
      content: t.blog4Content,
      author: t.author,
      date: "2024-01-01",
      category: "tutorial",
      tags: ["Database", "SQL", "Optimization"],
      readTime: "8 min read",
      featured: false,
      image: "/images/blog4.jpg"
    }
  ];

  const categories = [
    { id: "all", label: t.allPosts, icon: <FaCode /> },
    { id: "tutorial", label: t.tutorials, icon: <FaCode /> },
    { id: "tips", label: t.tips, icon: <FaLightbulb /> },
    { id: "project", label: t.projects, icon: <FaRocket /> }
  ];

  const filteredBlogs = blogData.filter(blog => {
    const matchesCategory = selectedCategory === "all" || blog.category === selectedCategory;
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         blog.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

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
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                {category.icon}
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlogs.map((post) => (
            <article
              key={post.id}
              className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-2 hover:scale-[1.02]"
            >
              {/* Featured Badge */}
              {post.featured && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge variant="default" className="bg-indigo-500 text-white">
                    {t.featured}
                  </Badge>
                </div>
              )}

              {/* Post Image */}
              <div className="relative h-48 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  {getCategoryIcon(post.category)}
                </div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              </div>

              {/* Post Content */}
              <div className="p-6">
                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <div className="flex items-center gap-1">
                    <FaCalendarAlt className="w-3 h-3" />
                    {formatDate(post.date)}
                  </div>
                  <div className="flex items-center gap-1">
                    <FaUser className="w-3 h-3" />
                    {post.author}
                  </div>
                  <span>{post.readTime}</span>
                </div>

                {/* Category */}
                <div className="flex items-center gap-2 mb-3">
                  {getCategoryIcon(post.category)}
                  <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {post.category}
                  </span>
                </div>

                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent group-hover:from-indigo-500 group-hover:to-purple-500 transition-all duration-300 mb-3 leading-tight py-1">
                  {post.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                  {post.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
                      <FaTag className="w-2 h-2" />
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Read More Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center gap-2 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20"
                >
                  {t.readMore}
                  <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </article>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="px-8">
            {t.viewMorePosts}
          </Button>
        </div>
      </div>
    </section>
  );
}
