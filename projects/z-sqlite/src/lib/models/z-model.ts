import { SQLiteObject } from "@ionic-native/sqlite/ngx";
import { DbDAO } from "../db/db-dao";
import { FakeDAO } from "../fake/fake-dao";
import { GenericDAO } from "../generic/generic-dao";
import { GenericLibDAO } from "../generic/generic-lib-dao";
import { ZWrapper } from "./z-wrapper";
import { ZWrapperVersion } from "./z-wrapper-version";
import { ZDataModel } from "./z-data-model";

export class ZModel<Model> implements GenericDAO<Model> {
    private dao: GenericLibDAO<Model>;
    private isFake: boolean = true;

    constructor(wrapper: ZWrapper, isFake: boolean, db?: SQLiteObject, data?: {db?: Model[], fake?:Model[]}) {
        this.isFake = isFake;
        if(!isFake && db){
            this.dao = new DbDAO<Model>(wrapper, db);

        } else {
            this.dao = new FakeDAO<Model>(wrapper);
        }

        this.dao.createTable().then();
        this.initData(data);
    }

    updateVersions(versions: ZWrapperVersion): Promise<boolean> {
        return this.dao.updateVersions(versions);
    }

    add(item: Model): Promise<boolean> {
        return this.dao.add(item);
    }

    findById(key: any): Promise<Model | undefined> {
        return this.dao.findById(key);
    }

    update(model: Model): Promise<boolean> {
        return this.dao.update(model);
    }

    deleteById(key: any): Promise<boolean> {
        return this.deleteById(key);
    }

    deleteAll(): Promise<boolean> {
        return this.deleteAll();
    }

    fetch(filters?: any, sorts?: any, page?: any): Promise<Model[]> {
        return this.dao.fetch(filters, sorts, page)
    }

    private async initData(data?: ZDataModel<Model>){
        if(data){
            if(data.required){
                for(let i = 0; i<data.required.length; i++){
                    await this.dao.add(data.required[i])
                }
            }
            if(this.isFake && data.fake){
                for(let i = 0; i<data.fake.length; i++){
                    await this.dao.add(data.fake[i])
                }
            }
        }
    }
}