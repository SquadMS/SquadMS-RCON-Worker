import { EventEmitter } from "node:events";
import Connection from "./Connection.ts";
import RCONOptions from "./RCONOptions.ts";
import { injectable, ServiceIdentifier } from "inversify";

export const ConnectionManagerId: ServiceIdentifier<ConnectionManager> = Symbol
    .for("ConnectionManager");

@injectable("Singleton")
export default class ConnectionManager extends EventEmitter {
    /**
     * Internal registry of the managed Connections.
     */
    private readonly connections: Connection[] = [];

    /**
     * Method to add a connection to the manager.
     */
    public async add(options: RCONOptions) {
        // Initialize the RCON connection handler
        const connection = new Connection(
            options.password,
            options.host,
            options.port,
        );

        // Listen to the connections events
        connection.on("error", (error) => {
            this.onError(connection, error);
        });
        connection.on("disconnect", () => {
            this.onDisconnect(connection);
        });
        connection.on("connect", () => {
            this.onConnect(connection);
        });

        // Add the connection to the registry
        this.connections.push(connection);

        // Establish the connection
        await connection.establish();
    }

    /**
     * Method to remove a connection from the manager.
     */
    public async remove(connection: Connection) {
        // Remove listeners registered by this Connection Manager

        // Remove the connection from the internal registry
        const index = this.connections.indexOf(connection);
        if (index !== -1) {
            this.connections.splice(index, 1);
        }

        // Gracefully stop the connection
        await connection.disconnect();
    }

    private async reConnect(connection: Connection) {
        // Reconnect strategy

        // Establish the connection
        await connection.establish();
    }

    /**
     * Internal handler of any connections error event
     */
    private async onError(connection: Connection, _error: Error) {
        // Handle the error

        // Handle (possible) reconnect
        await this.reConnect(connection);
    }

    /**
     * Internal handler of any connections disconnect event
     */
    private async onDisconnect(connection: Connection) {
        // Handle (possible) reconnect
        await this.reConnect(connection);
    }

    /**
     * Internal handler of any connections connect event
     */
    private async onConnect(_connection: Connection) {
        // Do nothing (for now)
    }
}
