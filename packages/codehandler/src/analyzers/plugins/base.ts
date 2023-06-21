import { SyftEventType } from '@syftdata/client';
import { type Usage } from '..';
import { SyntaxKind, type SourceFile, type Node, type ts } from 'ts-morph';
import { getTypeSchema } from '../../deserializer/ts_morph_utils';

export abstract class BaseAnalyser {
  isAMatch(expression: string): SyftEventType | undefined {
    return undefined;
  }

  getUsage(
    method: string,
    type: SyftEventType,
    args: Array<Node<ts.Node>>
  ): Usage | undefined {
    return undefined;
  }
}

export function handleSourceFile(
  sourceFile: SourceFile,
  plugins: BaseAnalyser[]
): Usage[] {
  const callExpressions = sourceFile.getDescendantsOfKind(
    SyntaxKind.CallExpression
  );
  return plugins.flatMap((plugin) => {
    const usages = callExpressions.map((callExpression) => {
      const expression = callExpression.getExpression();
      return { callExpression, type: plugin.isAMatch(expression.getText()) };
    });
    return usages
      .map(({ callExpression, type }) => {
        if (type === undefined) return undefined;
        const method = callExpression.getExpression().getText();
        const args = callExpression.getArguments();

        if (args.length === 0) return undefined;
        return plugin.getUsage(method, type, args);
      })
      .filter((a) => a != null) as Usage[];
  });
}

export function extractEventNameAndFields(
  method: string,
  args: Array<Node<ts.Node>>,
  eventType: SyftEventType = SyftEventType.TRACK
): Usage | undefined {
  const eventNameArg = args[0];
  let eventProperties = args.slice(1);
  let eventName: string | undefined;
  let eventNameType = eventNameArg.getType();

  if (args.length <= 1) {
    // args and event-name might be merged into one ?
    if (eventNameArg.isKind(SyntaxKind.ObjectLiteralExpression)) {
      const fields = eventNameArg.getChildrenOfKind(
        SyntaxKind.PropertyAssignment
      );
      const field = fields.find(
        (field) =>
          field.getName() === 'event_name' || field.getName() === 'eventName'
      );
      if (field?.getInitializer() != null) {
        eventNameType = (field.getInitializer() as any).getType();
      }
      // TODO: strip off this field from the schema.
      eventProperties = args;
    }
  }

  if (eventNameType.isStringLiteral()) {
    eventName = eventNameType.getLiteralValue() as string;
  } else {
    eventName = eventNameType.getText();
  }

  if (eventName == null) return undefined;

  const argTypes = eventProperties.map((arg) => {
    return getTypeSchema(arg.getType(), method);
  });
  const typeFields = argTypes.at(0)?.typeFields ?? [];
  const usageDetail: Usage = {
    eventType,
    eventName,
    typeFields
  };
  return usageDetail;
}
