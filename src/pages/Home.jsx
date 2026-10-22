import { lazy, Suspense } from "react";
import Header from "../components/Header";
import About from "../components/About";
import Footer from "../components/Footer";
import DelayedFallback from "../components/DelayedFallback";

const Skills = lazy(() => import("../components/Skills"));

function Home() {
  const skills = [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Node.js",
    "Express",
    "PostgreSQL",
    "Git",
    "GitHub",
  ];

  return (
    <div className="container">
      <Header name="Jatin Chandani" />

      <div className="card">
        <About />
      </div>

      <div className="card">
        <Suspense fallback={<DelayedFallback delay={150} message="Loading skills..." />}>
          <Skills skillList={skills} />
        </Suspense>
      </div>

      <Footer />
    </div>
  );
}

export default Home;
