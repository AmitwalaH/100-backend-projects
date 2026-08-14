import { SITE } from "../../constants";
import { useGithubStats } from "../../hooks/useGithubStats";
import projectsData from "../../../../../project-manifest.json";

const totalCategories = new Set(projectsData.map((p) => p.category)).size;
const totalTechs = new Set(projectsData.flatMap((p) => p.tech)).size;

// Belt-and-braces: inline styles here beat any class-based override no
// matter what's causing it, so the numbers are guaranteed visible. If
// they're STILL blank after this, the problem is the data, not the CSS.
const numStyle = {
  fontFamily: "var(--mono)",
  fontSize: "1.75rem",
  fontWeight: 700,
  color: "var(--fg)",
  lineHeight: 1,
};
const labelStyle = {
  fontFamily: "var(--mono)",
  fontSize: "0.65rem",
  color: "var(--dim)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginTop: "8px",
};

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
        {SITE.totalProjects} <span className="accent">Backend Projects</span>
        <br />
        Built in Public
        <span
          className="terminal-cursor welcome-title-cursor"
          aria-hidden="true"
        />
      </h1>

      <p className="welcome-sub">{SITE.description}</p>

      <div className="section-eyebrow">by_the_numbers</div>
      <div className="stat-bar">
        <div className="stat-cell">
          <div className="stat-num" style={numStyle}>
            {SITE.totalProjects}
          </div>
          <div className="stat-label" style={labelStyle}>
            projects
          </div>
        </div>
        <div className="stat-cell">
          <div className="stat-num" style={numStyle}>
            {totalCategories}
          </div>
          <div className="stat-label" style={labelStyle}>
            categories
          </div>
        </div>
        <div className="stat-cell">
          <div className="stat-num" style={numStyle}>
            {totalTechs}
          </div>
          <div className="stat-label" style={labelStyle}>
            stacks
          </div>
        </div>
        {stats && (
          <div className="stat-cell">
            <div className="stat-num" style={numStyle}>
              {stats.stars}
            </div>
            <div className="stat-label" style={labelStyle}>
              stars
            </div>
          </div>
        )}
      </div>

      <p className="welcome-hint">
        Press <span className="welcome-hint-kbd">⌘K</span> to browse or search
        projects
      </p>
    </div>
  );
}
