//_g库应用函数，主要提供一些面向对象的处理，数据的处理等等
//depends:[jquery]
/*jshint asi: true*/
(function(){
var _g_util={
    getValueByType:function(value,type){//返回指定类型的值
        type=type?type.toLowerCase():type;
        switch(type){
            case "number":return Number(value);
            case "boolean": if(value=="false") return false;
                            if(value=="true") return true;
                            return Boolean(value);
            case "string": return String(value);
            case "object": return _g.object.jsonparse(value);
            default: return value;
        }       
    },
    bindFormChange:function(opts){//绑定指定的dom范围内form元素的改变事件
        var defaults={
            containment:null,//设定区域的范围父节点
            $item:null,//指定特定的form元素，如果没有，则缺省（input, select , textarea )
            callback:null//(item,this)当form区域内的元素发生change时，将通过callback来返回函数,将返回2个参数，item指向当前变化的对象，this指向opts本身
        }
        opts=opts?$.extend(true,{},defaults,opts):defaults; 
        if(!opts.containment) return false;
        var $item=opts.$item?opts.$item:'input,textarea,select';
        $(opts.containment).find($item).on('change',function(){
            if(opts.callback){
                opts.callback($(this),opts);
            }
        })  
    },
    serializeValue:function(opts){//对一个对象范围内的form表单进行标准化，输出一套符合后续处理的列表
        var defaults={
            containment:null,//设定序列化区域的范围父节点,该属性不能缺省
            typeAttr:'data-type',//用来指定取得赋值变量类型的属性，通常是data-type
            attrAttr:'data-attr',//有时候需要把一个值附到某一个key中，通常用data-attr来指示这个值属于哪一个key
            allowEmpty:true //设定是否允许保留空的key，主要针对checkbox来用
        }
        opts=opts?$.extend({},defaults,opts):defaults;
        if(!opts.containment) return false;
        var target=opts.containment;
        var data={};
        var parseValue=function($this,value){
            if($this.attr('disabled')=="disabled") return;
            var name=$this.attr('name')||$(this).attr('id');
            var type=$this.attr(opts.typeAttr);
            var attr=$this.attr(opts.attrAttr);
            if(!name) return;
            if(attr){
                if(!data[attr]) data[attr]={};
                data[attr][name]=value;
            }
            else data[name]=value;          
        }
        $(target).find('input[type="text"],input[type="hidden"],textarea').each(function(){
            var name=$(this).attr('name')||$(this).attr('id');
            var type=$(this).attr(opts.typeAttr);
            var attr=$(this).attr(opts.attrAttr);
            var value=_g.util.getValueByType($(this).val(),type);
            parseValue($(this),value);
        })
        $(target).find('input[type="checkbox"]').each(function(){
            var name=$(this).attr('name')||$(this).attr('id');
            var type=$(this).attr(opts.typeAttr);
            var attr=$(this).attr(opts.attrAttr);
            var value=attr?(data[attr][name]?data[attr][name]:[]):(data[name]?data[name]:[]);
            if($(this).attr('checked')=='checked'){
                if(type=="boolean") value=true;
                else value.push(_g.util.getValueByType($(this).val(),type));                    
            }
            else{
                if($(this).attr('data-type')=="boolean") value=false;
            }
            parseValue($(this),value);
        })
        $(target).find('input[type="radio"]:checked').each(function(){
            var name=$(this).attr('name')||$(this).attr('id');
            var type=$(this).attr(opts.typeAttr);
            var attr=$(this).attr(opts.attrAttr);
            var value=_g.util.getValueByType($(this).val(),type);
            parseValue($(this),value);
        })
        $(target).find('select').each(function(){
            var name=$(this).attr('name')||$(this).attr('id');
            var type=$(this).attr(opts.typeAttr);
            var attr=$(this).attr(opts.attrAttr);
            var mutiple=Boolean($(this).attr('data-mutiple'));
            var value;
            if(!mutiple){
                value=_g.util.getValueByType($(this).val(),type);               
            }
            else{
                value=attr?(data[attr][name]?data[attr][name]:[]):(data[name]?data[name]:[]);
                value.push($(this).val());                              
            }
            parseValue($(this),value);
        })
        return data;
    },
    disableLink:function(opts){//对一个区域内的链接进行屏蔽，或者button进行屏蔽，参数可以自定义
        var defaults={
            containment:null,//区域的父节点，在该区域下的屏蔽功能有效
            linkitem:'a',//对象，默认为所有的链接
            enabled:true//在刚建立的时候默认为开启状态，可以通过disable来关闭
        }
        opts=opts?$.extend(true,{},defaults,opts):defaults;
        if(!opts.containment) return false;
        opts.func=function(){
            return false;
        }
        opts.enable=function(){
            $(opts.containment).find(opts.linkitem).each(function(){
                $(this).on('click',opts.func);
                opts.enabled=true;
            })
        }
        opts.disable=function(){
            $(opts.containment).find(opts.linkitem).each(function(){
                $(this).off('click',opts.func);
                opts.enabled=false;
            })          
        }
        opts.enable();
        return opts;
    },
    domExist:function($foo){//判断一个dom是否存在于整个html中，比如他已经被remove(),或者它的parent被remove()
        if(typeof $foo=="string") $foo=$($foo);
        return jQuery.contains(document.documentElement, $foo[0]);
    }
}
if(typeof require=="undefined"){
    if(!window._g) window._g={};
    window._g.util=_g_util;
    _g_util=undefined;
}
else{
    define(['jquery','_g/base'],function(){
        window._g.util=_g_util;
        _g_util=undefined;
        return window._g.util;  
    })
}
})(window);