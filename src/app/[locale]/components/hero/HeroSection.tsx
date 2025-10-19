"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { Ubuntu, Concert_One, Inder } from "next/font/google";
import { FaRegFilePdf } from "react-icons/fa6";
import { IoMailOutline } from "react-icons/io5";
import { SiGithub, SiFacebook, SiX, SiYoutube } from "react-icons/si";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["400"],
});

const concertOne = Concert_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-concert-one",
});

const inder = Inder({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-inder",
});


function HeroSection({ t }: { t: any }) {
  const bp = useBreakpoint();

  const codeLines = useMemo(
    () => [
      t.hello,
      "const dev = {",
      '  role: "Full Stack Developer",',
      '  platforms: ["Mobile", "Web", "Desktop"],',
      "};",
    ],
    [t.hello]
  );

  const fullText = useMemo(() => codeLines.join("\n"), [codeLines]);
  const [displayText, setDisplayText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  const indexRef = useRef(0);
  const deletingRef = useRef(false);

  useEffect(() => {
    const blink = setInterval(() => setCursorVisible((v) => !v), 500);
    return () => clearInterval(blink);
  }, []);

  useEffect(() => {
    let lastTime = performance.now();

    const loop = (now: number) => {
      const delta = now - lastTime;
      const delay = deletingRef.current
        ? 25 + Math.random() * 15
        : 50 + Math.random() * 20;

      if (delta >= delay) {
        lastTime = now;
        const idx = indexRef.current;

        if (!deletingRef.current && idx < fullText.length) {
          indexRef.current++;
          setDisplayText(fullText.slice(0, idx + 1));
        } else if (!deletingRef.current && idx === fullText.length) {
          setTimeout(() => (deletingRef.current = true), 2000);
        } else if (deletingRef.current && idx > 0) {
          indexRef.current--;
          setDisplayText(fullText.slice(0, idx - 1));
        } else if (deletingRef.current && idx === 0) {
          deletingRef.current = false;
        }
      }

      requestAnimationFrame(loop);
    };

    const id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [fullText]);

  const width = bp.isDesktop || bp.isLaptop ? 400 : bp.isTablet ? 400 : 350;

  return (
    <section
      className="
        flex flex-col-reverse lg:flex-row 
        justify-between items-center
        gap-10 lg:gap-20 
        pt-24 
        text-center lg:text-left
        w-full max-w-[1200px] mx-auto
        px-6 md:px-10
      "
    >
      {/* LEFT: Code + Description */}
      <div className="flex-1 flex flex-col items-start w-full lg:pl-0 lg:pr-0 max-w-lg">
        {/* Code box */}
        <div className="bg-[#f5f5f5] dark:bg-[#1e1e2f] text-gray-800 dark:text-gray-100 rounded-lg shadow-lg font-mono text-left overflow-hidden mb-6 border border-gray-300 dark:border-gray-700 w-full">
          <div className="relative flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400">
            <div className="absolute left-4 flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full"></span>
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
            </div>
            <span className="italic">Introduction.tsx</span>
          </div>

          <div className="flex w-full min-w-0 border-t border-gray-300 dark:border-gray-700 overflow-hidden">
            <div className="bg-[#f5f5f5] dark:bg-[#1e1e2f] text-gray-400 dark:text-gray-500 text-xs p-3 pr-4 select-none text-right flex-shrink-0">
              {Array.from({ length: Math.max(displayText.split("\n").length, 10) }).map(
                (_, i) => (
                  <div key={i} className="leading-6">
                    {i + 1}
                  </div>
                )
              )}
            </div>

            <div className="flex-1 bg-[#f5f5f5] dark:bg-[#1e1e2f] overflow-hidden">
              <pre className="p-3 text-sm leading-6 text-gray-800 dark:text-gray-100 overflow-x-auto whitespace-pre-wrap break-keep max-w-full tab-size-[4]">
                <code className="block min-w-full">
                  {displayText.split("\n").map((line, i, arr) => {
                    const isLastLine = i === arr.length - 1;
                    const isComment =
                      line.trimStart().startsWith("//") ||
                      line.trimStart().startsWith("/*") ||
                      line.trimStart().startsWith("*/");

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
                            <span key={idx}>
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
        <div className="relative bg-[#f5f5f5] dark:bg-[#1e1e2f] border border-gray-300 dark:border-gray-700 rounded-lg px-6 py-6 shadow-inner mb-10 font-mono overflow-hidden w-full">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          <p className="text-gray-800 dark:text-gray-100 leading-relaxed text-left text-base font-normal">
            <span className="text-center text-3xl mb-5 block font-bold">
            {t.aboutMe}
            </span>
            <span>{t.intro}</span>
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3 font-bold text-base mt-6">
            <span
              className="flex items-center gap-2 cursor-pointer text-green-500 hover:text-white bg-green-50 dark:bg-green-900/20 hover:bg-green-500 dark:hover:bg-green-600 px-3 py-3 rounded-lg transition-all shadow-sm"
              onClick={() => window.open("/cv.pdf", "_blank")}
            >
              <FaRegFilePdf className="w-4 h-4" /> {t.previewCV}
            </span>

            <span
              className="flex items-center gap-2 cursor-pointer text-blue-500 hover:text-white bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-500 dark:hover:bg-blue-600 px-3 py-3 rounded-lg transition-all shadow-sm"
              onClick={() =>
                (window.location.href = "mailto:nguyenhuynhdev@gmail.com")
              }
            >
              <IoMailOutline className="w-4 h-4" /> {t.contact}
            </span>
          </div>

          {/* Social icons */}
          {/* Social icons */}
          <div className="mt-6 border-t border-gray-300 dark:border-gray-700 pt-3 flex justify-center items-center gap-6">
            <a
              href="https://github.com/nguyenhuynhdev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-black dark:hover:text-white transition-colors"
            >
              <SiGithub className="w-5 h-5" />
            </a>
            <a
              href="https://facebook.com/nguyenhuynhdev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-blue-600 transition-colors"
            >
              <SiFacebook className="w-5 h-5" />
            </a>
            <a
              href="https://www.youtube.com/@nguyenhuynhdev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-blue-500 transition-colors"
            >
              <SiYoutube className="w-5 h-5" />
            </a>
            <a
              href="https://x.com/nguyenhuynhdev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-blue-400 transition-colors"
            >
              <SiX className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* RIGHT: Profile image */}
      <div className="relative flex justify-center lg:justify-end flex-shrink-0 pb-10">
        <div
          className="rounded-full overflow-hidden shadow-[0_0_25px_rgba(0,0,0,0.25)] dark:shadow-[0_0_25px_rgba(255,255,255,0.25)]"
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

export default memo(HeroSection);
