export type Config = {
    /**
     * Prints a trace along with the original log.
     */
    trace: boolean;

    /**
     * Prints group logs collapsed.
     */
    collapsedGroups: boolean;

    /**
     * Uses `console.table` for arrays of objects.
     */
    tableObjectArrays: boolean;

    /**
     * Uses `console.dir` for objects.
     */
    foldObject: boolean;
};