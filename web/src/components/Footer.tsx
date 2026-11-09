import Link from "next/link";
import { Wordmark } from "./Wordmark";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="brand">
              <Wordmark />
              <span>TicTacLearn</span>
            </Link>
            <p>
              A convolutional network project for the Department of Computer Science and
              Engineering, University of Information Technology and Sciences.
            </p>
          </div>

          <div>
            <h2 className="footer-heading">Play</h2>
            <Link className="footer-link" href="/play">
              Beginner network
            </Link>
            <Link className="footer-link" href="/play?level=overfit">
              Memorizer network
            </Link>
            <Link className="footer-link" href="/play?level=stable">
              Steady network
            </Link>
          </div>

          <div>
            <h2 className="footer-heading">Read</h2>
            <Link className="footer-link" href="/learn">
              How the models learn
            </Link>
            <Link className="footer-link" href="/compare">
              Measurements
            </Link>
            <Link className="footer-link" href="/teacher">
              For the course
            </Link>
          </div>

          <div>
            <h2 className="footer-heading">Project</h2>
            <Link className="footer-link" href="/about">
              Team
            </Link>
            <a
              className="footer-link"
              href="https://github.com/Srabon-bot/cnn-tictactoe-playground"
              rel="noreferrer"
            >
              Source on GitHub
            </a>
            <a className="footer-link" href="/artifacts/artifacts.zip">
              Artifacts
            </a>
          </div>
        </div>

        <div className="footer-foot">
          <span>University of Information Technology and Sciences, Dhaka</span>
          <span>Built with TensorFlow, Keras and a hand-written browser engine</span>
        </div>
      </div>
    </footer>
  );
}
