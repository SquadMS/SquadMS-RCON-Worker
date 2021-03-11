import arg from 'arg';
import dotenv from 'dotenv';
import path from 'path';

import SquadRCONWorker from'./SquadRCONWorker.js';
import Logger from './RCON/core/logger.js';

/* Load package.json */
import packageJSON from './package.json';

/* Retrieve CLI arguments */
const args = arg({
	// Types
	'--help':    Boolean,
    '--version':    Boolean,
	'--verbose': arg.COUNT,  // Counts the number of times --verbose is passed
	'--env':     String,      // --env <path>

	// Aliases
    '-h':        '--help',
	'-v':        '--verbose',
	'-e':        '--env'     // --env <path>
});

/* Show help if requested */
if (args['--help']) {
    console.log('SquadMS RCON Worker v' + packageJSON.version);
    console.log('--help       Shows the help dialog. Aliases: -h');
    console.log('--version    Shows the version of the worker.');
    console.log('--verbose    Sets the verbosity, use like -v or -vvvv. Aliases: -v');
    console.log('--env        Set the path to the .env file, fallback is CWD. Aliases: -e');
    exit(0);
}

/* Show version if requested */
if (args['--version']) {
    console.log(packageJSON.version);
    exit(0);
}

/* Load .ENV */
dotenv.config({
    path: path.resolve(args['--env'] ?? process.cwd(), '.env'),
});

/* Configure Logger */
const verbosity = args['--verbose'] ?? 0;
Logger.setVerboseness('RCON', verbosity);
Logger.setVerboseness('SquadRcon', verbosity);
Logger.setVerboseness('Worker', verbosity);
Logger.setVerboseness('APIClient', verbosity);
Logger.setVerboseness('APIServer', verbosity);

/* Initialize the Worker */
const worker = new SquadRCONWorker();

/* Register stop listeners to shutdown gracefully */
process.on('SIGTERM', () => {
    worker.running = false;
})
process.on('SIGINT', () => {
    worker.running = false;
});

/* Run it */
worker.run();