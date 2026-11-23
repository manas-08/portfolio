import type {ReactNode} from 'react';
import BrainFigure from '@/components/brain/brain-figure';
import {DagFigure} from '@/components/figures/dag-figure';
import {GradCamFigure} from '@/components/figures/gradcam-figure';
import {RetrievalFigure} from '@/components/figures/retrieval-figure';
import {Masthead} from '@/components/masthead';
import {
  Caption,
  Cite,
  formatMonth,
  Marginalia,
  type Reference,
  Section,
  Subsection,
} from '@/components/paper';
import {Reveal} from '@/components/reveal';
import {type RailItem, SectionRail} from '@/components/section-rail';
import {
  type Project,
  profile,
  projects,
  sideProjects,
  skills,
  timeline,
} from '@/lib/content';
import {getGithubSnapshot, getWordOfTheDay, type GithubSnapshot} from '@/lib/github';

export const revalidate = 86400;

/** Inline arrow; the Unicode glyph falls back to an emoji in some fonts. */
function Arrow() {
  return (
    <svg viewBox="0 0 12 12" className="inline-block size-[0.7em] align-baseline"
      fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M3 9L9 3M4 3h5v5" />
    </svg>
  );
}

const RAIL: RailItem[] = [
  {id: 'abstract', number: '0', label: 'Abstract'},
  {id: 'introduction', number: '1', label: 'Introduction'},
  {id: 'experiments', number: '2', label: 'Experiments'},
  {id: 'further', number: '3', label: 'Further work'},
  {id: 'methods', number: '4', label: 'Methods'},
  {id: 'appointments', number: '5', label: 'Appointments'},
  {id: 'conclusion', number: '6', label: 'Conclusion'},
  {id: 'references', number: '§', label: 'References'},
];

/** GitHub's own language colors, so the chart reads as "GitHub data". */
const LANGUAGE_COLORS: Record<string, string> = {
  'Python': '#3572A5',
  'Jupyter Notebook': '#DA5B0B',
  'Java': '#b07219',
  'HTML': '#e34c26',
  'Rust': '#dea584',
  'TypeScript': '#3178c6',
  'JavaScript': '#f1e05a',
};

function buildReferences(github: GithubSnapshot): Reference[] {
  const entries = [
    ...projects.map((p) => ({repo: p.repo, title: p.title})),
    ...sideProjects.map((p) => ({repo: p.repo, title: p.title})),
  ];
  return entries.map(({repo, title}, i) => {
    const live = github.byName[repo];
    return {
      n: i + 1,
      title,
      url: live?.url ?? `${profile.github}/${repo}`,
      description: live?.description ?? null,
      language: live?.language ?? null,
      stars: live ? live.stars : null,
      updatedAt: live?.updatedAt ?? null,
    };
  });
}

