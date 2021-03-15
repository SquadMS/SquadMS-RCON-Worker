import Logger from './core/logger.js';
import Rcon from './core/rcon.js';

export default class SquadRcon extends Rcon {

  constructor(options = {}) {
    super(options);

    this.keepAlive = this.keepAlive.bind(this);
  }

  async start() {
    await this.connect();
    await this.keepAlive();
  }

  async stop() {
    if (this.keepAliveTimeout) {
      clearTimeout(this.keepAliveTimeout);
    }

    try {
      await this.disconnect();
    } catch(e) {
      Logger.verbose('SquadRcon', 1, `Could not disconnect RCON during stop.`);
    }
  }

  processChatPacket(decodedPacket) {
    const matchChat = decodedPacket.body.match(
      /\[(ChatAll|ChatTeam|ChatSquad|ChatAdmin)] \[SteamID:([0-9]{17})] (.+?) : (.*)/
    );
    if (matchChat) {
      Logger.verbose('SquadRcon', 2, `Matched chat message: ${decodedPacket.body}`);

      this.emit('CHAT_MESSAGE', {
        raw: decodedPacket.body,
        chat: matchChat[1],
        steamID: matchChat[2],
        name: matchChat[3],
        message: matchChat[4],
        time: new Date()
      });

      return;
    }

    const matchPossessedAdminCam = decodedPacket.body.match(
      /\[SteamID:([0-9]{17})] (.+?) has possessed admin camera./
    );
    if (matchPossessedAdminCam) {
      Logger.verbose('SquadRcon', 2, `Matched admin camera possessed: ${decodedPacket.body}`);
      this.emit('POSSESSED_ADMIN_CAMERA', {
        raw: decodedPacket.body,
        steamID: matchPossessedAdminCam[1],
        name: matchPossessedAdminCam[2],
        time: new Date()
      });

      return;
    }

    const matchUnpossessedAdminCam = decodedPacket.body.match(
      /\[SteamID:([0-9]{17})] (.+?) has unpossessed admin camera./
    );
    if (matchUnpossessedAdminCam) {
      Logger.verbose('SquadRcon', 2, `Matched admin camera possessed: ${decodedPacket.body}`);
      this.emit('UNPOSSESSED_ADMIN_CAMERA', {
        raw: decodedPacket.body,
        steamID: matchUnpossessedAdminCam[1],
        name: matchUnpossessedAdminCam[2],
        time: new Date()
      });
    }

    const matchWarn = decodedPacket.body.match(
      /Remote admin has warned player (.*)\. Message was "(.*)"/
    );
    if (matchWarn) {
      Logger.verbose('SquadRcon', 2, `Matched warn message: ${decodedPacket.body}`);

      this.emit('PLAYER_WARNED', {
        raw: decodedPacket.body,
        name: matchWarn[1],
        reason: matchWarn[2],
        time: new Date()
      });

      return;
    }

    const matchKick = decodedPacket.body.match(
      /Kicked player ([0-9]+)\. \[steamid=([0-9]{17})] (.*)/
    );
    if (matchKick) {
      Logger.verbose('SquadRcon', 2, `Matched kick message: ${decodedPacket.body}`);

      this.emit('PLAYER_KICKED', {
        raw: decodedPacket.body,
        playerID: matchKick[1],
        steamID: matchKick[2],
        name: matchKick[3],
        time: new Date()
      });

      return;
    }

    const matchBan = decodedPacket.body.match(
      /Banned player ([0-9]+)\. \[steamid=(.*?)\] (.*) for interval (.*)/
    );
    if (matchBan) {
      Logger.verbose('SquadRcon', 2, `Matched ban message: ${decodedPacket.body}`);

      this.emit('PLAYER_BANNED', {
        raw: decodedPacket.body,
        playerID: matchBan[1],
        steamID: matchBan[2],
        name: matchBan[3],
        interval: matchBan[4],
        time: new Date()
      });
    }
  }

  async getCurrentMap() {
    const response = await this.execute('ShowCurrentMap');
    const match = response.match(/^Current level is (.*), layer is (.*)/);
    return { level: match[1], layer: match[2] };
  }

  async getNextMap() {
    const response = await this.execute('ShowNextMap');
    const match = response.match(/^Next level is (.*), layer is (.*)/);
    return {
      level: match[1] !== '' ? match[1] : null,
      layer: match[2] !== 'To be voted' ? match[2] : null
    };
  }

  async getListPlayers() {
    const response = await this.execute('ListPlayers');

    const players = [];

    for (const line of response.split('\n')) {
      const match = line.match(
        /ID: ([0-9]+) \| SteamID: ([0-9]{17}) \| Name: (.+) \| Team ID: ([0-9]+) \| Squad ID: ([0-9]+|N\/A)/
      );
      if (!match) continue;

      players.push({
        playerID: match[1],
        steamID: match[2],
        name: match[3],
        teamID: match[4],
        squadID: match[5] !== 'N/A' ? match[5] : null
      });
    }

    return players;
  }

  async broadcast(message) {
    await this.execute(`AdminBroadcast ${message}`);
  }

  async warn(steamID, message) {
    await this.execute(`AdminWarn "${steamID}" ${message}`);
  }

  async switchTeam(steamID) {
    await this.execute(`AdminForceTeamChange "${steamID}"`);
  }

  async keepAlive() {
    if (this.keepAliveTimeout) clearTimeout(this.keepAliveTimeout);

    Logger.verbose('SquadRcon', 1, `Sending KeepAlive Command`);

    try {
      this.players = (await this.getListPlayers())
    } catch (err) {
      Logger.verbose('SquadRcon', 1, 'Failed to keep alive.', err);
    }

    this.keepAliveTimeout = setTimeout(this.keepAlive, 30 * 1000);
  }
}