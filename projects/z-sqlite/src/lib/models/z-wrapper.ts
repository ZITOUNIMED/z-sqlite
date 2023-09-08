import { ZWrapperColumn } from "./z-wrapper-column";
import { ZWrapperVersion } from "./z-wrapper-version";

export interface ZWrapper {
    tableName: string;
    entityName: string;
    primaryKeyColumn: ZWrapperColumn;
    columns: ZWrapperColumn[];
    version: ZWrapperVersion;
}