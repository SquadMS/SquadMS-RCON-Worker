import { app } from "../../core/Helpers.ts";
import { EventEmitter } from "node:events";
import { serviceId as logServiceId } from "../../core/Logging/Log.ts";
import { Socket } from "node:net";

/**
 * Implements the connection to the Squad server's RCON service.
 */
export default class Connection extends EventEmitter {
    /**
     * The internal connection to the Squad server's RCON service
     */
    public readonly connection: Socket = new Socket();

    constructor(
        /**
         * Password used to authenticate the RCON connection.
         */
        private readonly password: string,
        /**
         * Host of the Squad srver's RCON service
         *
         * **Examples**
         * IPV4: 1.2.3.4
         * IPv6: 2001:0db8:85a3:0000:0000:8a2e:0370:7334
         */
        private readonly host: string,
        /**
         * Port number of the Squad server's RCON service.
         *
         * **Example:** 21114
         */
        private readonly port: number = 21114,
    ) {
        super();

        this.connection.on("close", this.onClose.bind(this));
        this.connection.on("error", this.onError.bind(this));
    }

    public async establish(): Promise<void> {
        // Use a new Promise to await the event based connection to either connect or fail
        await new Promise<void>((resolve, reject) => {
            app().get(logServiceId).info(
                `Connecting to: ${this.host}:${this.port}`,
            );

            // Handle successfull connection
            const onConnect = () => {
                app().get(logServiceId).info(
                    `Connected to: ${this.host}:${this.port}`,
                );

                // Resolve the promise
                resolve();
            };
            this.connection.prependOnceListener("connect", onConnect);

            // Handle failed connection
            const onError = (_error: Error) => {
                app().get(logServiceId).error(
                    `Failed to connect to: ${this.host}:${this.port}`,
                );

                // Reject the promise
                reject();
            };
            this.connection.prependOnceListener("error", onError);

            // Try to establish the connection
            this.connection.connect(this.port, this.host);
        });

        // Signal the successful connection
        this.emit("connect");
    }

    public async disconnect() {
        // Gracefully disconnec the socket
    }

    /**
     * Internal handler for the socket's close event
     */
    private onClose(error: boolean | string): void {
        if (error) {
            app().get(logServiceId).error(
                `Socket closed with an error: ${error}`,
            );
        } else {
            app().get(logServiceId).info(`Socket closed without an error.`);
        }

        // Handle the close
        this.emit("disconnect");
    }

    /**
     * Internal handler for the socket's error event
     */
    private onError(error: Error): void {
        app().get(logServiceId).error(
            `Socket threw the following error: ${error}`,
        );

        // Handle the error
        this.emit("error", error);
    }
}
