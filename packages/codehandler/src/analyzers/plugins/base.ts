import { SyftEventType } from '@syftdata/client';
import { type Usage } from '..';
import {
  SyntaxKind,
  type SourceFile,
  type Node,
  type ts,
  type Type
} from 'ts-morph';
import {
  extractFieldsFromObjectLiteral,
  extractPropsFromObjectType,
  getTypeSchema
} from '../../deserializer/ts_morph_utils';
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
    const props = extractPropsFromObjectType(type);
    const eventNamePropType =
      props.get('event_name') ??
      props.get('eventName') ??
      props.get('action') ??
      props.get('name');
    if (eventNamePropType != null) {
      if (eventNamePropType.isString() || eventNamePropType.isStringLiteral()) {
        return eventNamePropType;
      }
    }

    // TODO: check if this is still needed or not.
    if (arg.isKind(SyntaxKind.ObjectLiteralExpression)) {
      const fields = extractFieldsFromObjectLiteral(arg);
      const field =
        fields.get('event_name') ??
        fields.get('eventName') ??
        fields.get('action') ??
        fields.get('name');
      if (field != null) {
        const eventNameType = field.getType();
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
