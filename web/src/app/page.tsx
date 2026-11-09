import Link from "next/link";
import { HeroInstrument } from "@/components/HeroInstrument";
import { OpponentList } from "@/components/OpponentList";

export default function HomePage() {
  return (
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-shade" aria-hidden="true" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <h1 id="hero-title" className="display">
              Three minds, one board.
            </h1>
            <p className="lead">
              Play tic-tac-toe against three convolutional networks: one that underfit, one that
              memorised sixty boards, and one that learned the game. Open any move and see the
              nine scores behind it.
            </p>
            <div className="hero-actions">
              <Link href="/play" className="btn btn--primary">
                Take a turn
              </Link>
              <Link href="/compare" className="btn btn--secondary">
                See the measurements
              </Link>
            </div>
          </div>
          <HeroInstrument />
        </div>
      </section>

      <section className="section" aria-labelledby="opponents-title">
        <div className="container">
          <div className="section-head">
            <h2 id="opponents-title">Pick an opponent</h2>
            <p className="section-note">
              Same rules, same board, three different amounts of learning. The figures come
              from the final notebook run.
            </p>
          </div>
          <OpponentList />
        </div>
      </section>

      <section className="section section--band" aria-labelledby="report-title">
        <div className="container">
          <div className="procedure">
            <div className="procedure-copy">
              <h2 id="report-title" className="statement">
                A game is a short lesson.
              </h2>
              <p>
                The board is ordinary tic-tac-toe. What changes is that every network move is
                recorded, scored and explained in plain language when the game ends.
              </p>
            </div>
            <ol className="procedure-steps">
              <li>
                <div>
                  <h3>You move first as X</h3>
                  <p>Or take O and watch the network open. X always starts.</p>
                </div>
              </li>
              <li>
                <div>
                  <h3>The network scores all nine cells</h3>
                  <p>
                    The highest legal score is the move. The heat map shows the rest of its
                    answer, not a story written afterwards.
                  </p>
                </div>
              </li>
              <li>
                <div>
                  <h3>The report names what it missed</h3>
                  <p>
                    A win it could have taken, a block it walked past, or a square it wanted
                    that was already occupied.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="read-title">
        <div className="container">
          <div className="section-head">
            <h2 id="read-title">Read the working</h2>
            <p className="section-note">
              The site is the demonstration. The notebook is the evidence.
            </p>
          </div>
          <div className="destination-list">
            <Link className="destination" href="/learn">
              <span className="destination-title">Learn the ideas</span>
              <p>Filters, loss, underfitting, overfitting and why symmetry splits matter.</p>
              <span className="destination-go">Start reading</span>
            </Link>
            <Link className="destination" href="/compare">
              <span className="destination-title">Compare the three</span>
              <p>Accuracy, training curves, game records and the same board read three ways.</p>
              <span className="destination-go">Open the figures</span>
            </Link>
            <Link className="destination" href="/teacher">
              <span className="destination-title">For the course</span>
              <p>Concept map, acceptance checks, notebook and artifact downloads.</p>
              <span className="destination-go">Teacher view</span>
            </Link>
            <Link className="destination" href="/about">
              <span className="destination-title">Meet the team</span>
              <p>Who built it, and what each person did.</p>
              <span className="destination-go">About the project</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--ink" aria-labelledby="closing-title">
        <div className="container">
          <div className="closing">
            <h2 id="closing-title" className="statement">
              No account. No score kept. Just the board.
            </h2>
            <Link href="/play" className="btn btn--primary">
              Play the steady network
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
