/**
 * Data model for the walkthrough. Everything the steps show (text, media, tables) lives in a
 * WalkthroughContent object, so the host site can override content without touching components.
 */

/** How a media slot renders. 'none' draws an empty dashed box to be filled later. */
export type MediaKind = 'image' | 'video' | 'embed' | 'none';

export interface MediaSource {
  kind: MediaKind;
  /** Relative paths resolve against the asset base (see provideDroneWalkthrough); absolute URLs pass through. */
  src?: string;
  /** Video poster frame. */
  poster?: string;
  alt?: string;
  /** Caption under the media. */
  caption?: string;
  /**
   * When set, the slot shows an orange "ต้องเปลี่ยน" badge with this note.
   * Use it for placeholder media that must be replaced before going live.
   */
  todo?: string;
}

/** One click of the ▶ button inside a step. */
export interface BeatDef {
  label: string;
  /** How long autoplay stays on this beat before moving on. */
  ms: number;
}

export type StepId = 'register' | 'dataset' | 'code' | 'route' | 'queue' | 'results';

export interface StepDef {
  id: StepId;
  /** Step number shown on the page (big outline number, chip, control bar), e.g. "1". */
  number: string;
  title: string;
  description: string;
  beats: BeatDef[];
}

export interface RegisterContent {
  /** Address shown in the fake browser bar for the home page / the register page. */
  url: string;
  registerUrl: string;
  /** Home page (beat 0). */
  media: MediaSource;
  /** The privacy-consent dialog shown when /register opens (beat 1). */
  consentMedia: MediaSource;
  teamName: string;
}

export interface DatasetFile {
  name: string;
  /** Leave empty when unknown; the cell stays blank. */
  size?: string;
}

export interface DatasetContent {
  /** Hugging Face owner / org. Empty = blank (not decided). */
  owner: string;
  repo: string;
  license: string;
  files: DatasetFile[];
  downloadCommand: string;
  media: MediaSource;
}

export interface CodeFile {
  name: string;
  lang: 'python' | 'shell';
  code: string;
}

export interface TrainImage {
  src: string;
  boxes: [number, number, number, number][];
}

export interface TrainContent {
  model: string;
  epochs: number;
  /** Training images with their ground-truth boxes (YOLO cx, cy, w, h, normalised 0..1). */
  images: TrainImage[];
  /** True while the loss / mAP curves are illustrative and not from a real run. */
  metricsAreIllustrative: boolean;
  weightsName: string;
}

export interface CodeContent {
  files: CodeFile[];
  terminal: string[];
  train: TrainContent;
}

export interface RouteContent {
  siteName: string;
  timeLimitS: number;
  ceilingM: number;
  map: MediaSource;
  attribution: string;
}

export interface QueueEntry {
  team: string;
  status: 'flying' | 'waiting' | 'done';
  you?: boolean;
}

export interface TarFile {
  name: string;
  /** Description. Supports **bold** and `code` markup. */
  note: string;
  /** Box colour: plain = grey (Dockerfile), lib = light green, main = green + thick border,
   *  rules = yellow (mission.kml), optional = dashed. */
  emphasis?: 'plain' | 'lib' | 'main' | 'rules' | 'optional';
}

export interface QueueContent {
  teamName: string;
  slotLabel: string;
  queue: QueueEntry[];
  tarName: string;
  tarFiles: TarFile[];
  /** Rules printed under the tar box. Supports **bold** and `code`. */
  tarRules: string[];
  buildChecks: string[];
  dashboardMedia: MediaSource;
}

export interface ScoreRow {
  label: string;
  /** null = leave the cell empty (no data yet). */
  value: number | null;
  max: number | null;
  note?: string;
}

export interface ResultFile {
  name: string;
  description: string;
  /** Download URL; leave empty to show a disabled button. */
  href?: string;
}

export interface ResultsContent {
  video: MediaSource;
  scores: ScoreRow[];
  /** True while the table holds sample numbers. Shows a "ตัวอย่าง" stamp. */
  scoresAreSample: boolean;
  files: ResultFile[];
}

export interface WalkthroughContent {
  eyebrow: string;
  title: string;
  lead: string;
  steps: StepDef[];
  register: RegisterContent;
  dataset: DatasetContent;
  code: CodeContent;
  route: RouteContent;
  queue: QueueContent;
  results: ResultsContent;
}

/**
 * How the steps are laid out:
 *   carousel  steps side by side in one row; the next step slides in from the right (one step tall: saves page space)
 *   scroll    steps stacked down the page; the one in the middle of the viewport plays
 *   slides    one step at a time filling a fixed-height frame (presenting / screen-recording)
 */
export type WalkthroughMode = 'carousel' | 'scroll' | 'slides';

export interface StepChangeEvent {
  stepIndex: number;
  stepId: StepId;
  beat: number;
}
