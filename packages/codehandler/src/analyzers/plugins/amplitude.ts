import { SyftEventType } from '@syftdata/common/lib/client_types';
import { BaseAnalyser, extractEventNameAndFields } from './base';
import { type Node, type ts } from 'ts-morph';
import { type Usage } from '..';

export class AmplitudeAnalyser extends BaseAnalyser {
  isAMatch(expression: string): SyftEventType | undefined {
    if (expression.endsWith('.track')) {
      return SyftEventType.TRACK;
    }
    if (expression.endsWith('.page')) {
      return SyftEventType.PAGE;
    }
    if (expression.endsWith('.identify')) {
      return SyftEventType.IDENTIFY;
    }
    if (expression.endsWith('.setGroup')) {
      return SyftEventType.GROUP_IDENTIFY;
    }
    return super.isAMatch(expression);
  }

  getUsage(
    method: string,
    type: SyftEventType,
    args: Array<Node<ts.Node>>
  ): Usage | undefined {
    const usage = extractEventNameAndFields(method, args, type);
    if (type === SyftEventType.IDENTIFY) {
      if (usage != null) {
        usage.typeFields.push({
          name: usage.eventName,
          type: {
            name: 'string',
            zodType: 'z.string()'
          },
          isOptional: false
        });
        usage.eventName = 'UserIdentify';
      }
    }
    return usage;
  }
}
