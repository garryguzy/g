//sort 是 g 库的高级组件，基于nestable 来更好的实现tree 的排序功能
//该module用来画sort,可以根据列数，行数，来画出相对应的sort来
(function(){
var _g_sort=function(options){
    this.init(options);
}
_g_sort.prototype={
    init:function(options){
        var defaults={
            containment:'.g-slider',//
            handle:'.g-slider-handle',
            range:'.g-slider-range'
        };
        this.options=opts?$.extend(true,{},defaults,opts):defaults; 
        _.bindAll(this);  
    }
}
if(typeof require=="undefined"){
    if(!window._g) window._g={};
    window._g.sort=_g_sort;
}
else{
    define(['_g/base','underscore'],function(){
        window._g.sort=_g_sort;
        return window._g.sort; 
    })
}
})(window);