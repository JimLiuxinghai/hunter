(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.hunter = factory());
}(this, (function () {

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var utils = {
    assignObject: function assignObject(obj1, obj2) {
        for (var name in obj2) {
            if (obj2.hasOwnProperty(name)) {
                obj1[name] = obj2[name];
            }
        }
        return obj1;
    },
    stringify: function stringify(obj) {
        if (window.JSON && window.JSON.stringify) {
            return JSON.stringify(obj);
        }
        var t = typeof obj === "undefined" ? "undefined" : _typeof(obj);
        if (t != "object" || obj === null) {
            // simple data type
            if (t == "string") obj = '"' + obj + '"';
            return String(obj);
        } else {
            // recurse array or object
            var n,
                v,
                json = [],
                arr = obj && obj.constructor == Array;

            // fix.
            var self = arguments.callee;

            for (n in obj) {
                if (obj.hasOwnProperty(n)) {

                    v = obj[n];
                    t = typeof v === "undefined" ? "undefined" : _typeof(v);
                    if (obj.hasOwnProperty(n)) {
                        if (t == "string") v = '"' + v + '"';else if (t == "object" && v !== null)
                            // v = jQuery.stringify(v);
                            v = self(v);
                        json.push((arr ? "" : '"' + n + '":') + String(v));
                    }
                }
            }
            return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
        }
    },
    parse: function parse(str) {
        str = str != 'undefined' ? str : {};
        return window.JSON && window.JSON.parse ? JSON.parse(str) : new Function('return ' + str)();
    },
    getPlatType: function getPlatType() {
        try {
            document.createEvent("TouchEvent");
            return 'Mobile';
        } catch (e) {
            return 'PC';
        }
    },
    getSystemInfo: function getSystemInfo() {
        var scr = window.screen;
        return {
            timestamp: +new Date(),
            projectType: utils.getPlatType(),
            title: document.title,
            screenSize: scr.width + "x" + scr.height,
            referer: document.referrer ? document.referrer.toLowerCase() : '',
            projectId: window.__hunter,
            host: window.location.host
        };
    },
    typeDecide: function typeDecide(o, type) {
        return Object.prototype.toString.call(o) === "[object " + type + "]";
    },
    toArray: function toArray$$1(arr) {
        return Array.prototype.slice.call(arr);
    },
    serializeObj: function serializeObj(obj) {
        var parames = '';
        Object.keys(obj).forEach(function (name) {
            if (utils.typeDecide(obj[name], 'Object')) {
                parames += name + '=' + utils.stringify(obj[name]);
            } else {
                parames += name + '=' + obj[name] + '^';
            }
        });
        return encodeURIComponent(parames.substr(0, parames.length - 1));
    },
    //空回调
    noop: function noop() {}
};

/*
* @ config 用户配置
*/
var Config = function () {
	function Config(options) {
		classCallCheck(this, Config);

		this.config = {
			localKey: 'hunter',
			url: 'http://192.168.19.201:9050/api/error.gif', //上报错误地址
			except: [/^Script error\.?/, /^Javascript error: Script error\.? on line 0/], // 忽略某个错误
			delay: 3000, //延迟上报时间
			repeat: 1, //重复2次不上报
			validTime: 7 //localstorage过期时间
		};
		this.config = utils.assignObject(this.config, options);
	}

	createClass(Config, [{
		key: 'get',
		value: function get$$1(name) {
			return this.config[name];
		}
	}, {
		key: 'set',
		value: function set$$1(name, value) {
			this.config[name] = value;
			return this.config[name];
		}
	}]);
	return Config;
}();

function callByArgs(func, args, global) {
    return func.apply(global, args);
}
function handleItem(data) {
    var handleData = data ? utils.parse(data) : {};
    return handleData;
}
var store = {
    //存储localstorage的json中的key
    getKey: function getKey(error) {
        var getDetail = function getDetail(name) {
            return error[name];
        };
        return ['msg', 'colNum', 'rowNum'].filter(getDetail).map(getDetail).join('@');
    },
    //设置失效时间
    getEpires: function getEpires(validTime) {
        return +new Date() + 1000 * 60 * 60 * 24 * validTime;
    },
    getInfo: function getInfo(key, errorObj, validTime) {
        var source = store.getItem(key);

        if (errorObj) {
            var name = store.getKey(errorObj);
            source[name] = {
                value: errorObj.msg,
                expiresTime: store.getEpires(validTime)
            };
        }
        return utils.stringify(source);
    },
    //获取localstorage内容
    getItem: function getItem(key) {
        return handleItem(localStorage.getItem(key));
    },
    setItem: function setItem() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return localStorage.setItem(args[0], callByArgs(store.getInfo, args, store));
    },
    clear: function clear(key) {
        return key ? localStorage.removeItem(key) : localStorage.clear();
    }
};
var Storage$1 = function Storage(supperclass) {
    return function (_supperclass) {
        inherits(_class, _supperclass);

        function _class(options) {
            classCallCheck(this, _class);

            var _this = possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, options));

            _this.setItem();
            return _this;
        }
        //得到元素值 获取元素值 若不存在则返回''


        createClass(_class, [{
            key: "getItem",
            value: function getItem(key) {
                return store.getItem(key);
            }
            // 设置一条localstorage或cookie

        }, {
            key: "setItem",
            value: function setItem(errorObj) {
                var _config = this.config;
                store.setItem(_config.localKey, errorObj, _config.validTime);
                return utils.stringify(errorObj);
            }
        }, {
            key: "clear",
            value: function clear(key) {
                store.clear(key);
            }
            //过期key删除

        }, {
            key: "removeEpires",
            value: function removeEpires() {
                var _config = this.config;

                var oData = store.getItem(_config.localKey) || {};

                var date = +new Date();
                for (var key in oData) {
                    if (oData[key].expiresTime <= date) {
                        delete oData[key];
                    }
                }
                this.clear(_config.localKey);

                for (var newkey in oData) {
                    store.setItem(_config.localKey, { msg: oData[newkey].value }, _config.validTime);
                }
            }
        }]);
        return _class;
    }(supperclass);
};

