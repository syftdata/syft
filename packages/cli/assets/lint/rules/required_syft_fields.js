'use strict';

const { getJSDocComment } = require('@es-joy/jsdoccomment');

const REQUIRED_FIELDS = {
  IDENTIFY: ['userId'],
  GROUP_IDENTIFY: ['groupId', 'groupType'],
  PAGE: ['name'],
  SCREEN: ['name']
};

function checkNode(node, context) {
  const comment = getJSDocComment(context.getSourceCode(node), node, {
    minLines: 0,
    maxLines: 100
  });
  if (!comment) return;
  const defType = comment.value.match(/@type {SyftEventType.(.*)}/);
  if (defType == null) return;
  const requiredFieldNames = REQUIRED_FIELDS[defType[1]];
  if (requiredFieldNames == null) return;
  const fieldNames = new Set(
    node.body.body.map((field) => {
      return field.key.name;
    })
  );
  const notFound = requiredFieldNames.filter(
    (fieldName) => !fieldNames.has(fieldName)
  );
  if (notFound.length > 0) {
    context.report({
      node,
      messageId: 'no_required_fields',
      data: {
        name: node.id.name,
        syftType: defType[1],
        notFound
      }
    });
  }
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensures that syft event models have required fields',
      recommended: true,
      url: null // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [], // Add a schema if the rule has options
    messages: {
      no_required_fields:
        '{{name}} is declared as {{syftType}} and requires {{notFound}} in its fields.'
    }
  },
  create: function (context) {
    return {
      TSInterfaceDeclaration(node) {
        checkNode(node, context);
      },
      ClassDeclaration(node) {
        checkNode(node, context);
      }
    };
  }
};