export default async function Home() {
  const [github, word] = await Promise.all([
    getGithubSnapshot(),
    getWordOfTheDay(),
  ]);
  const refs = buildReferences(github);
  const refFor = (repo: string) =>
    refs[[...projects, ...sideProjects].findIndex((p) => p.repo === repo)];
  const today = new Date();
  const version = today.toISOString().slice(0, 10).replaceAll('-', '.');

  return (
    <>
      <Masthead word={word} version={version} />
      <SectionRail items={RAIL} />

      <main className="mx-auto max-w-[1120px] px-5 pb-24 sm:px-8 lg:pr-[19rem]">
        <div className="relative">
          <TitleBlock />

          <Reveal delay={0.2}>
            <BrainFigure />
          </Reveal>

          <Abstract />

          <Section id="introduction" number="1" title="Introduction">
            <div className="prose-paper relative space-y-5">
              <Marginalia className="lg:top-0">
                yes, the whole site is typeset like a paper. old habits.
              </Marginalia>
              <p className="drop-cap">
                Most machine-learning demos are confident. Far fewer are
                accountable. This page argues that the interesting part of an
                AI system is not that it produces an answer, but that it can
                show you <em>why</em>, and that it knows when to stay quiet.
              </p>
              <p>
                I’m Manas, a B.Tech student in Artificial Intelligence and
                Machine Learning at Shri Ramdeobaba College of Engineering and
                Management (CGPA 9.21) and a GenC Programmer Analyst Intern in
                AI &amp; Analytics at Cognizant. I build retrieval systems,
                medical-imaging models and data pipelines, and I like each of
                them to come with receipts: page-level citations <Cite
                  reference={refFor('multi-doc-research-assistant')} />,
                attribution heatmaps <Cite reference={refFor(projects[1].repo)} />
                {' '}and validation checks <Cite reference={refFor(projects[2].repo)} />.
                If I had to compress my engineering taste into one line, it
                would be Eq. (1).
              </p>
            </div>
            <Equation />
            <div className="prose-paper relative">
              <Marginalia className="lg:-top-24">
                this one line is basically my personality
              </Marginalia>
              <p>
                Here <em>s</em> is a retrieval score, <em>𝒟<sub>k</sub></em>{' '}
                the top-<em>k</em> evidence and <em>τ</em> a confidence
                threshold. The rest of this document reports three experiments
                that follow the rule, a handful of smaller ones that bent it,
                and the methods used along the way.
              </p>
            </div>
          </Section>

          <Section id="experiments" number="2" title="Experiments">
            <p className="prose-paper mb-12 text-muted">
              Three principal projects, each reported with its setup, its
              results table and an interactive figure. Numbers are taken
              from the project write-ups and benchmarks.
            </p>
            <div className="space-y-24">
              <ExperimentBlock index={0} project={projects[0]}
                reference={refFor(projects[0].repo)} figure={<RetrievalFigure />} />
              <ExperimentBlock index={1} project={projects[1]}
                reference={refFor(projects[1].repo)} figure={<GradCamFigure />}
                note="Dice 0.998. I checked it twice. then a third time." />
              <ExperimentBlock index={2} project={projects[2]}
                reference={refFor(projects[2].repo)} figure={<DagFigure />} />
            </div>
          </Section>

          <Section id="further" number="3" title="Further Work">
            <p className="prose-paper mb-8">
              Not every experiment earns a figure. These smaller repositories
              cover serving models over HTTP, graph learning, automation and a
              new systems language. Metadata below is pulled live from GitHub
              and refreshed daily.
            </p>
            <SideProjects refs={refs} />
            <LanguageFigure github={github} />
          </Section>

          <Section id="methods" number="4" title="Methods">
            <p className="prose-paper mb-8">
              Table 4 lists the instruments used across the experiments above,
              annotated in red pen with where each one earned its place.
            </p>
            <Toolkit />
          </Section>

          <Section id="appointments" number="5" title="Appointments & Training">
            <Timeline />
          </Section>

          <Section id="conclusion" number="6" title="Conclusion">
            <Correspondence />
          </Section>

          <References refs={refs} />
          <Colophon />
        </div>
      </main>
    </>
  );
}

function TitleBlock() {
  return (
    <header className="pb-12 pt-16 text-center sm:pt-24">
      <Reveal>
        <h1 className="mx-auto mt-8 max-w-4xl font-display
          text-[clamp(2.75rem,8vw,6.25rem)] leading-[0.95] tracking-tight">
          On Building Machines
          <br />
          That <em className="text-accent">Show Their Work</em>
        </h1>
      </Reveal>
      <Reveal delay={0.05}>
        <p className="mt-8 text-xl">
          <span className="small-caps text-2xl">Manas Shende</span>
          <sup className="ml-0.5 font-mono text-xs text-accent">1,2</sup>
        </p>
        <p className="mt-2 text-sm italic text-muted">
          <sup className="font-mono not-italic text-accent">1</sup> Shri
          Ramdeobaba College of Engineering and Management, B.Tech AI &amp; ML
          <span className="mx-2">·</span>
          <sup className="font-mono not-italic text-accent">2</sup> Cognizant,
          AI &amp; Analytics
        </p>
        <p className="mt-1 font-mono text-xs text-muted">
          <a className="ink-link" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        </p>
      </Reveal>
    </header>
  );
}

