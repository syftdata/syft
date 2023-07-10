import { SyftEventType } from '@syftdata/client';
import { type Usage } from '..';
import {
  SyntaxKind,
  type SourceFile,
  type Node,
  type ts,
  type Type
} from 'ts-morph';
import { getTypeSchema } from '../../deserializer/ts_morph_utils';
import { type TypeField } from '@syftdata/common/lib/types';

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

function extractEventNameType(arg: Node<ts.Node>): Type<ts.Type> | undefined {
  const type = arg.getType();
  if (type.isObject()) {
    // args and event-name might be merged into one ?
    let eventNameProp = type.getProperties().find((prop) => {
      return prop.getName() === 'event_name' || prop.getName() === 'eventName';
    });
    if (eventNameProp == null) {
      // some people are using "action" instead of "event_name"
      eventNameProp = type.getProperties().find((prop) => {
        return prop.getName() === 'action' || prop.getName() === 'name';
      });
    }
    if (eventNameProp?.getDeclaredType() != null) {
      const eventNameType = eventNameProp.getDeclaredType();
      if (eventNameType.isString() || eventNameType.isStringLiteral()) {
        return eventNameType;
      }
    }

    if (arg.isKind(SyntaxKind.ObjectLiteralExpression)) {
      const fields = arg.getChildrenOfKind(SyntaxKind.PropertyAssignment);
      let field = fields.find(
        (field) =>
          field.getName() === 'event_name' || field.getName() === 'eventName'
      );
      if (field == null) {
        // some people are using "action" instead of "event_name"
        field = fields.find(
          (field) => field.getName() === 'action' || field.getName() === 'name'
        );
      }
      if (field?.getInitializer() != null) {
        const eventNameType = (
          field.getInitializer() as any
        ).getType() as Type<ts.Type>;
        if (eventNameType.isString() || eventNameType.isStringLiteral()) {
          return eventNameType;
        }
      }
    }
    return undefined;
  }
  return type;
}

export function extractEventNameAndFields(
  method: string,
  args: Array<Node<ts.Node>>,
  eventType: SyftEventType = SyftEventType.TRACK
): Usage | undefined {
  const eventNameArg = args[0];
  let eventProperties = args.slice(1);
  let eventName: string | undefined;
  const eventNameType = extractEventNameType(eventNameArg);

  // args and event-name might be merged into one ?
  if (eventNameArg.getType().isObject()) {
    // TODO: strip off this field from the schema.
    eventProperties = args;
  }

  if (eventNameType == null) return undefined;
  if (eventNameType.isStringLiteral()) {
    eventName = eventNameType.getLiteralValue() as string;
  } else {
    eventName = eventNameType.getText();
  }

  const argTypes = eventProperties.map((arg) => {
    return getTypeSchema(arg.getType(), method);
  });

  let typeFields: TypeField[] = [];
  // merge all the type fields into one.
  argTypes.forEach((argType) => {
    if (argType.typeFields == null) {
      // TODO: we need to get the argument name from the function definition.
      // const arg = eventProperties[idx];
      // typeFields.push({
      //   name: arg.getKindName(),
      //   type: {
      //     name: argType.name,
      //     zodType: 'z.any()'
      //   },
      //   isOptional: false
      // });
      return;
    }
    typeFields = typeFields.concat(argType.typeFields);
  });
  const usageDetail: Usage = {
    eventType,
    eventName,
    typeFields
  };
  return usageDetail;
}
