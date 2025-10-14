"use client";

import { useBreakpoint } from "@/hooks/use-breakpoint";
import { useEffect, useState } from "react";

export default function HeroSection({ t }: { t: any }) {
    const bp = useBreakpoint();

    const codeLines = [
        "const dev = {",
        '    role: "Full Stack Developer",',
        '    skills: ["Android", "Web", "Flutter"],',
        "};",
    ];
    const fullText = codeLines.join("\n");

    const [displayText, setDisplayText] = useState("");
    const [index, setIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [cursorVisible, setCursorVisible] = useState(true);

    // Typing + deleting effect
    useEffect(() => {
        let timer: any;

        if (!isDeleting && index < fullText.length) {
            // Typing phase
            timer = setTimeout(() => {
                const nextText = fullText.slice(0, index + 1);
                setDisplayText(nextText);
                setIndex(index + 1);

                // 🔽 đảm bảo cursor xuống đúng dòng sau khi layout render xong
                requestAnimationFrame(() => setCursorVisible(true));
            }, 35);
            setCursorVisible(true);
        } else if (!isDeleting && index === fullText.length) {
            // Finished typing -> blink cursor 3 times (6 toggles)
            let blinkCount = 0;
            const blinkInterval = setInterval(() => {
                setCursorVisible((v) => !v);
                blinkCount++;
                if (blinkCount >= 6) {
                    clearInterval(blinkInterval);
                    setTimeout(() => setIsDeleting(true), 300);
                }
            }, 400);
        } else if (isDeleting && index > 0) {
            // Deleting phase
            timer = setTimeout(() => {
                const nextText = fullText.slice(0, index - 1);
                setDisplayText(nextText);
                setIndex(index - 1);

                requestAnimationFrame(() => setCursorVisible(true));
            }, 15);

            setCursorVisible(true);
        } else if (isDeleting && index === 0) {
            // Blink 2 times before retyping
            let blinkCount = 0;
            const blinkInterval = setInterval(() => {
                setCursorVisible((v) => !v);
                blinkCount++;
                if (blinkCount >= 4) {
                    clearInterval(blinkInterval);
                    setIsDeleting(false);
                }
            }, 400);
        }

        return () => clearTimeout(timer);
    }, [index, isDeleting, fullText]);

    let width = 176;
    if (bp.isDesktop) width = 480;
    else if (bp.isLaptop) width = 400;
    else if (bp.isTablet) width = 320;
    else if (bp.isMobile) width = 220;

    return (
        <section className="flex flex-col lg:flex-row items-center justify-center py-24 px-6 md:px-20 gap-10 text-center lg:text-left">
            {/* Ảnh bên trái */}
            <div className="relative flex-shrink-0">
                <div
                    className="
            rounded-full overflow-hidden aspect-[1440/2348]
            shadow-[0_0_25px_rgba(0,0,0,0.25)]
            dark:shadow-[0_0_25px_rgba(255,255,255,0.25)]
          "
                    style={{ width: width }}
                >
                    <img
                        src="/images/profile.webp"
                        alt="Profile"
                        loading="lazy"
                        className="object-cover w-full h-full"
                    />
                </div>
            </div>

            {/* Code bên phải */}
            <div className="max-w-xl w-full">
                <div className="
    bg-[#f5f5f5] dark:bg-[#1e1e2f]
    text-gray-800 dark:text-gray-100
    rounded-lg shadow-lg font-mono text-left overflow-hidden mb-6
    border border-gray-300 dark:border-gray-700
  ">
                    {/* Header */}
                    <div className="
      relative flex items-center justify-center
      px-4 py-2
      bg-gray-200 dark:bg-gray-800
      text-xs text-gray-500 dark:text-gray-400
    ">
                        <div className="absolute left-4 flex items-center gap-1">
                            <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span>
                            <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full"></span>
                            <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                        </div>
                        <span className="italic">information.tsx</span>
                    </div>

                    {/* Code typing + number lines */}
                    <div className="flex">
                        {/* Number lines */}
                        <div className="
        bg-[#f5f5f5] dark:bg-[#1e1e2f]
        text-gray-400 dark:text-gray-500
        text-xs p-3 pr-4 select-none text-right
      ">
                            {Array.from({
                                length: Math.max(displayText.split("\n").length, 10),
                            }).map((_, i) => (
                                <div key={i} className="leading-6">
                                    {i + 1}
                                </div>
                            ))}
                        </div>

                        {/* Code typing */}
                        <pre
                            className="
    p-3 text-sm leading-6
    bg-[#f5f5f5] dark:bg-[#1e1e2f]
    text-gray-800 dark:text-gray-100
    w-full
    overflow-x-auto overflow-y-hidden
    whitespace-pre-wrap break-words
  "
                            style={{
                                minHeight: "180px",
                                maxWidth: "100%",  // ⬅️ Ngăn kéo vượt container
                            }}
                        >
                            <code>
                                {displayText.split("\n").map((line, i, arr) => {
                                    const isLastLine = i === arr.length - 1;
                                    return (
                                        <div key={i} className="flex">
                                            <span>
                                                {line
                                                    .replace("const", "<const>")
                                                    .replace("role", "<role>")
                                                    .replace("skills", "<skills>")
                                                    .split(/(<const>|<role>|<skills>)/)
                                                    .map((part, idx) => {
                                                        if (part === "<const>")
                                                            return (
                                                                <span key={idx} className="text-purple-600 dark:text-purple-400 font-semibold">
                                                                    const
                                                                </span>
                                                            );
                                                        if (part === "<role>")
                                                            return (
                                                                <span key={idx} className="text-blue-600 dark:text-blue-400 font-semibold">
                                                                    role
                                                                </span>
                                                            );
                                                        if (part === "<skills>")
                                                            return (
                                                                <span key={idx} className="text-blue-600 dark:text-blue-400 font-semibold">
                                                                    skills
                                                                </span>
                                                            );
                                                        return part;
                                                    })}
                                            </span>
                                            {isLastLine && cursorVisible && (
                                                <span className="text-gray-400 ml-1">|</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </code>
                        </pre>
                    </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-4">
                    {t.heroDescription ||
                        "I build efficient, scalable full-stack systems across web, Android, and Flutter."}
                </p>

                <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Download CV
                </button>
            </div>
        </section>
    );
}