function Abstract() {
  return (
    <Reveal>
      <section id="abstract" data-section
        className="mx-auto mt-16 max-w-2xl scroll-mt-24">
        <h2 className="mb-3 text-center font-mono text-xs uppercase
          tracking-[0.25em]">Abstract</h2>
        <p className="prose-paper text-[0.97em]">
          We present an AI/ML engineer who builds systems that explain
          themselves. Across three principal experiments (a retrieval-augmented
          research assistant that cites every claim and abstains when evidence
          is missing, a SwinUNet brain-tumor segmenter whose predictions are
          audited with Grad-CAM++, and a self-validating Apache Airflow
          pipeline) we observe a consistent bias toward verifiability.
          Results include a <strong>100% citation rate</strong>, <strong>Dice
          scores up to 0.998</strong> on BraTS and <strong>zero manual
          interventions</strong> in hourly production runs. We conclude that
          the subject is well suited to AI engineering roles, and is
          currently open to them.
        </p>
        <p className="mt-4 text-sm">
          <span className="font-semibold italic">Keywords:</span>{' '}
          <span className="text-muted">
            retrieval-augmented generation · multimodal retrieval · medical
            image segmentation · explainable AI · data engineering
          </span>
        </p>
      </section>
    </Reveal>
  );
}

function Equation() {
  return (
    <Reveal>
      <div className="my-10 flex items-center justify-center gap-4 overflow-x-auto
        py-2 font-display text-xl sm:text-2xl">
        <span className="whitespace-nowrap italic">ŷ(q) =</span>
        <span className="text-7xl font-light leading-none text-muted">{'{'}</span>
        <span className="grid grid-cols-[auto_auto] items-baseline gap-x-8
          gap-y-3 whitespace-nowrap">
          <span className="italic">generate(q, 𝒟<sub>k</sub>)</span>
          <span className="text-lg text-muted">
            if max<sub>d∈𝒟</sub> <em>s</em>(q, d) ≥ <em>τ</em>
          </span>
          <span>“I don’t know.”</span>
          <span className="text-lg text-muted">otherwise</span>
        </span>
        <span className="ml-auto hidden font-mono text-sm text-muted sm:inline">
          (1)
        </span>
      </div>
    </Reveal>
  );
}

