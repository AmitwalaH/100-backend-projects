import { SITE } from "../../constants";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-prompt">
          <span className="dim">~/{SITE.author.toLowerCase()}</span>
          <span className="dim"> ❯ </span>
          <a href={SITE.repoUrl} target="_blank" rel="noopener noreferrer">
            {SITE.author}
          </a>
          <span className="footer-prompt-text">
            {" "}
            · {SITE.totalProjects} real-world backend projects · Open Source
          </span>
          <span className="terminal-cursor footer-cursor" aria-hidden="true" />
        </div>
        <div className="footer-right">
          <a href={SITE.repoUrl} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a
            href={`${SITE.repoUrl}#readme`}
            target="_blank"
            rel="noopener noreferrer"
          >
            README
          </a>
        </div>
      </div>
    </footer>
  );
}
