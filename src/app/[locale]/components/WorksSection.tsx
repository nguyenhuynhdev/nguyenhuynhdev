"use client";

import { useState } from "react";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { 
  FaGithub, 
  FaExternalLinkAlt,
  FaCode,
  FaMobile,
  FaDesktop,
  FaGlobe
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function WorksSection({ t }: { t: any }) {
  const bp = useBreakpoint();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const worksData = [
    {
      id: 1,
      title: t.work1Title,
      description: t.work1Description,
      image: "/images/work1.jpg",
      category: "web",
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Firebase"],
      githubUrl: "https://github.com/nguyenhuynhdev/project1",
      liveUrl: "https://project1.vercel.app",
      featured: true
    },
    {
      id: 2,
      title: t.work2Title,
      description: t.work2Description,
      image: "/images/work2.jpg",
      category: "mobile",
      technologies: ["Flutter", "Dart", "Firebase", "REST API"],
      githubUrl: "https://github.com/nguyenhuynhdev/project2",
      liveUrl: "https://play.google.com/store/apps/details?id=com.project2",
      featured: true
    },
    {
      id: 3,
      title: t.work3Title,
      description: t.work3Description,
      image: "/images/work3.jpg",
      category: "desktop",
      technologies: ["C#", ".NET", "WPF", "SQL Server"],
      githubUrl: "https://github.com/nguyenhuynhdev/project3",
      liveUrl: null,
      featured: false
    },
    {
      id: 4,
      title: t.work4Title,
      description: t.work4Description,
      image: "/images/work4.jpg",
      category: "web",
      technologies: ["React", "Node.js", "MongoDB", "Express"],
      githubUrl: "https://github.com/nguyenhuynhdev/project4",
      liveUrl: "https://project4.netlify.app",
      featured: false
    }
  ];

  const categories = [
    { id: "all", label: t.allWorks, icon: <FaCode /> },
    { id: "web", label: t.webWorks, icon: <FaGlobe /> },
    { id: "mobile", label: t.mobileWorks, icon: <FaMobile /> },
    { id: "desktop", label: t.desktopWorks, icon: <FaDesktop /> }
  ];

  const filteredWorks = selectedCategory === "all" 
    ? worksData 
    : worksData.filter(work => work.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "web": return <FaGlobe className="w-4 h-4" />;
      case "mobile": return <FaMobile className="w-4 h-4" />;
      case "desktop": return <FaDesktop className="w-4 h-4" />;
      default: return <FaCode className="w-4 h-4" />;
    }
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

        {/* Works Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredWorks.map((work) => (
            <div
              key={work.id}
              className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-2 hover:scale-[1.02]"
            >
              {/* Featured Badge */}
              {work.featured && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge variant="default" className="bg-indigo-500 text-white">
                    {t.featured}
                  </Badge>
                </div>
              )}

              {/* Project Image */}
              <div className="relative h-48 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  {getCategoryIcon(work.category)}
                </div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              </div>

              {/* Project Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  {getCategoryIcon(work.category)}
                  <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {work.category}
                  </span>
                </div>

                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent group-hover:from-indigo-500 group-hover:to-purple-500 transition-all duration-300 mb-3 leading-tight py-1">
                  {work.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                  {work.description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {work.technologies.map((tech, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 flex items-center gap-2"
                    onClick={() => window.open(work.githubUrl, '_blank')}
                  >
                    <FaGithub className="w-4 h-4" />
                    {t.viewCode}
                  </Button>
                  {work.liveUrl && (
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 flex items-center gap-2"
                      onClick={() => window.open(work.liveUrl, '_blank')}
                    >
                      <FaExternalLinkAlt className="w-4 h-4" />
                      {t.viewLive}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="px-8">
            {t.viewMoreWorks}
          </Button>
        </div>
      </div>
    </section>
  );
}
