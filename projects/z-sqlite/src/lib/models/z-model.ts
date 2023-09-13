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
    private successLogFn?: any;
    private errorLogFn?: any;

    constructor(private wrapper: ZWrapper, private data?: ZDataModel<Model>) {
        this.dao = new FakeDAO<Model>(wrapper);
    }

    async init(isFake: boolean, db?: SQLiteObject, successLogFn?: any, errorLogFn?: any){
        this.successLogFn = successLogFn;
        this.errorLogFn = errorLogFn;
        this.isFake = isFake;

        if(!isFake && db){
            if(this.successLogFn) this.successLogFn('CREATE NEW DB DAO: SUCCESS',);
            this.dao = new DbDAO<Model>(this.wrapper, db, this.successLogFn, this.errorLogFn);
        } else {
            if(this.successLogFn) this.successLogFn('CREATE NEW FAKE DAO: SUCCESS',);
            this.dao = new FakeDAO<Model>(this.wrapper, this.successLogFn, this.errorLogFn);
        }

        await this.dao.createTable();
        await this.initData(this.data);
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
        return this.dao.deleteById(key);
    }

    deleteAll(): Promise<boolean> {
        return this.dao.deleteAll();
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