//用来进行国际化输出的函数
//其原理是通过调取各个组成翻译库语言的json模块来构建前端的翻译系统
//通常根据用户选择的语言，来取相应的翻译模块
//目前所使用的i18n js engine 是 jed
//dependence: [_g/base, jed]
(function(){
var _g_i18n={
    create:function(opts){//使用jed来创建一个国际化查询库,返回由jed生成的国际化库
        defaults={
            domain:'global',//这个查询库的名称，默认为'global'
            data:[],//一个数组包，包含了所有需要打包进去的字典数据
            lang:'zh'//对应的语言
        };
        opts=opts?$.extend(true,{},defaults,opts):defaults;
        var _i18n=null;
        var locale_data={
            "global":{
              "" : {
                  "domain" : "interaction",
                  "lang"   : "zh",
                  "plural_forms" : "nplurals=2; plural=(n != 1);"
                 }
            }
        };
        for(i=0;i<opts.data.length;i++){
            locale_data=$.extend(true,locale_data,opts.data[i]);
        }
        _i18n = new Jed({
            // Generally output by a .po file conversion
            locale_data :locale_data,
            "domain" : opts.domain||"global"
        });
        _i18n.query=function(key,domain){
            return _g.i18n.translate(_i18n,key,domain);
        }
        _i18n.queryPlural=function(key,n,domain){
            return _g.i18n.translatePlural(_i18n,key,n,domain);
        }
        _i18n.queryStr=function(key,strs,domain){
            return _g.i18n.translateStr(_i18n,key,strs,domain);
        }
        return _i18n;
    },
    translate:function(i18nlib,key,domain){//sometimes we can easily translate a key within specific domain
        if(!i18nlib) return key;
        return domain?i18nlib.translate(key).onDomain(domain).fetch():i18nlib.translate(key).fetch();
    },
    translatePlural:function(i18nlib,key,n,domain){//返回复数的国际化转换结果，n对应相应的值
        if(!i18nlib) return key;
        return domain?i18nlib.translate(key).onDomain(domain).ifPlural(n, "" ).fetch(n):i18nlib.translate(key).ifPlural(n, "" ).fetch(n);
    },
    translateStr:function(i18nlib,key,strs,domain){
        if(!i18nlib) return key;
        if(typeof strs=="string") ;
        else{
            if(strs.length==0) strs="";
            strs=strs.join(',');
        }
        return domain?i18nlib.translate(key).onDomain(domain).fetch(strs):i18nlib.translate(key).fetch(strs);
    }
}
if(typeof require=="undefined"){
    if(!window._g) window._g={};
    window._g.i18n=_g_i18n;
}
else{
    define(['_g/base','jed'],function(){
        window._g.i18n=_g_i18n;
        return window._g.i18n; 
    })
}
})(window);