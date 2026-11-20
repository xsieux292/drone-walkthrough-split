/*
 * Public API of drone-walkthrough.
 *
 * Most hosts only need DwWalkthrough + provideDroneWalkthrough (+ DW_DEFAULT_CONTENT to tweak content).
 * Each step and shared piece is exported too, so a single step can be placed on its own page.
 */

export * from './lib/models';
export * from './lib/config';
export * from './lib/content.default';
export * from './lib/walkthrough';

export * from './lib/shared/stage';
export * from './lib/shared/media-slot';
export * from './lib/shared/browser-frame';
export * from './lib/shared/cursor';
export * from './lib/shared/tar-contents';

export * from './lib/steps/step-base';
// steps (one folder each: step-*.ts = timeline, parts/ = visual pieces)
export * from './lib/steps/01-register/step-register';
export * from './lib/steps/01-register/parts/register-form';
export * from './lib/steps/02-dataset/step-dataset';
export * from './lib/steps/02-dataset/parts/hf-page';
export * from './lib/steps/02-dataset/parts/download-terminal';
export * from './lib/steps/03-code/step-code';
export * from './lib/steps/03-code/parts/code-editor';
export * from './lib/steps/03-code/parts/train-viz';
export * from './lib/steps/04-route/step-route';
export * from './lib/steps/04-route/parts/planner-map';
export * from './lib/steps/04-route/parts/planner-side';
export * from './lib/steps/05-queue/step-queue';
export * from './lib/steps/05-queue/parts/dashboard-nav';
export * from './lib/steps/05-queue/parts/queue-board';
export * from './lib/steps/05-queue/parts/tar-upload';
export * from './lib/steps/06-results/step-results';
export * from './lib/steps/06-results/parts/score-table';
export * from './lib/steps/06-results/parts/result-files';

export { Sequencer, prefersReducedMotion } from './lib/util/sequencer';
export * from './lib/util/cursor-script';
export * from './lib/util/rich-text';
