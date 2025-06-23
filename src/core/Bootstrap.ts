import Application from "./Application.ts";
import { app } from "./Helpers.ts";
import LoggingServiceProvider from "./Logging/LoggingServiceProvider.ts";
import ServiceProvider from "./Foundation/ServiceProvider.ts";
import Newable from "./types/Newable.ts";
import { ApplicationInterface } from "./Foundation/ApplicationInterface.ts";
import CoreServiceProvider from "./CoreServiceProvider.ts";
import { serviceId as logServiceId } from "./Logging/Log.ts";

export async function bootstrap(
    providers: Newable<ServiceProvider>[] = [],
): Promise<ApplicationInterface> {
    // Initialize the application and set it's singleton instance
    Application.setInstance(
        new Application(),
    );

    // Add the core services
    providers.push(...[
        LoggingServiceProvider,
        CoreServiceProvider,
    ]);

    // Load service providers
    for (const provider of providers) {
        app().registerProvider(provider);
    }

    // Register and boot
    await app().register();
    await app().boot();

    app().get(logServiceId).logger.info("Successfully booted the application.");

    return app();
}
