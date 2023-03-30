'use strict';

const { getJSDocComment } = require('@es-joy/jsdoccomment');

function isExported(node, context) {
  // Check if we find the keyword export before the type declaration
  const sourceCode = context.getSourceCode(node);
  let before = sourceCode.getTokenBefore(sourceCode.getFirstToken(node));
  while (before && before.type === 'Keyword') {
    if (before.value === 'export') {
      return true;
    }
    before = sourceCode.getTokenBefore(before);
  }
  return false;
}

function checkNode(node, context) {
  if (!isExported(node, context)) return;
  const comment = getJSDocComment(context.getSourceCode(node), node, {
    minLines: 0,
    maxLines: 100
  });
  if (!comment) {
    context.report({
      node,
      messageId: 'no_tsdoc',
      data: {
        name: node.id.name
      }
    });
  }
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensures that syft event models have documentation',
      recommended: true,
      url: null // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [], // Add a schema if the rule has options
    messages: {
      no_tsdoc: "{{name}} doesn't have documentation."
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
