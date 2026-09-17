import { useState, useEffect } from "react";

import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";

function Projects() {

  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    fetch("https://api.github.com/users/iamjatinchandani/repos")

      .then((res) => {

        if (!res.ok) {
          throw new Error("Failed to fetch repositories");
        }

        return res.json();

      })

      .then((data) => {

        setRepos(data);

      })

      .catch((err) => {

        setError(err.message);

      })

      .finally(() => {

        setLoading(false);

      });

  }, []);

  const projects = [

    {
      title: "Talent Intelligence Platform",
      status: "In Progress",
      description:
        "An AI-powered placement platform that analyzes resumes, recommends career paths, identifies skill gaps and helps recruiters discover talent.",
      technologies: [
        "React",
        "Node.js",
        "PostgreSQL",
        "Prisma",
        "Gemini AI"
      ]
    },

    {
      title: "TransitOps",
      status: "Hackathon Project",
      description:
        "A smart transport management platform with multiple dashboards, fleet monitoring and analytics developed during a hackathon.",
      technologies: [
        "React",
        "Tailwind",
        "PostgreSQL"
      ]
    },

    {
      title: "Student Portfolio",
      status: "Completed",
      description:
        "A modern responsive portfolio website developed using React Router, reusable components and clean UI principles.",
      technologies: [
        "React",
        "React Router",
        "CSS"
      ]
    }

  ];

  if (loading) return <Spinner />;

  if (error) return <ErrorMessage message={error} />;

  return (

    <div className="container">

      <h1 className="page-title">
        Featured Projects
      </h1>

      <div className="projects-grid">

        {projects.map((project, index) => (

          <div className="project-card" key={index}>

            <span className="status">

              {project.status}

            </span>

            <h2>{project.title}</h2>

            <p>{project.description}</p>

            <div className="tech-stack">

              {project.technologies.map((tech, i) => (

                <span className="tech-badge" key={i}>

                  {tech}

                </span>

              ))}

            </div>

          </div>

        ))}

      </div>

      <br />
      <br />

      <h1 className="page-title">
        GitHub Repositories
      </h1>

      <div className="projects-grid">

        {repos.map((repo) => (

          <div className="project-card" key={repo.id}>

            <span className="status">
              Repository
            </span>

            <h2>{repo.name}</h2>

            <p>

              {repo.description || "No description available"}

            </p>

            <p className="repo-stars">

              ⭐ {repo.stargazers_count} Stars

            </p>

            <a
              className="repo-link"
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              >
               View Repository
             </a>

          </div>

        ))}

      </div>

    </div>

  );

}

export default Projects;