import SquadServer from './RCON/squad-server.js';
import APIClient from './API/APIClient.js';
import APIServer from './API/APIServer.js';
import Logger from './RCON/core/logger.js';

export default class SquadRCONWorker {
    constructor() {
        Logger.verbose('Worker', 1, 'Initializing...');

        /* Server lookup */
        this.servers = {};
        this.connectionFailed = {};

        /* Running state, flip to stop */
        this.running = true;

        Logger.verbose('Worker', 1, 'Initialized!');
    }

    async serverUpdatedCallback(changed) {
        await this.syncServers(changed);

        return {
            code: 200,
            content: 'Success',
        }
    }

    async serverCommandCallback(id, command) {
        if (this.servers[id]) {
            try {
                const result = await this.servers[id].execute(command);
            
                Logger.verbose('Worker', 1, 'Successfully executed: ' + command);
    
                return {
                    code: 200,
                    content: result,
                }
            } catch(e) {
                Logger.verbose('Worker', 1, 'Error executing: ' + command + '. Error: ' + e.message);

                return {
                    code: 500,
                    content: {
                        success: false,
                        error: 'Error executing: ' + command + '. Error: ' + e.message,
                    }
                }
            }
        } else {
            Logger.verbose('Worker', 1, 'Error executing: ' + command + '. No server for id: ' + id);

            return {
                code: 404,
                content: {
                    success: false,
                    error: 'Error executing: ' + command + '. No server for id: ' + id,
                }
            }
        }
    }

    async init() {
        this.apiClient = new APIClient(process.env.SQMS_WORKER_API_HOST || 'http://localhost', process.env.SQMS_WORKER_AUTH_TOKEN || null);
        this.apiServer = new APIServer({
            host: process.env.SQMS_WORKER_BIND_IP || '0.0.0.0', 
            port: process.env.SQMS_WORKER_BIND_PORT || 8080,
            serverUpdatedCallback: this.serverUpdatedCallback.bind(this),
            serverCommandCallback: this.serverCommandCallback.bind(this),
        });
        await this.apiServer.start();
    }

    async run() {
        await this.init();

        while(this.running) {
            await this.syncServers();
            
            await this.sleep(15000);
        }

        await this.shutdown();
    }

    async shutdown() {
        Logger.verbose('Worker', 1, 'Shutting down.');

        /* Stop API Server */
        this.apiServer.stop();

        /* Remove all servers */
        for (const serverId of Object.keys(this.servers)) {
            await this.removeServer(serverId);
        }

        Logger.verbose('Worker', 1, 'Shutdown successfully.');
    }

    async syncServers(changed = null) {
        /* If there is a changed server that has been blacklisted unlist it */
        if (Object.keys(this.connectionFailed).includes(changed)) {
            this.connectionFailed[changed] = 0;
        }

        /* If there is a changed server unwatch and remove it first */
        if (Object.keys(this.servers).includes(changed)) {
            await this.removeServer(changed);
        }

        const remoteIds = [];
        let response;
        try {
            response = await this.apiClient.getServers();
        } catch (e) {
            return;
        }

        for (const datum of response.data) {
            /* Add Server id to the remote id list */
            remoteIds.push(parseInt(datum.id));

            /* Add and watch server if it does not already exist */
            if (!this.servers[datum.id] && (!this.connectionFailed[datum.id] || this.connectionFailed[datum.id] <= 2)) {
                await this.addServer(datum);
            }
        }

        /* Remove servers that do not exist any longer */
        for (const serverId of Object.keys(this.servers)) {
            if (!remoteIds.includes(parseInt(serverId))) {
                await this.removeServer(serverId);
            }
        }
    }

    async addServer(data) {
        /* initialize a new Server */
        const server = new SquadServer({
            host: data.host,
            port: data.rcon_port,
            password: data.rcon_password,
        });

        /* Listen for events */
        server.removeAllListeners('CHAT_MESSAGE').on('CHAT_MESSAGE', event => {
            this.apiClient.postMessage(data.id, event.chat, event.steamID, event.name, event.message, event.time.toIsoString());
        });

        server.removeAllListeners('POSSESSED_ADMIN_CAMERA').on('POSSESSED_ADMIN_CAMERA', event => {
            this.apiClient.postAdminCameraPosess(data.id, event.steamID, event.name, event.time.toIsoString());
        });

        server.removeAllListeners('UNPOSSESSED_ADMIN_CAMERA').on('UNPOSSESSED_ADMIN_CAMERA', event => {
            this.apiClient.postAdminCamerUnposess(data.id, event.steamID, event.name, event.time.toIsoString());
        });

        server.removeAllListeners('PLAYER_WARNED').on('PLAYER_WARNED', event => {
            this.apiClient.postPlayerWarned(data.id, event.name, event.message, event.time.toIsoString());
        });

        server.removeAllListeners('PLAYER_KICKED').on('PLAYER_KICKED', event => {
            this.apiClient.postPlayerKicked(data.id, event.steamID, event.name, event.time.toIsoString());
        });

        server.removeAllListeners('PLAYER_BANNED').on('PLAYER_BANNED', event => {
            this.apiClient.postPlayerBanned(data.id, event.steamID, event.name, event.interval, event.time.toIsoString());
        });

        try {
            /* Watch the servers rcon socket */
            await server.start();

            /* Add to the local lookup */
            this.servers[data.id] = server;

            Logger.verbose('Worker', 1, 'Added Server.');
        } catch(e) {
            /* Increase connection failed count */
            this.connectionFailed[data.id] = (this.connectionFailed[data.id] || 0) + 1;

            /* Log */
            Logger.verbose('Worker', 1, 'Could not connect to server: ' + data.id + '. Attempts: ' + this.connectionFailed[data.id]);
        }
    }

    async removeServer(id) {
        if (this.servers[id]) {
            await this.servers[id].stop();
            delete this.servers[id];
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
