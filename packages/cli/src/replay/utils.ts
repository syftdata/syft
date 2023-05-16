import { type Step, StepType, type CustomStep } from '@puppeteer/replay';

interface SyftStepParams {
  name: 'syft';
  parameters: Record<string, any>;
}
export type SyftStep = CustomStep & SyftStepParams;
export function isSyftStep(step: Step): boolean {
  return step.type === StepType.CustomStep && step.name === 'syft';
}
export function getEventNameFrom(step: Step): string | undefined {
  if (!isSyftStep(step)) {
    return;
  }
  return (step as SyftStep).parameters.name as string;
}
