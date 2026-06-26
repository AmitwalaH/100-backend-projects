import { SITE } from "../../constants";
import { useGithubStats } from "../../hooks/useGithubStats";
import projectsData from "../../data/projects.json";

const totalCategories = new Set(projectsData.map((p) => p.category)).size;
const totalTechs = new Set(projectsData.flatMap((p) => p.tech)).size;

export default function WelcomeScreen() {
  const { stats } = useGithubStats(SITE.author, SITE.repoName);

  return (
    <div className="welcome">
      <div className="terminal-prompt">
        <span className="dim">{SITE.author.toLowerCase()}@projects</span>
        <span className="dim">:</span>
        <span className="path">~</span>
        <span className="dim">$</span>
        <span className="cmd">ls ./backend-projects/</span>
        <span className="terminal-cursor" />
      </div>

      <h1 className="welcome-title">
        {SITE.totalProjects}{" "}
        <span className="accent">Backend Projects</span>
        <br />Built in Public
      </h1>

      <p className="welcome-sub">{SITE.description}</p>

      <div className="stat-bar">
        <div className="stat-cell">
          <div className="stat-num">{SITE.totalProjects}</div>
          <div className="stat-label">projects</div>
        </div>
        <div className="stat-cell">
          <div className="stat-num">{totalCategories}</div>
          <div className="stat-label">categories</div>
        </div>
        <div className="stat-cell">
          <div className="stat-num">{totalTechs}</div>
          <div className="stat-label">stacks</div>
        </div>
        {stats && (
          <div className="stat-cell">
            <div className="stat-num">{stats.stars}</div>
            <div className="stat-label">stars</div>
          </div>
        )}
      </div>

      <p className="welcome-hint">
        <span className="welcome-hint-arrow">←</span>
        Select a project from the sidebar to explore it
      </p>
    </div>
  );
}