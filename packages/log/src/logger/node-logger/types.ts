export type Config = {
    /**
     * Prints a trace along with the original log.
     */
    trace: boolean;

    /**
     * Uses `console.table` for arrays of objects.
     */
    tableObjectArrays: boolean;

    /**
     * Uses `console.dir` for objects.
     */
    foldObject: boolean;

    /**
     * Adds pid, hostname, and worker thread id to the title.
     */
    processIdentity: boolean;
};
