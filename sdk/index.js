import utils from './utils';
import report from './report';
import config from './config';
import store from './store';

class hunter extends report(store(config)) {
	constructor(options) {
		super(options);
		this.breadcrumbs = [];
		this.rewriteError();
		this.rewritePromiseError();
		this.catchClickQueue();
	}
	rewriteError() {
		//let defaultOnerror = window.onerror || utils.noop;
		window.onerror = (msg, url, line, col, error) => {
			//有些浏览器没有col
			col = col || (window.event && window.event.errorCharacter) || 0;

			var reportMsg = msg;
			if (error && error.stack) {
				reportMsg = this.handleErrorStack(error);
			} else {
				reportMsg = this._fixMsgByCaller(reportMsg, arguments.callee.caller);
			}
			if (utils.typeDecide(reportMsg, "Event")) {
				reportMsg += reportMsg.type ?
					("--" + reportMsg.type + "--" + (reportMsg.target ?
						(reportMsg.target.tagName + "::" + reportMsg.target.src) : "")) : "";
			}
			if (reportMsg) {
				this.error({
					msg: reportMsg,
					rowNum: line,
					colNum: col,
					level: 1,
					breadcrumbs: JSON.stringify(this.breadcrumbs)
				});
			}
			//defaultOnerror.call(null, msg, url, line, col, error);
		};
	}
	rewritePromiseError() {
		//const defaultUnhandledRejection = window.onunhandledrejection || utils.noop;;
		window.onunhandledrejection = (error) => {

			let msg = error.reason && error.reason.message || '';
			let stackObj = {};
			if (error.reason && error.reason.stack) {
				msg = this.handleErrorStack(error.reason);
				stackObj = this._parseErrorStack(error.reason.stack);
			} else {
				msg = this._fixMsgByCaller(msg, arguments.callee.caller); // jshint ignore:line
			}
			if (msg) {
				this.error({
					msg: msg,
					rowNum: stackObj.line || 0,
					colNum: stackObj.col || 0,
					level: 1,
					breadcrumbs: JSON.stringify(this.breadcrumbs)
				});
			}
			//defaultUnhandledRejection.call(null, error);
		}
	}
	//不存在stack的话，取调用栈信息
	_fixMsgByCaller(msg, caller) {
		var ext = [];
		var f = caller,
			c = 3;
		//这里只拿三层堆栈信息
		while (f && (c-- > 0)) {
			ext.push(f.toString());
			if (f === f.caller) {
				break; //如果有环
			}
			f = f.caller;
		}
		if (ext.length > 0) {
			msg += '@' + ext.join(',');
		}
		return msg;
	}
	// 从报错信息中获取行号、列号、url
	_parseErrorStack(stack) {
		const stackObj = {};
		const stackArr = stack.split('at');
		// 只取第一个堆栈信息，获取包含url、line、col的部分，如果有括号，去除最后的括号
		let infoStr = stackArr[1].match(/http.*/) || stackArr[2].match(/.js.*/);
		const info = infoStr[0].replace(/\)$/, '') || infoStr[0].replace(/\)$/, '');
		// 以冒号拆分
		const errorInfoArr = info.split(':');
		const len = errorInfoArr.length;
		// 行号、列号在最后位置
		stackObj.col = errorInfoArr[len - 1];
		stackObj.line = errorInfoArr[len - 2];
		// 删除最后两个（行号、列号）
		errorInfoArr.splice(len - 2, 2);
		return stackObj
	}
	// 处理onerror返回的error.stack
	handleErrorStack(error) {
		let stackMsg = error.stack;
		let errorMsg = error.toString();
		if (errorMsg) {
			if (stackMsg.indexOf(errorMsg) === -1) {
				stackMsg += '@' + errorMsg;
			}
		} else {
			stackMsg = '';
		}
		return stackMsg;
	}
	catchClickQueue() {
		if (window.addEventListener) {
			if ('ontouchstart' in document.documentElement) {
				window.addEventListener('touchstart', this._storeClcikedDom, !0)
			} else {
				window.addEventListener('click', this._storeClcikedDom, !0)
			}
		} else {
			document.attachEvent("onclick", this._storeClcikedDom);
		}
	}
	_storeClcikedDom = (ele) => {
		const target = ele.target ? ele.target : ele.srcElement;
		let info = {};
		if (target) {
			// 只保存存在的属性
			target.tagName && (info.tagName = target.tagName);
			target.id && (info.id = target.id);
			target.className && (info.className = target.className);
			target.name && (info.name = target.name);
			// 不存在id时，遍历父元素
			if (!target.id) {
				// 遍历三层父元素
				let i = 0,
					parent = target;
				while (i++ < 3 && parent.parentNode) {
					if (!parent.parentNode.outerHTML) break;
					parent = parent.parentNode;
					if (parent.id) break;
				}
				// 如果父元素中有id，则只保存id，保存规则为 父元素层级:id
				if (parent.id) {
					info.parentId = i + ':' + parent.id;
				} else {
					// 父元素没有id，则保存outerHTML
					let outerHTML = parent.outerHTML.replace(/>\s+</g, '><'); // 去除空白字符
					outerHTML && outerHTML.length > 200 && (outerHTML = outerHTML.slice(0, 200));
					info.outerHTML = outerHTML;
				}
			}
		}
		this.breadcrumbs.push(info);
		this.breadcrumbs.length > 10 && this.breadcrumbs.shift();
		this.setOpreat(JSON.stringify(this.breadcrumbs))

	}
}
export default hunter;