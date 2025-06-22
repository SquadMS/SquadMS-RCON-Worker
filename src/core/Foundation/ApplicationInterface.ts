import { ServiceIdentifier } from 'inversify'
import ServiceProvider from './ServiceProvider.ts'
import Newable from '../types/Newable.ts'

export interface ApplicationInterface {
    /**
     * Get a service from the container
     */
    get<T>(identifier: ServiceIdentifier<T>): T

    /**
     * Get all services for an identifier
     */
    getAll<T>(identifier: ServiceIdentifier<T>): T[]

    /**
     * Get a service asynchronously
     */
    getAsync<T>(identifier: ServiceIdentifier<T>): Promise<T>

    /**
     * Get all services asynchronously
     */
    getAllAsync<T>(identifier: ServiceIdentifier<T>): Promise<T[]>

    /**
     * Register a service provider instance
     */
    registerProvider(provider: Newable<ServiceProvider>): void

    /**
     * Perform the registration phase
     */
    register(): Promise<void>

    /**
     * Perform the boot phase
     */
    boot(): Promise<void>
}