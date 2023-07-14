import { SyftEventType } from '@syftdata/common/lib/client_types';
import { BaseAnalyser, extractEventNameAndFields } from './base';
import { type Node, type ts } from 'ts-morph';
import { type Usage } from '..';

export class MixpanelAnalyser extends BaseAnalyser {
  isAMatch(expression: string): SyftEventType | undefined {
    if (expression.endsWith('.track')) {
      return SyftEventType.TRACK;
    }
    if (expression.endsWith('.page')) {
      return SyftEventType.PAGE;
    }
    if (expression.endsWith('.people.set')) {
      return SyftEventType.IDENTIFY;
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
          name: 'id',
          type: {
            name: 'string',
            zodType: 'z.string()',
            isArray: false
          },
          isOptional: false
        });
        usage.eventName = 'UserIdentify';
      }
    }
    return usage;
  }
}
