import { SQLite, SQLiteDatabaseConfig, SQLiteObject } from "@ionic-native/sqlite/ngx";
import { ZWrapper } from "./models/z-wrapper";
import { ZModel } from "./models/z-model";
import { ZDataModel } from "./models/z-data-model";

export class ZSQLite {
    private db?: SQLiteObject;
    constructor(private isFake: boolean, private sqlite: SQLite,){}

    async init(isFake: boolean, config: SQLiteDatabaseConfig){
        this.isFake = isFake;
        if(!isFake){
            this.db = await this.sqlite.create(config);
        }
    }

    model<Model>(wrapper: ZWrapper, data?: ZDataModel<Model>): ZModel<Model> {
        const model = new ZModel<Model>(wrapper, this.isFake, this.db, data);
        return model;
    }
}