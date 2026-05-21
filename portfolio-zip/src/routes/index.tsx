import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/portfolio/Nav";
import { Hero } from "@/components/portfolio/Hero";
import { Marquee } from "@/components/portfolio/Marquee";
import { About } from "@/components/portfolio/About";
import { Skills } from "@/components/portfolio/Skills";
import { Projects } from "@/components/portfolio/Projects";
import { Terminal } from "@/components/portfolio/Terminal";
import { Contact } from "@/components/portfolio/Contact";
import { Footer } from "@/components/portfolio/Footer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Aarav Sharma — Cybersecurity · Android · AI" },
      {
        name: "description",
        content:
          "Portfolio of Aarav Sharma — first-year CSE engineering secure Android runtimes, AI-driven threat detection, and shipping production Kotlin.",
      },
      { property: "og:title", content: "Aarav Sharma — Phosphor Command Center" },
      {
        property: "og:description",
        content:
          "Cybersecurity, Android, and AI dossier of a first-year CSE undergraduate.",
      },
    ],
  }),
});

function Index() {
  return (
    <main className="relative min-h-screen bg-background text-foreground font-display selection:bg-phosphor/30 selection:text-phosphor">
      <div className="fixed inset-0 scanlines opacity-[0.04] pointer-events-none z-[60]" />
      <Nav />
      <Hero />
      <Marquee />
      <About />
      <Skills />
      <Projects />
      <Terminal />
      <Contact />
      <Footer />
    </main>
  );
}
