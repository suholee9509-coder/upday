/**
 * Seed script for upday news database
 *
 * Usage:
 * 1. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 * 2. Run: npx tsx scripts/seed.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

type Category = 'ai' | 'startup' | 'science' | 'design' | 'space' | 'dev'

interface SeedItem {
  title: string
  summary: string
  body: string
  category: Category
  source: string
  source_url: string
  published_at: string
}

// Helper to create dates relative to now
const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString()

const seedData: SeedItem[] = [
  // === AI Category (12 items) ===
  {
    title: 'OpenAI Announces GPT-5 with Revolutionary Reasoning Capabilities',
    summary: 'OpenAI unveiled GPT-5, featuring breakthrough reasoning abilities and 40% improvement on complex problem-solving benchmarks. The model demonstrates unprecedented understanding of context and nuance.',
    body: 'OpenAI has announced the release of GPT-5, its most advanced language model to date. The new model shows significant improvements in reasoning, problem-solving, and contextual understanding...',
    category: 'ai',
    source: 'TechCrunch',
    source_url: 'https://techcrunch.com/2026/02/01/openai-gpt5',
    published_at: hoursAgo(2),
  },
  {
    title: 'Anthropic Raises $4B in New Funding Round',
    summary: 'Claude maker Anthropic secured $4 billion in funding led by Google and Salesforce. The company plans to accelerate AI safety research and model development.',
    body: 'Anthropic, the AI safety startup founded by former OpenAI researchers, has closed a $4 billion funding round...',
    category: 'ai',
    source: 'The Verge',
    source_url: 'https://theverge.com/2026/02/01/anthropic-funding',
    published_at: hoursAgo(5),
  },
  {
    title: 'Claude Opus 4.5 Sets New Benchmark Records',
    summary: 'Anthropic\'s latest model achieves state-of-the-art performance across all major benchmarks. Extended thinking capability enables complex reasoning tasks.',
    body: 'Anthropic has released Claude Opus 4.5, the latest version of its flagship AI model...',
    category: 'ai',
    source: 'Anthropic Blog',
    source_url: 'https://anthropic.com/2026/02/01/claude-opus-45',
    published_at: hoursAgo(8),
  },
  {
    title: 'Google DeepMind Achieves Breakthrough in Protein Design',
    summary: 'AlphaFold 3 can now design novel proteins from scratch, opening new possibilities in drug discovery and synthetic biology.',
    body: 'Google DeepMind announced that AlphaFold 3 has achieved a major breakthrough in de novo protein design...',
    category: 'ai',
    source: 'Nature',
    source_url: 'https://nature.com/2026/02/01/alphafold3-design',
    published_at: hoursAgo(12),
  },
  {
    title: 'Meta Releases Llama 4 as Open Source',
    summary: 'Meta\'s latest LLM rivals GPT-4 in performance while remaining fully open source. The 400B parameter model is available for commercial use.',
    body: 'Meta has released Llama 4, its most powerful open-source language model yet...',
    category: 'ai',
    source: 'Wired',
    source_url: 'https://wired.com/2026/02/01/meta-llama4',
    published_at: hoursAgo(18),
  },
  {
    title: 'AI Agents Now Handle 40% of Customer Service Calls',
    summary: 'Enterprise adoption of AI agents accelerates as companies report 60% cost reduction in customer support operations.',
    body: 'A new report from Gartner shows that AI agents now handle 40% of all customer service interactions...',
    category: 'ai',
    source: 'Bloomberg',
    source_url: 'https://bloomberg.com/2026/02/01/ai-customer-service',
    published_at: hoursAgo(26),
  },
  {
    title: 'Microsoft Copilot Gains Code Execution Capabilities',
    summary: 'GitHub Copilot can now run and test code directly in the IDE, automatically fixing errors before commit.',
    body: 'Microsoft announced a major upgrade to GitHub Copilot that enables direct code execution...',
    category: 'ai',
    source: 'GitHub Blog',
    source_url: 'https://github.blog/2026/02/01/copilot-execution',
    published_at: hoursAgo(32),
  },
  {
    title: 'Nvidia Unveils H200 GPU with 50% Performance Boost',
    summary: 'The new H200 delivers 141GB HBM3e memory and significant improvements in AI training throughput.',
    body: 'Nvidia has announced the H200, the successor to its popular H100 GPU...',
    category: 'ai',
    source: 'Ars Technica',
    source_url: 'https://arstechnica.com/2026/02/01/nvidia-h200',
    published_at: hoursAgo(38),
  },
  {
    title: 'EU AI Act Enforcement Begins Today',
    summary: 'New regulations require AI systems to disclose training data sources and implement human oversight mechanisms.',
    body: 'The European Union\'s AI Act officially goes into effect today, marking a new era of AI regulation...',
    category: 'ai',
    source: 'Reuters',
    source_url: 'https://reuters.com/2026/02/01/eu-ai-act',
    published_at: hoursAgo(44),
  },
  {
    title: 'Midjourney V7 Achieves Photorealistic Video Generation',
    summary: 'The latest version can generate 60-second photorealistic videos from text prompts, challenging Hollywood VFX studios.',
    body: 'Midjourney has released version 7 of its AI image generator, now with full video capabilities...',
    category: 'ai',
    source: 'The Information',
    source_url: 'https://theinformation.com/2026/02/01/midjourney-v7',
    published_at: hoursAgo(52),
  },
  {
    title: 'OpenAI Introduces Enterprise-Grade AI Agents',
    summary: 'New platform allows businesses to deploy autonomous AI agents for complex multi-step workflows.',
    body: 'OpenAI launched its enterprise agent platform, enabling businesses to create autonomous AI systems...',
    category: 'ai',
    source: 'VentureBeat',
    source_url: 'https://venturebeat.com/2026/01/31/openai-agents',
    published_at: hoursAgo(60),
  },
  {
    title: 'Hugging Face Raises $500M at $8B Valuation',
    summary: 'The open-source AI platform raises Series E to expand model hosting and enterprise features.',
    body: 'Hugging Face has closed a $500 million Series E funding round at an $8 billion valuation...',
    category: 'ai',
    source: 'Forbes',
    source_url: 'https://forbes.com/2026/01/31/hugging-face-funding',
    published_at: hoursAgo(68),
  },

  // === Startup Category (10 items) ===
  {
    title: 'Stripe Acquires AI Startup for $1.2 Billion',
    summary: 'Payment giant Stripe completed its largest acquisition, buying AI fraud detection startup SecureAI. The deal signals growing importance of AI in fintech security.',
    body: 'Stripe has announced the acquisition of SecureAI, an AI-powered fraud detection startup...',
    category: 'startup',
    source: 'Bloomberg',
    source_url: 'https://bloomberg.com/2026/02/02/stripe-secureai',
    published_at: hoursAgo(4),
  },
  {
    title: 'Y Combinator Launches $500M AI Fund',
    summary: 'Startup accelerator Y Combinator announced a dedicated AI fund to back early-stage AI companies. Applications open for the summer batch.',
    body: 'Y Combinator has launched a new $500 million fund specifically focused on AI startups...',
    category: 'startup',
    source: 'TechCrunch',
    source_url: 'https://techcrunch.com/2026/02/02/yc-ai-fund',
    published_at: hoursAgo(10),
  },
  {
    title: 'Notion Acquires Linear in $800M Deal',
    summary: 'Productivity tool Notion acquired project management startup Linear. The combined company aims to create an all-in-one workspace for engineering teams.',
    body: 'Notion has announced the acquisition of Linear, the popular issue tracking tool...',
    category: 'startup',
    source: 'The Information',
    source_url: 'https://theinformation.com/2026/02/02/notion-linear',
    published_at: hoursAgo(16),
  },
  {
    title: 'Databricks Files for IPO at $60B Valuation',
    summary: 'Data analytics unicorn Databricks officially filed S-1 documents, seeking to raise $3 billion in the largest tech IPO of 2026.',
    body: 'Databricks has filed its S-1 registration statement with the SEC, marking the beginning of its IPO process...',
    category: 'startup',
    source: 'Wall Street Journal',
    source_url: 'https://wsj.com/2026/02/01/databricks-ipo',
    published_at: hoursAgo(24),
  },
  {
    title: 'Figma Valued at $30B After Secondary Sale',
    summary: 'Design tool maker Figma sees valuation soar after Adobe deal collapse. Employee shares trade at 50% premium.',
    body: 'Figma\'s valuation has reached $30 billion following a secondary share sale...',
    category: 'startup',
    source: 'Fortune',
    source_url: 'https://fortune.com/2026/02/01/figma-valuation',
    published_at: hoursAgo(30),
  },
  {
    title: 'Perplexity AI Raises $250M Series C',
    summary: 'AI search startup Perplexity valued at $3 billion as it challenges Google with answer-first search experience.',
    body: 'Perplexity AI has raised $250 million in Series C funding led by IVP...',
    category: 'startup',
    source: 'Forbes',
    source_url: 'https://forbes.com/2026/02/01/perplexity-series-c',
    published_at: hoursAgo(42),
  },
  {
    title: 'Rippling Acquires HR Tech Competitor Gusto',
    summary: 'Workforce management platform Rippling announced acquisition of payroll startup Gusto for $2.5 billion.',
    body: 'Rippling has agreed to acquire Gusto, creating the largest independent HR technology company...',
    category: 'startup',
    source: 'CNBC',
    source_url: 'https://cnbc.com/2026/01/31/rippling-gusto',
    published_at: hoursAgo(54),
  },
  {
    title: 'Vercel Launches $100M Developer Fund',
    summary: 'Next.js creator Vercel introduces fund to invest in startups building on its platform.',
    body: 'Vercel has announced a $100 million fund to support developers building applications on its platform...',
    category: 'startup',
    source: 'TechCrunch',
    source_url: 'https://techcrunch.com/2026/01/31/vercel-fund',
    published_at: hoursAgo(66),
  },
  {
    title: 'Canva Surpasses $2B Annual Revenue',
    summary: 'Australian design platform Canva reports record revenue as enterprise adoption accelerates.',
    body: 'Canva has announced that it surpassed $2 billion in annual recurring revenue...',
    category: 'startup',
    source: 'AFR',
    source_url: 'https://afr.com/2026/01/31/canva-revenue',
    published_at: hoursAgo(74),
  },
  {
    title: 'Arc Browser Maker Raises $100M at $1B Valuation',
    summary: 'The Browser Company reaches unicorn status as Arc gains momentum against Chrome.',
    body: 'The Browser Company, maker of the Arc browser, has raised $100 million in Series B funding...',
    category: 'startup',
    source: 'The Verge',
    source_url: 'https://theverge.com/2026/01/30/browser-company',
    published_at: hoursAgo(82),
  },

  // === Science Category (8 items) ===
  {
    title: 'CRISPR Gene Therapy Cures First Patient with Sickle Cell Disease',
    summary: 'A landmark medical achievement as gene therapy completely cured a patient suffering from sickle cell disease. FDA fast-tracks approval for broader use.',
    body: 'Researchers announced that a patient with sickle cell disease has been completely cured using CRISPR gene therapy...',
    category: 'science',
    source: 'Nature',
    source_url: 'https://nature.com/2026/02/02/crispr-sickle-cell',
    published_at: hoursAgo(6),
  },
  {
    title: 'Quantum Computer Solves Previously Impossible Chemistry Problem',
    summary: 'Google\'s quantum computer simulated a complex molecular interaction that classical computers couldn\'t handle. Breakthrough could accelerate drug discovery.',
    body: 'Google Quantum AI announced that its Willow quantum processor has solved a molecular simulation problem...',
    category: 'science',
    source: 'Science',
    source_url: 'https://science.org/2026/02/02/quantum-chemistry',
    published_at: hoursAgo(14),
  },
  {
    title: 'MIT Creates Room-Temperature Superconductor',
    summary: 'Scientists at MIT demonstrated a material that superconducts at 15°C under moderate pressure, potentially revolutionizing energy transmission.',
    body: 'MIT researchers have created a new material that exhibits superconductivity at room temperature...',
    category: 'science',
    source: 'MIT News',
    source_url: 'https://news.mit.edu/2026/02/01/superconductor',
    published_at: hoursAgo(28),
  },
  {
    title: 'New Cancer Vaccine Shows 90% Efficacy in Clinical Trial',
    summary: 'Moderna\'s mRNA-based cancer vaccine demonstrated unprecedented success against melanoma in Phase 3 trials.',
    body: 'Moderna has announced positive results from its Phase 3 trial of an mRNA-based cancer vaccine...',
    category: 'science',
    source: 'STAT News',
    source_url: 'https://statnews.com/2026/02/01/moderna-cancer',
    published_at: hoursAgo(36),
  },
  {
    title: 'Brain-Computer Interface Restores Movement in Paralyzed Patient',
    summary: 'Neuralink competitor Synchron demonstrates full arm movement restoration using minimally invasive brain implant.',
    body: 'Synchron announced that a patient with complete paralysis has regained arm movement using its brain-computer interface...',
    category: 'science',
    source: 'New England Journal',
    source_url: 'https://nejm.org/2026/02/01/synchron-bci',
    published_at: hoursAgo(48),
  },
  {
    title: 'Nuclear Fusion Reactor Achieves Net Energy Gain for 30 Minutes',
    summary: 'ITER fusion reactor in France sustained net positive energy output, marking a major milestone toward commercial fusion power.',
    body: 'The ITER fusion reactor achieved a sustained net energy gain for 30 minutes during a test run...',
    category: 'science',
    source: 'Scientific American',
    source_url: 'https://scientificamerican.com/2026/01/31/iter-fusion',
    published_at: hoursAgo(56),
  },
  {
    title: 'First Synthetic Embryo Created Without Sperm or Egg',
    summary: 'Cambridge scientists created a mouse embryo entirely from stem cells, raising both scientific possibilities and ethical questions.',
    body: 'Researchers at Cambridge University have created the first complete synthetic embryo...',
    category: 'science',
    source: 'The Guardian',
    source_url: 'https://theguardian.com/2026/01/31/synthetic-embryo',
    published_at: hoursAgo(70),
  },
  {
    title: 'Anti-Aging Drug Reverses Biological Age by 5 Years in Trial',
    summary: 'Longevity startup Altos Labs reports breakthrough results from its epigenetic reprogramming therapy.',
    body: 'Altos Labs announced that its anti-aging therapy reversed biological age markers by an average of 5 years...',
    category: 'science',
    source: 'Nature Medicine',
    source_url: 'https://nature.com/nm/2026/01/30/altos-aging',
    published_at: hoursAgo(80),
  },

  // === Design Category (8 items) ===
  {
    title: 'Figma Introduces AI-Powered Design Generation',
    summary: 'Figma launched an AI feature that generates complete UI designs from text descriptions. Designers can now create wireframes and mockups in seconds.',
    body: 'Figma has announced Figma AI, a new feature that generates complete UI designs from natural language prompts...',
    category: 'design',
    source: 'Designer News',
    source_url: 'https://designernews.co/2026/02/02/figma-ai',
    published_at: hoursAgo(3),
  },
  {
    title: 'Apple Vision Pro 2 Leaks Reveal 50% Weight Reduction',
    summary: 'Leaked schematics show Apple\'s next-gen headset will be significantly lighter with improved battery life. Launch expected in Q3 2026.',
    body: 'Leaked design documents reveal that Apple\'s Vision Pro 2 will weigh 50% less than the original...',
    category: 'design',
    source: 'MacRumors',
    source_url: 'https://macrumors.com/2026/02/02/vision-pro-2-leak',
    published_at: hoursAgo(11),
  },
  {
    title: 'Pantone Announces 2027 Color of the Year',
    summary: 'Pantone selected "Digital Dawn" (17-4540), a blue-green shade representing the intersection of technology and nature.',
    body: 'Pantone has announced its Color of the Year for 2027: Digital Dawn...',
    category: 'design',
    source: 'Fast Company',
    source_url: 'https://fastcompany.com/2026/02/01/pantone-2027',
    published_at: hoursAgo(22),
  },
  {
    title: 'Adobe Launches Photoshop Web with Full Feature Parity',
    summary: 'Photoshop for web now matches the desktop app in features, enabled by WebAssembly and WebGPU.',
    body: 'Adobe announced that Photoshop for web has achieved full feature parity with the desktop application...',
    category: 'design',
    source: 'Adobe Blog',
    source_url: 'https://blog.adobe.com/2026/02/01/photoshop-web',
    published_at: hoursAgo(34),
  },
  {
    title: 'Airbnb Redesigns Its Entire Product Around AI Concierge',
    summary: 'New Airbnb app centers around an AI assistant that plans entire trips, suggests listings, and handles bookings conversationally.',
    body: 'Airbnb has unveiled a complete redesign of its mobile and web applications, centering the experience around an AI concierge...',
    category: 'design',
    source: 'Dezeen',
    source_url: 'https://dezeen.com/2026/02/01/airbnb-redesign',
    published_at: hoursAgo(46),
  },
  {
    title: 'iOS 20 Introduces Fully Customizable Home Screen',
    summary: 'Apple finally allows free-form app placement and dynamic widgets that change based on time and context.',
    body: 'Apple announced iOS 20 at WWDC, featuring a completely reimagined home screen experience...',
    category: 'design',
    source: '9to5Mac',
    source_url: 'https://9to5mac.com/2026/01/31/ios-20-homescreen',
    published_at: hoursAgo(58),
  },
  {
    title: 'Dieter Rams Documentary Wins Oscar for Best Documentary',
    summary: '"Less But Better" film about legendary Braun designer wins Academy Award, sparking renewed interest in minimalist design.',
    body: 'The documentary "Less But Better," chronicling the life and work of Dieter Rams, won the Academy Award...',
    category: 'design',
    source: 'Core77',
    source_url: 'https://core77.com/2026/01/31/rams-oscar',
    published_at: hoursAgo(72),
  },
  {
    title: 'Material Design 4 Introduces Emotional Color System',
    summary: 'Google\'s new design language uses AI to adapt UI colors based on content mood and user preferences.',
    body: 'Google has unveiled Material Design 4, introducing an emotional color system that adapts in real-time...',
    category: 'design',
    source: 'Google Design',
    source_url: 'https://design.google/2026/01/30/material-4',
    published_at: hoursAgo(84),
  },

  // === Space Category (8 items) ===
  {
    title: 'SpaceX Successfully Tests Starship Orbital Refueling',
    summary: 'SpaceX achieved a major milestone with successful in-orbit fuel transfer between two Starship vehicles. This technology is crucial for future Mars missions.',
    body: 'SpaceX has successfully demonstrated orbital refueling between two Starship vehicles for the first time...',
    category: 'space',
    source: 'Space News',
    source_url: 'https://spacenews.com/2026/02/02/starship-refueling',
    published_at: hoursAgo(1),
  },
  {
    title: 'NASA Confirms Water Ice on Mars Surface',
    summary: 'Mars Reconnaissance Orbiter detected significant water ice deposits near the equator. This discovery dramatically improves prospects for future human missions.',
    body: 'NASA announced that the Mars Reconnaissance Orbiter has detected significant deposits of water ice...',
    category: 'space',
    source: 'NASA',
    source_url: 'https://nasa.gov/2026/02/02/mars-water-ice',
    published_at: hoursAgo(9),
  },
  {
    title: 'Blue Origin Launches First Commercial Space Station Module',
    summary: 'Jeff Bezos\'s space company successfully deployed the first module of its commercial space station. Full station expected to be operational by 2028.',
    body: 'Blue Origin successfully launched the first module of its Orbital Reef commercial space station...',
    category: 'space',
    source: 'Ars Technica',
    source_url: 'https://arstechnica.com/2026/02/01/blue-origin-station',
    published_at: hoursAgo(20),
  },
  {
    title: 'James Webb Telescope Discovers New Earth-Like Planet',
    summary: 'JWST identified a rocky planet with liquid water signatures in the habitable zone of nearby star Proxima Centauri.',
    body: 'The James Webb Space Telescope has discovered a new potentially habitable exoplanet...',
    category: 'space',
    source: 'Nature Astronomy',
    source_url: 'https://nature.com/astro/2026/02/01/jwst-planet',
    published_at: hoursAgo(27),
  },
  {
    title: 'China Completes First Module of Lunar Base',
    summary: 'CNSA announces successful deployment of automated construction systems on the Moon\'s south pole.',
    body: 'China\'s National Space Administration announced the completion of the first module of its planned lunar base...',
    category: 'space',
    source: 'SpaceRef',
    source_url: 'https://spaceref.com/2026/02/01/china-lunar-base',
    published_at: hoursAgo(40),
  },
  {
    title: 'Rocket Lab Achieves 100% Reusability with Electron',
    summary: 'First fully reusable small launch vehicle catches booster mid-air and lands first stage on drone ship.',
    body: 'Rocket Lab has achieved complete reusability of its Electron rocket for the first time...',
    category: 'space',
    source: 'SpaceX Insider',
    source_url: 'https://spacexinsider.com/2026/01/31/rocketlab-reuse',
    published_at: hoursAgo(50),
  },
  {
    title: 'Axiom Space Station Construction Begins in Orbit',
    summary: 'First private space station segment docks with ISS, marking beginning of commercial orbital infrastructure era.',
    body: 'Axiom Space has successfully connected its first station module to the International Space Station...',
    category: 'space',
    source: 'Aviation Week',
    source_url: 'https://aviationweek.com/2026/01/31/axiom-station',
    published_at: hoursAgo(64),
  },
  {
    title: 'Virgin Galactic Begins Weekly Suborbital Flights',
    summary: 'Space tourism pioneer starts regular commercial service with twice-weekly launches from Spaceport America.',
    body: 'Virgin Galactic announced the beginning of regular commercial suborbital flight operations...',
    category: 'space',
    source: 'Space.com',
    source_url: 'https://space.com/2026/01/30/virgin-galactic-weekly',
    published_at: hoursAgo(76),
  },

  // === Dev Category (10 items) ===
  {
    title: 'React 20 Released with Built-in State Management',
    summary: 'Meta released React 20 featuring native state management, eliminating the need for external libraries like Redux. Performance improvements of up to 50% reported.',
    body: 'Meta has released React 20, introducing native state management capabilities...',
    category: 'dev',
    source: 'Dev.to',
    source_url: 'https://dev.to/2026/02/02/react-20',
    published_at: hoursAgo(7),
  },
  {
    title: 'TypeScript 6.0 Brings Native Pattern Matching',
    summary: 'Microsoft released TypeScript 6.0 with native pattern matching syntax. The feature eliminates complex switch statements and improves code readability.',
    body: 'Microsoft has released TypeScript 6.0, introducing native pattern matching to the language...',
    category: 'dev',
    source: 'Microsoft DevBlog',
    source_url: 'https://devblogs.microsoft.com/2026/02/02/typescript-6',
    published_at: hoursAgo(13),
  },
  {
    title: 'Bun 2.0 Achieves Drop-In Node.js Compatibility',
    summary: 'JavaScript runtime Bun reaches full Node.js compatibility while maintaining 5x performance advantage.',
    body: 'Oven has released Bun 2.0, achieving complete drop-in compatibility with Node.js...',
    category: 'dev',
    source: 'JavaScript Weekly',
    source_url: 'https://javascriptweekly.com/2026/02/01/bun-2',
    published_at: hoursAgo(21),
  },
  {
    title: 'Rust Reaches 50% Adoption in System Programming',
    summary: 'Survey shows Rust now used in half of new system-level projects, surpassing C++ for the first time.',
    body: 'According to a new Stack Overflow survey, Rust is now used in 50% of new system programming projects...',
    category: 'dev',
    source: 'InfoQ',
    source_url: 'https://infoq.com/2026/02/01/rust-adoption',
    published_at: hoursAgo(29),
  },
  {
    title: 'Next.js 16 Introduces Zero-Config Edge Deployment',
    summary: 'Vercel\'s framework now automatically deploys to edge locations without configuration, reducing latency by 70%.',
    body: 'Vercel has released Next.js 16, featuring automatic edge deployment for all applications...',
    category: 'dev',
    source: 'Vercel Blog',
    source_url: 'https://vercel.com/blog/2026/02/01/nextjs-16',
    published_at: hoursAgo(37),
  },
  {
    title: 'GitHub Copilot X Writes Complete Test Suites',
    summary: 'AI coding assistant now generates comprehensive test coverage including edge cases and integration tests.',
    body: 'GitHub has announced Copilot X, a major upgrade that can generate complete test suites...',
    category: 'dev',
    source: 'GitHub Blog',
    source_url: 'https://github.blog/2026/01/31/copilot-x',
    published_at: hoursAgo(45),
  },
  {
    title: 'Deno 3.0 Ships with Built-in Package Manager',
    summary: 'Deno adds npm-compatible package.json support, making Node.js migration seamless.',
    body: 'Deno has released version 3.0, introducing a built-in package manager with full npm compatibility...',
    category: 'dev',
    source: 'Deno Blog',
    source_url: 'https://deno.com/blog/2026/01/31/deno-3',
    published_at: hoursAgo(53),
  },
  {
    title: 'VS Code Passes 50 Million Monthly Active Users',
    summary: 'Microsoft\'s code editor dominates the market with record-breaking user numbers and expanded AI features.',
    body: 'Visual Studio Code has reached a milestone of 50 million monthly active users...',
    category: 'dev',
    source: 'The Register',
    source_url: 'https://theregister.com/2026/01/31/vscode-50m',
    published_at: hoursAgo(62),
  },
  {
    title: 'WebAssembly 3.0 Enables Full DOM Access',
    summary: 'New Wasm standard allows direct DOM manipulation, enabling high-performance web apps in any language.',
    body: 'The W3C has finalized WebAssembly 3.0, introducing direct DOM access from Wasm modules...',
    category: 'dev',
    source: 'MDN Blog',
    source_url: 'https://blog.mozilla.org/2026/01/30/wasm-3',
    published_at: hoursAgo(71),
  },
  {
    title: 'Cloudflare Workers Adds Persistent Storage',
    summary: 'Edge computing platform introduces Durable Objects v2 with SQLite-compatible persistent state.',
    body: 'Cloudflare has announced major enhancements to its Workers platform, including persistent storage...',
    category: 'dev',
    source: 'Cloudflare Blog',
    source_url: 'https://blog.cloudflare.com/2026/01/30/workers-storage',
    published_at: hoursAgo(78),
  },
]

async function seed() {
  console.log('Starting seed...')
  console.log(`Inserting ${seedData.length} news items...`)

  // Clear existing data (optional - comment out if you want to append)
  const { error: deleteError } = await supabase
    .from('news_items')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

  if (deleteError) {
    console.warn('Warning: Could not clear existing data:', deleteError.message)
  }

  // Insert seed data in batches
  const batchSize = 20
  for (let i = 0; i < seedData.length; i += batchSize) {
    const batch = seedData.slice(i, i + batchSize)
    const { error } = await supabase.from('news_items').insert(batch)

    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error.message)
      throw error
    }

    console.log(`Inserted batch ${i / batchSize + 1}/${Math.ceil(seedData.length / batchSize)}`)
  }

  // Verify counts by category
  console.log('\nVerifying seed data:')
  for (const cat of ['ai', 'startup', 'science', 'design', 'space', 'dev']) {
    const { count } = await supabase
      .from('news_items')
      .select('*', { count: 'exact', head: true })
      .eq('category', cat)

    console.log(`  ${cat}: ${count} items`)
  }

  const { count: totalCount } = await supabase
    .from('news_items')
    .select('*', { count: 'exact', head: true })

  console.log(`\nTotal: ${totalCount} items`)
  console.log('Seed completed successfully!')
}

seed().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
