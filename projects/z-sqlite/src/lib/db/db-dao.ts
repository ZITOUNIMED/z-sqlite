import { SQLiteObject } from "@ionic-native/sqlite/ngx";
import { ZQueryBuilder } from "../builders/z-query-builder";
import { GenericLibDAO } from "../generic/generic-lib-dao";
import { ZWrapper } from "../models/z-wrapper";
import { ZWrapperVersion } from "../models/z-wrapper-version";
import { ZWrapperVersionColum } from "../models/z-wrapper-version-column";

export class DbDAO<Model> implements GenericLibDAO<Model> {
    private queryBuilder: ZQueryBuilder;

    constructor(private wrapper: ZWrapper, private db: SQLiteObject){
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
         return this.db
         .executeSql(query, [])
         .then(() => {
            return Promise.resolve(true);
        })
         .catch((e: any) => {
            return Promise.reject(false)
        });
     }
 
     private addDb(item: Model): Promise<boolean> {
         const query = this.queryBuilder.buildAddItemQuery(item);
         return this.db
         .executeSql(query, [])
         .then(() => {
             return Promise.resolve(true);
         })
         .catch((e: any) => {
            return Promise.reject(false);
        });
     }
 
     private advancedFilterDb(filterColumns?: Map<string, any>, sortColumns?: Map<string, any>, page?: any): Promise<any> {
         const query = this.queryBuilder.buildAdvancedFilterQuery(filterColumns, sortColumns, page);
         return this.db
         .executeSql(query, [])
         .then((res: any) => {
             return res;
         })
         .catch((e: any) => {
            return Promise.reject(false)
         });
     }
 
     private getByIdDb(key: any): Promise<any> {
         const query = this.queryBuilder.buildGetByPrimaryKeyQuery(key);
         return this.db
         .executeSql(query, [])
         .then((res: any) => {
             return res;
         })
         .catch((e: any) => {
           return Promise.reject(false);
         });
     }
 
     private updateDb(item: Model): Promise<boolean> {
         const query = this.queryBuilder.buildUpdateItemQuery(item);
         return this.db
         .executeSql(query, [])
         .then(() => {
             return Promise.resolve(true)
         })
         .catch((e: any) => {
           return Promise.reject(false);
         });
     }
 
     private deleteByIdDb(key: any): Promise<boolean> {
         const query = this.queryBuilder.buildDeleteItemQuery(key);
         return this.db
         .executeSql(query, [])
         .then(() => {
             return Promise.resolve(true)
         })
         .catch((e: any) => {
           return Promise.reject(false);
         });
     }
 
     private deleteAllDb(): Promise<boolean> {
         const query = this.queryBuilder.buildDeleteAllItemsQuery();
         return this.db
         .executeSql(query, [])
         .then(() => {
             return Promise.resolve(true)
         })
         .catch((e: any) => {
           return Promise.reject(false)
         });
     }
 
     private createTableDb(): Promise<boolean> {
         const query = this.queryBuilder.buildCreateTableQuery();
         return this.db
         .executeSql(query, [])
         .then(() => {
             return Promise.resolve(true);
         })
         .catch((e: any) => {
           return Promise.reject(false)
         });
     }
}