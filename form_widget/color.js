define(['text!_g/form_widget/templates/color.js','colorpicker'],function(){
    var color=function(opts){
        //作为控件，除了生成这样一个控件的render以外
        //绑定控件的事件，在事件触发后进行model的变量设置，同时需要对相应的dom做出调整
        //opts.model ,opts.attr//比如iDetail等等 ，opts.el 元素 ，opts.key 默认是bg_color
        var defaults={
            replace:false,
            color:'#000000',//默认的初始颜色为黑色
            widgetType:1,
            classname:null
        }
        opts=opts?$.extend(true,{},defaults,opts):$.extend(true,{},defaults);
        opts.T=require('text!_g/form_widget/templates/color.js');
        var el=_g.renderT(opts.T,opts,'data','text!_g/form_widget/templates/color.js');
        var $el=$(el);
        //$('body').children('.colorpicker').remove();
        $el.colorpicker(opts)
        .on('changeColor', function(ev){
           var value=ev.color.toHex();
            if(opts.callback) opts.callback(value);
        });
        $el.addClass('c-colorpicker');
        if(opts.classname) $el.addClass(opts.classname);
        return $el;
    }
    return color;
})