import { customType } from 'drizzle-orm/pg-core';

/**
 * A custom column type for storing embeddings via pgvector.
 */
interface PgVectorConfig {
    dimension: number;
}
export function pgVector(config: PgVectorConfig) {
    // In Drizzle v0.29+, we define custom columns with `customType`
    return customType<{
        data: number[];         // The TS type you use in your code
        driverData: number[];   // What gets passed to the DB driver
    }>({
        // dataType is how Drizzle creates the column in CREATE TABLE
        dataType() {
            return `vector(${config.dimension})`;
        },

        // fromDriver transforms DB driver data -> your TS type
        fromDriver(value: number[]) {
            return value;
        },

        // toDriver transforms your TS type -> DB driver data
        toDriver(value: number[]) {
            return value;
        },
    });
}