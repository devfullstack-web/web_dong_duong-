export function getOptionalEnv(value: string | undefined): string {
    return value?.trim() ?? '';
}

export function getRequiredEnv(value: string | undefined, name: string): string {
    const envValue = getOptionalEnv(value);

    if (!envValue) {
        throw new Error(`${name} is required`);
    }

    return envValue;
}

export function getRequiredPositiveIntegerEnv(
    value: string | undefined,
    name: string,
): number {
    const envValue = getRequiredEnv(value, name);
    const parsed = Number(envValue);

    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error(`${name} must be a positive integer`);
    }

    return parsed;
}