function ExperimentBlock({index, project, reference, figure, note}: {
  index: number;
  project: Project;
  reference: Reference;
  figure: ReactNode;
  note?: string;
}) {
  return (
    <article id={`exp-${project.id}`} className="relative">
      <Reveal>
        <Subsection number={`2.${index + 1}`} title={project.title}
          aside={project.year} />
        {note && <Marginalia className="lg:top-14">{note}</Marginalia>}
        <p className="prose-paper text-xl leading-relaxed">
          {project.summary} <Cite reference={reference} />
        </p>
        <ul className="mt-5 space-y-2">
          {project.points.map((point) => (
            <li key={point} className="flex gap-3">
              <span className="mt-[0.55em] h-px w-4 shrink-0 bg-accent" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal>{figure}</Reveal>

      <Reveal>
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto]">
          <figure>
            <div className="overflow-x-auto">
              <table className="booktabs w-full text-[0.95em]">
                <thead>
                  <tr className="font-mono text-[11px] uppercase tracking-wider">
                    <th>Measure</th>
                    <th className="text-right!">Result</th>
                    <th className="hidden sm:table-cell">Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {project.metrics.map((m) => (
                    <tr key={m.label} className="border-b border-rule/60">
                      <td>{m.label}</td>
                      <td className="text-right! font-mono font-semibold
                        text-accent">{m.value}</td>
                      <td className="hidden text-sm text-muted sm:table-cell">
                        {m.note ?? '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Caption label={`Table ${index + 1}.`}>
              Reported results for the experiment in §2.{index + 1}.
            </Caption>
          </figure>
          <div className="md:w-48">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wider
              text-muted">apparatus</p>
            <ul className="flex flex-wrap gap-1.5">
              {project.stack.map((s) => (
                <li key={s} className="border border-rule px-2 py-0.5
                  font-mono text-[11px]">{s}</li>
              ))}
            </ul>
            <a href={reference.url} target="_blank" rel="noreferrer"
              className="ink-link mt-4 inline-block font-mono text-xs">
              read the source <Arrow />
            </a>
          </div>
        </div>
      </Reveal>
    </article>
  );
}

function SideProjects({refs}: {refs: Reference[]}) {
  const offset = projects.length;
  return (
    <ol className="divide-y divide-rule border-y border-rule">
      {sideProjects.map((p, i) => {
        const ref = refs[offset + i];
        return (
          <li key={p.repo}>
            <a href={p.href ?? ref.url} target="_blank" rel="noreferrer"
              className="group grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3
                py-5 transition-colors hover:bg-paper-2/60 sm:grid-cols-[3rem_minmax(0,1fr)_9rem]">
              <span className="pl-2 font-mono text-xs text-blue">
                [{ref.n}]
              </span>
              <span>
                <span className="font-display text-2xl leading-tight
                  group-hover:text-accent">
                  {p.title}
                  <span className="ml-2 inline-block text-base opacity-0
                    transition-all group-hover:translate-x-1
                    group-hover:opacity-100"><Arrow /></span>
                </span>
                <span className="mt-1 block text-[0.95em] text-muted">
                  {p.blurb}
                </span>
              </span>
              <span className="col-start-2 mt-2 font-mono text-[11px]
                text-muted sm:col-start-3 sm:mt-1 sm:pr-2 sm:text-right">
                {ref.language ?? '-'}
                {ref.updatedAt && (
                  <span className="block">{formatMonth(ref.updatedAt)}</span>
                )}
              </span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}

function LanguageFigure({github}: {github: GithubSnapshot}) {
  if (!github.fetched || github.languages.length === 0) return null;
  const total = github.languages.reduce((sum, l) => sum + l.count, 0);
  return (
    <Reveal>
      <figure className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex gap-10">
            <Stat value={github.publicRepos} label="public repositories" />
            <Stat value={github.originalRepos} label="original works" />
            <Stat value={github.languages.length} label="languages" />
          </div>
        </div>
        <div className="mt-6 flex h-3 w-full overflow-hidden">
          {github.languages.map((l) => (
            <span key={l.name} title={`${l.name}: ${l.count}`}
              style={{
                width: `${(l.count / total) * 100}%`,
                background: LANGUAGE_COLORS[l.name] ?? 'var(--muted)',
              }} />
          ))}
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono
          text-[11px] text-muted">
          {github.languages.map((l) => (
            <li key={l.name} className="flex items-center gap-1.5">
              <i className="inline-block size-2 rounded-full"
                style={{background: LANGUAGE_COLORS[l.name] ?? 'var(--muted)'}} />
              {l.name} <span className="text-ink">{l.count}</span>
            </li>
          ))}
        </ul>
        <Caption label="Figure 5.">
          Primary language across original (non-fork) repositories on{' '}
          <a className="ink-link" href={profile.github} target="_blank"
            rel="noreferrer">github.com/manas-08</a>, fetched from the GitHub
          API.
        </Caption>
      </figure>
    </Reveal>
  );
}

function Stat({value, label}: {value: number; label: string}) {
  return (
    <div>
      <div className="font-display text-5xl leading-none">{value}</div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-wider
        text-muted">{label}</div>
    </div>
  );
}

const SKILL_USAGE: Record<string, string> = {
  'Generative AI': 'hybrid retrieval and cited generation in §2.1',
  'Deep Learning': 'SwinUNet segmentation and Grad-CAM++ in §2.2',
  'Machine Learning': 'baselines, evaluation and the premium-prediction API',
  'AI Applications': 'semantic and multimodal search over PDFs',
  'Backend & Data': 'the Airflow DAG in §2.3 and FastAPI services',
  'Tooling': 'containerized stacks, dashboards and demos',
  'Languages': 'everything above, plus DSA practice',
  'Core CS': 'the foundations under all of it',
};

function Toolkit() {
  return (
    <Reveal>
      <figure>
        <div className="overflow-x-auto">
          <table className="booktabs w-full">
            <thead>
              <tr className="font-mono text-[11px] uppercase tracking-wider">
                <th className="w-44">Area</th>
                <th>Instruments</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((group) => (
                <tr key={group.area} className="group border-b border-rule/60
                  transition-colors hover:bg-paper-2/70">
                  <td className="font-display text-xl leading-tight">
                    {group.area}
                    <span className="mt-1 block font-hand text-base leading-tight
                      text-accent/60 transition-colors
                      group-hover:text-accent">
                      {SKILL_USAGE[group.area]}
                    </span>
                  </td>
                  <td>
                    <ul className="flex flex-wrap gap-x-1 gap-y-1">
                      {group.items.map((item, i) => (
                        <li key={item} className="text-[0.95em]">
                          {item}
                          {i < group.items.length - 1 && (
                            <span className="ml-1 text-rule">/</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Caption label="Table 4.">
          Methods and instruments, grouped by area.
        </Caption>
      </figure>
    </Reveal>
  );
}

function Timeline() {
  return (
    <ol className="relative border-l border-rule pl-8">
      {timeline.map((entry, i) => (
        <li key={entry.what} className="relative pb-10 last:pb-0">
          <Reveal delay={i * 0.05}>
            <span className={`absolute -left-[37px] top-2 size-2.5 rounded-full
              border border-ink ${i === 0 ? 'bg-accent' : 'bg-paper'}`} />
            <p className="font-mono text-[11px] uppercase tracking-wider
              text-muted">{entry.when}</p>
            <p className="mt-1 font-display text-2xl leading-tight">
              {entry.what}
            </p>
            <p className="italic">{entry.where}</p>
            <p className="mt-1 text-muted">{entry.detail}</p>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}

function Correspondence() {
  const links = [
    {label: 'GitHub', href: profile.github, sub: 'manas-08'},
    {label: 'LinkedIn', href: profile.linkedin, sub: 'manas-shende'},
    {label: 'Résumé', href: profile.resume, sub: 'PDF, 1 page'},
  ];
  return (
    <div className="relative">
      <Marginalia className="lg:top-0">
        reviewers are encouraged to reach out. I reply faster than arXiv.
      </Marginalia>
      <p className="prose-paper text-xl leading-relaxed">
        The evidence suggests the subject builds AI systems that are useful
        because they are honest about what they know. He is looking for AI
        engineering roles where that matters. Further experiments are ongoing,
        and collaboration is welcome.
      </p>
      <Reveal>
        <div className="mt-12 border-y-2 border-ink py-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em]
            text-muted">* Correspondence</p>
          <a href={`mailto:${profile.email}`}
            className="group mt-3 block break-all font-display
              text-[clamp(1.6rem,5.2vw,3.6rem)] leading-tight">
            <span className="bg-[linear-gradient(var(--accent),var(--accent))]
              bg-[length:0%_3px] bg-left-bottom bg-no-repeat transition-all
              duration-500 group-hover:bg-[length:100%_3px]">
              {profile.email}
            </span>
          </a>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {links.map((link) => (
              <a key={link.label} href={link.href} target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between border
                  border-ink px-4 py-3 transition-all hover:-translate-y-0.5
                  hover:shadow-[4px_4px_0_var(--accent)]">
                <span>
                  <span className="block font-display text-xl">{link.label}</span>
                  <span className="font-mono text-[11px] text-muted">
                    {link.sub}
                  </span>
                </span>
                <span className="transition-transform group-hover:translate-x-1
                  group-hover:-translate-y-1"><Arrow /></span>
              </a>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function References({refs}: {refs: Reference[]}) {
  return (
    <section id="references" data-section className="scroll-mt-24 pt-20">
      <h2 className="mb-6 font-display text-3xl">References</h2>
      <ol className="space-y-3 text-[0.95em]">
        {refs.map((r) => (
          <li key={r.n} id={`ref-${r.n}`}
            className="grid scroll-mt-28 grid-cols-[2.5rem_minmax(0,1fr)]
              target:bg-accent/10">
            <span className="font-mono text-xs leading-7 text-blue">[{r.n}]</span>
            <span>
              M. Shende. <em>{r.title}</em>. GitHub repository
              {r.updatedAt ? `, ${new Date(r.updatedAt).getUTCFullYear()}` : ''}.{' '}
              <a href={r.url} target="_blank" rel="noreferrer"
                className="ink-link break-all font-mono text-xs text-muted">
                {r.url.replace('https://', '')}
              </a>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Colophon() {
  return (
    <footer className="mt-24 border-t border-rule pt-6 font-mono text-[11px]
      leading-relaxed text-muted">
      <p>
        Received 2022 · Revised continuously · Accepted:{' '}
        <span className="text-accent">pending your reply</span>
      </p>
      <p className="mt-2">
        Typeset in Instrument Serif, Newsreader &amp; JetBrains Mono. Built
        with Next.js, Three.js &amp; Framer Motion. Print this page for a
        paper copy.
      </p>
      <p className="mt-2">© {new Date().getFullYear()} Manas Shende</p>
    </footer>
  );
}
