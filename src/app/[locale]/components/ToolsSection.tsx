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
            icon: <SiAndroidstudio />,
            title: t.ide,
            description: t.ideDescription,
        },
        {
            icon: <SiGit />,
            title: t.versionControl,
            description: t.versionControlDescription,
        },
        {
            icon: <SiFigma />,
            title: t.designTools,
            description: t.designToolsDescription,
        },
        {
            icon: <SiDocker />,
            title: t.otherTools,
            description: t.otherToolsDescription,
        },
    ];

    return (
        <section
            id="tools"
            className={'py-10 w-full  flex flex-col lg:flex-row mx-auto gap-12 ' + (bp.isDesktop || bp.isLaptop ? 'max-w-[1200px] px-6 md:px-10' : bp.isTablet ? 'max-w-lg' : 'px-6')}>
            {/* LEFT CONTENT */}
            <div className="flex-1 max-w-md">
                <p className="uppercase tracking-widest text-indigo-500 dark:text-indigo-400 font-semibold mb-3">
                    {t.toolLabel}
                </p>
                <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                    {t.toolTitle}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {t.toolDescription}
                </p>

                <p className="mt-2 text-xs text-gray-500/80 dark:text-gray-400/80 italic">
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
                        className="group bg-white dark:bg-[#141429] border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-lg p-6 transition-all duration-300 hover:-translate-y-1 shadow-sm"
                    >
                        <div className="text-indigo-500 dark:text-indigo-400 text-3xl mb-4">
                            {item.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-500 dark:group-hover:text-indigo-400">
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
