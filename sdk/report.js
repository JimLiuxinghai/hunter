import utils from "./utils";
let Report = (supperclass) => class extends supperclass {
	constructor(options) {
		super( options );
        this.errorQueue = [];
        this.repeatList = {};
        this.url = this.config.url + '?err_msg=';
        [ 'warn', 'error' ].forEach( ( type, index ) => {
            this[ type ] = ( msg ) => {
                return this.handle( msg, index );
            };
        });
	}
	request( url, cb ) {
        let img = new window.Image();
        img.onload = cb;
        img.src = url;
    }
    report( cb ) {
        let curQueue = this.errorQueue;
        // 合并上报
        let parames = curQueue.map( obj => {
            this.setItem( obj );
            return utils.stringify( obj );
        } ).join( '|' );
        let url = this.url + parames;
        this.request( url, () => {
            this.removeEpires()
        } );
        return url;
    }
	//重复错误不收集
	repeat( error ) {
        let rowNum = error.rowNum || '';
        let colNum = error.colNum || '';
        let repeatName = error.msg + rowNum + colNum;
        this.repeatList[ repeatName ] = this.repeatList[ repeatName ] ? this.repeatList[ repeatName ] + 1 : 1;
        return this.repeatList[ repeatName ] > this.config.repeat;
    }
	// push错误到pool
    catchError( error ) {
        if ( this.repeat( error ) ) {
            return false;
        }
        if ( this.except( error ) ) {
            return false;
        }
        this.errorQueue.push( error );
        return this.errorQueue;
    }
    //忽略错误
    except( error ) {
        let oExcept = this.config.except;
        let result = false;
        let v = null;
        if ( utils.typeDecide( oExcept, "Array" ) ) {
            for ( let i = 0, len = oExcept.length; i < len; i++ ) {
                v = oExcept[ i ];
                if ( ( utils.typeDecide( v, "RegExp" ) && v.test( error.msg ) ) ||
                    ( utils.typeDecide( v, "Function" ) && v( error, error.msg ) ) ) {
                    result = true;
                    break;
                }
            }
        }
        return result;

    }
	// 发送
    send( cb ) {
        let callback = cb || utils.noop;
        let delay =  this.config.delay;
        setTimeout( () => {
            this.report( callback );
        }, delay );

    }
	//手动上报
	handle (msg, level) {

        if ( !msg ) {
            return false;
        }
        if( utils.typeDecide( msg, 'Object' ) && !msg.msg ){
            return false;
        }
        if ( utils.typeDecide( msg, 'Error' ) ) {
            let key = this.config.localKey+'bread'
            let msgInfo = this._parseErrorStack(msg.stack)
            let breadcrumbs = this.getItem(key)
            msg = {
                msg: msg.stack,
                colNum: msgInfo.col,
                rowNum: msgInfo.line,
                level: level,
                breadcrumbs: breadcrumbs.bread.value
            };
        }
        let errorMsg = msg;
        errorMsg = utils.assignObject( utils.getSystemInfo(), errorMsg );
        
        if ( this.catchError( errorMsg ) ) {
            this.send();
        }
        return errorMsg;
	}
}
export default Report;