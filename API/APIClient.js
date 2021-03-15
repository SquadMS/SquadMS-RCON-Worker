import axios from 'axios';
import Logger from '../RCON/core/logger.js';
import routes from './routes.js';

export default class APIClient {
    constructor(baseURL, key) {
        this.baseURL = baseURL;

        this.axios = axios.create({
            baseURL: baseURL,
            timeout: 1000,
            headers: {
                'SQUADMS-WORKER-AUTH-TOKEN': key
            }
        });
    }

    async postMessage(serverId, chat, steamId64, player, message, time) {
        try {
            await this._post(routes.definitions.chatMessage, {
                server: serverId,
                chat: chat,
                steamId64: steamId64,
                player: player,
                message: message,
                time: time,
            });
        } catch(e) {
            Logger.verbose('APIClient', 1, 'Could not post ChatMessage. Error: ' + e.message);
        }
        
    }

    async postAdminCameraPosess(serverId, steamId64, player, time) {
        try {
            await this._post(routes.definitions.camPosessed, {
                server: serverId,
                steamId64: steamId64,
                player: player,
                time: time,
            });
        } catch(e) {
            Logger.verbose('APIClient', 1, 'Could not post AdminCameraPosses Event. Error: ' + e.message);
        } 
    }

    async postAdminCamerUnposess(serverId, steamId64, player, time) {
        try {
            await this._post(routes.definitions.camPosessed, {
                server: serverId,
                steamId64: steamId64,
                player: player,
                time: time,
            });
        } catch(e) {
            Logger.verbose('APIClient', 1, 'Could not post AdminCameraUnposses Event. Error: ' + e.message);
        }
    }

    async postPlayerWarned(serverId, player, message, time) {
        try {
            await this._post(routes.definitions.warned, {
                server: serverId,
                player: player,
                message: message,
                time: time,
            });
        } catch(e) {
            Logger.verbose('APIClient', 1, 'Could not post AdminCameraUnposses Event. Error: ' + e.message);
        }
    }

    async postPlayerKicked(serverId, steamId64, player, time) {
        try {
            await this._post(routes.definitions.kicked, {
                server: serverId,
                steamId64: steamId64,
                player: player,
                time: time,
            });
        } catch(e) {
            Logger.verbose('APIClient', 1, 'Could not post AdminCameraUnposses Event. Error: ' + e.message);
        }
    }

    async postPlayerBanned(serverId, steamId64, player, interval, time) {
        try {
            await this._post(routes.definitions.banned, {
                server: serverId,
                steamId64: steamId64,
                player: player,
                interval: interval,
                time: time,
            });
        } catch(e) {
            Logger.verbose('APIClient', 1, 'Could not post AdminCameraUnposses Event. Error: ' + e.message);
        }
    }

    async getServers() {
        try {
            return await this._get(routes.getServers);
        } catch(e) {
            Logger.verbose('APIClient', 1, 'Error fetching Servers: ' + e.message);
            throw e;
        }
    }

    _post(route, data = {}) {
        return this.axios.post(this.baseURL + route, data);
    }

    _get(route, data = {}) {
        return this.axios.get(this.baseURL + route, data);
    }
}