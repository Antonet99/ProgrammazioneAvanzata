


export function conta_nodi(obj : object){
    let nodi_unici = new Set<any>();
    
    for(let key in obj){
        nodi_unici.add(key);
        if (typeof (obj as any)[key] === 'object') {
            for (let ikey in (obj as any)[key]){
                //console.log(ikey);
                nodi_unici.add(ikey);
            }
        }
    }
    //console.log(nodi_unici);
    return nodi_unici.size;
}

export function conta_archi(obj : object) {
    let counter : number = 0;
    for(let key in obj){
        //console.log(obj[key]);
        counter+=Object.keys( (obj as any)[key]).length;
    }
    return counter;
}