/**
 * https://github.com/5orenso
 *
 * Copyright (c) 2019-2020 Øistein Sørensen
 * Licensed under the MIT license.
 */
type PathOf<T> = T extends object ? {
    [K in keyof T]: K extends string ? (T[K] extends object ? `${K}` | `${K}.${PathOf<T[K]>}` : `${K}`) : never;
}[keyof T] : never;
type ValueAtPath<T, P extends string> = P extends `${infer K}.${infer Rest}` ? K extends keyof T ? ValueAtPath<T[K], Rest> : never : P extends keyof T ? T[P] : never;
export default class FastTypeCheck {
    static getType(element: unknown): string;
    static isError(element: unknown): boolean;
    static isArray(element: unknown): element is unknown[];
    static isObject(element: unknown): element is Record<string, unknown>;
    static isEmptyObject(element: unknown): boolean;
    static isString(element: unknown): element is string;
    static isDate(element: unknown): element is Date;
    static isNumber(element: unknown): element is number;
    static isFunction(element: unknown): element is (...args: unknown[]) => unknown;
    static isRegexp(element: unknown): element is RegExp;
    static isBoolean(element: unknown): element is boolean;
    static isNull(element: unknown): element is null;
    static isUndefined(element: unknown): element is undefined;
    static isDefined(element: unknown): element is Exclude<unknown, undefined>;
    static isMongoObject(element: unknown): boolean;
    static isArrayOfObjects(element: unknown): boolean;
    static isArrayOfArrays(element: unknown): boolean;
    static isArrayOfStrings(element: unknown): boolean;
    static isArrayOfNumbers(element: unknown): boolean;
    static isArrayOfMongoObjects(element: unknown): boolean;
    static isEqual(a: unknown, b: unknown): boolean;
    static isEqualArrays<T>(array1: T[], array2: T[]): boolean;
    static isEqualObjects(object1: Record<string, unknown>, object2: Record<string, unknown>): boolean;
    static isInArray<T>(finalArray: T[], objectElement: T): boolean;
    static isValidEmail(email: unknown): boolean;
    static ensureNumber(input: unknown, useUndefined?: boolean): number | undefined;
    static ensureString(input: unknown, useUndefined?: boolean): string | undefined;
    static ensureArray(input: unknown, useUndefined?: boolean): unknown[] | undefined;
    static ensureObject(input: unknown, useUndefined?: boolean): Record<string, unknown> | undefined;
    static ensureUniqArray<T>(input: T[]): T[];
    static ensureDate(input: unknown): Date | undefined;
    static ensureBoolean(input: unknown): boolean | undefined;
    static ensureValidEmail($email: unknown): string | undefined;
    static parseObject($obj: Record<string, unknown>, ...$args: unknown[]): unknown | null;
    static checkNested($obj: Record<string, unknown>, ...args: string[]): boolean;
    static getNestedValue<T>(obj: T, path: PathOf<T>): unknown | null;
    static setNestedValue<T extends Record<string, unknown>, P extends PathOf<T>>(obj: T, path: P, value: ValueAtPath<T, P>): T;
    static cleanObject($obj: Record<string, unknown>): Record<string, unknown>;
    static dump(input: unknown): string;
    static lc($str: unknown): string;
    static uc($str: unknown): string;
    static ucFirst($str: unknown, skipRest?: boolean): string;
    static ucFirstWord($str: unknown): string;
}
export {};
