import arg from "arg";

export default arg({
    // Types
    '--help':    Boolean,
    '--version': Boolean,
    '--verbose': arg.COUNT,  // Counts the number of times --verbose is passed
    '--env':     String,      // --env <path>

    // Aliases
    '-h':        '--help',
    '-v':        '--verbose',
    '-e':        '--env'     // --env <path>
})