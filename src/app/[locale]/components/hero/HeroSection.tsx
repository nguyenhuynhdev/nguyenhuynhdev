"use client";

import { useBreakpoint } from "@/hooks/use-breakpoint";
import { useEffect, useState } from "react";
import { Ubuntu } from 'next/font/google'
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react";

const roboto = Ubuntu({
    subsets: ['latin'],
    weight: ['400', '400'],
})

export default function HeroSection({ t }: { t: any }) {
    const bp = useBreakpoint();

    const codeLines = [
        t.hello,
        "const dev = {",
        '  role: "Full Stack Developer",',
        '  platforms: ["Mobile", "Web", "Desktop"],',
        "};",
    ];
    const fullText = codeLines.join("\n");

    const [displayText, setDisplayText] = useState("");
    const [index, setIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [cursorVisible, setCursorVisible] = useState(true);

    // Typing + deleting effect (natural speed with slight randomness)
    useEffect(() => {
        let timer: any;

        const typeDelay = 35 + Math.random() * 15;   // natural typing delay (55–70ms)
        const deleteDelay = 15 + Math.random() * 10; // natural deleting delay (25–35ms)

        if (!isDeleting && index < fullText.length) {
            timer = setTimeout(() => {
                setDisplayText(fullText.slice(0, index + 1));
                setIndex(index + 1);
            }, typeDelay);
        } else if (!isDeleting && index === fullText.length) {
            // Blink before deleting
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
            timer = setTimeout(() => {
                setDisplayText(fullText.slice(0, index - 1));
                setIndex(index - 1);
            }, deleteDelay);
        } else if (isDeleting && index === 0) {
            // Blink before retyping
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

    // Responsive image width
    const width = bp.isDesktop ? 400 : bp.isLaptop ? 350 : bp.isTablet ? 400 : 350;

    return (
        <section className="flex flex-col-reverse lg:flex-row items-center justify-center py-24 px-6 md:px-20 gap-10 lg:gap-20 text-center lg:text-left">

            {/* Code block */}
            <div className="max-w-xl w-full opacity-0 animate-fade-in-up [animation-delay:0.3s] [animation-fill-mode:forwards]">
                <div className="bg-[#f5f5f5] dark:bg-[#1e1e2f] text-gray-800 dark:text-gray-100 rounded-lg shadow-lg font-mono text-left overflow-hidden mb-6 border border-gray-300 dark:border-gray-700">
                    {/* Header */}
                    <div className="relative flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400">
                        <div className="absolute left-4 flex items-center gap-1">
                            <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span>
                            <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full"></span>
                            <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                        </div>
                        <span className="italic">Introduction.tsx</span>
                    </div>

                    {/* Typing area */}
                    <div className="flex w-full min-w-0 border-t border-gray-300 dark:border-gray-700 overflow-hidden">
                        {/* Line numbers */}
                        <div className="bg-[#f5f5f5] dark:bg-[#1e1e2f] text-gray-400 dark:text-gray-500 text-xs p-3 pr-4 select-none text-right flex-shrink-0">
                            {Array.from({ length: Math.max(displayText.split("\n").length, 10) }).map((_, i) => (
                                <div key={i} className="leading-6">{i + 1}</div>
                            ))}
                        </div>

                        {/* Code area */}
                        <div className="flex-1 basis-0 min-w-0 bg-[#f5f5f5] dark:bg-[#1e1e2f] overflow-hidden">
                            <pre
                                className="p-3 text-sm leading-6 text-gray-800 dark:text-gray-100 overflow-x-auto whitespace-pre-wrap break-keep max-w-full tab-size-[4]"
                                style={{ minHeight: "180px", paddingLeft: "1em" }}
                            >
                                <code className="block min-w-full">
                                    {displayText.split("\n").map((line, i, arr) => {
                                        const isLastLine = i === arr.length - 1;
                                        const isComment = line.trimStart().startsWith("//") || line.trimStart().startsWith("/*") || line.trimStart().startsWith("*/");

                                        if (isComment)
                                            return (
                                                <div key={i}>
                                                    <span className="text-green-600 dark:text-green-400 font-bold">
                                                        {line}
                                                    </span>
                                                </div>
                                            );

                                        const parts = line
                                            .replace("const", "<const>")
                                            .replace("dev", "<dev>")
                                            .replace("role", "<role>")
                                            .replace("platforms", "<platforms>")
                                            .split(/(<const>|<dev>|<role>|<platforms>)/);

                                        return (
                                            <div key={i}>
                                                {parts.map((part, idx) => {
                                                    let content: React.ReactNode = part;
                                                    if (part === "<const>")
                                                        content = (
                                                            <span className="text-purple-600 dark:text-purple-400 font-semibold">
                                                                const
                                                            </span>
                                                        );
                                                    else if (part === "<dev>")
                                                        content = (
                                                            <span className="text-blue-800 dark:text-blue-400 font-semibold">
                                                                dev
                                                            </span>
                                                        );
                                                    else if (part === "<role>" || part === "<platforms>")
                                                        content = (
                                                            <span className="text-blue-500 dark:text-blue-300 font-semibold">
                                                                {part.replace(/<|>/g, "")}
                                                            </span>
                                                        );

                                                    const isLastPart = isLastLine && idx === parts.length - 1;

                                                    return (
                                                        <span key={idx} className="whitespace-pre-wrap break-keep">
                                                            {content}
                                                            {isLastPart && cursorVisible && (
                                                                <span className="text-gray-400">|</span>
                                                            )}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </code>
                            </pre>

                        </div>
                    </div>
                </div>
                {/* Description */}
                <div className="backdrop-blur-md bg-white/40 dark:bg-gray-800/30 border border-gray-300/30 dark:border-gray-700/50 rounded-[25px] px-6 py-8 shadow-lg flex flex-col gap-6">
                    {/* Intro paragraph */}
                    <p
                        className={`text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-left`}
                        dangerouslySetInnerHTML={{ __html: t.intro }}
                    />

                    {/* Action buttons container */}
                    <div className="flex justify-end items-center gap-4">
                        {/* Preview CV button (blue background + white text) */}
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl rounded-2xl px-5 py-5 text-sm font-medium transition-all flex items-center gap-2"
                            onClick={() => window.open("/cv.pdf", "_blank")} // Opens PDF in browser
                        >
                            {t.previewCV}
                        </Button>

                        {/* Contact button (neutral tone) */}
                        <Button
                            variant="secondary"
                            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 shadow-md hover:shadow-lg rounded-2xl px-5 py-5 text-sm font-medium transition-all"
                            onClick={() => (window.location.href = "#contact")}
                        >
                            {t.contact}
                        </Button>
                    </div>
                </div>


            </div>
            {/* Profile image */}
            <div
                className="relative flex-shrink-0 opacity-0 animate-fade-in-up [animation-delay:0.1s] [animation-fill-mode:forwards]"
            >
                <div
                    className="rounded-full overflow-hidden aspect-[1440/2348] shadow-[0_0_25px_rgba(0,0,0,0.25)] dark:shadow-[0_0_25px_rgba(255,255,255,0.25)]"
                    style={{
                        width,
                        aspectRatio: bp.isMobile || bp.isTablet ? "1 / 1" : "1440 / 2348",
                    }}
                >
                    <img
                        src="/images/profile.webp"
                        alt="Profile"
                        loading="lazy"
                        className="object-cover object-top w-full h-full"
                    />
                </div>
            </div>
        </section>
    );
}
