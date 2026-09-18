export const PROFESSIONS = [
  { id: 'finance', icon: 'finance', label: 'Finance & Trading' },
  { id: 'legal', icon: 'legal', label: 'Legal' },
  { id: 'tech', icon: 'tech', label: 'Technology' },
  { id: 'health', icon: 'health', label: 'Healthcare' },
  { id: 'consulting', icon: 'consulting', label: 'Consulting' },
  { id: 'marketing', icon: 'marketing', label: 'Marketing' },
  { id: 'policy', icon: 'policy', label: 'Government' },
  { id: 'realestate', icon: 'realestate', label: 'Real Estate' },
  { id: 'education', icon: 'education', label: 'Education' },
  { id: 'founder', icon: 'founder', label: 'Founder' },
  { id: 'industry', icon: 'industry', label: 'Manufacturing' },
  { id: 'design', icon: 'design', label: 'Design' },
]

export const NICHES = [
  { id: 'ai', icon: 'ai', label: 'AI & Technology' },
  { id: 'markets', icon: 'markets', label: 'Markets' },
  { id: 'india', icon: 'india', label: 'Indian Business' },
  { id: 'world', icon: 'world', label: 'World Politics' },
  { id: 'startups', icon: 'startups', label: 'Startups' },
  { id: 'science', icon: 'science', label: 'Science' },
  { id: 'geopolitics', icon: 'geopolitics', label: 'Geopolitics' },
  { id: 'medicine', icon: 'medicine', label: 'Health' },
  { id: 'climate', icon: 'climate', label: 'Climate' },
  { id: 'sports', icon: 'sports', label: 'Sports' },
  { id: 'culture', icon: 'culture', label: 'Culture' },
  { id: 'lawpolicy', icon: 'lawpolicy', label: 'Law & Policy' },
  { id: 'crypto', icon: 'crypto', label: 'Crypto' },
  { id: 'property', icon: 'property', label: 'Property' },
  { id: 'cinema', icon: 'cinema', label: 'Cinema' },
]

export const VOICES = [
  {
    id: 'aria',
    name: 'Aria',
    initial: 'A',
    lang: 'EN',
    langTone: 'blue',
    line: 'Warm, unhurried. British English.',
    sample: '0:10',
  },
  {
    id: 'kai',
    name: 'Kai',
    initial: 'K',
    lang: 'EN',
    langTone: 'blue',
    line: 'Crisp, focused. American English.',
    sample: '0:10',
  },
  {
    id: 'meera',
    name: 'Meera',
    initial: 'M',
    lang: 'हिन्दी',
    langTone: 'green',
    line: 'चमकदार और स्पष्ट। भारतीय हिन्दी।',
    deva: true,
    sample: '0:10',
  },
]

// Minutes are what the profile stores; the label is what the strip paints.
// `Custom` carries no minute count of its own — it opens the stepper.
export const LENGTHS = [
  { id: '5', label: '5 min', minutes: 5 },
  { id: '10', label: '10 min', minutes: 10 },
  { id: '15', label: '15 min', minutes: 15 },
  { id: 'custom', label: 'Custom', minutes: null },
]

export const CUSTOM_MINUTES = { min: 2, max: 30 }

export const TIMES = ['5:30', '6:00', '6:30', '7:00', '7:30', '8:00', '8:30']

// Placeholder editorial. Every headline, summary and outlet below is invented
// for the prototype and is surfaced in-app behind a SAMPLE marker. No real
// journalism and no real outlet is attributed anywhere in this build.
export const STORIES = [
  {
    n: 1,
    niche: 'AI & Tech',
    icon: 'ai',
    headline: 'Anthropic ships Claude 4.5 with a 2M-token memory and native tool use.',
    snip: 'The new memory layer lets Claude hold entire codebases in mind while it works — a direct move on enterprise developer tooling.',
    outlet: 'Sample wire',
    filed: '06:12',
    run: '2:04',
  },
  {
    n: 2,
    niche: 'Markets',
    icon: 'markets',
    headline: 'RBI holds rates as inflation cools to a fourteen-month low.',
    snip: 'Officials flagged growing confidence that prices are settling back toward the target band.',
    outlet: 'Sample wire',
    filed: '06:40',
    run: '1:38',
  },
  {
    n: 3,
    niche: 'Startups',
    icon: 'startups',
    headline: 'Zepto raises $350M at a $5B valuation.',
    snip: 'The round is led by existing investors and values the ten-minute delivery firm above its listed rivals.',
    outlet: 'Sample wire',
    filed: '05:55',
    run: '1:12',
  },
  {
    n: 4,
    niche: 'Climate',
    icon: 'climate',
    headline: 'Solar now prices below coal in six states.',
    snip: 'New tariff filings put unsubsidised solar under thermal power across most of the western grid.',
    outlet: 'Sample wire',
    filed: '06:02',
    run: '1:24',
  },
]

export const NOTIFICATIONS = [
  {
    icon: 'bell',
    title: 'Morning brief ready',
    line: 'Your daily audio briefing is waiting',
    when: 'Daily · 7:00',
  },
  {
    icon: 'bolt',
    title: 'Breaking story',
    line: 'A major story broke inside your niches',
    when: 'Rare',
  },
  {
    icon: 'digest',
    title: 'Weekly digest',
    line: 'The most-saved stories of the week',
    when: 'Sun · 9:00',
  },
]

export const SCREENS = [
  'Splash',
  'Language',
  'Sign in',
  'Profession',
  'Niches',
  'Voice',
  'Delivery time',
  'Notifications',
  'Ready',
  'Morning brief',
  'Discover',
  'Settings',
  'Plan & billing',
]
