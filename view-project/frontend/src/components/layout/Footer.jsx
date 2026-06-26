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
          · {SITE.totalProjects} real-world backend projects · Open Source
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
