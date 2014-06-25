//keyboard 在浏览器上的应用非常广泛，此module就是为了提供键盘的响应控制
//提供全局范围内的键盘按键控制
//dependencies: [base]
(function(){
var _g_keyboard={
    support:function(){

    },
    init:function(){
        $(document).on('keydown',function(e){
            console.log('keydown'+e);
        })
        $(document).on('keyup',function(e){
            console.log('keyup'+e);
        })
        $(document).on('keypress',function(e){
            console.log('keypress'+e);
        })
    }
}
if(typeof require=="undefined"){
    if(!window._g) window._g={};
    window._g.keyboard=_g_keyboard;
}
else{
    define(['_g/base','_g/event'],function(){
        window._g.keyboard=_g_keyboard;
        return window._g.keyboard; 
    })
}
})(window);
