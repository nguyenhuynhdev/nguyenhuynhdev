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

export default function SkillsSection({ t }: { t: any }) {
  const { isMobile, isTablet, isLaptop, isDesktop } = useBreakpoint();
  const [api, setApi] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const skillsData = [
    {
      title: "Mobile",
      description:
        "Build clean architecture mobile apps with Flutter, Kotlin, Dart, and Java — cross-platform, custom UI, and optimized performance.",
      icons: [
        { icon: <SiKotlin />, name: "Kotlin" },
        { icon: <SiDart />, name: "Dart" },
        { icon: <SiFlutter />, name: "Flutter" },
        { icon: <FaJava />, name: "Java" },
      ],
    },
    {
      title: "Web",
      description:
        "Develop full-stack web apps using HTML, JS, TS, Node.js, and Next.js — frontend, backend, CMS, extensions, and automation scripts.",
      icons: [
        { icon: <BiLogoTypescript />, name: "TypeScript" },
        { icon: <RiJavascriptFill />, name: "JavaScript" },
        { icon: <SiNodedotjs />, name: "Node.js" },
        { icon: <SiNextdotjs />, name: "Next.js" },
      ],
    },
    {
      title: "Desktop",
      description:
        "Build Windows applications, automation tools, and batch scripts using C#, Visual Studio, and Windows APIs.",
      icons: [
        { icon: <TbBrandCSharp />, name: "C#" },
        { icon: <DiVisualstudio />, name: "Visual Studio" },
        { icon: <FaWindows />, name: "Windows" },
      ],
    },
    {
      title: "Database",
      description:
        "Design and manage small-scale databases using PostgreSQL, MySQL, and MongoDB — model data, optimize queries, and integrate with APIs.",
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
    <section className="text-center bg-transparent overflow-hidden pt-8 lg:pt-16 pb-16 lg:pb-24 px-6 md:px-10">
      <h2 className="text-3xl font-bold mb-10">
        {t.skillTitle || "Skills & Technology"}
      </h2>

      {/* --- MOBILE / TABLET: Carousel --- */}
      {(isMobile || isTablet) ? (
        <div className={`w-full mx-auto ${isMobile ? "max-w-md" : "max-w-[640px]"}`}>
          <Carousel
            setApi={setApi}
            plugins={[Autoplay({ delay: 8000 })]}
            opts={{ loop: true, align: "center" }}
          >
            <CarouselContent className="gap-6">
              {skillsData.map((item, idx) => (
                <CarouselItem
                  key={idx}
                  className="basis-[80%] flex justify-center cursor-pointer"
                >
                  <div
                    className=" flex flex-col justify-between h-full rounded-xl border border-gray-200 dark:border-gray-700 p-8 bg-white/40 dark:bg-gray-800/30 backdrop-blur-sm text-left select-none transition-all duration-300 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500">
                    <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                      {item.title}
                    </h3>

                    <p className="text-gray-700 dark:text-gray-300 mb-6 text-sm leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex justify-end gap-3 flex-wrap">
                      {item.icons.map((it, i) => (
                        <div
                          key={i}
                          className="relative group text-xl text-gray-700 dark:text-gray-200 hover:text-indigo-500 transition-transform"
                        >
                          {it.icon}
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform text-xs bg-gray-800 text-white px-2 py-1 rounded">
                            {it.name}
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
          <div className="flex justify-center mt-6 space-x-2">
            {skillsData.map((_, i) => (
              <button
                key={i}
                onClick={() => handleDotClick(i)}
                className={`w-3 h-3 rounded-full transition-all cursor-pointer ${selectedIndex === i ? "bg-indigo-500 w-5" : "bg-gray-400"
                  }`}
                title={`Go to ${skillsData[i].title}`}
              />
            ))}
          </div>
        </div>
      ) : (
        /* --- DESKTOP / LAPTOP: 2x2 GRID equal height --- */
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1100px] mx-auto items-stretch">
          {skillsData.map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col justify-between h-full rounded-xl border border-gray-200 dark:border-gray-700 shadow-md p-8 bg-white/40 dark:bg-gray-800/30 backdrop-blur-sm text-left transition-transform hover:scale-[1.02] ${isDesktop ? "min-h-[230px]" : ""
                }`}
            >
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="flex justify-end gap-3 flex-wrap">
                {item.icons.map((it, i) => (
                  <div
                    key={i}
                    className="relative group text-xl text-gray-700 dark:text-gray-200 hover:text-indigo-500"
                  >
                    {it.icon}
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform text-xs bg-gray-800 text-white px-2 py-1 rounded">
                      {it.name}
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
