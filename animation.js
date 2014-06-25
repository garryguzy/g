//动态包，支持许多动态效果
//dependencies: [base]
(function(){
var _g_animation={
    initItems:function(opts){
        
    },
    slide:function(opts){
        //slide是滑动效果
        //通常由2个slide页组成
        
    }
}
if(typeof require=="undefined"){
    if(!window._g) window._g={};
    window._g.animation=_g_animation;
}
else{
    define(['_g/base','jquery.hammer'],function(){
        window._g.animation=_g_animation;
        return window._g.animation; 
    })
}
})(window);