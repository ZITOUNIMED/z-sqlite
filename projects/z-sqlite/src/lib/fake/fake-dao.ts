import { GenericLibDAO } from "../generic/generic-lib-dao";
import { ZWrapper } from "../models/z-wrapper";
import { ZWrapperVersion } from "../models/z-wrapper-version";

export class FakeDAO<Model> implements GenericLibDAO<Model> {
    
    itemsMap: Map<any, Model> = new Map();
    constructor(private wrapper: ZWrapper,){
    }

    fetch(filters?: any, sorts?: any, page?: any): Promise<Model[]> {
        const all = [...this.itemsMap.values()];
        let res:Model[] = [];
        let keys1: string[] = [];
        let filtersMap = undefined;
        if(filters){
            filtersMap = new Map(Object.entries(filters));
            keys1 = [...filtersMap?.keys()];
        }
        for(let i = 0; i<all.length; i++){
            const item = all[i];
            let isNotOk = false;
            for(let j = 0; j<keys1.length; j++){
                const value:any = filtersMap?.get(keys1[j]);
                if(value){
                    if(value.op && value.op === '>'){
                        if((item as any)[keys1[j]] <= value.value){
                            isNotOk = true;
                            break;
                        }
                    } else {
                        if((item as any)[keys1[j]] !== value){
                            isNotOk = true;
                            break;
                        }
                    }
                }
                
            }            
            if(!isNotOk){
                res.push(item);
            }
        }

        if(sorts){
            const sortsMap = new Map(Object.entries(sorts));
            const keys2 = [...sortsMap.keys()];
            const key: string = keys2[0];
            const value = sortsMap.get(key);
            res = res.sort((t1, t2) => {
                if((t1 as any)[key]>(t2 as any)[key]){
                    return value? 1:-1;
                } else if((t1 as any)[key]<(t2 as any)[key]){
                    return value? -1:1;
                }
                return 0;
            });
        }

        return Promise.resolve(res);
    }

    createTable(): Promise<boolean> {
        return Promise.resolve(true)
    }

    async updateVersions(versions: ZWrapperVersion): Promise<boolean> {
        return Promise.resolve(true);
    }

    add(item: Model): Promise<boolean> {
        const col = this.wrapper.primaryKeyColumn
        let newItem= undefined;
        let key = undefined;
        if(col.isAutoIncrement){
            key = [...this.itemsMap.values()].length + 1;
            newItem = { ...item, ...{[col.name]: key}};
        } else {
            key = { ...{[col.name]: undefined}, ...item}[col.name];
            newItem = {...item};
        }
        this.itemsMap.set(key, newItem);
        return Promise.resolve(true);
    }

    findById(key: any): Promise<Model|undefined> {
        const found = this.itemsMap.get(key);
        return Promise.resolve(found);
    }

    update(model: Model): Promise<boolean> {
        const column = this.wrapper.primaryKeyColumn;
        const key = {...{[column.name]: undefined}, ...model}[column.name];
        this.itemsMap.set(key, model);
        return Promise.resolve(true);
    }

    deleteById(key: any): Promise<boolean> {
        this.itemsMap.delete(key);
        return Promise.resolve(true); 
    }

    deleteAll(): Promise<boolean> {
        this.itemsMap = new Map();
        return Promise.resolve(true);
    }
}