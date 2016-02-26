import { test } from '../utils'

import { RuleTester } from 'eslint'

const ruleTester = new RuleTester()
    , rule = require('rules/no-deprecated')

ruleTester.run('no-deprecated', rule, {
  valid: [
    test({ code: "import { x } from './fake' " }),
    test({ code: "import bar from './bar'" }),

    test({ code: "import { fine } from './deprecated'" }),
    test({ code: "import { _undocumented } from './deprecated'" }),

    // naked namespace is fine
    test({ code: "import * as depd from './deprecated'" }),
    test({ code: "import * as depd from './deprecated'; console.log(depd.fine())" }),
    test({ code: "import { deepDep } from './deep-deprecated'" }),
    test({ code: "import { deepDep } from './deep-deprecated'; console.log(deepDep.fine())" }),

    // redefined
    test({
      code: "import { deepDep } from './deep-deprecated'; function x(deepDep) { console.log(deepDep.MY_TERRIBLE_ACTION) }",
    }),
  ],
  invalid: [

    // reports on parse errors even without specifiers
    test({ code: "import './malformed.js'", errors: 1 }),

    test({
      code: "import { fn } from './deprecated'",
      errors: ["Deprecated: please use 'x' instead."],
    }),

    test({
      code: "import TerribleClass from './deprecated'",
      errors: ['Deprecated: this is awful, use NotAsBadClass.'],
    }),

    test({
      code: "import { MY_TERRIBLE_ACTION } from './deprecated'",
      errors: ['Deprecated: please stop sending/handling this action type.'],
    }),

    // ignore redeclares
    test({
      code: "import { MY_TERRIBLE_ACTION } from './deprecated'; function shadow(MY_TERRIBLE_ACTION) { console.log(MY_TERRIBLE_ACTION); }",
      errors: ['Deprecated: please stop sending/handling this action type.'],
    }),

    // ignore non-deprecateds
    test({
      code: "import { MY_TERRIBLE_ACTION, fine } from './deprecated'; console.log(fine)",
      errors: ['Deprecated: please stop sending/handling this action type.'],
    }),

    // reflag on subsequent usages
    test({
      code: "import { MY_TERRIBLE_ACTION } from './deprecated'; console.log(MY_TERRIBLE_ACTION)",
      errors: [
        { type: 'ImportSpecifier', message: 'Deprecated: please stop sending/handling this action type.' },
        { type: 'Identifier', message: 'Deprecated: please stop sending/handling this action type.' },
      ],
    }),

    // don't flag other members
    test({
      code: "import { MY_TERRIBLE_ACTION } from './deprecated'; console.log(someOther.MY_TERRIBLE_ACTION)",
      errors: [
        { type: 'ImportSpecifier', message: 'Deprecated: please stop sending/handling this action type.' },
      ],
    }),

    // flag it even with members
    test({
      code: "import { MY_TERRIBLE_ACTION } from './deprecated'; console.log(MY_TERRIBLE_ACTION.whatever())",
      errors: [
        { type: 'ImportSpecifier', message: 'Deprecated: please stop sending/handling this action type.' },
        { type: 'Identifier', message: 'Deprecated: please stop sending/handling this action type.' },
      ],
    }),

    // works for function calls too
    test({
      code: "import { MY_TERRIBLE_ACTION } from './deprecated'; console.log(MY_TERRIBLE_ACTION(this, is, the, worst))",
      errors: [
        { type: 'ImportSpecifier', message: 'Deprecated: please stop sending/handling this action type.' },
        { type: 'Identifier', message: 'Deprecated: please stop sending/handling this action type.' },
      ],
    }),

    // deprecated full module
    test({
      code: "import Thing from './deprecated-file'",
      errors: [
        { type: 'ImportDeclaration', message: 'Deprecated: this module is the worst.' },
      ],
    }),

    // don't flag as part of other member expressions
    test({
      code: "import Thing from './deprecated-file'; console.log(other.Thing)",
      errors: [
        { type: 'ImportDeclaration', message: 'Deprecated: this module is the worst.' },
      ],
    }),

    // namespace following
    test({
      code: "import * as depd from './deprecated'; console.log(depd.MY_TERRIBLE_ACTION)",
      errors: [
        { type: 'Identifier', message: 'Deprecated: please stop sending/handling this action type.' },
      ],
    }),
    test({
      code: "import * as deep from './deep-deprecated'; console.log(deep.deepDep.MY_TERRIBLE_ACTION)",
      errors: [
        { type: 'Identifier', message: 'Deprecated: please stop sending/handling this action type.' },
      ],
    }),
    test({
      code: "import { deepDep } from './deep-deprecated'; console.log(deepDep.MY_TERRIBLE_ACTION)",
      errors: [
        { type: 'Identifier', message: 'Deprecated: please stop sending/handling this action type.' },
      ],
    }),
    test({
      code: "import { deepDep } from './deep-deprecated'; function x(deepNDep) { console.log(deepDep.MY_TERRIBLE_ACTION) }",
      errors: [
        { type: 'Identifier', message: 'Deprecated: please stop sending/handling this action type.' },
      ],
    }),
  ],
})