'use client';

import {useInView} from 'framer-motion';
import {Fragment, useEffect, useRef, useState} from 'react';
import {Caption} from '../paper';

const TASKS = [
  {id: 'extract', sub: 'Open-Meteo · 5 cities'},
  {id: 'transform', sub: 'UTC-normalize · 5 TZ'},
  {id: 'load', sub: 'PostgreSQL'},
  {id: 'validate', sub: '−50 ≤ T ≤ 60 °C'},
  {id: 'summarize', sub: 'Grafana · 5 panels'},
];

const TICK_MS = 900;
/** One run in three hits a transient failure to show the retry policy. */
const FLAKY_EVERY = 3;

/** Figure 4: an animated Airflow DAG run with simulated retries. */
export function DagFigure() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {margin: '-80px'});
  const [run, setRun] = useState(1);
  const [tick, setTick] = useState(0);

  const flaky = run % FLAKY_EVERY === 0;
  // A flaky run spends two extra ticks failing and retrying on "extract".
  const offset = flaky ? 2 : 0;
  const taskIndex = Math.max(0, tick - offset);
  const totalTicks = TASKS.length + offset + 2;

  useEffect(() => {
    if (!inView) return;
    const timer = setInterval(() => {
      setTick((t) => {
        if (t + 1 >= totalTicks) {
          setRun((r) => r + 1);
          return 0;
        }
        return t + 1;
      });
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [inView, totalTicks]);

  const status = (i: number): 'done' | 'running' | 'failed' | 'queued' => {
    if (flaky && i === 0 && tick === 0) return 'failed';
    if (flaky && i === 0 && tick === 1) return 'running';
    if (tick < offset) return 'queued';
    if (i < taskIndex) return 'done';
    if (i === taskIndex) return 'running';
    return 'queued';
  };

  const hour = String((run + 9) % 24).padStart(2, '0');
  const finished = taskIndex >= TASKS.length;

  return (
    <figure className="my-10" ref={ref}>
      <div className="border border-rule bg-paper-2/40 p-4 font-mono sm:p-6">
        <div className="mb-5 flex flex-wrap justify-between gap-2 text-[11px]
          text-muted">
          <span>dag_id = weather_etl · schedule = @hourly</span>
          <span>run #{String(run).padStart(4, '0')} · {hour}:00Z</span>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-stretch">
          {TASKS.map((task, i) => {
            const s = status(i);
            return (
              <Fragment key={task.id}>
                {i > 0 && (
                  <span className={`self-center transition-colors ${
                    status(i - 1) === 'done' ? 'text-ink' : 'text-rule'}`}
                  aria-hidden>
                    <span className="md:hidden">↓</span>
                    <span className="hidden md:inline">→</span>
                  </span>
                )}
                <div className={`relative flex-1 border px-3 py-2
                  transition-all duration-300 ${{
                    done: 'border-edema text-ink',
                    running: 'border-accent bg-accent/10 text-ink',
                    failed: 'border-accent text-accent',
                    queued: 'border-rule text-muted',
                  }[s]}`}>
                  <div className="flex items-center justify-between text-xs">
                    {task.id}
                    <StatusDot status={s} />
                  </div>
                  <div className="text-[10px] opacity-70">{task.sub}</div>
                  {flaky && i === 0 && tick <= 1 && (
                    <div className="absolute -top-3 right-2 bg-paper px-1
                      text-[10px] text-accent">
                      {tick === 0 ? 'HTTP 503' : 'retry 1/3 · +5 min'}
                    </div>
                  )}
                </div>
              </Fragment>
            );
          })}
        </div>

        <div className="mt-5 flex justify-between text-[11px] text-muted">
          <span>retries = 3 · retry_delay = 5 min</span>
          <span className={finished ? 'text-edema' : ''}>
            {finished ? '✓ success · 5 rows upserted' : 'running…'}
          </span>
        </div>
      </div>
      <Caption label="Figure 4.">
        One hour in the life of the §2.3 pipeline. Every third run, the
        simulation fails the extract step so you can watch the retry policy
        recover without a human.
      </Caption>
    </figure>
  );
}

function StatusDot({status}: {status: 'done' | 'running' | 'failed' | 'queued'}) {
  const color = {
    done: 'bg-edema',
    running: 'bg-accent animate-pulse',
    failed: 'bg-accent',
    queued: 'bg-rule',
  }[status];
  return <span className={`inline-block size-2 rounded-full ${color}`} />;
}
