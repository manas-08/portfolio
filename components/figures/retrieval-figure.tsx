'use client';

import {AnimatePresence, motion} from 'framer-motion';
import {Fragment, useEffect, useState} from 'react';
import {Caption} from '../paper';

type StageId =
  | 'query' | 'bm25' | 'dense' | 'clip' | 'rerank' | 'gate' | 'answer'
  | 'abstain';

interface Stage {
  id: StageId;
  label: string;
  sub: string;
}

const COLUMNS: Stage[][] = [
  [{id: 'query', label: 'query', sub: 'user question'}],
  [
    {id: 'bm25', label: 'BM25', sub: 'w = 0.4'},
    {id: 'dense', label: 'MiniLM', sub: 'dense · w = 0.6'},
    {id: 'clip', label: 'CLIP', sub: 'ViT-B/32 · figures'},
  ],
  [{id: 'rerank', label: 'rerank', sub: 'cross-encoder · top 20'}],
  [{id: 'gate', label: 'evidence ≥ τ ?', sub: 'abstention gate'}],
  [
    {id: 'answer', label: 'answer', sub: 'streamed + cited'},
    {id: 'abstain', label: 'abstain', sub: '“not in the index”'},
  ],
];

interface Trace {
  question: string;
  path: StageId[];
  output: string;
  abstained?: boolean;
}

const TRACES: Trace[] = [
  {
    question: 'How does Swin restrict self-attention?',
    path: ['query', 'bm25', 'dense', 'rerank', 'gate', 'answer'],
    output: 'It computes self-attention locally within non-overlapping ' +
      'windows, and shifts the window partition between consecutive layers ' +
      'so information flows across windows [Swin, §3.2].',
  },
  {
    question: 'Show me the architecture diagram.',
    path: ['query', 'clip', 'rerank', 'gate', 'answer'],
    output: 'Matched an image region via CLIP: the Swin-T architecture ' +
      'figure [Swin, Fig. 3]. Two visually similar figures from other ' +
      'papers are available for comparison.',
  },
  {
    question: 'What did training Swin cost in dollars?',
    path: ['query', 'bm25', 'dense', 'rerank', 'gate', 'abstain'],
    output: 'None of the indexed documents state a training cost. I would ' +
      'rather not guess.',
    abstained: true,
  },
];

const STEP_MS = 420;

/** Figure 2: a clickable, simulated trace through the RAG pipeline. */
export function RetrievalFigure() {
  const [traceIndex, setTraceIndex] = useState(0);
  const [step, setStep] = useState(0);
  const trace = TRACES[traceIndex];
  const done = step >= trace.path.length;

  useEffect(() => {
    if (done) return;
    const timer = setTimeout(() => setStep((s) => s + 1), STEP_MS);
    return () => clearTimeout(timer);
  }, [step, done]);

  const run = (index: number) => {
    setTraceIndex(index);
    setStep(0);
  };

  const stateOf = (id: StageId): 'active' | 'visited' | 'idle' => {
    const position = trace.path.indexOf(id);
    if (position === -1 || position > step) return 'idle';
    return position === step ? 'active' : 'visited';
  };

  return (
    <figure className="my-10">
      <div className="border border-rule bg-paper-2/40 p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap gap-2">
          {TRACES.map((t, i) => (
            <button
              key={t.question}
              type="button"
              onClick={() => run(i)}
              className={`border px-3 py-1.5 text-left font-mono text-xs
                transition-colors ${i === traceIndex ?
                  'border-ink bg-ink text-paper' :
                  'border-rule text-muted hover:border-ink hover:text-ink'}`}
            >
              › {t.question}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-stretch gap-2 md:flex-row
          md:items-center">
          {COLUMNS.map((column, ci) => (
            <Fragment key={ci}>
              {ci > 0 && (
                <span className="self-center font-mono text-muted" aria-hidden>
                  <span className="md:hidden">↓</span>
                  <span className="hidden md:inline">→</span>
                </span>
              )}
              <div className="flex flex-1 flex-row gap-2 md:flex-col">
                {column.map((stage) => (
                  <StageBox key={stage.id} stage={stage} state={stateOf(stage.id)} />
                ))}
              </div>
            </Fragment>
          ))}
        </div>

        <div className="mt-6 min-h-24 border-t border-dashed border-rule pt-4">
          <p className="mb-1 font-mono text-[10px] uppercase tracking-wider
            text-muted">output</p>
          <AnimatePresence mode="wait">
            {done ? (
              <motion.p
                key={traceIndex}
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                className={`text-lg leading-snug ${trace.abstained ?
                  'italic text-muted' : ''}`}
              >
                {trace.output.split(' ').map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{delay: i * 0.03}}
                  >
                    {word}{' '}
                  </motion.span>
                ))}
              </motion.p>
            ) : (
              <motion.p key="thinking" className="font-mono text-sm text-muted"
                animate={{opacity: [0.3, 1, 0.3]}}
                transition={{repeat: Infinity, duration: 1.2}}>
                retrieving…
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Caption label="Figure 2.">
        The retrieval pipeline of §2.1 as a clickable trace. Pick a question to
        follow it through hybrid lexical and dense retrieval, multimodal CLIP
        search, cross-encoder reranking and the abstention gate. The trace is
        simulated over an illustrative corpus; the architecture is the real
        one.
      </Caption>
    </figure>
  );
}

function StageBox({stage, state}: {
  stage: Stage;
  state: 'active' | 'visited' | 'idle';
}) {
  const styles = {
    active: 'border-accent bg-accent/10 text-ink',
    visited: 'border-ink text-ink',
    idle: 'border-rule text-muted',
  }[state];
  return (
    <div className={`flex-1 border px-3 py-2 transition-all duration-300
      ${styles}`}>
      <div className="font-mono text-xs">{stage.label}</div>
      <div className="font-mono text-[10px] opacity-70">{stage.sub}</div>
    </div>
  );
}
