import { ZWrapperVersionColum } from "./z-wrapper-version-column";

export interface ZWrapperVersion {
    name: string;
    highest: number;
    columns: ZWrapperVersionColum[]
}