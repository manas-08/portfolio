/**
 * @fileoverview Static portfolio content sourced from the resume. GitHub
 * metadata (descriptions, stars, languages) is merged in at request time.
 */

export const GITHUB_USER = 'manas-08';

export const profile = {
  name: 'Manas Shende',
  role: 'AI / ML Engineer',
  email: 'manasshende2004@gmail.com',
  github: `https://github.com/${GITHUB_USER}`,
  linkedin: 'https://www.linkedin.com/in/manas-shende-aa143a261',
  resume: '/manas-shende-resume.pdf',
  site: 'https://manas-shende.vercel.app',
};

export interface Metric {
  label: string;
  value: string;
  note?: string;
}

export interface Project {
  id: string;
  title: string;
  repo: string;
  year: string;
  summary: string;
  points: string[];
  metrics: Metric[];
  stack: string[];
}

export const projects: Project[] = [
  {
    id: 'rag',
    title: 'Multi-Document Research Assistant',
    repo: 'multi-doc-research-assistant',
    year: '2026',
    summary:
      'A retrieval-augmented assistant over a library of PDFs that streams ' +
      'page-cited answers, and, crucially, says “I don’t know” when the ' +
      'index does not support a claim.',
    points: [
      'Hybrid retrieval fuses BM25 (40%) with MiniLM dense vectors (60%); a ' +
        'cross-encoder reranks the top 20 candidates before generation.',
      'Multimodal search with PyMuPDF and CLIP ViT-B/32 indexes figures and ' +
        'tables, enabling text-to-diagram and similar-figure retrieval plus ' +
        'cross-document comparison in a Gradio interface.',
      'Validated with 48 unit tests and an end-to-end benchmark over 4 ' +
        'research papers.',
    ],
    metrics: [
      {label: 'Citation rate', value: '100%', note: '9-question E2E benchmark'},
      {label: 'Abstention accuracy', value: '100%', note: 'unsupported claims'},
      {label: 'All source papers retrieved', value: '80%', note: '10 queries'},
      {label: '≥ 1 source paper retrieved', value: '100%', note: '10 queries'},
      {label: 'Unit tests', value: '48'},
    ],
    stack: ['LangChain', 'Chroma', 'MiniLM', 'BM25', 'Cross-Encoder', 'CLIP',
      'PyMuPDF', 'Gradio'],
  },
  {
    id: 'brain',
    title: 'Brain Tumor Segmentation with Transformers & XAI',
    repo: 'brainTumorSegmentation_Using_Transformers_And_XAITechniques',
    year: '2026',
    summary:
      'A SwinUNet with Multi-Scale Attention Fusion and deep supervision that ' +
      'segments tumors from multimodal MRI, and then shows where it looked.',
    points: [
      'Medical-image preprocessing, transfer learning and hybrid loss ' +
        'functions, benchmarked against DeepLabV3+ResNet50 and UNet+ResNet34 ' +
        'with ROC curves and confusion matrices.',
      'Evaluated across three BraTS releases (2018, 2019, 2020).',
      'Grad-CAM++ heatmaps and overlays for all three MRI modalities support ' +
        'interpretability analysis of every prediction.',
    ],
    metrics: [
      {label: 'Dice score (best)', value: '0.998', note: 'T1 · T1CE · FLAIR'},
      {label: 'Validation accuracy', value: '97.3–97.7%', note: 'BraTS 18/19/20'},
      {label: 'Baselines compared', value: '2'},
      {label: 'Dataset releases', value: '3'},
    ],
    stack: ['PyTorch', 'SwinUNet', 'Attention Fusion', 'Grad-CAM++',
      'NiBabel', 'BraTS'],
  },
  {
    id: 'etl',
    title: 'Real-Time Weather ETL Pipeline',
    repo: 'etl_weather_pipeline_using_dag_airflow',
    year: '2025',
    summary:
      'An hourly, self-validating Apache Airflow DAG that ingests weather for ' +
      'five global cities and paints it onto a live Grafana dashboard.',
    points: [
      'Five-task DAG (extract → transform → load → validate → summarize) ' +
        'pulling from the Open-Meteo API with zero manual intervention.',
      'Three automatic retries at 5-minute intervals and a −50 to 60 °C ' +
        'range check; UTC-normalized rows stored in PostgreSQL across 5 time ' +
        'zones.',
      'PostgreSQL and Grafana provisioned with Docker Compose; a 5-panel ' +
        'multi-city dashboard auto-refreshes every 5 minutes.',
    ],
    metrics: [
      {label: 'Cities', value: '5'},
      {label: 'Records / day', value: '≈ 120'},
      {label: 'Retries', value: '3 × 5 min'},
      {label: 'Dashboard panels', value: '5'},
    ],
    stack: ['Apache Airflow', 'Astro', 'PostgreSQL', 'Grafana', 'Docker Compose'],
  },
];

