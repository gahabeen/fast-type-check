/**
 * https://github.com/5orenso
 *
 * Copyright (c) 2019-2020 Øistein Sørensen
 * Licensed under the MIT license.
 */


// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import  assert from 'assert';
// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import { inspect } from 'util';

type PathOf<T> = T extends object
    ? { [K in keyof T]: K extends string ? (T[K] extends object ? `${K}` | `${K}.${PathOf<T[K]>}` : `${K}`) : never }[keyof T]
    : never;

type ValueAtPath<T, P extends string> = P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
    ? ValueAtPath<T[K], Rest>
    : never
    : P extends keyof T
    ? T[P]
    : never;

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export default class FastTypeCheck {
    static getType(element: unknown): string {
        return Object.prototype.toString.call(element);
    }

    static isError(element: unknown): boolean {
        return FastTypeCheck.getType(element) === '[object Error]';
    }

    static isArray(element: unknown): element is unknown[] {
        return FastTypeCheck.getType(element) === '[object Array]';
    }

    static isObject(element: unknown): element is Record<string, unknown> {
        return FastTypeCheck.getType(element) === '[object Object]';
    }

    static isEmptyObject(element: unknown): boolean {
        if (FastTypeCheck.isObject(element)) {
            const keys = Object.keys(element);
            return keys.length === 0;
        }
        return false;
    }

    static isString(element: unknown): element is string {
        return FastTypeCheck.getType(element) === '[object String]';
    }

    static isDate(element: unknown): element is Date {
        return FastTypeCheck.getType(element) === '[object Date]';
    }

    static isNumber(element: unknown): element is number {
        return FastTypeCheck.getType(element) === '[object Number]' && !Number.isNaN(element);
    }

    static isFunction(element: unknown): element is (...args: unknown[]) => unknown {
        return FastTypeCheck.getType(element) === '[object Function]';
    }

    static isRegexp(element: unknown): element is RegExp {
        return FastTypeCheck.getType(element) === '[object RegExp]';
    }

    static isBoolean(element: unknown): element is boolean {
        return FastTypeCheck.getType(element) === '[object Boolean]';
    }

    static isNull(element: unknown): element is null {
        return FastTypeCheck.getType(element) === '[object Null]';
    }

    static isUndefined(element: unknown): element is undefined {
        return FastTypeCheck.getType(element) === '[object Undefined]';
    }

    static isDefined(element: unknown): element is Exclude<unknown, undefined> {
        return !FastTypeCheck.isUndefined(element);
    }

    static isMongoObject(element: unknown): boolean {
        if (FastTypeCheck.isObject(element)) {
            return Object.prototype.hasOwnProperty.call(element, '_id') && /[a-z0-9]+/i.test(element._id as string);
        }
        return false;
    }

    static isArrayOfObjects(element: unknown): boolean {
        return FastTypeCheck.isArray(element) && element.length > 0 && element.every(item => FastTypeCheck.isObject(item));
    }

    static isArrayOfArrays(element: unknown): boolean {
        return FastTypeCheck.isArray(element) && element.length > 0 && element.every(item => FastTypeCheck.isArray(item));
    }

    static isArrayOfStrings(element: unknown): boolean {
        return FastTypeCheck.isArray(element) && element.length > 0 && element.every(item => FastTypeCheck.isString(item));
    }

    static isArrayOfNumbers(element: unknown): boolean {
        return FastTypeCheck.isArray(element) && element.length > 0 && element.every(item => FastTypeCheck.isNumber(item));
    }

    static isArrayOfMongoObjects(element: unknown): boolean {
        return FastTypeCheck.isArray(element) && element.length > 0 && element.every(item => FastTypeCheck.isMongoObject(item));
    }

    static isEqual(a: unknown, b: unknown): boolean {
        return Object.is(a, b);
    }

    static isEqualArrays<T>(array1: T[], array2: T[]): boolean {
        return array1.length === array2.length && array1.every((el, i) => FastTypeCheck.isEqual(el, array2[i]));
    }

    static isEqualObjects(object1: Record<string, unknown>, object2: Record<string, unknown>): boolean {
        try {
            assert.deepEqual(object1, object2);
            return true;
        } catch {
            return false;
        }
    }

    static isInArray<T>(finalArray: T[], objectElement: T): boolean {
        let idx = -1;
        if (FastTypeCheck.isObject(objectElement)) {
            idx = finalArray.findIndex(el => FastTypeCheck.isEqualObjects(el as Record<string, unknown>, objectElement));
        } else if (FastTypeCheck.isArray(objectElement)) {
            idx = finalArray.findIndex(el => FastTypeCheck.isEqualArrays(el as unknown[], objectElement));
        } else if (FastTypeCheck.isNumber(objectElement) || FastTypeCheck.isString(objectElement) || FastTypeCheck.isBoolean(objectElement)) {
            idx = finalArray.findIndex(el => FastTypeCheck.isEqual(el, objectElement));
        }
        return idx >= 0;
    }

    static isValidEmail(email: unknown): boolean {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    static ensureNumber(input: unknown, useUndefined = false): number | undefined {
        if (FastTypeCheck.isNumber(input)) {
            return input;
        }
        if (FastTypeCheck.isArray(input)) {
            return 0;
        }
        if (FastTypeCheck.isBoolean(input) && !!input) {
            return 1;
        }
        let number = input;
        if (FastTypeCheck.isString(input)) {
            number = input.replace(/,/g, '.').replace(/\s+/g, '');
        }
        number = Number.parseFloat(number as string);
        if (FastTypeCheck.isNumber(number)) {
            return number;
        }
        const integer = Number.parseInt(input as string, 10);
        return FastTypeCheck.isNumber(integer) ? integer : useUndefined ? undefined : 0;
    }

    static ensureString(input: unknown, useUndefined = false): string | undefined {
        if (FastTypeCheck.isString(input)) {
            return input;
        }
        if (FastTypeCheck.isArray(input) || FastTypeCheck.isNumber(input) || FastTypeCheck.isDate(input) || FastTypeCheck.isBoolean(input)) {
            return String(input);
        }
        return useUndefined ? undefined : '';
    }

    static ensureArray(input: unknown, useUndefined = false): unknown[] | undefined {
        if (FastTypeCheck.isArray(input)) {
            return input;
        }
        if (FastTypeCheck.isString(input) || FastTypeCheck.isNumber(input) || FastTypeCheck.isDate(input) || FastTypeCheck.isBoolean(input) || FastTypeCheck.isNull(input)) {
            return [input];
        }
        return useUndefined ? undefined : [];
    }

    static ensureObject(input: unknown, useUndefined = false): Record<string, unknown> | undefined {
        if (FastTypeCheck.isObject(input)) {
            return input;
        }
        if (FastTypeCheck.isString(input) && input !== '') {
            return { [input]: input };
        }
        if (FastTypeCheck.isNumber(input) && input !== 0) {
            return { [input]: input };
        }
        return useUndefined ? undefined : {};
    }

    static ensureUniqArray<T>(input: T[]): T[] {
        if (Array.isArray(input)) {
            const finalArray: T[] = [];
            for (const el of input) {
                if (!FastTypeCheck.isInArray(finalArray, el)) {
                    finalArray.push(el);
                }
            }
            return finalArray;
        }
        return input;
    }

    static ensureDate(input: unknown): Date | undefined {
        if (FastTypeCheck.isDate(input)) {
            return input;
        }
        if (FastTypeCheck.isString(input)) {
            return new Date(input);
        }
        if (FastTypeCheck.isNumber(input)) {
            return new Date(input < 9999999999 ? input * 1000 : input);
        }
        return undefined;
    }

    static ensureBoolean(input: unknown): boolean | undefined {
        if (FastTypeCheck.isBoolean(input)) {
            return input;
        }
        if (FastTypeCheck.isString(input)) {
            return input === 'true' || input === '1';
        }
        if (FastTypeCheck.isNumber(input)) {
            return input === 1;
        }
        return undefined;
    }

    static ensureValidEmail($email: unknown): string | undefined {
        const email = FastTypeCheck.ensureString($email)?.trim().toLowerCase();
        return email && FastTypeCheck.isValidEmail(email) ? email : undefined;
    }

    static parseObject($obj: Record<string, unknown>, ...$args: unknown[]): unknown | null {
        const args: string[] = Array.isArray($args[0]) ? $args[0] as string[] : $args as string[];
        let obj = $obj;
        for (const key of args) {
            if (!obj || !(key in obj)) {
                return null;
            }
            obj = obj[key] as Record<string, unknown>;
        }
        return typeof obj === 'object' ? obj : null;
    }

    static checkNested($obj: Record<string, unknown>, ...args: string[]): boolean {
        let obj = $obj;
        for (const key of args) {
            if (!obj || !(key in obj)) {
                return false;
            }
            obj = obj[key] as Record<string, unknown>;
        }
        return true;
    }

    static getNestedValue<T>(obj: T, path: PathOf<T>): unknown | null {
        if (!FastTypeCheck.isObject(obj) || !FastTypeCheck.isString(path)) {
            return null;
        }

        const parts = path.split('.');
        let el: unknown = obj;
        for (const part of parts) {
            el = (el as Record<string, unknown>)[part];
            if (el === undefined) {
                return null;
            }
        }
        return el;
    }

    static setNestedValue<T extends Record<string, unknown>, P extends PathOf<T>>(
        obj: T,
        path: P,
        value: ValueAtPath<T, P>
    ): T {
        const parts = path.split('.') as Array<keyof unknown>;
        let current = obj as Record<string, unknown>;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (i === parts.length - 1) {
                current[part] = value;
            } else {
                current = current[part] as Record<string, unknown>;
            }
        }

        return obj;
    }

    static cleanObject($obj: Record<string, unknown>): Record<string, unknown> {
        const obj = { ...$obj };
        for (const idx of Object.keys(obj)) {
            if (Object.prototype.hasOwnProperty.call(obj, idx)) {
                if (obj[idx] === undefined || obj[idx] === false || obj[idx] === null || Number.isNaN(obj[idx]) || FastTypeCheck.isEmptyObject(obj[idx])) {
                    delete obj[idx];
                }
            }
        };
        return obj;
    }

    static dump(input: unknown): string {
        return inspect(input, { showHidden: false, depth: null });
    }

    static lc($str: unknown): string {
        return FastTypeCheck.ensureString($str)?.toLowerCase() ?? '';
    }

    static uc($str: unknown): string {
        return FastTypeCheck.ensureString($str)?.toUpperCase() ?? '';
    }

    static ucFirst($str: unknown, skipRest = false): string {
        const str = FastTypeCheck.ensureString($str)?.trim();
        return str ? str.charAt(0).toUpperCase() + (skipRest ? '' : str.slice(1)) : '';
    }

    static ucFirstWord($str: unknown): string {
        const str = FastTypeCheck.ensureString($str)?.trim();
        return str ? str.split(' ').map(val => val.charAt(0).toUpperCase() + val.slice(1)).join(' ') : '';
    }
}