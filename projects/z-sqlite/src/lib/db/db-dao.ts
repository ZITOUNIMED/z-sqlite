import { SQLiteObject } from "@ionic-native/sqlite/ngx";
import { ZQueryBuilder } from "../builders/z-query-builder";
import { GenericLibDAO } from "../generic/generic-lib-dao";
import { ZWrapper } from "../models/z-wrapper";
import { ZWrapperVersion } from "../models/z-wrapper-version";
import { ZWrapperVersionColum } from "../models/z-wrapper-version-column";

export class DbDAO<Model> implements GenericLibDAO<Model> {
    private queryBuilder: ZQueryBuilder;

    constructor(private wrapper: ZWrapper, private db: SQLiteObject, private successLogFn?: any, private errorLogFn?: any){
        this.queryBuilder = new ZQueryBuilder(this.wrapper);
    }
 
    async fetch(filters?: any, sorts?: any, page?: any): Promise<Model[]> {
        let filtersMap = undefined;
        if(filters){
          filtersMap= new Map(Object.entries(filters));
        } 
        let sortsMap = undefined;
        if(sorts){
         sortsMap = new Map(Object.entries(sorts));
        }
        const res = await this.advancedFilterDb(filtersMap, sortsMap, page);
        const items: Model[] = [];
        for (let i = 0; i < res.rows.length; i++) {
             items.push(res.rows.item(i));
        }
        if (this.successLogFn) this.successLogFn('Fetch result: ', items);
        return Promise.resolve(items); 
     }
 
     async updateVersions(versions: ZWrapperVersion): Promise<boolean> {
         const map = new Map(Object.entries(versions));
         const lastVersion: number = map.get(this.wrapper.version.name)||0;
         const versionsToUpdate: ZWrapperVersionColum[] = this.wrapper.version.columns
                 .filter(v => v.version>lastVersion)
                 .sort((v1, v2) => v1.version>v2.version ? 1:-1);
         for(let i = 0; i<versionsToUpdate.length; i++){
             const version = versionsToUpdate[i];
             const query = this.queryBuilder.buildUpdateVersionQuery(version);
             await this.updateVersionDb(query);
         }
         return Promise.resolve(true)
     }
 
     async add(item: Model): Promise<boolean> {
         return this.addDb(item);
     }
 
     async findById(key: any): Promise<Model|undefined> {
         const res = await this.getByIdDb(key);
         const items = [];
         for (let i = 0; i < res.rows.length; i++) {
              items.push(res.rows.item(i));
         }
         if(items.length>0){
            if (this.successLogFn) this.successLogFn('Find by id result', items[0]);
             return Promise.resolve(items[0]);
         }
         return Promise.resolve(undefined);
     }
 
     async update(item: Model): Promise<boolean> {
        return this.updateDb(item);
     }
 
     async deleteById(key: any): Promise<boolean> {
       return this.deleteByIdDb(key);  
     }
 
     async deleteAll(): Promise<boolean> {
         return  this.deleteAllDb();
     }
 
     async createTable(): Promise<boolean> {
         return this.createTableDb();
     }
 
     private updateVersionDb(query: string): Promise<boolean> {
        if (this.successLogFn) this.successLogFn('Update version query: ', query);
         return this.db
         .executeSql(query)
         .then(() => {
            if (this.successLogFn) this.successLogFn('Update version success', );
            return Promise.resolve(true);
        })
         .catch((e: any) => {
            if (this.errorLogFn) this.errorLogFn('Update version error: ', e);
            return Promise.resolve(false)
        });
     }
 
     private addDb(item: Model): Promise<boolean> {
         const query = this.queryBuilder.buildAddItemQuery(item);
         if (this.successLogFn) this.successLogFn('Add query', query);
         return this.db
         .executeSql(query)
         .then(() => {
            if (this.successLogFn) this.successLogFn('Add success', );
             return Promise.resolve(true);
         })
         .catch((e: any) => {
            if (this.errorLogFn) this.errorLogFn('Add Error: ', e);
            return Promise.resolve(false);
        });
     }
 
