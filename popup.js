// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
var req = new XMLHttpRequest();
var response;
var queryStr = '';
// 返回数据显示的容器
var box;
function getResut(url, str, handler) {
	queryStr = str;
	req.open("GET", url + encodeURIComponent(str), true);
	req.onload = handler;
	req.send(null);
}

function showPhotos() {
	response = req.responseText.trim();
	constructSugDiv(response);
}

function constructSugDiv(data) {
	if (data[data.length - 1] != '\n') data += "\n";
	data = data.split("\n");
	var num=data.length-1;
	var item = null;
	var query = queryStr.toLowerCase();
	var query_len = query.length;
	var isHilight = 0;
	if (query.indexOf("?") == - 1) {
		var index = query.indexOf("*");
		if (index == - 1) {
			isHilight = 1;
		} else if (index == query.lastIndexOf("*")) {
			if (index == 0) {
				query = query.substr(1);
				query_len = query.length;
				isHilight = 2;
			} else if (index == query_len - 1) {
				query = query.substr(0, query_len - 1);
				query_len = query.length;
				isHilight = 1;
			}
		}
	}
	if (document.getElementById('box')) {
		box = document.getElementById('box');
		box.innerHTML = '';
	} else {
		var box = document.createElement('div');
		box.setAttribute('id', 'box')
	}
	for (var i = 0; i < num; i++) {
		if (data[i] == "") {
			num--;
			continue;
		}
		if ( - 1 != data[i].indexOf("\t")) {
			data[i] = data[i].split("\t");
		}
		/**/
		item = document.createElement("div");
		item.className = "sdi";
		item.id = i;
		item.data = data[i][0];
		var word = data[i][0];
		var hilightedWord = word;
		if (isHilight == 1) {
			if (word.toLowerCase().indexOf(query) == 0) {
				hilightedWord = "<span>";
				hilightedWord += word.substr(0, query_len);
				hilightedWord += "</span>";
				hilightedWord += word.substr(query_len);
			}
		} else if (isHilight == 2) {
			var suffix_len = word.length - query_len;
			var offset = word.toLowerCase().lastIndexOf(query);
			if (offset != - 1 && offset == suffix_len) {
				hilightedWord = word.substr(0, suffix_len);
				hilightedWord += "<span>";
				hilightedWord += word.substr(suffix_len);
				hilightedWord += "</span>";
			}
		}
		item.innerHTML += '<div class="sdiw">' + hilightedWord + '</div>';
		item.innerHTML += '<div class="sdim">' + data[i][1] + '</div>';
		item.title = data[i][0] + "\t" + data[i][1];
		item.style.cursor = 'pointer';

		item.onmouseover = function() {
			this.style.backgroundColor = 'rgb(235, 248, 255)';
		};
		item.onmouseout = function() {
			this.style.backgroundColor = '#fff';
		};
		item.onclick = function() {
			var value = data[this.id][0];
			getDetail(value);
		};
		//QQDICTSug.sugContentDiv.appendChild(item);
		/**/
		box.appendChild(item);
	}
	/**
	if (QQDICTSug.sug_item_num > 0) {
		QQDICTSug.sugContentDiv.style.height = item.offsetHeight * QQDICTSug.sug_item_num + 'px';
	} else {
		QQDICTSug.sugContentDiv.style.height = '23px';
	}
	showSugDiv();
	/**/
	document.getElementById('container').appendChild(box);
}

window.onload = function() {
	document.getElementById('queryInput').onkeyup = function() {
		getResut("http://dict.qq.com/sug?", this.value, showPhotos);
	}
	document.getElementsByClassName("detailLink").onclick=function(e){
		getResultByQuery(this.value);
	}
}

 var getDetail=function(value){
	getResut("http://dict.qq.com/dict?f=web&q=", value, function() {
				data = JSON.parse(req.responseText);
				var str = '<h3>' + value + '</h3>';
				var local = data['local'];
				var netsen = data['netsen'];
				var lang = data.lang;

				if (lang == 'eng') {
					var mor, mor_length;
					for (var i = 0, l1 = local.length; i < l1; i++) {
						var it1 = local[i];
						mor = it1.mor || [];
						mor_length = mor.length;
						if (mor_length) {
							str += '<p>';
							for (var m = 0; m < mor_length; m++) {
								str += mor[m].c + ' <span style="color:green;font-size:14px;font-weight:600">' + mor[m].m + '</span>  '
							}
							str += '</p><hr/>'
						}
						for (var i1 = 0, l11 = it1.des.length; i1 < l11; i1++) {
							str += '<p>' + (function(s) {
								if (typeof s == 'undefined') {
									return ''
								} else {
									return s;
								}
							})(it1.des[i1].p) + it1.des[i1].d + '</p>'
						}
					}
					/**/
					for (var j = 0, l2 = netsen.length; j < l2; j++) {
						var it2 = netsen[j];
					}
				}else if(lang == 'ch'){
					str+='<div id="detailBox">'
					for(var i1=0,l1=local.length;i1<l1;i1++){
						str+='<p><span style="cursor:pointer;color:#15C;text-decoration: underline;" class="detailLink">'+local[i1].des+'</span></p>'
					}
					str+='</div>';
					
				}else{
					str = '无法查到相关解释'
				}
				box=document.getElementById('box');
				box.innerHTML=str;

			});
}

var getResultByQuery=function(value){
	document.getElementById('queryInput').value=value;
	getResut("http://dict.qq.com/sug?", this.value, showPhotos);
}




/**
QQDICTSug.sugInput.onkeydown = function(event) {
	if (QQDICTSug.siSug == 0) {
		return;
	}
	var e1 = event || window.event;
	var e = e1.charCode || e1.keyCode;
	if (13 == e) {
		hideSugDiv();
	}
	if (isSugHidden()) {
		return;
	}
	if (38 == e) {
		if (QQDICTSug.current_sug_item == null) {
			QQDICTSug.current_sug_item = QQDICTSug.sugContentDiv.lastChild;
		} else {
			unHilight(QQDICTSug.current_sug_item);
			QQDICTSug.current_sug_item = QQDICTSug.current_sug_item.previousSibling;
		}
		hilight(QQDICTSug.current_sug_item);
		travelCurrentItem(QQDICTSug.current_sug_item);
	}
	if (40 == e) {
		if (QQDICTSug.current_sug_item == null) {
			QQDICTSug.current_sug_item = QQDICTSug.sugContentDiv.firstChild;
		} else {
			unHilight(QQDICTSug.current_sug_item);
			QQDICTSug.current_sug_item = QQDICTSug.current_sug_item.nextSibling;
		}
		hilight(QQDICTSug.current_sug_item);
		travelCurrentItem(QQDICTSug.current_sug_item);
	}
}
/**/

