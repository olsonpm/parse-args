'use strict'

/**
 * README
 *  - covers a simple and strict case where only named arguments are allowed and
 *    must follow these rules
 *
 *    : if --help or --version are supplied, all other args are ignored
 *    : if --help and --version are supplied, only --help is parsed
 *    : other named args
 *       * must start with '--'
 *       * must provide values
 *       * cannot be a single letter
 *    : named args passed in the 'allowMultiple' parameter will always return as
 *      an array of values even if only one named arg is passed.  Also note,
 *      since commas should be allowed in values, multiple values must be passed
 *      by declaring multiple of the same named parameter
 *      e.g. --name phil --name matt
 *
 *    The result of this function is an object where the keys are the named
 *    parameters camelcased and the values are the raw strings (no type parsing
 *    is done)
 *
 *    e.g.
 *
 *    correct
 *      --name phil --age 32
 *      --name phil --name matt
 *
 *    incorrect
 *      -name phil
 *      --n phil
 *      --no-val
 *      positional-arg
 */

//---------//
// Imports //
//---------//

const camelcase = require('camelcase'),
  tedent = require('tedent')

//
//------//
// Main //
//------//

const namedSimple = ({ allArgs, allowMultiple = [] }) => {
  const result = initResult(allowMultiple)

  for (let i = 0; i < allArgs.length; i += 1) {
    const arg = allArgs[i]

    if (!arg.startsWith('--')) throwExpectedToBeNamed(arg, allArgs)

    if (i === allArgs.length - 1) throwLastArgCannotBeNamed(arg, allArgs)

    const key = camelcase(arg),
      val = allArgs[(i += 1)]

    if (Array.isArray(result[key])) result[key].push(val)
    else result[key] = val
  }

  return result
}

//
//------------------//
// Helper Functions //
//------------------//

function initResult(allowMultiple) {
  return allowMultiple.reduce((res, arg) => {
    res[camelcase(arg)] = []
    return res
  }, {})
}

function throwExpectedToBeNamed(arg, allArgs) {
  const errMsg = tedent(`
    the following argument was expected to be named: '${arg}'
    (i.e. it should begin with --)

    when parsing, this argument was expected to be named followed by a value.
    make sure to read the rules of this parsing function because it is strict
    in order to maintain simplicity.

    here are all the arguments passed: ${JSON.stringify(allArgs, null, 2)}
  `)

  const err = new Error(errMsg)

  err.id = 'expected to be named'

  throw err
}

function throwLastArgCannotBeNamed(arg, allArgs) {
  const errMsg = tedent(`
    The last argument cannot be named: ${arg}

    This is because all named parameters must have values

    here are all the arguments passed: ${JSON.stringify(allArgs, null, 2)}
  `)

  const err = new Error(errMsg)

  err.id = 'last arg cannot be named'

  throw err
}

//
//---------//
// Exports //
//---------//

module.exports = namedSimple
