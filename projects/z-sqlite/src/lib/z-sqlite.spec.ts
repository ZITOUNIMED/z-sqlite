import { ZModel, ZSQLite, ZWrapper } from "z-sqlite"

interface UserModel {
    id?: number;
    name: string;
}

describe('z-sqlite', () => {
    const sqlite = jasmine.createSpyObj('SQLiteObject', ['create']);
    const db = jasmine.createSpyObj('SQLiteObject', ['executeSql']);
    sqlite.create.and.returnValue(db)
    const successLogFn = jasmine.createSpy();
    const errorLogFn = jasmine.createSpy();
    const wrapper: ZWrapper = {
        tableName: 'users',
        primaryKeyColumn: {name: 'id',type: 'number', isPrimaryKey: true},
        columns: [
            {name: 'id',type: 'number', isPrimaryKey: true}, 
            {name: 'name',type: 'varchar(20)', isText: true}
        ],
        entityName: 'User',
        version: {
            columns: [],
            highest: 1,
            name: 'users'
        }
    };
    const zModel1 = new ZModel<UserModel>(wrapper, {
        required: [{id: 1000, name: 'Test'}]
    });
    const zSQLite: ZSQLite = new ZSQLite([zModel1]);

    it('should create', () => {
        expect(zSQLite).toBeDefined();
    });

    it('should init db when tables exists', async () =>{
        db.executeSql
        .withArgs('SELECT COUNT(*) FROM users;').and.returnValue(Promise.resolve({rows: {length: 1}}))
        .withArgs('insert or ignore into users (id, name) values (1000, \'Test\'); COMMIT;', []).and.returnValue(Promise.resolve(true))

        await zSQLite.init(false, sqlite, {name: 'test', location: 'default'}, () => {}, true, successLogFn, errorLogFn);
        expect(db.executeSql).toHaveBeenCalled();
    })

    it('should init db when tables don\'t exist', async () =>{
        db.executeSql
        .withArgs('SELECT COUNT(*) FROM users;').and.returnValue(Promise.reject({error: 'error'}))
        .withArgs('insert or ignore into users (id, name) values (1000, \'Test\'); COMMIT;', []).and.returnValue(Promise.resolve(true))
        .withArgs('CREATE TABLE IF NOT EXISTS users ( id number PRIMARY KEY  , name varchar(20)    ); COMMIT;', []).and.returnValue(Promise.resolve(true));
        
        await zSQLite.init(false, sqlite, {name: 'test', location: 'default'}, () => {}, true, successLogFn, errorLogFn);
        expect(db.executeSql).toHaveBeenCalled();
    })
})