export interface SideProject {
  repo: string;
  title: string;
  blurb: string;
  href?: string;
}

/** Smaller experiments pulled from GitHub, cited in §3. */
export const sideProjects: SideProject[] = [
  {
    repo: 'insurance_premium_prediction_API---A-fastAPI-application',
    title: 'Insurance Premium Prediction API',
    blurb: 'An ML model served behind FastAPI, containerized with Docker, ' +
      'with a Vite + Tailwind front end.',
  },
  {
    repo: 'majorProject_7thSem_GNN',
    title: 'Graph Neural Network Major Project',
    blurb: 'Seventh-semester research project exploring graph neural networks.',
  },
  {
    repo: 'word_of_the_day',
    title: 'Word of the Day',
    blurb: 'A GitHub Actions cron that rewrites its own README with a new word ' +
      'every day and publishes it to GitHub Pages. It also powers this ' +
      'page’s masthead.',
    href: 'https://manas-08.github.io/word_of_the_day/',
  },
  {
    repo: 'learning-rust',
    title: 'Learning Rust',
    blurb: 'Working notes, crates and scripts from learning Rust in public.',
  },
  {
    repo: 'DSA_leetcode',
    title: 'DSA · LeetCode',
    blurb: 'Data structures and algorithms practice in Java.',
  },
];

export const skills: Array<{area: string; items: string[]}> = [
  {area: 'Generative AI', items: ['RAG', 'LangChain', 'Sentence Transformers',
    'Chroma', 'BM25', 'Dense Retrieval', 'Cross-Encoder Reranking', 'CLIP']},
  {area: 'Deep Learning', items: ['PyTorch', 'TensorFlow', 'CNNs',
    'Transformers', 'SwinUNet', 'Grad-CAM++']},
  {area: 'Machine Learning', items: ['Scikit-learn', 'Pandas', 'NumPy',
    'Feature Engineering', 'Model Evaluation', 'Transfer Learning']},
  {area: 'AI Applications', items: ['Multimodal Retrieval', 'Embeddings',
    'Semantic Search', 'NLP']},
  {area: 'Backend & Data', items: ['FastAPI', 'REST APIs', 'Apache Airflow',
    'MySQL', 'PostgreSQL']},
  {area: 'Tooling', items: ['Docker', 'Docker Compose', 'Git', 'Grafana',
    'Gradio', 'Postman']},
  {area: 'Languages', items: ['Python', 'SQL', 'Java', 'Rust (learning)']},
  {area: 'Core CS', items: ['Data Structures & Algorithms', 'Operating Systems',
    'DBMS', 'Computer Networks']},
];

export interface TimelineEntry {
  when: string;
  what: string;
  where: string;
  detail: string;
}

export const timeline: TimelineEntry[] = [
  {
    when: 'Present',
    what: 'GenC Programmer Analyst Intern, AI & Analytics',
    where: 'Cognizant',
    detail: 'AI and data-driven applications: data processing, debugging ' +
      'alongside the team and improving software solutions.',
  },
  {
    when: '2025',
    what: 'Co-holder, Registered Design Patent',
    where: 'Indian Patent Office',
    detail: 'Design No. 452099-001, granted 2025.',
  },
  {
    when: '2022 – Present',
    what: 'B.Tech, Artificial Intelligence & Machine Learning',
    where: 'Shri Ramdeobaba College of Engineering and Management',
    detail: 'CGPA 9.21.',
  },
  {
    when: '2007 – 2022',
    what: 'School',
    where: 'USA Vidya Niketan, Tumsar',
    detail: 'HSC 90.80% · MHT-CET 97.67 percentile · SSC 93.60%.',
  },
];
