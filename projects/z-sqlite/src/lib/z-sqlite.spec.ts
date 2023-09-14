import { ZModel, ZSQLite, ZWrapper } from "z-sqlite"
import { ZQueryBuilder } from "./builders/z-query-builder";

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

    const queryBuilder = new ZQueryBuilder(wrapper);

    beforeEach(()=> {
        db.executeSql.calls.reset();
        successLogFn.calls.reset();
        errorLogFn.calls.reset();
    });

    it('should create', () => {
        expect(zSQLite).toBeDefined();
    });

    it('should init db when tables exists', async () =>{
        // GIVEN
        const isAlreadyExisingQueryUsers = queryBuilder.buildIsAlreadyExistingTableQuery();
        const insertUserQuery = 'insert or ignore into users (id, name) values (1000, \'Test\'); COMMIT;';
        db.executeSql
        .withArgs(isAlreadyExisingQueryUsers).and.returnValue(Promise.resolve({rows: {length: 1}}))
        .withArgs(insertUserQuery).and.returnValue(Promise.resolve(true))

        // WHEN
        await zSQLite.init(false, sqlite, {name: 'test', location: 'default'}, () => {}, true, successLogFn, errorLogFn);
        
        // THEN
        expect(db.executeSql.calls.allArgs()).toEqual([
            [isAlreadyExisingQueryUsers],
            [insertUserQuery]
          ]); 
        
        expect(successLogFn.calls.allArgs()).toEqual([
            ['INIT DB: SUCCESS CREATION DB.'],
            ['CREATE NEW DB DAO: SUCCESS'],
            ['Table users is already existing.'],
            ['Add query', insertUserQuery],
            [ 'Add success' ]
        ]); 
    })

    it('should init db when tables are not already exisiting', async () =>{
        // GIVEN
        const isAlreadyExisingQueryUsers = queryBuilder.buildIsAlreadyExistingTableQuery();
        const createTableQuery = queryBuilder.buildCreateTableQuery();
        const insertUserQuery = 'insert or ignore into users (id, name) values (1000, \'Test\'); COMMIT;';

        db.executeSql
        .withArgs(isAlreadyExisingQueryUsers).and.returnValue(Promise.reject({error: 'error'}))
        .withArgs(createTableQuery).and.returnValue(Promise.resolve(true))
        .withArgs(insertUserQuery).and.returnValue(Promise.resolve(true))
        
        // WHEN
        await zSQLite.init(false, sqlite, {name: 'test', location: 'default'}, () => {}, true, successLogFn, errorLogFn);

        // THEN
        expect(db.executeSql.calls.allArgs()).toEqual([
            [isAlreadyExisingQueryUsers],
            [createTableQuery],
            [insertUserQuery]
        ]); 
        
        expect(successLogFn.calls.allArgs()).toEqual([
            ['INIT DB: SUCCESS CREATION DB.'],
            ['CREATE NEW DB DAO: SUCCESS'],
            ['Table users is not exisiting.'],
            ['Create table users Query: ', createTableQuery],
            ['Create table users success.'],
            ['Add query', insertUserQuery],
            [ 'Add success' ]
        ]);  

    })
})