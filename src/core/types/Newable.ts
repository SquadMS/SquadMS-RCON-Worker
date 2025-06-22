// deno-lint-ignore no-explicit-any
export default interface Newable<TInstance = unknown, TArgs extends unknown[] = any[]> {
    new (...args: TArgs): TInstance;
}