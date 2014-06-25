//使用bootstrap-slider组件
define(['bootstrap.slider','text!_g/form_widget/templates/slider.js'],function(){
    var result=function(opts){
        //作为控件，除了生成这样一个控件的render以外
        //绑定控件的事件，在事件触发后进行model的变量设置，同时需要对相应的dom做出调整
        //opts.value :初始值 , opts.min opts.max , opts.step ,opts.decimal_length 小数点位数
        var defaults={
            replace:false,
            min:0,
            max:100,
            step:1,
            orientation:'horizontal',//vertical 代表纵向
            value:50,//初始值50
            tooltip:'show',
            handle:'round',
            //width:'100%',
            classname:null
        }
        opts=opts?$.extend(true,{},defaults,opts):$.extend(true,{},defaults);
        var T=require('text!_g/form_widget/templates/slider.js');
        var el=_g.renderT(T,opts,'data','text!_g/form_widget/templates/slider.js');
        var $el=$(el);
        //opts.containment.append($el);
        //$el.children('.spinner').attr('data-attr',opts.attr);
        $el.slider(opts);
        $el.closest('.slider').addClass('c-slider');
        if(opts.classname) $el.closest('.slider').addClass(opts.classname);
        return $el.closest('.slider');
    }
    return result;
})