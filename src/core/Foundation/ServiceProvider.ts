import { ContainerModuleLoadOptions } from 'inversify';
export default abstract class ServiceProvider
{
    /**
     * Handles the registration of services to the container
     */
    public abstract register(module: ContainerModuleLoadOptions): Promise<void>

    /**
     * Handles the boot of services in the container
     */
    public abstract boot(): Promise<void>
}