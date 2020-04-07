/*
* @ config 用户配置
*/
import utils from './utils.js';
class Config  {
	constructor(options) {
		this.config = {
			localKey: 'hunter',
			url: 'http://192.168.19.201:9050/api/error.gif', //上报错误地址
			except: [ /^Script error\.?/, /^Javascript error: Script error\.? on line 0/ ], // 忽略某个错误
			delay: 3000, //延迟上报时间
			repeat: 1, //重复2次不上报
			validTime: 7 //localstorage过期时间 天
		}
		this.config = utils.assignObject( this.config, options );
	}
	get (name) {
		return this.config[name];
	}
	set (name, value) {
		this.config[ name ] = value;
		return this.config[ name ];
	}
}
export default Config;