import { ZWrapperVersion } from "../models/z-wrapper-version";

export interface GenericDAO<Model> {
    updateVersions(versions: ZWrapperVersion): Promise<boolean>;
    add(item: Model): Promise<boolean>;
    findById(key: any): Promise<Model|undefined>;
    update(model: Model): Promise<boolean>;
    deleteById(key: any): Promise<boolean>;
    deleteAll(): Promise<boolean>;
    fetch(filters?: any, sorts?: any, page?: any): Promise<Model[]>;
}