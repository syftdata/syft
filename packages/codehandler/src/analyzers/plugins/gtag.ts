import { SyftEventType } from '@syftdata/common/lib/client_types';
import { BaseAnalyser, extractEventNameAndFields } from './base';
import { type Node, type ts } from 'ts-morph';
import { type Usage } from '..';

export class GAAnalyser extends BaseAnalyser {
  isAMatch(expression: string): SyftEventType | undefined {
    if (expression.endsWith('gtag')) {
      return SyftEventType.TRACK;
    }
    return undefined;
  }

  getUsage(
    method: string,
    type: SyftEventType,
    args: Array<Node<ts.Node>>
  ): Usage | undefined {
    // based on the first arg, we decide if it is track, identify or global.
    let realType: SyftEventType | undefined;
    const typeName = args[0].getType().getLiteralValue() as string;
    if (typeName === 'event') {
      realType = SyftEventType.TRACK;
    } else if (typeName === 'set') {
      realType = SyftEventType.IDENTIFY;
    }

    if (realType == null) return undefined;

    const realArgs = args.slice(1);
    const usage = extractEventNameAndFields(method, realArgs, realType);
    if (realType === SyftEventType.IDENTIFY) {
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
