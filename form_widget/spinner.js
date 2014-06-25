//使用fuelux spinner 组件
define(['fuelux/fuelux.spinner','text!_g/form_widget/templates/spinner.js'],function(){
    var result=function(opts){
        //作为控件，除了生成这样一个控件的render以外
        //绑定控件的事件，在事件触发后进行model的变量设置，同时需要对相应的dom做出调整
        //opts.value :初始值 , opts.min opts.max , opts.step ,opts.decimal_length 小数点位数
        if(!opts) opts={};
        if(!opts.data) opts.data={size:'xs'};
        var T=require('text!_g/form_widget/templates/spinner.js');
        var el=_g.renderT(T,opts.data,'data','text!_g/form_widget/templates/spinner.js');
        var $el=$(el);
        //opts.containment.html($el);
        //$el.children('.spinner').attr('data-attr',opts.attr);
        $el.spinner({
            value:opts.value,
            min:opts.min,
            max:opts.max,
            step:opts.step,
            decimal_length:opts.decimal_length
        }).on('changed',function(event,value){
            console.log('change');
            if(opts.callback) opts.callback(event,value);
        }); 
        return $el;
    }
    return result;
})