import * as http from 'http';
import Logger from '../RCON/core/logger.js';

export default class APIServer {
    constructor(options = {}) {
        Logger.verbose('APIServer', 1, 'Initializing API...');

        this.options = options;

        this.host = options.hasOwnProperty('host') ? options.host : '0.0.0.0';
        this.port = options.hasOwnProperty('port') ? options.port : 8080;

        this.serverUpdatedCallback = options.hasOwnProperty('serverUpdatedCallback') ? options.serverUpdatedCallback : null;
        this.serverCommandCallback = options.hasOwnProperty('serverCommandCallback') ? options.serverCommandCallback : null;

        
    }

    async start() {
        await new Promise((resolve, reject) => {
            /* Create a new HTTP server and listen */
            this.server = http.createServer((request, res) => {
                /* Buffer request chunks */
                let body = '';
                request.on('data', chunk => body += chunk);

                /* Trigger once all data is received */
                request.on('end', () => {
                    this.process(request, res, body);
                });
            }).listen(this.port, this.host, () => {
                Logger.verbose('APIServer', 1, 'Initialized on ' + this.host + ':' + this.port + '.');

                resolve() 
            });
        });
    }

    async process(request, response, body) {
        /* Try to decode the request body */
        let decoded = null;
        try {
            decoded = JSON.parse(body);
        } catch (e) {
            Logger.verbose('APIServer', 1, 'Could not parse request body. Error: ' + e.message);

            this.respond(response, 500, {
                success: false,
                error: 'Could not parse request body.',
            });
        }

        /* Execute route and get code/content */
        const result = await this.routes(request, decoded);

        this.respond(response, result.code, result.content);
    }

    async routes(request, data) {
        if (request.url === '/server-updated') {
            if (this.serverUpdatedCallback) {
                return await this.serverUpdatedCallback(data.changed);
            }
        } else if (request.url === '/execute-command') {
            if (this.serverCommandCallback) {
                return await this.serverCommandCallback(data.id, data.command);
            }
        }

        Logger.verbose('APIServer', 1, 'No route found for request. URL: ' + request.url);

        return {
            code: 404,
            content: {
                success: false,
                error: 'Not found.',
            },
        }
    }
    
    respond(response, code, content) {
        /* Write the basic 200 JSON response header */
        response.writeHead(code, {
            'Content-Type': 'application/json'
        });

        response.write(JSON.stringify(content));

        /* End the Response */
        response.end();
    }

    stop() {
        this.server.close();

        Logger.verbose('APIServer', 1, 'Stopped');
    }
}