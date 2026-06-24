import { SITE } from "../../constants";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-left">
          Built by{" "}
          <a href={SITE.repoUrl} target="_blank" rel="noopener noreferrer">
            {SITE.author}
          </a>{" "}
          · {SITE.totalProjects} real-world backend projects
        </div>
        <div className="footer-right">
          <a href={SITE.repoUrl} target="_blank" rel="noopener noreferrer">
            GitHub Repo
          </a>
          <a href="#projects">Browse All</a>
        </div>
      </div>
    </footer>
  );
}