var Report$1 = function Report(supperclass) {
    return function (_supperclass) {
        inherits(_class, _supperclass);

        function _class(options) {
            classCallCheck(this, _class);

            var _this = possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, options));

            _this.errorQueue = [];
            _this.repeatList = {};
            _this.url = _this.config.url + '?err_msg=';
            ['warn', 'error'].forEach(function (type, index) {
                _this[type] = function (msg) {
                    return _this.handle(msg, index);
                };
            });
            return _this;
        }

        createClass(_class, [{
            key: 'request',
            value: function request(url, cb) {
                var img = new window.Image();
                img.onload = cb;
                img.src = url;
            }
        }, {
            key: 'report',
            value: function report(cb) {
                var _this2 = this;

                var curQueue = this.errorQueue;
                // 合并上报
                var parames = curQueue.map(function (obj) {
                    _this2.setItem(obj);
                    return utils.stringify(obj);
                }).join('|');
                var url = this.url + parames;
                this.request(url, function () {
                    _this2.removeEpires();
                    // if ( cb ) {
                    //     cb.call( this );
                    // }
                });
                return url;
            }
            //重复错误不收集

        }, {
            key: 'repeat',
            value: function repeat(error) {
                var rowNum = error.rowNum || '';
                var colNum = error.colNum || '';
                var repeatName = error.msg + rowNum + colNum;
                this.repeatList[repeatName] = this.repeatList[repeatName] ? this.repeatList[repeatName] + 1 : 1;
                return this.repeatList[repeatName] > this.config.repeat;
            }
            // push错误到pool

        }, {
            key: 'catchError',
            value: function catchError(error) {
                if (this.repeat(error)) {
                    return false;
                }
                if (this.except(error)) {
                    return false;
                }
                this.errorQueue.push(error);
                return this.errorQueue;
            }
            //忽略错误

        }, {
            key: 'except',
            value: function except(error) {
                var oExcept = this.config.except;
                var result = false;
                var v = null;
                if (utils.typeDecide(oExcept, "Array")) {
                    for (var i = 0, len = oExcept.length; i < len; i++) {
                        v = oExcept[i];
                        if (utils.typeDecide(v, "RegExp") && v.test(error.msg) || utils.typeDecide(v, "Function") && v(error, error.msg)) {
                            result = true;
                            break;
                        }
                    }
                }
                return result;
            }
            // 发送

        }, {
            key: 'send',
            value: function send(cb) {
                var _this3 = this;

                var callback = cb || utils.noop;
                var delay = this.config.delay;
                setTimeout(function () {
                    _this3.report(callback);
                }, delay);
            }
            //手动上报

        }, {
            key: 'handle',
            value: function handle(msg, level) {

                if (!msg) {
                    return false;
                }
                if (utils.typeDecide(msg, 'Object') && !msg.msg) {
                    return false;
                }

                if (utils.typeDecide(msg, 'Error')) {
                    msg = {
                        msg: msg.message,
                        ext: {
                            stack: msg.stack
                        }
                    };
                }

                var errorMsg = utils.typeDecide(msg, 'Object') ? msg : {
                    msg: msg,
                    level: level
                };

                errorMsg = utils.assignObject(utils.getSystemInfo(), errorMsg);

                if (this.catchError(errorMsg)) {
                    this.send();
                }
                return errorMsg;
            }
        }]);
        return _class;
    }(supperclass);
};

