//event 函数包扩展常规的事件绑定方法，有利于在一个页面内进行统一的，对象化的事件驱动
//通过统一对象的事件驱动来规范一些常规类型事件
//最初的时候我们会绑定最基本的全局，或者整个document的事件来进行事件管理，包括事件触发，事件截获，事件屏蔽等等
(function(){
var _g_event={
    addEvent:function (el, type, fn, capture) {
        if(el.addEventListener)
            el.addEventListener(type, fn, !!capture);
        else
            $(el).on(type, fn);
    },
    removeEvent:function (el, type, fn, capture) {
        if(el.removeEventListener)
            el.removeEventListener(type, fn, !!capture);
        else
            $(el).off(type, fn);
    },
    document:{
        //设定document事件
        disable_contextmenu:function(){
            document.oncontextmenu=function(event){
                if(event)
                    event.preventDefault();
                return false;
            }
        },
        enable_contextmenu:function(){
            document.oncontextmenu=function(event){}
        },
        onCopy:function(opts,callback){
            $(document).on("copy", function(event){
                console.log(event);
            });            
        },
        disable_paste:function(){
            document.disable_paste=true;
        },
        enable_paste:function(){
            document.disable_paste=false;  
        }
    }
}
if(typeof require=="undefined"){
    if(!window._g) window._g={};
    window._g.event=_g_event;
}
else{
    define(['_g/base'],function(){
        window._g.event=_g_event;
        return window._g.event; 
    })
}
})(window);
