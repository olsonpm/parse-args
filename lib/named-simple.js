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
 *    : if 'commands' is passed, then the first argument must be one of the
 *      commands in that array (note, commands are not named)
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

const namedSimple = ({ allArgs, allowMultiple = [], commands = [] }) => {
  if (allArgs.includes('--help')) return { help: true }
  if (allArgs.includes('--version')) return { version: true }

  const result = initResult(allowMultiple)

  handleCommand(allArgs, commands, result)

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

/**
 * mutates allArgs and result
 */
function handleCommand(allArgs, commands, result) {
  if (!commands.length) return

  const theCommand = allArgs[0]

  let err

  if (!allArgs.length) {
    err = new Error('you must pass a command as your first argument')

    err.id = 'no command given'
  } else if (!commands.includes(theCommand)) {
    const errMsg = tedent(`
      the command you passed '${theCommand}' doesn't exist
      commands: ${commands.join(', ')}
    `)

    err = new Error(errMsg)

    err.id = "command given doesn't exist"
  }

  if (err) {
    err.group = 'cannot parse'
    throw err
  }

  result._command = allArgs[0]
  allArgs.shift()
}

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

    here are all the arguments passed: ${JSON.stringify(allArgs, null, 2)}
  `)

  const err = new Error(errMsg)

  err.id = 'expected to be named'
  err.group = 'cannot parse'

  throw err
}

function throwLastArgCannotBeNamed(arg, allArgs) {
  const errMsg = tedent(`
    The last argument cannot be named because all named parameters must have values

    last argument: ${arg}

    here are all the arguments passed: ${JSON.stringify(allArgs, null, 2)}
  `)

  const err = new Error(errMsg)

  err.id = 'last arg cannot be named'
  err.group = 'cannot parse'

  throw err
}

//
//---------//
// Exports //
//---------//

module.exports = namedSimple
