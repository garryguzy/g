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
    getUrlParameterByName:function(name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results == null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
    },
    parseTemplate:function(template){//该函数对模板对象进行处理，模板可以是underscore template func , 模板字符串，text取得的文本
        var returned=null;
        if(typeof template=='function') returned=template;
        if(typeof template=='string') returned=_.template(template);
        return returned;
    },
    renderT:function(T,data,key,Tname,debug){
        //render template，该功能主要是扩展模板的展现，以及与debug模式相联系
        //T代表模板，可以是function或是string
        //data是所需要传递的数据
        //key是模板传入的时候是否需要加key ，例如 {key:data} 
        //Tname是测试用的，我们可以人为的给模板定名称，这样在debug的时候就可以用来调用，否则的话，就使用T， 如果T是function 就不行了
        //debug为调试选项，代表当前输入的T是一个调试模板
        if(!T) return false;
        if(!data) data={};
        var name=Tname||null;
        var d=$.extend(true,{},data);//我们需要将用作生成template的数据clone一下，以防止改动原有的数据
        if(name&&(typeof _gDebug!="undefined"&&_gDebug)&&_g.debug&&_g.debug.enabled){
            if(_g.debug.query_user_template(name)&&!debug) T=_g.debug.query_user_template(name);
        }
        if(key){
             var dict={};
             dict[key]=d;
             d=dict;
        }
        var resultT=_g.parseTemplate(T);
        if(name&&_g.debug&&_g.debug.enabled){
            _g.debug.template[name]={
                data:d,
                template:(typeof T=="string")?T:T.textsource,
                debug:true
            };
        }
        return resultT(d);
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
        },
        toDict:function(list,key){
            //将一个数组array转变成一个dict，key是dict的查询关键字
            var dict={},dictkey;
            for(i=0;i<list.length;i++){
                dictkey=list[i][key];
                dict[dictkey]=list[i]; 
            }
            return dict;
        },
        treeToList:function(list,opts,referencelist){
            //把一个dict数组变成一个tree结构，也就是平行化的结构转变成树形化结构的list
            //生成对应的这样的id一套
            //因为平行结构的关系，可能在children里面并不包含结构，只有ids，这时候我们在拼凑数据时会用referencelist
            var defaults={
                childrenKey:'children',
                parentKey:'parent',
                idAttribute:'id'
            }
            opts=opts?$.extend(true,{},defaults,opts):$.extend(true,{},defaults);
            if(!list) return [];
            var ids=[];
            _.each(list,function(i){
                if(i[opts.childrenKey].length){
                    var results=_g.array.toTreeList(i[opts.childrenKey],opts,referencelist?referencelist:list);
                    for(j=0;j<results.length;j++){
                        //这时候有两种可能，一种是这个树形结构里面的children也是树形结构
                        ids.push(results[j]);
                    }
                    i.children=_.pluck(i.children,'id');
                }
                else delete i.children;
                ids.push(i);
            }) 
            return ids;           
        },
        listToTree:function(list,opts,referencelist){
            //把平行结构的数据变成树形结构
            var defaults={
                childrenKey:'children',
                parentKey:'parent',
                idAttribute:'id'
            }
            opts=opts?$.extend(true,{},defaults,opts):$.extend(true,{},defaults);
            var results=[];
            if(referencelist){
                //表示是参考列表，来获取子元素的数据
                list=_.map(list,function(i){
                    if(typeof i=="string"){
                        //如果i是id的话，需要通过referencelist 来找回实际的数据
                        i=_.find(referencelist,function(j){return j[opts.idAttribute]==i});
                    }
                    return i;
                })
            }
            _.each(list,function(_i){
                var i=$.extend(true,{},_i);
                if(referencelist){
                    results.push(i);
                }
                else{
                    if(i[opts.parentKey]) ;//pass
                    else{
                        if(i[opts.childrenKey]&&i[opts.childrenKey].length){
                            i[opts.childrenKey]=_g.array.listToTree(i[opts.childrenKey],opts,referencelist?referencelist:list);
                            results.push(i);
                        }
                        else{
                            results.push(i);
                        }
                    }
                }
            })
            return results;
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
            
        },
        treeToArray:function(tree){
            //把树形结构编程平行结构化的数组
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
        },
        getUrlNameWithOutExt:function(url){
            return url.substr(0, url.lastIndexOf('.'))||url;
        },
        getFileNameByPath:function(fullPath){
            return fullPath.replace(/^.*[\\\/]/, '');
        },
        string2boolean:function(str){//将一个string形式的boolean转成真正的boolean,有的时候比较有用
            return (str=="true")?true:false;
        },
        isPureEng:function(str) {
            //判断str是不是纯英文组成
            var j = 0;
            var s = str;
            if (s == "")
                return true;
        
            for (var i = 0; i < s.length; i++) {
                if (!((s.charCodeAt(i) >= 48 && s.charCodeAt(i) <= 57) || (s.charCodeAt(i) >= 65 && s.charCodeAt(i) <= 90) || (s.charCodeAt(i) >= 97 && s.charCodeAt(i) <= 122) ))
                    return false;
            }
            return true;
        },
        isEng:function(str) {
            //判断英文，可能中间会有空格之类
            var j = 0;
            var s = str;
            if (s == "")
                return true;
        
            for (var i = 0; i < s.length; i++) {
                if (!((s.charCodeAt(i) == 32) || (s.charCodeAt(i) >= 48 && s.charCodeAt(i) <= 57) || (s.charCodeAt(i) >= 65 && s.charCodeAt(i) <= 90) || (s.charCodeAt(i) >= 97 && s.charCodeAt(i) <= 122) ))
                    return false;
            }
            return true;
        },
        isPureChi:function(str) {
            var j = 0;
            var s = str;
            if (s == "")
                return true;
        
            for (var i = 0; i < s.length; i++) {
                if (!(s.charCodeAt(i) >= 19968 && s.charCodeAt(i) <= 64041))
                    return false;
            }
            return true;
        },
        isChi:function(str) {
            var j = 0;
            var s = str;
            if (s == "")
                return true;
        
            for (var i = 0; i < s.length; i++) {
                if (!((s.charCodeAt(i) == 32) || (s.charCodeAt(i) >= 19968 && s.charCodeAt(i) <= 64041) ))
                    return false;
            }
            return true;
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
        },
        round:function(value,seperate){
            var result=value;
            if(typeof seperate==undefined) seperate=0.5;
            var intValue=parseInt(value);
            var dValue=value-intValue;
            if(dValue<seperate){
                result=intValue;
            }
            else{
                result=intValue+1;
            }    
        },
        rgbToHex:function(r, g, b) {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        },
        hexToRgb:function(hex) {
            // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function(m, r, g, b) {
                return r + r + g + g + b + b;
            });
        
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },
        decimal:function(value,count){
            return Number(value.toFixed(count));
        }
    },
    hasTouch:function(){
      try {  
        document.createEvent("TouchEvent");  
        return true;  
      } catch (e) {  
        return false;  
      }  
    }(),
    inIframe:function(){//检测是否当前网页是在iframe下
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    },
    supportFlash:function(){
        return (typeof swfobject !== 'undefined' && swfobject.getFlashPlayerVersion().major !== 0 ? true : false);
    },
    isMSIE11:function(){
        return !!navigator.userAgent.match(/Trident\/7\./);
    },
    getRGBA:function(HEXcolor,opacity){
        //根据颜色和透明度来返回一个RGBA的属性值
        opacity=opacity!=undefined?Number(opacity):1;
        if(!HEXcolor) return 'transparent';
        else{
            var rgba=_g.number.hexToRgb(HEXcolor);
            var bg_color='rgba('+rgba.r+','+rgba.g+','+rgba.b+','+opacity+')';
        }
        return bg_color;
    }
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
