"use client";

export default function SkillsSection({ t }: { t: any }) {
  const skills = t.skills || ["Next.js", "TypeScript", "React", "TailwindCSS"];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900 text-center">
      <h2 className="text-3xl font-bold mb-6">{t.skillTitle || "Skills & Experience"}</h2>
      <div className="flex flex-wrap justify-center gap-4">
        {skills.map((skill: string, idx: number) => (
          <span
            key={idx}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg text-sm font-medium"
          >
            {skill}
          </span>
        ))}
      </div>
      <p className="mt-8 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
        {t.experience || "3+ years experience building responsive, scalable web applications."}
      </p>
    </section>
  );
}
