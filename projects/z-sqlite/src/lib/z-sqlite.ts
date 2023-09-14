import { SQLite, SQLiteDatabaseConfig, SQLiteObject } from "@ionic-native/sqlite/ngx";
import { ZModel } from "./models/z-model";

export class ZSQLite {
    private db?: SQLiteObject;
    private sqlite?: SQLite
    private isFake: boolean = true;
    private successLogFn?: any;
    private errorLogFn?: any;

    constructor(private models: ZModel<any>[]){}

    async init(isFake: boolean, sqlite: SQLite, config: SQLiteDatabaseConfig, dbUpCallBack?: any, isLogEnabled?: boolean, successLogFn?: any, errorLogFn?: any){
        if(isLogEnabled){
            this.successLogFn = successLogFn;
            this.errorLogFn = errorLogFn;
        }
    
        this.isFake = isFake;
        this.sqlite = sqlite;

        if(this.isFake && this.successLogFn) this.successLogFn('INIT FAKE DB.');
        
        if(!isFake && this.sqlite){
            this.db = await this.sqlite.create(config);
            if(this.successLogFn) this.successLogFn('INIT DB: SUCCESS CREATION DB.');
        }

        if(this.successLogFn) this.successLogFn(`${this.models.length} models found.`)

        for(let i = 0; i<this.models.length; i++){
            await this.models[i].init(this.isFake, this.db, this.successLogFn, this.errorLogFn)
        }
        
        if(dbUpCallBack) dbUpCallBack();
    }

    executeQuery(query: string) {
        if(this.db){
            return this.db.executeSql(query);
        }
        return Promise.reject({error: 'db is down'});
    }
}