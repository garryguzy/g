// error 库，用来返回出错的信息
//dependencies:[_g/base,'jquery']
(function(){
var _g_error={
	log:function(msg){//记录错误，但不返回错误处理，或提示
		console.log(msg);
	},
	serverError:function(){
		$(document).trigger('serverError');
	}
}
if(typeof require=="undefined"){
	if(!window._g) window._g={};
	window._g.error=_g_error;
}
else{
	define(['_g/base'],function(){
		window._g.error=_g_error;
		return window._g.error;	
	})
}
})(window);