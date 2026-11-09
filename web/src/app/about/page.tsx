import Link from "next/link";

const TEAM = [
  {
    name: "Md. Shahriar Hossain Srabon",
    id: "0432310005101056",
    section: "53/B1",
  },
  {
    name: "Lubna Jahan Lipa",
    id: "0432310005101088",
    section: "53/B2",
  },
  {
    name: "Tamanna Khokon",
    id: "0432310005101082",
    section: "53/B2",
  },
];

export default function AboutPage() {
  return (
    <main>
      <div className="container">
        <div className="page-head">
          <h1 className="display">A teaching project, not a product</h1>
          <p className="lead">
            TicTacLearn exists so that a visitor can feel the difference between a model that
            underfits, one that memorises, and one that generalises, in about two minutes of
            play.
          </p>
        </div>

        <section className="section section--tight" aria-labelledby="what-title">
          <div className="procedure">
            <div className="procedure-copy">
              <h2 id="what-title" className="statement">
                One notebook. Three models. One small site.
              </h2>
              <p>
                The notebook generates every board, trains the three convolutional networks and
                exports the weights, histories and plots. This site reads those exports. It has
                no backend and keeps no scores.
              </p>
            </div>
            <ol className="procedure-steps">
              <li>
                <div>
                  <h3>The notebook is the source of truth</h3>
                  <p>
                    It runs top to bottom in Colab, saves its outputs, and writes a portable
                    weight file for each model.
                  </p>
                </div>
              </li>
              <li>
                <div>
                  <h3>The browser runs the same forward pass</h3>
                  <p>
                    Inference is a hand-written JavaScript implementation of the exported
                    weights. Twenty boards per model are checked against Python, and the test
                    suite fails if the numbers drift.
                  </p>
                </div>
              </li>
              <li>
                <div>
                  <h3>The fallback is stated, not hidden</h3>
                  <p>
                    TensorFlow.js conversion is attempted during export. When the converter
                    cannot read the installed Keras version, the notebook writes{" "}
                    <code>weights.json</code> and records that choice in{" "}
                    <code>export_status.json</code>.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section className="section section--tight" aria-labelledby="team-title">
          <div className="section-head">
            <h2 id="team-title">The team</h2>
            <p className="section-note">
              Department of Computer Science and Engineering, University of Information
              Technology and Sciences.
            </p>
          </div>
          <div className="team-list">
            {TEAM.map((person) => (
              <div className="team-row" key={person.id}>
                <h2>{person.name}</h2>
                <span className="team-id">{person.id}</span>
                <span className="team-section">Section {person.section}</span>
                <span className="team-role">UITS CSE</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section section--tight" aria-labelledby="limits-title">
          <div className="section-head">
            <h2 id="limits-title">What this site does not claim</h2>
            <p className="section-note">
              Limits are part of the lesson, so they are written down.
            </p>
          </div>
          <div className="note-block">
            <p>
              The network is not perfect. The Steady model draws every evaluated game against
              perfect play but does not win one, and its accuracy on held-out boards is below
              100%. The Beginner and the Memorizer are meant to fail in specific ways; those
              failures are the demonstration.
            </p>
            <p>
              The post-mask accuracy is generous because the engine discards occupied cells
              before choosing. The top-choice score, which requires a legal and optimal first
              answer, is the primary number on the Compare and Teacher pages.
            </p>
          </div>
          <p style={{ marginTop: "var(--space-lg)" }}>
            <Link className="text-link" href="/compare">
              See the measurements
            </Link>{" "}
            or{" "}
            <Link className="text-link" href="/teacher">
              read the acceptance report
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
