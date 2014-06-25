//touch.js for _g is a module lib extend the touch event and controls 
//在触摸或者移动设备上提供许多触控的功能是非常必须的，如果来管理这些触控的事件以达到效果，是这个控件的原理
//dependencies: [base ,jquery,hammer]
(function(){
var _g_touch={
    support:function(){
      try {  
        document.createEvent("TouchEvent");  
        return true;  
      } catch (e) {  
        return false;  
      }  
    }(),
    bind:function(){
        //绑定touch事件
        
    }
}
if(typeof require=="undefined"){
    if(!window._g) window._g={};
    window._g.touch=_g_touch;
}
else{
    define(['_g/base','jquery.hammer'],function(){
        window._g.touch=_g_touch;
        return window._g.touch; 
    })
}
})(window);