/*
 * generator 有点像一个自动的机器人，作用是很方便的在静态端生成一些组件，插件之类的
 * generator 不仅用于静态，也用于动态的组件生成共用一套
 * 原来的MVC架构会带上widget和component解析，
 */
(function(){

var _g_generator={
    init:function(elm){
        //我们给元素定义上一些结构 <div class="_gGenerator" data-type="widget" data-name="slider" data-class="testclass"></div>
        //这样对于静态页面加载的时候，我们就会去查找页面中的这些Generator元素，将它转成元件显示在所在的位置
        //elm代表在哪个页面元素的范围下面，如果elm=null, 那么默认是在'body'下面进行元素的初始化
        if(!elm) elm="body";
        $(elm).find('.c-autowidget').each(function(){
            var data=$(this).data();
            if(data) data.replace=true;
            switch(data.widgetname){
                case 'slider': _g.generator.slider($(this),data);break;
                case 'colorpicker': _g.generator.colorpicker($(this),data);break;
            }
            //if(name=="slider") _g.debug_editor.drawSlider($(this).parent());
        })
    },
    render:function(elm){
        //render和init不同的地方，在于render是用于单个widget的转换
    },
    buttonDropDown:function(elm,opts){
        //
        var defaults={
            size:'xs' ,//button group 的尺寸
            widgetType:1,// 1表示不拆分button ，2表示拆分button
            name: 'button1',//用来赋值的字段名，和input 相同
            key: null,//用来赋值字段的key
            buttonname:'button1',
            classname:'btn-default',
            buttonclassname:'btn-default',
            caretbuttonclassname:'btn-default',
            dropdownmenuclassname:null,
            dropdownmenus:[],
            replace:false//是否替换原有的元素
        }
        opts=opts?$.extend(true,{},defaults,opts):$.extend(true,{},defaults);
        var newElm;
        var T=require('text!_g/templates/buttonDropDown.js');
        newElm=$(_.template(T,{data:opts}));
        if(!opts.replace) $(elm).append(newElm);
        else $(elm).replaceWith(newElm);
        return newElm;
    }
    ,slider:function(elm,opts){
        var newElm;
        newElm=_g.form.slider(opts);
        if(!opts.replace) $(elm).append(newElm);
        else $(elm).replaceWith(newElm);
        return newElm;
    }
    ,colorpicker:function(elm,opts){
        var newElm;
        newElm=_g.form.color(opts);
        $(elm).append(newElm); 
        if(!opts.replace) $(elm).append(newElm);
        else $(elm).replaceWith(newElm);
        return newElm;
    }
}
if(typeof require=="undefined"){
    if(!window._g) window._g={};
    window._g.generator=_g_generator;
}
else{
    define(['_g/base'
            ,'underscore'
            ,'text!_g/templates/buttonDropDown.js'
            ],function(){
        if(!window._g) window._g={};
        window._g.generator=_g_generator;
        return window._g.generator; 
    })
}
})(window);