     private advancedFilterDb(filterColumns?: Map<string, any>, sortColumns?: Map<string, any>, page?: any): Promise<any> {
         const query = this.queryBuilder.buildAdvancedFilterQuery(filterColumns, sortColumns, page);
         if (this.successLogFn) this.successLogFn('fetch query', query);
         return this.db
         .executeSql(query)
         .then((res: any) => {
            if (this.successLogFn) this.successLogFn('Fetch success', );
             return res;
         })
         .catch((e: any) => {
            if (this.errorLogFn) this.errorLogFn('Fetch error: ', e);
            return Promise.resolve(false)
         });
     }
 
     private getByIdDb(key: any): Promise<any> {
         const query = this.queryBuilder.buildGetByPrimaryKeyQuery(key);
         if (this.successLogFn) this.successLogFn('Find By ID Query: ', query);
         return this.db
         .executeSql(query)
         .then((res: any) => {
            if (this.successLogFn) this.successLogFn('Find By ID success');
             return res;
         })
         .catch((e: any) => {
            if (this.successLogFn) this.successLogFn('find By ID error: ', e);
           return Promise.resolve(false);
         });
     }
 
     private updateDb(item: Model): Promise<boolean> {
         const query = this.queryBuilder.buildUpdateItemQuery(item);
         if (this.successLogFn) this.successLogFn('Update Query: ', query);
         return this.db
         .executeSql(query)
         .then(() => {
            if (this.successLogFn) this.successLogFn('Update success', );
             return Promise.resolve(true)
         })
         .catch((e: any) => {
            if (this.errorLogFn) this.errorLogFn('Update error: ', e);
           return Promise.resolve(false);
         });
     }
 
     private deleteByIdDb(key: any): Promise<boolean> {
         const query = this.queryBuilder.buildDeleteItemQuery(key);
         if (this.successLogFn) this.successLogFn('Delete By Id Query', query);
         return this.db
         .executeSql(query)
         .then(() => {
            if (this.successLogFn) this.successLogFn('Delete By ID success', );
             return Promise.resolve(true)
         })
         .catch((e: any) => {
            if (this.errorLogFn) this.errorLogFn('Delete by id error: ', e);
           return Promise.resolve(false);
         });
     }
 
     private deleteAllDb(): Promise<boolean> {
         const query = this.queryBuilder.buildDeleteAllItemsQuery();
         if (this.successLogFn) this.successLogFn('Delete All Query: ', query);
         return this.db
         .executeSql(query)
         .then(() => {
            if (this.successLogFn) this.successLogFn('Delete all success', );
             return Promise.resolve(true)
         })
         .catch((e: any) => {
            if (this.errorLogFn) this.errorLogFn('Delete all error: ', e);
           return Promise.resolve(false)
         });
     }
 
     private async createTableDb(): Promise<boolean> {
         const isExists = await this.isTableAlreadyExists();

         if(isExists){
            return Promise.resolve(true)
         }
         const query = this.queryBuilder.buildCreateTableQuery();
         if (this.successLogFn) this.successLogFn(`Create table ${this.wrapper.tableName} Query: `, query);
         return this.db
         .executeSql(query)
         .then(() => {
            if (this.successLogFn) this.successLogFn(`Create table ${this.wrapper.tableName} success.`);
             return Promise.resolve(true);
         })
         .catch((e: any) => {
            if (this.errorLogFn) this.errorLogFn('create table error: ', e);
           return Promise.resolve(false)
         });
     }

     private async isTableAlreadyExists(): Promise<boolean>{
        const query = this.queryBuilder.buildIsAlreadyExistingTableQuery();
        let res = undefined;
        try {
            res = await this.db.executeSql(query);
        } catch {
            res = undefined;
        }
        
        if(res && res.rows){
            if(this.successLogFn) this.successLogFn(`Table ${this.wrapper.tableName} is already existing.`)
            return Promise.resolve(true);
        }
        if(this.successLogFn) this.successLogFn(`Table ${this.wrapper.tableName} is not exisiting.`)
        return Promise.resolve(false);
     }
     
}