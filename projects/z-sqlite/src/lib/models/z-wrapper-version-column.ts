import { ZWrapperColumn } from "./z-wrapper-column";

export interface ZWrapperVersionColum {
    action: 'ADD'|'REMOVE'|'MODIFY',
    column: ZWrapperColumn,
    version: number
}