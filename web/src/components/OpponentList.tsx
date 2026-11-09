'use client';

import Link from 'next/link';
import { LEVELS } from '@/lib/levels';
import { percent, useArtifacts } from '@/lib/useArtifacts';

export function OpponentList() {
  const { data } = useArtifacts();

  return (
    <div className="level-list">
      {LEVELS.map((level) => (
        <div className="level-row" key={level.id}>
          <h3>{level.name}</h3>
          <p className="level-analogy">
            <span className="label" style={{ display: 'block', marginBottom: 4 }}>
              {level.role}
            </span>
            {level.analogy}
          </p>
          <div className="level-figures">
            <div className="level-figure">
              <strong>{data ? percent(data.metrics[level.id].test_acc) : '…'}</strong>
              <span>test boards</span>
            </div>
            <div className="level-figure">
              <strong>
                {data ? data.metrics[level.id].params.toLocaleString('en-US') : '…'}
              </strong>
              <span>parameters</span>
            </div>
          </div>
          <Link className="text-link level-action" href={`/play?level=${level.id}`}>
            Play {level.name.toLowerCase()}
          </Link>
        </div>
      ))}
    </div>
  );
}
