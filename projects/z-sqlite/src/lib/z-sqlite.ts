import { SQLite, SQLiteDatabaseConfig, SQLiteObject } from "@ionic-native/sqlite/ngx";
import { ZModel } from "./models/z-model";

export class ZSQLite {
    private db?: SQLiteObject;
    private sqlite?: SQLite
    private isFake: boolean = true;
    private logFn?: any;

    constructor(private models: ZModel<any>[]){}

    async init(isFake: boolean, sqlite: SQLite, config: SQLiteDatabaseConfig, enableLog?: boolean, logFn?: any){
        if(enableLog){
            this.logFn = logFn;
        }
        this.logFn = logFn;
        this.isFake = isFake;
        this.sqlite = sqlite;

        if(this.logFn) this.logFn('INIT DB: ', `IS FAKE? ${isFake}`);
        if(this.logFn) this.logFn('INIT DB: dependency present? '+`${!!this.sqlite}`,);
        
        if(!isFake && this.sqlite){
            this.db = await this.sqlite.create(config);
            if(this.logFn) this.logFn('INIT DB: SUCCESS CREATION DB');
        } else {
            if(this.logFn) this.logFn('INIT DB: SUCCESS CREATION FAKE DB');
        }

        for(let i = 0; i<this.models.length; i++){
            await this.models[i].init(this.isFake, this.db, this.logFn)
        }
    }
}