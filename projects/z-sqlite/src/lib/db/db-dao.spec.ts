import { ZWrapper } from "z-sqlite";
import { DbDAO } from "./db-dao"
import { ZQueryBuilder } from "../builders/z-query-builder";

interface UserModel {
    id?: number;
    name: string;
}

describe('db-dao', () => {
    const db = jasmine.createSpyObj('SQLiteObject', ['executeSql']);
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

    const dbDAO: DbDAO<UserModel> = new DbDAO<UserModel>(wrapper, db, successLogFn, errorLogFn);

    const queryBuilder = new ZQueryBuilder(wrapper);

    beforeEach(()=> {
        db.executeSql.calls.reset();
        successLogFn.calls.reset();
        errorLogFn.calls.reset();
    });

    it('should create db dao instance', () =>{
        expect(dbDAO).toBeDefined();
    })

    it('should create table when table is not already existing', async () => {
        // GIVEN
        const createTableQuery = queryBuilder.buildCreateTableQuery();
        const isAlreadyExisingQuery = queryBuilder.buildIsAlreadyExistingTableQuery();

        db.executeSql
        .withArgs(isAlreadyExisingQuery).and.returnValue(Promise.reject({error: 'error'}))
        .withArgs(createTableQuery).and.returnValue(Promise.resolve(true));

        // WHEN
        const res = await dbDAO.createTable();

        // THEN
        expect(res).toEqual(true);

        expect(db.executeSql.calls.allArgs()).toEqual([
            [isAlreadyExisingQuery],
            [createTableQuery]
          ]); 

        expect(successLogFn.calls.allArgs()).toEqual([
            ['Table users is not exisiting.'],
            ['Create table users Query: ', createTableQuery],
            ['Create table users success.']
          ]); 
    })


    it('should not recreate exisiting table', async () => {
        // GIVEN
        const isAlreadyExisingQuery = queryBuilder.buildIsAlreadyExistingTableQuery();

        db.executeSql
        .withArgs(isAlreadyExisingQuery).and.returnValue(Promise.resolve({rows: {length: 1}}))

        // WHEN
        const res = await dbDAO.createTable();

        // THEN
        expect(res).toEqual(true);

        expect(db.executeSql.calls.allArgs()).toEqual([
            [isAlreadyExisingQuery],
          ]); 
        
        expect(successLogFn.calls.allArgs()).toEqual([
            ['Table users is already existing.']
          ]); 
    })

    it('should find by id', async() => {
        // GIVEN
        const query = queryBuilder.buildGetByPrimaryKeyQuery(1);
        const user = {id: 1, name: 'Test'};
        db.executeSql
        .withArgs(query).and.returnValue(Promise.resolve({rows: {length: 1, item: (i: number) => user}}))

        // WHEN
        const res = await dbDAO.findById(1);

        // THEN
        expect(res).toEqual(user)

        expect(db.executeSql.calls.allArgs()).toEqual([
            [query],
          ]); 
        
        expect(successLogFn.calls.allArgs()).toEqual([
            ['Find By ID Query: ', query],
            ['Find By ID success'],
            ['Find by id result', user]
        ]);
    })
})