import { SQLite, SQLiteDatabaseConfig, SQLiteObject } from "@ionic-native/sqlite/ngx";
import { ZWrapper } from "./models/z-wrapper";
import { ZModel } from "./models/z-model";
import { ZDataModel } from "./models/z-data-model";

export class ZSQLite {
    private db?: SQLiteObject;
    private sqlite?: SQLite
    private isFake: boolean = true;
    constructor(){}

    async init(isFake: boolean, sqlite: SQLite, config: SQLiteDatabaseConfig){
        this.isFake = isFake;
        this.sqlite = sqlite;
        if(!isFake && this.sqlite){
            this.db = await this.sqlite.create(config);
        }
    }

    model<Model>(wrapper: ZWrapper, data?: ZDataModel<Model>): ZModel<Model> {
        const model = new ZModel<Model>(wrapper, this.isFake, this.db, data);
        return model;
    }
}