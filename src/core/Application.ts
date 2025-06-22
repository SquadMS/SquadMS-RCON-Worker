import { BindingActivation, BindingDeactivation, BindingIdentifier, Container, ContainerModule, IsBoundOptions, ServiceIdentifier } from 'inversify'
import container from './Container.ts'
import ServiceProvider from './Foundation/ServiceProvider.ts'
import AbstractApplication from './Foundation/AbstractApplication.ts'
import { ApplicationInterface } from './Foundation/ApplicationInterface.ts'
import Newable from './types/Newable.ts'

export default class Application extends AbstractApplication implements ApplicationInterface
{
    /**
     * Internal reference to the container implementation
     */
    private readonly container: Container = container

    /**
     * Internal registry of service providers
     */
    private providers: ServiceProvider[] = []

    /**
     * Internal registry of container modules
     */
    private modules: Map<ServiceProvider, ContainerModule> = new Map()

    /**
     * Determines if the application has finished the register phase
     */
    private registered: boolean = false

    public registerProvider(provider: Newable<ServiceProvider>) {
        this.providers.push(new provider)
    }

    public async register() {
        // Register all the providers container modules
        await this.container.load(
            ...this.providers.map(provider => this.containerModule(provider))
        )

        // Signal that registration is done
        this.registered = true
    }

    public async boot() {
        this.ensureRegistration()

        // Boot all the providers
        await Promise.all(
            this.providers.map(provider => provider.boot())
        )
    }

    public get<T>(serviceIdentifier: ServiceIdentifier<T>) {
        this.ensureRegistration()
        return this.container.get<T>(serviceIdentifier);
    }

    public getAll<T>(serviceIdentifier: ServiceIdentifier<T>) {
        this.ensureRegistration()
        return this.container.getAll<T>(serviceIdentifier);
    }

    public getAsync<T>(serviceIdentifier: ServiceIdentifier<T>) {
        this.ensureRegistration()
        return this.container.getAsync<T>(serviceIdentifier);
    }

    public getAllAsync<T>(serviceIdentifier: ServiceIdentifier<T>) {
        this.ensureRegistration()
        return this.container.getAllAsync<T>(serviceIdentifier);
    }

    /**
     * Small helper method to ensure the registration phase is finished.
     */
    private ensureRegistration(): void | never
    {
        if (! this.registered) {
            throw new Error('Application has not been registered yet!')
        }
    }

    /**
     * Helper method to get the container module instance for the given provider
     */
    private containerModule(provider: ServiceProvider): ContainerModule
    {
        // Initialize the container module if is not on the registry yet
        if (! this.modules.has(provider)) {
            // Intercept the original methods to allow for logging or additional functionality
            this.modules.set(provider, new ContainerModule(original => provider.register({
                bind: <T>(serviceIdentifier: ServiceIdentifier<T>) => {
                    return original.bind<T>(serviceIdentifier)
                },
                isBound: (serviceIdentifier: ServiceIdentifier, options?: IsBoundOptions) => {
                    return original.isBound(serviceIdentifier, options)
                },
                onActivation: <T>(serviceIdentifier: ServiceIdentifier<T>, activation: BindingActivation<T>) => {
                    return original.onActivation<T>(serviceIdentifier, activation)
                },
                onDeactivation: <T>(serviceIdentifier: ServiceIdentifier<T>, deactivation: BindingDeactivation<T>) => {
                    return original.onDeactivation<T>(serviceIdentifier, deactivation)
                },
                rebind: <T>(serviceIdentifier: ServiceIdentifier<T>) => {
                    return original.rebind<T>(serviceIdentifier)
                },
                rebindSync: <T>(serviceIdentifier: ServiceIdentifier<T>) => {
                    return original.rebindSync<T>(serviceIdentifier)
                },
                unbind: (serviceIdentifier: BindingIdentifier |ServiceIdentifier) => {
                    return original.unbind(serviceIdentifier)
                },
                unbindSync: (serviceIdentifier: BindingIdentifier |ServiceIdentifier) => {
                    return original.unbindSync(serviceIdentifier)
                }
            })))
        }
        
        // Get the container module instance from the registry
        return this.modules.get(provider) as ContainerModule
    }
}