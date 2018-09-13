;
(function(window, factory) {
	if(typeof define === 'function' && define.amd) {
		define(factory);
	} else if(typeof define === 'function') {
		define(factory);
	} else if(typeof exports === 'object') {
		module.exports = factory();
	} else {
		window.easyCalendar = factory();
	}
})(typeof window !== "undefined" ? window : this, function() {
	"use strict";
	//构造定义
	function Calendar(id) {
		if(this instanceof Calendar) {
			this.id = id;
			this.el = document.querySelector("#" + id);
		} else {
			return new Calendar(id);
		}
	};
	//方法
	Calendar.prototype = {
		constructor: Calendar, //引入对象
		normal_year: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], //普通年
		leap_year: [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], //闰年
		now_date: new Date(), //当前时间
		out_day_class : "out-day",
		main_class : "calendar-container",
		display_class : "display-part",
		opt_class : "opt-part",
		today_class : "today-part",
		input_date: null, //输入的日期

		//初始化
		init() {
			let year = this.now_date.getFullYear(),
				month = this.now_date.getMonth();
			this.makeCalendar(year, month);
		},

		//是否闰年
		isLeapYear(year) {
			return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
		},

		//绘制日历
		makeCalendar(year, month) {
			//变量设置
			this.input_date = new Date(year, month, 1); //输入的日期从1号开始算
			let fragment = document.createDocumentFragment(),
				date_len = null,
				div_main = document.createElement("div"),
				div_date = document.createElement("div"),
				div_opt = document.createElement("div"),
				table = document.createElement("table"),
				thead = document.createElement("thead"),
				tbody = document.createElement("tbody"),
				week = this.input_date.getDay(), //第一天的星期
				pre_date = null, //上个月的预留日期
				next_date = 1, //下个月的预留日期从1开始
				date = 1, //日历的日期从1开始
				today = this.now_date.getDate(),
				now_year = this.now_date.getFullYear(),
				now_month = this.now_date.getMonth();

			//判断是否是闰年并根据月份获得相应的日期数
			if(!this.isLeapYear(year)) {
				date_len = this.normal_year[month];
				pre_date = this.normal_year[month != 0 ? (month - 1) : 11] - (week - 1);
			} else {
				date_len = this.leap_year[month];
				pre_date = this.normal_year[month != 0 ? (month - 1) : 11] - (week - 1);
			};

			//创建时间和点击列
			div_main.className = this.main_class;
			div_date.className = this.display_class;
			div_opt.className = this.opt_class;
			div_date.innerHTML = "<span id='"+ this.id +"_date-part'>" + __formatDate__(this.input_date, "yyyy年MM月") + "</span>"
			div_opt.innerHTML = "<button type='button' id='"+ this.id +"_previous' class='btn-part'><</button><button type='button' id='"+ this.id +"_toToday' class='btn-part'>今天</button><button type='button' id='"+ this.id +"_next' class='btn-part'>></button>"
			//创建表头
			thead.insertRow(0);
			//绘制表头
			thead.rows[0].insertCell(0).innerHTML = "日";
			thead.rows[0].insertCell(1).innerHTML = "一";
			thead.rows[0].insertCell(2).innerHTML = "二";
			thead.rows[0].insertCell(3).innerHTML = "三";
			thead.rows[0].insertCell(4).innerHTML = "四";
			thead.rows[0].insertCell(5).innerHTML = "五";
			thead.rows[0].insertCell(6).innerHTML = "六";

			//绘制表身子
			//行
			for(let r = 0; r < 6; r++) {
				tbody.insertRow(r);
				//列
				for(let c = 0; c < 7; c++) {
					switch(true) {
						//第一行处理
						case r == 0:
							if(c < week) {
								//写入上个月
								tbody.rows[r].insertCell(c).innerHTML = pre_date;
								tbody.rows[r].cells[c].className = this.out_day_class;
								pre_date++;
							} else {
								tbody.rows[r].insertCell(c).innerHTML = date;
								date++;
							}
							break;
						default:
							//判断是否超过当前月最大天数
							if(date <= date_len) {
								tbody.rows[r].insertCell(c).innerHTML = date;
								if(date === today && month === now_month && year === now_year) {
									tbody.rows[r].cells[c].className = this.today_class;
								}
								date++;
							} else {
								//写入下个月
								tbody.rows[r].insertCell(c).innerHTML = next_date;
								tbody.rows[r].cells[c].className = this.out_day_class;
								next_date++;
							}
							break;
					};
				};
			};

			//合并
			table.appendChild(thead);
			table.appendChild(tbody);
			div_main.appendChild(div_date);
			div_main.appendChild(div_opt);
			div_main.appendChild(table);
			fragment.appendChild(div_main);

			//移除事件
			try {
				this.removeEvent();
			} catch(e) {}

			this.el.innerHTML = "";
			this.el.appendChild(fragment);

			//绑定事件
			this.initEvent();
			fragment = null;
		},
		//上翻
		previous() {
			let year = this.input_date.getFullYear(),
				month = this.input_date.getMonth() - 1;
			if(month < 0) {
				month = 11;
				year = year - 1;
			}
			this.makeCalendar(year, month);
		},
		//下翻
		next() {
			let year = this.input_date.getFullYear(),
				month = this.input_date.getMonth() + 1;
			if(month > 11) {
				month = 0;
				year = year + 1;
			}
			this.makeCalendar(year, month);
		},
		//回今天
		toTaday() {
			let year = new Date().getFullYear(),
				month = new Date().getMonth();
			this.makeCalendar(year, month);
		},
		initEvent() {
			document.querySelector("#"+ this.id +"_previous").addEventListener("click", this.previous.bind(this));
			document.querySelector("#"+ this.id +"_next").addEventListener("click", this.next.bind(this));
			document.querySelector("#"+ this.id +"_toToday").addEventListener("click", this.toTaday.bind(this));
		},
		removeEvent() {
			document.querySelector("#"+ this.id +"_previous").removeEventListener("click", this.previous.bind(this));
			document.querySelector("#"+ this.id +"_next").removeEventListener("click", this.next.bind(this));
			document.querySelector("#"+ this.id +"_toToday").removeEventListener("click", this.toTaday.bind(this));
		}

	};

	//创建对象
	function easyCalendar(id) {
		if(typeof id !== 'string') {
			throw new TypeError('easyCalendar: param "id" must be the type of "string"!');
			return;
		}
		let calendar = new Calendar(id);
		return calendar.init();
	};
	//私有函数
	function __formatDate__(Date, fmt) {
		var o = {
			"M+": Date.getMonth() + 1, //月份 
			"d+": Date.getDate(), //日 
			"H+": Date.getHours(), //小时 
			"m+": Date.getMinutes(), //分 
			"s+": Date.getSeconds(), //秒 
			"q+": Math.floor((Date.getMonth() + 3) / 3), //季度 
			"S": Date.getMilliseconds() //毫秒 
		};
		if(/(y+)/.test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (Date.getFullYear() + "").substr(4 - RegExp.$1.length));
		};
		for(var k in o) {
			if(new RegExp("(" + k + ")").test(fmt)) {
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
			};
		};
		return fmt;
	};
	//返回
	return {
		create: easyCalendar
	}
});