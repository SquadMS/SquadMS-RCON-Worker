import { injectable, ServiceIdentifier } from 'inversify';
import winston from 'winston'
import type { VerbosityString } from './Verbosity.ts';

// Define the container service identifier for this service
export const serviceId: ServiceIdentifier<Log> = Symbol.for('Log')

@injectable('Singleton')
export class Log
{
    // Instance of the Winston logging library
    public readonly logger: winston.Logger;

    // Declare redirected Winston methods
    error!: winston.LeveledLogMethod;
    warn!: winston.LeveledLogMethod;
    info!: winston.LeveledLogMethod;
    http!: winston.LeveledLogMethod;
    verbose!: winston.LeveledLogMethod;
    debug!: winston.LeveledLogMethod;
    silly!: winston.LeveledLogMethod;
    log!: winston.LogMethod;

    constructor(
        /**
         * Determines the level of the internal winston instance.
         */
        level: VerbosityString = 'error',

        /**
         * Defines the filename of the persistent log file.
         */
        file: string = 'app.log',

        /**
         * Toggles log output to the console.
         */
        logToConsole: boolean = true
    ) {
        // Initialize winston with the provided configuration
        this.logger = winston.createLogger({
            level: level,
            format: winston.format.json(),
            transports: [
                // Write all logs to file
                new winston.transports.File({
                    filename: file
                })
            ]
        })

        // Determine if logs should be shown to console
        if (logToConsole) {
            this.logger.add(new winston.transports.Console({
                format: winston.format.simple()
            }))
        }

        // Map redirected Winston methods
        this.error = this.logger.error.bind(this.logger);
        this.warn = this.logger.warn.bind(this.logger);
        this.info = this.logger.info.bind(this.logger);
        this.http = this.logger.http.bind(this.logger);
        this.verbose = this.logger.verbose.bind(this.logger);
        this.debug = this.logger.debug.bind(this.logger);
        this.silly = this.logger.silly.bind(this.logger);
        this.log = this.logger.log.bind(this.logger);
    }
}