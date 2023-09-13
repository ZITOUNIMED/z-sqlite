import { ZWrapper } from "z-sqlite";
import { DbDAO } from "./db-dao"

xdescribe('db-dao', () => {
    const db = jasmine.createSpyObj('SQLiteObject', ['executeSql']);
    const successLogFn = jasmine.createSpy();
    const errorLogFn = jasmine.createSpy();
    const wrapper: ZWrapper = {
        tableName: 'tableName',
        primaryKeyColumn: {name: 'id',type: 'number'},
        columns: [{name: 'id',type: 'number'}, {name: 'name',type: 'varchar(20)', isText: true}],
        entityName: 'entityName',
        version: {
            columns: [],
            highest: 1,
            name: 'version'
        }
    };
    const dbDAO: DbDAO<any> = new DbDAO(wrapper, db, successLogFn, errorLogFn);

    it('should create db dao instance', () =>{
        expect(dbDAO).toBeDefined();
    })

    it('should not create table when table already existing', async () => {
        db.executeSql.and.returnValue(Promise.resolve({rows: {length: 1}}));
        const res = await dbDAO.createTable()
        expect(res).toBeTruthy();
    })

    it('should create table when it is not already exisiting 1', async () => {
        db.executeSql.and.returnValue(Promise.resolve(false));
        const res = await dbDAO.createTable()
        expect(res).toBeTruthy();
    })

    it('should create table when it is not already exisiting 2', async () => {
        db.executeSql.and.returnValue(Promise.resolve(true));
        dbDAO['isTableAlreadyExists'] = () => Promise.resolve(false)
        const res = await dbDAO.createTable()

        expect(successLogFn).toHaveBeenCalledWith('Create table tableName success.');
        expect(res).toBeTruthy();
    })

    it('should return false if table is not existing', async () =>{
        db.executeSql.and.returnValue(Promise.reject({error: 'error'}));
        const res = await dbDAO['isTableAlreadyExists']();
        expect(res).toBeFalsy();
    })
})