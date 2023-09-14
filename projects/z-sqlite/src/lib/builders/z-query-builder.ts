import { ZWrapper } from "../models/z-wrapper";
import { ZWrapperColumn } from "../models/z-wrapper-column";
import { ZWrapperVersionColum } from "../models/z-wrapper-version-column";

export class ZQueryBuilder {
    private wrapper: ZWrapper;
    constructor(wrapper: ZWrapper){
        this.wrapper = wrapper;
    }

    buildUpdateVersionQuery(version: ZWrapperVersionColum): string {
        switch(version.action) {
            case 'ADD':
            return `ALTER TABLE ${this.wrapper.tableName} ADD ${version.column.name} ${version.column.type} ${version.column.isNotNullable ? 'NOT NULL':''} ${version.column.isAutoIncrement?'AUTOINCREMENT':''}`;;
        }
        return '';
    }

    buildCreateTableQuery(): string {
        let query = '';
        for(let i = 0; i< this.wrapper.columns.length; i++){
            query = query + this.buildCreateTableColumnQuery(this.wrapper.columns[i]);
            if(i<this.wrapper.columns.length - 1){
                query = query + ', ';
            }
        }
        return `CREATE TABLE IF NOT EXISTS ${this.wrapper.tableName} ( ${query} ); COMMIT;`;
    }

    buildIsAlreadyExistingTableQuery(): string {
        return `SELECT count(*) FROM ${this.wrapper.tableName};`;
    }

    buildAddItemQuery(itemValue: any): string {
        let q1 = '';
        let q2 = '';
        
        const columns = this.wrapper.columns.filter(c => !c.isAutoIncrement);
        for(let i = 0; i<columns.length; i++){
            const col = columns[i];
            q1 = q1 + `${col.name}`;
            let value = itemValue[col.name];
            if(!value){
                if(col.isText){
                    value = '';
                } else if(col.isBoolean){
                    value = false;
                } else {
                    value = null;
                }
            }
            q2 = q2 + `${col.isText?'\'': ''}${value}${col.isText?'\'': ''}`;
            if(i<columns.length - 1){
                q1 = q1 + ', ';
                q2 = q2 + ', ';
            }
        }

        return `insert or ignore into ${this.wrapper.tableName} (${q1}) values (${q2}); COMMIT;`;
    }

    buildDeleteItemQuery(primaryKeyValue: any): string {
        const col = this.wrapper.primaryKeyColumn;
        return `delete from ${this.wrapper.tableName} where ${col.name}=${col.isText?'\'': ''}${primaryKeyValue}${col.isText?'\'': ''}; COMMIT;`;
    }

    buildDeleteAllItemsQuery(): string {
        return `delete from ${this.wrapper.tableName} where ${this.wrapper.primaryKeyColumn.name} <> null; COMMIT;`;
    }

    buildUpdateItemQuery(itemValue: any): string {
        let q1 = '';
        let q2 = '';
        
        const columns = this.wrapper.columns.filter(c => !c.isAutoIncrement || c.isPrimaryKey);
        for(let i = 0; i<columns.length; i++){
            const col = columns[i];
            if(!col.isPrimaryKey){
                q1 = q1 + `${col.name}=${col.isText?'\'': ''}${itemValue[col.name]}${col.isText?'\'': ''}`;
                if(i<columns.length - 1){
                    q1 = q1 + ', ';
                }
            } else {
                let value = itemValue[col.name];
                if(!value){
                    if(col.isText){
                        value = '';
                    } else if(col.isBoolean){
                        value = false;
                    } else {
                        value = null;
                    }
                }
                q2 = `${col.name}=${col.isText?'\'': ''}${value}${col.isText?'\'': ''}`;
            }
        }

        return `update ${this.wrapper.tableName} set ${q1} where ${q2}; COMMIT;`;
    }

    buildGetByPrimaryKeyQuery(primaryKeyValue: any): string {
        const col = this.wrapper.primaryKeyColumn;
        return `select * from ${this.wrapper.tableName} where ${col.name}=${col.isText?'\'': ''}${primaryKeyValue}${col.isText?'\'': ''};`;
    }

    buildFetchAllItemsQuery(): string {
        return `select * from ${this.wrapper.tableName};`;
    }

    buildAdvancedFilterQuery(filterColumns?: Map<string, any>, sortColumns?: Map<string, boolean>, page?: any): string {
        let whereClause = '';
        if(filterColumns){
            const keys = [...filterColumns.keys()];
            for(let i = 0; i<keys.length; i++){
                const col = this.wrapper.columns.find(c => c.name === keys[i])
                if(i === 0){
                    whereClause = 'WHERE ';
                } else if(col) {
                    whereClause = whereClause.concat(' and ');
                }
                if(col){
                    const value = filterColumns.get(col.name);
                    if(value.op){
                        whereClause = whereClause.concat(`${col.name}${value.op}${col.isText?'\'': ''}${value.value}${col.isText?'\'': ''}`);
                    } else {
                        whereClause = whereClause.concat(`${col.name}=${col.isText?'\'': ''}${value}${col.isText?'\'': ''}`);
                    }
                }
            }
        }
        
        let orderByClause = '';
        if(sortColumns){
            const keys2 = [...sortColumns.keys()];
            for(let i = 0; i<keys2.length; i++){
                const col = this.wrapper.columns.find(c => c.name === keys2[i])
                if(i === 0){
                    orderByClause = ' order by ';
                } else if(col){
                    orderByClause = orderByClause.concat(', ');
                }
                    
                if(col){
                    orderByClause = orderByClause.concat(`${col.name} ${sortColumns.get(col.name) ? 'ASC': 'DESC'}`);
                }
            }
        }
        return `SELECT * FROM ${this.wrapper.tableName} ${whereClause} ${orderByClause};`;
    }

    private buildCreateTableColumnQuery(column: ZWrapperColumn): string {
        return `${column.name} ${column.type} ${column.isPrimaryKey ? 'PRIMARY KEY':''} ${column.isNotNullable ? 'NOT NULL':''} ${column.isAutoIncrement?'AUTOINCREMENT':''}`;
    }
}