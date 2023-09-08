import { GenericDAO } from "./generic-dao";

export interface GenericLibDAO<Model> extends GenericDAO<Model> {
    createTable(): Promise<boolean>;
}