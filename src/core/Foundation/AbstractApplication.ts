import { ApplicationInterface } from "./ApplicationInterface.ts";

/**
 * Base application abstraction implementing mockable singleton pattern.
 */
export default abstract class AbstractApplication {
    /**
     * Internal application instance
     */
    protected static instance: ApplicationInterface | undefined;

    /**
     * Sets the application instance
     */
    public static setInstance(application: ApplicationInterface) {
        this.instance = application;
    }

    /**
     * Get the internal application instance
     */
    public static getInstance(): ApplicationInterface | never {
        if (!this.instance) {
            throw new Error(
                "Access of application instance before it has been set.",
            );
        }

        return this.instance;
    }
}
