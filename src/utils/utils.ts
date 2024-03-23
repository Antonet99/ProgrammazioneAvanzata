export function nodes_count(obj : object){
    let unique_nodes = new Set<any>();
    
    for(let key in obj){
        unique_nodes.add(key);
        if (typeof (obj as any)[key] === 'object') {
            for (let ikey in (obj as any)[key]){
                //console.log(ikey);
                unique_nodes.add(ikey);
            }
        }
    }
    //console.log(unique_nodes);
    return unique_nodes.size;
}

export function edges_count(obj : object) {
    let counter : number = 0;
    for(let key in obj){
        //console.log(obj[key]);
        counter+=Object.keys( (obj as any)[key]).length;
    }
    return counter;
}