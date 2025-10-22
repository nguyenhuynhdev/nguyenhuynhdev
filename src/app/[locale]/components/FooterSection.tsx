"use client";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { SiGithub, SiFacebook, SiX, SiYoutube, SiLinkedin } from "react-icons/si";
import { FaEnvelope } from "react-icons/fa";

export default function FooterSection({ t }: { t: any }) {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "GitHub",
      url: "https://github.com/nguyenhuynhdev",
      icon: <SiGithub className="w-5 h-5" />
    },
    {
      name: "LinkedIn",
      url: "https://linkedin.com/in/nguyenhuynhdev",
      icon: <SiLinkedin className="w-5 h-5" />
    },
    {
      name: "Facebook",
      url: "https://facebook.com/nguyenhuynhdev",
      icon: <SiFacebook className="w-5 h-5" />
    },
    {
      name: "YouTube",
      url: "https://www.youtube.com/@nguyenhuynhdev",
      icon: <SiYoutube className="w-5 h-5" />
    },
    {
      name: "Twitter",
      url: "https://x.com/nguyenhuynhdev",
      icon: <SiX className="w-5 h-5" />
    }
  ];

  const quickLinks = [
    { name: t.services, href: "#skills" },
    { name: t.works, href: "#works" },
    { name: t.blog, href: "#blog" },
    { name: t.contact, href: "#contact" }
  ];

  return (
    <footer className="relative bg-transparent border-t border-gray-200/50 dark:border-gray-700/50 mt-20">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-10 left-10 w-24 h-24 bg-blue-500 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-indigo-500 rounded-full blur-2xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 md:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">NH</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Nguyen Huynh</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Full Stack Developer</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
              {t.footer?.footerDescription || "Passionate about creating innovative solutions and sharing knowledge with the developer community."}
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-300"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t.footer?.quickLinks || "Quick Links"}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t.footer?.contactInfo || "Contact Info"}
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FaEnvelope className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <a
                  href="mailto:nguyenhuynhdev@gmail.com"
                  className="text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-300"
                >
                  nguyenhuynhdev@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-300">
                  {t.footer?.availableForWork || "Available for work"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200/50 dark:border-gray-700/50 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {currentYear} Nguyen Huynh. {t.footer?.allRightsReserved || "All rights reserved."}
            </p>
            
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              <LocaleSwitcher />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
