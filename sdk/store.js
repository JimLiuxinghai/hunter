import utils from "./utils";
import config from "./config";
function callByArgs( func, args, global ) {
    return func.apply( global, args );
}
function handleItem (data) {
    let handleData = data ? utils.parse(data) : {};
    return handleData;
}
const store = {
    //存储localstorage的json中的key
    getKey: (error) => {
        const getDetail = (name) => {
            return error[name];
        }
        return [ 'msg', 'colNum', 'rowNum' ].filter( getDetail ).map( getDetail ).join( '@' ); 
    },
    //设置失效时间
    getEpires: function ( validTime ) {
        return +new Date() + ( 1000 * 60 * 60 * 24 * validTime );
    },
    getInfo: (key, errorObj, validTime) => {
        let source = store.getItem(key);
        
        if ( errorObj ) {
            let name = store.getKey( errorObj ) || 'bread';
            source[ name ] = {
                value: errorObj.msg || errorObj,
                expiresTime: store.getEpires( validTime ),
            };
        }
        return utils.stringify( source );
    },
    //获取localstorage内容
    getItem: (key) => {
        return handleItem(localStorage.getItem(key));
    },
    setItem: (...args) => {
        return localStorage.setItem(args[0], callByArgs(store.getInfo, args, store))
    },
    clear: (key) => {
        return key ? localStorage.removeItem( key ) : localStorage.clear();
    }
}
const Storage = (supperclass) => class extends supperclass {
    constructor( options ) {
        super( options );
        this.setItem();
    }
    //得到元素值 获取元素值 若不存在则返回''
    getItem( key ) {
        return store.getItem( key );
    }
    // 设置一条localstorage
    setItem( errorObj ) {
        let _config = this.config;
        store.setItem( _config.localKey, errorObj,  _config.validTime );
        return utils.stringify( errorObj );
    }
    // 设置一条操作记录
    setOpreat (breadcrumbs) {
        let _config = this.config;
        store.setItem( _config.localKey+'bread', breadcrumbs,  _config.validTime );
    }
    clear( key ) {
        store.clear( key );
    }
    //过期key删除
    removeEpires () {
        let _config = this.config;

        let oData = store.getItem(_config.localKey) || {};

        let date = +new Date();
        for ( let key in oData ) {
            if ( oData[ key ].expiresTime <= date ) {
                delete oData[ key ];
            }
        }
        this.clear();

        for(let newkey in oData) {
            store.setItem(_config.localKey, {msg: oData[newkey].value}, _config.validTime);
        }

    }
}
export default Storage;