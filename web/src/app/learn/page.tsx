import Link from "next/link";

const KERNEL_CELLS = Array.from({ length: 25 }, (_, index) => {
  const row = Math.floor(index / 5);
  const column = index % 5;
  const inKernel = row >= 1 && row <= 3 && column >= 1 && column <= 3;
  const mark = index === 6 ? "x" : index === 18 ? "o" : undefined;
  return { index, inKernel, mark };
});

export default function LearnPage() {
  return (
    <main>
      <div className="container">
        <div className="page-head">
          <h1 className="display">The ideas behind the board</h1>
          <p className="lead">
            Six short explanations, each tied to something the models actually did. No maths
            beyond what the figures already show.
          </p>
        </div>

        <div className="learn-layout" style={{ paddingBlock: "var(--space-2xl)" }}>
          <nav className="learn-index" aria-label="On this page">
            <h2>On this page</h2>
            <a href="#input">The board as an input</a>
            <a href="#filter">What a filter sees</a>
            <a href="#loss">Loss, and what it punishes</a>
            <a href="#underfit">Underfitting</a>
            <a href="#overfit">Overfitting</a>
            <a href="#steady">Regularisation and symmetry</a>
            <a href="#split">Why the split is by symmetry</a>
            <a href="#report">Reading a match report</a>
          </nav>

          <div className="learn-body">
            <section className="learn-section" id="input">
              <h2>The board is the input</h2>
              <p>
                The network never sees a rule book. It sees nine cells, each marked as ours,
                theirs or empty. The board is rotated so the network always plays from the
                mover&apos;s point of view, and the output is nine scores that sum to one.
              </p>
              <p className="analogy">
                Like reading a position from the side of the player whose turn it is.
              </p>
            </section>

            <section className="learn-section" id="filter">
              <h2>What a filter sees</h2>
              <p>
                A filter is a small grid of learnable numbers that slides across the board and
                fires when it recognises a local shape: two marks in a row, a corner pair, an
                open line. The Beginner network has two filters. The Steady network has 32 then
                64, so it can hold several shapes at once.
              </p>
              <figure className="concept-figure">
                <div className="kernel-diagram" aria-hidden="true">
                  {KERNEL_CELLS.map((cell) => (
                    <span
                      key={cell.index}
                      data-kernel={cell.inKernel ? "true" : undefined}
                      data-mark={cell.mark}
                    />
                  ))}
                </div>
                <figcaption>
                  A 3×3 filter reading a 5×5 board. One position, one local pattern.
                </figcaption>
              </figure>
            </section>

            <section className="learn-section" id="loss">
              <h2>Loss, and what it punishes</h2>
              <p>
                At each board, minimax can mark several moves as equally good. The target is a
                flat distribution over those moves, and cross-entropy loss measures how far the
                network&apos;s nine scores sit from it. A confident wrong answer costs more than
                an unsure right one.
              </p>
              <p className="analogy">
                A marked exam that cares about the size of the mistake, not just the count.
              </p>
            </section>

            <section className="learn-section" id="underfit">
              <h2>Underfitting: the Beginner</h2>
              <p>
                Two filters, three passes over the data, a very small learning rate. The result
                is a model that has barely moved from guessing. It scores occupied squares,
                misses immediate wins, and loses games a careful player would draw.
              </p>
              <p>
                On the honest top-choice measure, where the cell it ranks first must be empty
                and optimal, it scores around a fifth of boards. On the post-mask measure, where
                the engine discards occupied cells first, it looks much better than it is. Both
                numbers are published side by side.
              </p>
              <p className="analogy">
                A student who skimmed the chapter and hopes the questions are familiar.
              </p>
            </section>

            <section className="learn-section" id="overfit">
              <h2>Overfitting: the Memorizer</h2>
              <p>
                The Memorizer has room to spare but only sixty practice boards. It learns those
                boards perfectly, every one, every time, and then meets validation boards it
                has never seen. Its train score is 100%; its validation score is around half
                that. Move one mark and the confidence collapses.
              </p>
              <p className="analogy">
                A student who memorised last year&apos;s answers and nothing else.
              </p>
            </section>

            <section className="learn-section" id="steady">
              <h2>Regularisation and symmetry</h2>
              <p>
                The Steady model trains on the whole split with two convolutions, dropout and
                early stopping. At play time it averages its answer over all eight rotations
                and mirrors of the board, then takes a forced win or the one forced block when
                either exists. The guards only choose moves the rules already prove correct.
              </p>
              <p className="analogy">
                A player who has seen the same position from every side of the table.
              </p>
            </section>

            <section className="learn-section" id="split">
              <h2>Why the split is by symmetry</h2>
              <p>
                Tic-tac-toe has eight symmetries. If a rotated copy of a training board landed
                in the test set, the test score would be inflated by memory rather than
                learning. The notebook groups all 4,520 reachable positions into 627 canonical
                groups, then splits by group, so no test board is a rotation of a practice
                board.
              </p>
            </section>

            <section className="learn-section" id="report">
              <h2>Reading a match report</h2>
              <p>
                After a game, the report separates three mistakes. A missed win is a turn where
                the network could have finished the game and did not. A missed block is a turn
                where you had exactly one winning cell and it did not take it. An occupied
                square is a cell it scored highest even though a mark was already there; the
                engine masked that cell so the game could continue.
              </p>
              <p>
                <Link className="text-link" href="/play">
                  Play a game
                </Link>{" "}
                and open a move to see the nine scores it started from.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
