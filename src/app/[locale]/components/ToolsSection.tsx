"use client";

import { useBreakpoint } from "@/hooks/use-breakpoint";
import {
    SiAndroidstudio,
    SiFigma,
    SiGit,
    SiDocker,
} from "react-icons/si";
import { DiVisualstudio } from "react-icons/di";
import { BiLogoVisualStudio } from "react-icons/bi";

export default function ToolsSection({ t }: { t: any }) {
    const bp = useBreakpoint();

    const toolsData = [
        {
            icon: <SiAndroidstudio className="text-[#3DDC84]" />,
            title: t.ide,
            description: t.ideDescription,
        },
        {
            icon: <SiGit className="text-[#F05032]" />,
            title: t.versionControl,
            description: t.versionControlDescription,
        },
        {
            icon: <SiFigma className="text-[#F24E1E]" />,
            title: t.designTools,
            description: t.designToolsDescription,
        },
        {
            icon: <SiDocker className="text-[#2496ED]" />,
            title: t.otherTools,
            description: t.otherToolsDescription,
        },
    ];

    return (
        <section
            id="tools"
            className={'relative py-16 lg:py-20 w-full flex flex-col lg:flex-row mx-auto gap-12 bg-transparent overflow-hidden ' + (bp.isDesktop || bp.isLaptop ? 'max-w-[1200px] px-6 md:px-10' : bp.isTablet ? 'max-w-lg' : 'px-6')}>
            {/* Background decorative elements */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10">
                <div className="absolute top-10 right-10 w-24 h-24 bg-blue-500 rounded-full blur-2xl"></div>
                <div className="absolute bottom-10 left-10 w-32 h-32 bg-indigo-500 rounded-full blur-2xl"></div>
            </div>

            {/* LEFT CONTENT */}
            <div className="relative flex-1 max-w-md">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-4">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                    {t.toolLabel}
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent leading-tight py-1">
                    {t.toolTitle}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                    {t.toolSubtitle}
                </p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                    {t.toolDescription}
                </p>

                <p className="mt-4 text-sm text-gray-500/80 dark:text-gray-400/80 italic bg-gray-100 dark:bg-gray-800/50 px-4 py-2 rounded-lg border-l-4 border-indigo-500">
                    {t.toolFooter || "Always exploring new tools to enhance productivity."}
                </p>
            </div>

            {/* RIGHT CONTENT */}
            <div
                className={`flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8 w-full`}
            >
                {toolsData.map((item, idx) => (
                    <div
                        key={idx}
                        className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-6 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] shadow-lg hover:shadow-2xl hover:shadow-indigo-500/20"
                    >
                        <div className="text-3xl mb-4">
                            {item.icon}
                        </div>
                        <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent group-hover:from-indigo-500 group-hover:to-purple-500 transition-all duration-300 mb-2 leading-tight py-1">
                            {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {item.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
