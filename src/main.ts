import args from './core/Arguments.ts'
import { bootstrap } from './core/Bootstrap.ts'
import dotenv from 'dotenv'
import packageJSON from '../package.json' with { type: 'json' }
import path from 'node:path'
import process from 'node:process'

// Show help if requested
if (args['--help']) {
	console.log('Squad RCON Worker ' + packageJSON.version)
	console.log('--help       Shows the help dialog. Aliases: -h')
	console.log('--version    Shows the version of the worker.')
	console.log('--verbose    Sets the verbosity, use like -v or -vvvv. Aliases: -v')
	console.log('--env        Set the path to the .env file, fallback is CWD. Aliases: -e')
	process.exit(0)
}

// Show version if requested
if (args['--version']) {
	console.log(packageJSON.version)
	process.exit(0)
}

// Load the DotEnv
const envPath = args['--env'] ?? path.resolve(process.cwd() + '/.env')
dotenv.config({
	path: envPath
})

// Start the application and its services
await bootstrap([
	// Load module service providers below
]);