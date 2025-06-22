// Define the basic verbosity levels
const VerbosityLevel = {
    0: "error",
    1: "warn",
    2: "info",
    3: "http",
    4: "verbose",
    5: "debug",
    6: "silly",
} as const

// Infer the types from the previously defined mapping
export type VerbosityNumber = keyof typeof VerbosityLevel // 0 | 1 | ...
export type VerbosityString = typeof VerbosityLevel[VerbosityNumber] // "error" | ...

/**
 * Helper function to determine the proper level string for the provided number.
 */
export function verbosityToString<L extends VerbosityNumber>(level: L): typeof VerbosityLevel[L] {
    return VerbosityLevel[level];
}