var hunter = function (_report) {
	inherits(hunter, _report);

	function hunter(options) {
		classCallCheck(this, hunter);

		var _this = possibleConstructorReturn(this, (hunter.__proto__ || Object.getPrototypeOf(hunter)).call(this, options));

		_this._storeClcikedDom = function (ele) {
			var target = ele.target ? ele.target : ele.srcElement;
			var info = {};
			if (target) {
				// 只保存存在的属性
				target.tagName && (info.tagName = target.tagName);
				target.id && (info.id = target.id);
				target.className && (info.className = target.className);
				target.name && (info.name = target.name);
				// 不存在id时，遍历父元素
				if (!target.id) {
					// 遍历三层父元素
					var i = 0,
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
						var outerHTML = parent.outerHTML.replace(/>\s+</g, '><'); // 去除空白字符
						outerHTML && outerHTML.length > 200 && (outerHTML = outerHTML.slice(0, 200));
						info.outerHTML = outerHTML;
					}
				}
			}
			_this.breadcrumbs.push(info);
			_this.breadcrumbs.length > 10 && _this.breadcrumbs.shift();
		};

		_this.breadcrumbs = [];
		_this.rewriteError();
		_this.rewritePromiseError();
		_this.catchClickQueue();
		return _this;
	}

	createClass(hunter, [{
		key: 'rewriteError',
		value: function rewriteError() {
			var _this2 = this,
			    _arguments = arguments;

			var defaultOnerror = window.onerror || utils.noop;
			window.onerror = function (msg, url, line, col, error) {
				//有些浏览器没有col
				col = col || window.event && window.event.errorCharacter || 0;

				var reportMsg = msg;
				if (error && error.stack) {
					reportMsg = _this2.handleErrorStack(error);
				} else {
					reportMsg = _this2._fixMsgByCaller(reportMsg, _arguments.callee.caller);
				}
				if (utils.typeDecide(reportMsg, "Event")) {
					reportMsg += reportMsg.type ? "--" + reportMsg.type + "--" + (reportMsg.target ? reportMsg.target.tagName + "::" + reportMsg.target.src : "") : "";
				}
				if (reportMsg) {
					_this2.error({
						msg: reportMsg,
						rowNum: line,
						colNum: col,
						targetUrl: url,
						level: 1,
						breadcrumbs: JSON.stringify(_this2.breadcrumbs)
					});
				}
				//defaultOnerror.call(null, msg, url, line, col, error);
			};
		}
	}, {
		key: 'rewritePromiseError',
		value: function rewritePromiseError() {
			var _this3 = this,
			    _arguments2 = arguments;

			var defaultUnhandledRejection = window.onunhandledrejection || utils.noop;
			window.onunhandledrejection = function (error) {

				var msg = error.reason && error.reason.message || '';
				var stackObj = {};
				if (error.reason && error.reason.stack) {
					msg = _this3.handleErrorStack(error.reason);
					stackObj = _this3._parseErrorStack(error.reason.stack);
				} else {
					msg = _this3._fixMsgByCaller(msg, _arguments2.callee.caller); // jshint ignore:line
				}
				if (msg) {
					_this3.error({
						msg: msg,
						rowNum: stackObj.line || 0,
						colNum: stackObj.col || 0,
						targetUrl: stackObj.targetUrl || '',
						level: 1,
						breadcrumbs: JSON.stringify(_this3.breadcrumbs)
					});
				}
				//defaultUnhandledRejection.call(null, error);
			};
		}
		//不存在stack的话，取调用栈信息

	}, {
		key: '_fixMsgByCaller',
		value: function _fixMsgByCaller(msg, caller) {
			var ext = [];
			var f = caller,
			    c = 3;
			//这里只拿三层堆栈信息
			while (f && c-- > 0) {
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

	}, {
		key: '_parseErrorStack',
		value: function _parseErrorStack(stack) {
			var stackObj = {};
			var stackArr = stack.split('at');
			// 只取第一个堆栈信息，获取包含url、line、col的部分，如果有括号，去除最后的括号
			var info = stackArr[1].match(/http.*/)[0].replace(/\)$/, '');
			// 以冒号拆分
			var errorInfoArr = info.split(':');
			var len = errorInfoArr.length;
			// 行号、列号在最后位置
			stackObj.col = errorInfoArr[len - 1];
			stackObj.line = errorInfoArr[len - 2];
			// 删除最后两个（行号、列号）
			errorInfoArr.splice(len - 2, 2);
			stackObj.targetUrl = errorInfoArr.join(':');
			return stackObj;
		}
		// 处理onerror返回的error.stack

	}, {
		key: 'handleErrorStack',
		value: function handleErrorStack(error) {
			var stackMsg = error.stack;
			var errorMsg = error.toString();
			if (errorMsg) {
				if (stackMsg.indexOf(errorMsg) === -1) {
					stackMsg += '@' + errorMsg;
				}
			} else {
				stackMsg = '';
			}
			return stackMsg;
		}
	}, {
		key: 'catchClickQueue',
		value: function catchClickQueue() {
			if (window.addEventListener) {
				if ('ontouchstart' in document.documentElement) {
					window.addEventListener('touchstart', this._storeClcikedDom, !0);
				} else {
					window.addEventListener('click', this._storeClcikedDom, !0);
				}
			} else {
				document.attachEvent("onclick", this._storeClcikedDom);
			}
		}
	}]);
	return hunter;
}(Report$1(Storage$1(Config)));

return hunter;

})));
