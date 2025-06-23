import { injectable, ServiceIdentifier } from "inversify";
import process from "node:process";

const Signals = {
    SIGINT: "SIGINT",
    SIGTERM: "SIGTERM",
    SIGHUP: "SIGHUP",
    SIGBREAK: "SIGBREAK",
} as const;

/**
 * Helper function that ensures that there is a "handle"
 * that keeps the process from exiting while the provided
 * Promise is being waited for.
 */
function asyncHandle<T>(promise: Promise<T>): Promise<T> {
    // Create a interval to act as our "handle"
    const keepAlive = setInterval(() => {}, 100);

    // Add a finally to remove the "handle" once it has finished
    return promise.finally(() => {
        // Remove the previously created "handle"
        clearInterval(keepAlive);
    });
}

export const serviceId: ServiceIdentifier<Shutdown> = Symbol.for("Shutdown");

@injectable("Singleton")
export default class Shutdown {
    /**
     * Determines if the shutdown has been triggered (already)
     */
    private triggered: boolean = false;

    /**
     * Internal registry of shutdown handlers
     */
    private handlers: Array<() => Promise<void>> = [];

    constructor() {
        // Determine if the process has a stdout
        if (process.stdout && typeof process.stdout.write === "function") {
            // Ensure the next output is written at the start of the line on SIGINT
            process.on(Signals.SIGINT, () => {
                process.stdout.write("\r");
            });
        }

        // Listen to the various shutdown signals
        for (const signal of Object.values(Signals)) {
            process.on(signal, () => {
                // Prevent duplicate invocations
                if (this.triggered) return;
                this.triggered = true;

                // Use async handle to ensure the Promise is NOT killed
                asyncHandle(this.shutdown());
            });
        }
    }

    /**
     * Adds the provided handler to the internal registry
     */
    public addHandler(handler: () => Promise<void>) {
        this.handlers.push(handler);
    }

    /**
     * Basically handles the shutdown procedure
     */
    public async shutdown() {
        // Resolve all registered handlers
        await Promise.all(this.handlers);

        // Exit the process successfully
        process.exit(0);
    }
}
