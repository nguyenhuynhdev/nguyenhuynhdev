"use client";

import { useState, useEffect } from "react";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import {
  SiKotlin,
  SiDart,
  SiFlutter,
  SiNodedotjs,
  SiNextdotjs,
  SiPostgresql,
  SiMysql,
  SiMongodb,
} from "react-icons/si";
import { FaJava, FaWindows } from "react-icons/fa6";
import { TbBrandCSharp } from "react-icons/tb";
import { DiVisualstudio } from "react-icons/di";
import { BiLogoTypescript } from "react-icons/bi";
import { RiJavascriptFill } from "react-icons/ri";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export default function ServicesSection({ t }: { t: any }) {
  const { isMobile, isTablet, isLaptop, isDesktop } = useBreakpoint();
  const [api, setApi] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const skillsData = [
  {
    title: t.mobile,
    description: t.mobileDescription,
    icons: [
      { icon: <SiKotlin />, name: "Kotlin" },
      { icon: <SiDart />, name: "Dart" },
      { icon: <SiFlutter />, name: "Flutter" },
      { icon: <FaJava />, name: "Java" },
    ],
  },
  {
    title: t.web,
    description: t.webDescription,
    icons: [
      { icon: <BiLogoTypescript />, name: "TypeScript" },
      { icon: <RiJavascriptFill />, name: "JavaScript" },
      { icon: <SiNodedotjs />, name: "Node.js" },
      { icon: <SiNextdotjs />, name: "Next.js" },
    ],
  },
  {
    title: t.desktop,
    description: t.desktopDescription,
    icons: [
      { icon: <TbBrandCSharp />, name: "C#" },
      { icon: <DiVisualstudio />, name: "Visual Studio" },
      { icon: <FaWindows />, name: "Windows" },
    ],
  },
  {
    title: t.database,
    description: t.databaseDescription,
    icons: [
      { icon: <SiPostgresql />, name: "PostgreSQL" },
      { icon: <SiMysql />, name: "MySQL" },
      { icon: <SiMongodb />, name: "MongoDB" },
    ],
  },
];

  // --- Track carousel ---
  useEffect(() => {
    if (!api) return;
    const handleSelect = () => setSelectedIndex(api.selectedScrollSnap());
    api.on("select", handleSelect);
    return () => api.off("select", handleSelect);
  }, [api]);

  const handleDotClick = (index: number) => {
    if (api) api.scrollTo(index);
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
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
            {t.services}
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent mb-4 leading-tight py-2">
            {t.servicesTitle}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t.servicesSubtitle}
          </p>
        </div>
        </div>
      {/* --- MOBILE / TABLET: Carousel --- */}
      {(isMobile || isTablet) ? (
        <div className={`w-full mx-auto ${isMobile ? "max-w-xs" : "max-w-lg"}`}>
          <Carousel
            setApi={setApi}
            plugins={[Autoplay({ delay: 8000 })]}
            opts={{ loop: true, align: "center" }}
          >
            <CarouselContent className="gap-6 px-[7%]">
              {skillsData.map((item, idx) => (
                <CarouselItem
                  key={idx}
                  className="basis-[80%] flex justify-center cursor-pointer">
                  <div
                    className="group flex flex-col justify-between h-full rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-left select-none transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/20 hover:border-indigo-300 dark:hover:border-indigo-500 hover:-translate-y-2 hover:scale-[1.02]">
                    <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent group-hover:from-indigo-500 group-hover:to-purple-500 transition-all duration-300 leading-tight py-1">
                      {item.title}
                    </h3>

                    <p className="text-gray-700 dark:text-gray-300 mb-6 text-sm leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex justify-end gap-3 flex-wrap">
                      {item.icons.map((it, i) => (
                        <div
                          key={i}
                          className="relative group/icon text-2xl text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all duration-300 hover:scale-110 hover:rotate-3"
                        >
                          {it.icon}
                          <span className="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 group-hover/icon:scale-100 transition-all duration-200 text-xs bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1.5 rounded-lg shadow-lg font-medium whitespace-nowrap z-10">
                            {it.name}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* --- DOTS --- */}
          <div className="flex justify-center mt-8 space-x-3">
            {skillsData.map((_, i) => (
              <button
                key={i}
                onClick={() => handleDotClick(i)}
                className={`relative rounded-full transition-all duration-300 cursor-pointer group ${
                  selectedIndex === i 
                    ? "w-8 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30" 
                    : "w-3 h-3 bg-gray-300 dark:bg-gray-600 hover:bg-indigo-400 dark:hover:bg-indigo-500"
                }`}
                title={`Go to ${skillsData[i].title}`}
              >
                {selectedIndex === i && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* --- DESKTOP / LAPTOP: Grid --- */
        <div
          className={`grid grid-cols-1 gap-8 max-w-[1100px] mx-auto items-stretch ${isLaptop ? "md:grid-cols-2" : ""} ${isDesktop ? "lg:grid-cols-4" : ""}`}>
          {skillsData.map((item, idx) => (
            <div
              key={idx}
              className={`group flex flex-col justify-between h-full rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl hover:shadow-indigo-500/20 p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-left transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${isDesktop ? "min-h-[280px]" : ""
                }`}
            >
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent group-hover:from-indigo-500 group-hover:to-purple-500 transition-all duration-300 mb-4 leading-tight py-1">
                  {item.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6 text-base leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="flex justify-end gap-3 flex-wrap">
                {item.icons.map((it, i) => (
                  <div
                    key={i}
                    className="relative group/icon text-2xl text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all duration-300 hover:scale-110 hover:rotate-3"
                  >
                    {it.icon}
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 group-hover/icon:scale-100 transition-all duration-200 text-xs bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1.5 rounded-lg shadow-lg font-medium whitespace-nowrap z-10">
                      {it.name}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
