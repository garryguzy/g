//_g库应用函数，主要提供一些面向对象的处理，数据的处理等等
//depends:[jquery]
//ajax库函数支持
/*jshint asi: true*/
(function(){
var _g_ajax={
    load:function(opts,callback){
        return _g.ajax.get(opts,callback);
    },
    get:function(opts,callback){//用来从服务器端取json或其他类型数据
        var defaults={
            url:null,//用来取JSON数据的服务端地址
            dataType:"JSON",//默认是取JSON数据，也可以支持'html','text','jsonp'等等
            staticUrl:null,//用来在debug模式下取json数据的地址
            callback:null,//成功后返回的操作，将回传response的JSON数据
            parseData:null,//如果需要对静态数据进行处理，可以通过parseData来进行，比如说对静态数据进行生成
            debug:false,//除了可以全局控制debug模式的开启通过_gdebug外，还可以通过debug参数来强制使json数据走静态来取
            name:null//name主要是debug用的，当开启debug的时候，我们甚至可以通过外部的方式来改变url的地址
        }
        if(typeof opts=='string') {
            defaults.url=opts;
            defaults.callback=callback;
            opts=defaults;
        }
        else opts=opts?$.extend(true,{},defaults,opts):$.extend(true,{},defaults);
        if(_g.debug&&_g.debug.enabled){
            if(!opts.name) opts.name=opts.url;
            _g.debug.data[opts.name]={};
        }
        var isDebug=((typeof _gDebug!="undefined")&&_gDebug||opts.debug);
        var url=isDebug?(_g.debug&&_g.debug.query_user_data(opts.name)?_g.debug.query_user_data(opts.name):opts.staticUrl):opts.url;
        if(!url) return false;//如果没有设定url地址，则这次ajax无效
        var returned=$.ajax({
            url:url,
            type:"GET",
            data:"",
            dataType:opts.dataType,
            success:function(data){
                if(_g.debug&&_g.debug.enabled) _g.debug.data[opts.name].data=$.extend(true,{},data);
                if(isDebug&&opts.parseData) data=opts.parseData(data);
                if(opts.callback) opts.callback(data);
            },
            error:function(){
                _g.error.serverError();
                if(opts.onError) opts.onError(0);
            }
        })
        return returned;
    },
    post:function(opts,data,callback){
        var defaults={
            url:null,//用来取JSON数据的服务端地址
            data:null,//改参数定义需要post的数据
            dataType:"JSON",//默认是取JSON数据，也可以支持'html','text','jsonp'等等
            staticUrl:null,//用来在debug模式下取json数据的地址
            callback:null,//成功后返回的操作，将回传response的JSON数据
            debug:false,//除了可以全局控制debug模式的开启通过_gdebug外，还可以通过debug参数来强制使json数据走静态来取
            name:null
        }
        if(typeof opts=='string') {
            defaults.url=opts;
            defaults.callback=callback;
            defaults.data=data;
            opts=defaults;
        }
        else opts=opts?$.extend(true,{},defaults,opts):$.extend(true,{},defaults);
        if(_g.debug&&_g.debug.enabled){
            if(!opts.name) opts.name=opts.url;
            _g.debug.data[opts.name]={};
        }
        var isDebug=((typeof _gDebug!="undefined")&&_gDebug||opts.debug);
        var url=isDebug?(_g.debug&&_g.debug.query_user_data(opts.name)?_g.debug.query_user_data(opts.name):opts.staticUrl):opts.url;
        if(!url) return false;
        var returned=$.ajax({
            url:url,
            type:isDebug?"GET":"POST",//如果是开启了debug模式，则直接采用get方式来获取虚拟的静态数据
            data:opts.data,
            dataType:opts.dataType,
            success:function(data){
                if(_g.debug&&_g.debug.enabled) _g.debug.data[opts.name].data=$.extend(true,{},data);
                if(opts.callback) opts.callback(data);
            },
            error:function(){
                _g.error.serverError();
                if(opts.onError) opts.onError(0);
            }
        })
        return returned;        
    },
    dataGenerate:function(opts){//用来生成一套数据可以供模拟JSON使用
        var defaults={
            dataSource:null,//取得data的元数据,传入的dataSource的第一个数据作为参照源，会被删除。
            map:null,//数据加工结构
            key:null,//在datasource里面的哪一个key进行map映射
            count:0//要生成多少个数据
            // map:{
                // id:'uuid',
                // type:'randompick',
                // name:'string',
                // number:'number',
                // editable:'boolean'
            // }
        }
        opts=opts?$.extend(true,{},defaults,opts):$.extend(true,{},defaults);
        if(!opts.dataSource||!opts.map) return opts.dataSource;
        var data=opts.key?opts.dataSource[opts.key]:opts.dataSource;
        if(!data[0]) return opts.dataSource;
        for(i=0;i<opts.count;i++){
            var newdict={};
            var dict=data[0];
            _.each(dict,function(value,key){
                var mapvalue;
                if(!opts.map[key]) newdict[key]=dict[key];
                else{
                    switch(opts.map[key]){
                        case 'uuid': mapvalue=_g.uuid();break;
                        case 'randompick': mapvalue=_g.array.randomPick(dict[key]);break;
                        case 'string': mapvalue=_g.string.randomGenerate(10);break;
                        case 'number': mapvalue=_g.number.randomInt();break;
                        case 'boolean': mapvalue=_g.boolean.randomPick();break;
                        default: mapvalue=dict[key];
                    }
                    newdict[key]=mapvalue;
                }
            })  
            data.push(newdict);     
        }
        data.shift();
        if(opts.key) opts.dataSource[opts.key]=data;
        else opts.dataSource=data;
        return opts.dataSource;
    },
    testSpeed:function(opts){//用来获取用户的网络速度，以此作为网站下载传输时间的依据
        var defaults={
            file:null,//用来测试速度的文件
            fileSize:0,//该测试文件的大小
            callback:null
        }
        opts=opts?$.extend(true,{},defaults,opts):$.extend(true,{},defaults);  
        if(!opts.file) return false;     
        var imageAddr = opts.file + "?n=" + Math.random();
        var startTime, endTime;
        var downloadSize = opts.fileSize;
        var download = new Image();
        download.onload = function () {
            endTime = (new Date()).getTime();
            showResults();
        }
        startTime = (new Date()).getTime();
        download.src = imageAddr;
        
        function showResults() {
            var duration = (endTime - startTime) / 1000;
            var bitsLoaded = downloadSize * 8;
            var speedBps = (bitsLoaded / duration).toFixed(2);
            var speedKbps = (speedBps / 1024).toFixed(2);
            var speedMbps = (speedKbps / 1024).toFixed(2);
            // alert("Your connection speed is: \n" + 
                   // speedBps + " bps\n"   + 
                   // speedKbps + " kbps\n" + 
                   // speedMbps + " Mbps\n" );
        }        
    }
}
if(typeof require=="undefined"){
    if(!window._g) window._g={};
    window._g.ajax=_g_ajax;
    _g_ajax=undefined;
}
else{
    define(['jquery','_g/base','_g/error'],function(){
        window._g.ajax=_g_ajax;
        _g_ajax=undefined;
        return window._g.ajax;  
    })
}
})(window);