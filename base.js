//依赖库,所有_g module的核心，定义最基础的变量
//dependencies: [jquery,backbone]
/*jshint asi: true*/
(function(){
var _g_base={
    uuid:function(){//用来生成unique字符串
        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
                     .toString(16)
                     .substring(1);
        }
        return s4() + s4() + s4() + s4() + s4() +  s4() + s4() + s4();
    },
    parseTemplate:function(template){//该函数对模板对象进行处理，模板可以是underscore template func , 模板字符串，text取得的文本
        var returned=null;
        if(typeof template=='function') returned=template;
        if(typeof template=='string') returned=_.template(template);
        return returned;
    },
    browserSupport:function(opts){//设置浏览器版本支持检测设定
        var success=false;
        var defaults={
            msie:1,//0，表示不支持IE，1表示所有IE版本都支持，或者后面跟版本号表示支持到哪个版本,目前版本号支持整数
            chrome:1,
            mozilla:1,
            safari:1,
            opera:1,
            success:null,//如果符合上面的支持类型，则返回success调用功能
            fail:null//如果不支持当前的浏览器,则返回不支持
        }
        opts=opts?$.extend(true,{},defaults,opts):$.extend(true,{},defaults);
        var version=parseInt($.browser.version,10);
        if($.browser.msie&&opts.msie==1||$.browser.chrome&&opts.chrome==1||$.browser.mozilla&&opts.mozilla==1||$.browser.safari&&opts.safrai==1&&$.browser.opera&&opts.opera==1){
            success=true;
        }
        else if($.browser.msie&&opts.msie==0||$.browser.chrome&&opts.chrome==0||$.browser.mozilla&&opts.mozilla==0||$.browser.safari&&opts.safrai==0&&$.browser.opera&&opts.opera==0){
            success=false;
        }
        else{
            if($.browser.msie) success=(version>=opts.msie);
            if($.browser.chrome) success=(version>=opts.chrome);
            if($.browser.mozilla) success=(version>=opts.mozilla);
            if($.browser.opera) success=(version>=opts.opera);
            if($.browser.safari) success=(version>=opts.safari);
        }
        if(success){
            if(opts.success) opts.success();
        }
        else{
            if(opts.fail) opts.fail();
        }
        return success;
    },
    array:{
        move2first:function(list,value){//移动数值放到list的最前面
            var result=[];
            result.push(value);
            for(i=0;i<list.length;i++){
                if(list[i]!=value) result.push(list[i]);
            }
            return result;
        },
        move2last:function(list,value){
            var result=[];
            for(i=0;i<list.length;i++){
                if(list[i]!=value) result.push(list[i]);
            }
            result.push(value);
            return result;          
        },
        randomPick:function(list){//在一个array里面进行
            return list[Math.floor(Math.random() * list.length)];
        },
        maptree:function(opts){//对一个树形结构进行赋值，根据树形结构的id来生成一个带值的树结构,treedata为array对象，根据其id属性来对treeobject对象进行赋值
            var defaults={
                treesource:null,//tree对象，是一个array组
                mapdata:null,//用来赋值的数据
                idAttribute:'id'//通常根据id来进行tree赋值
            }
            opts=opts?$.extend(true,{},defaults,opts):$.extend(true,{},defaults);
            if(!opts.treesource||!opts.mapdata) return [];
            var result=[];
            _.each(opts.treesource,function(i){
                if(i.children){
                    i.children=_g.array.maptree({
                        treesource:i.children,
                        mapdata:opts.mapdata,
                        idAttribute:opts.idAttribute
                    })
                }
                var value=_.find(opts.mapdata,function(d){return d[opts.idAttribute]==i[opts.idAttribute]});
                if(value) i=$.extend(true,i,value);
                result.push(i);     
            })
            return result;
        }
    },
    object:{
        jsonparse:function(val){//将一个string值parse成json object，如果失败则返回原有val
            if (val){
                try{
                    a=JSON.parse(val);
                    return a;
                }catch(e){
                    //alert(e); //error in the above string(in this case,yes)!
                    return val;
                }
            }
            else return null;
        },
        equal:function(obj1,obj2){//compare two object if they are the same
            
        }
    },
    string:{
        randomGenerate:function(length){//生成随即的string字符串，字符串的长度由length决定,默认length为10
            length=length?length:10;
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
            for( var i=0; i < length; i++ )
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            return text;
        },
        getUrlExt:function(url){//获取一个路径字符串的文件名后缀,然后可以根据后缀进行一系列的处理
            return url.match(/(.[^.]+|)$/)[0];
        }
    },
    boolean:{
        randomPick:function(){//改函数返回随即的boolean变量，true or false
            return !! Math.round(Math.random() * 1);
        }
    },
    number:{
        random:function(min, max) {
            if(typeof min=="undefined") min=0;
            if(typeof max=="undefined") max=100;
            return Math.random() * (max - min) + min;
        },
        randomInt:function(min, max) {
            if(typeof min=="undefined") min=0;
            if(typeof max=="undefined") max=100;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    },
    hasTouch:function(){
      try {  
        document.createEvent("TouchEvent");  
        return true;  
      } catch (e) {  
        return false;  
      }  
    }()
}
if(typeof require=="undefined"){
    if(!window._g) window._g={};
    window._g=$.extend(true,{},window._g,_g_base);
    _g_base=undefined;
}
else{
    define(['jquery','backbone'],function(){
        if(!window._g) window._g={};
        window._g=$.extend(true,{},window._g,_g_base);
        _g_base=undefined;
        return window._g;
    })
}
})(window);
