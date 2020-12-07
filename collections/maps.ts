export function copy<T, U>(map: ReadonlyMap<T, U>): Map<T, U> {
    return new Map(map);
}

export function mapValue<T, U, V>(map: ReadonlyMap<T, U>, f: (value: U, key: T) => V): Map<T, V> {
    const result = new Map();
    for (const [key, value] of map.entries()) {
        result.set(key, f(value, key));
    }
    return result;
}

export function mapValueFn<T, U, V>(
    f: (value: U, key: T) => V
): (map: ReadonlyMap<T, U>) => Map<T, V> {
    return map => mapValue(map, f);
}

export function insert<T, U>(map: ReadonlyMap<T, U>, key: T, value: U): Map<T, U> {
    return copy(map).set(key, value);
}
