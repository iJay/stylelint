import execall from "execall"
import {
  blurComments,
  cssStatementHasBlock,
  cssStatementStringBeforeBlock,
  report,
  ruleMessages,
  validateOptions,
} from "../../utils"

export const ruleName = "number-no-trailing-zeros"

export const messages = ruleMessages(ruleName, {
  rejected: "Unexpected trailing zero(s)",
})

export default function (actual) {
  return (root, result) => {
    const validOptions = validateOptions(result, ruleName, { actual })
    if (!validOptions) { return }

    root.walkDecls(decl => {
      check(decl.toString(), decl)
    })

    root.walkAtRules(atRule => {
      const source = (cssStatementHasBlock(atRule))
        ? cssStatementStringBeforeBlock(atRule, { noBefore: true })
        : atRule.toString()
      check(source, atRule)
    })

    function check(source, node) {
      // Get out quickly if there are no periods
      if (source.indexOf(".") === -1) { return }

      const errors = execall(/\.\d*0+(?:\D|$)/g, blurComments(source))
      if (!errors.length) { return }

      errors.forEach(error => {
        report({
          message: messages.rejected,
          node,
          index: error.index + error.match.length -2,
          result,
          ruleName,
        })
      })
    }
  }
}
