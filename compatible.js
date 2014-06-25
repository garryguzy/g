//建立compatible.js是为了很方便的可以得知我们的系统中所用到的模块，框架，功能在各个系统，各个浏览器中的兼容性情况
//compatible判断的依据是各个引用的module,modele的兼容性是基础的，同时还有功能性的比如，一个功能点可能包含有其他的功能点，用__来表示
//依据browser support 的功能， 0代表全部不支持，1代表支持所有版本，其他则代表版本号
//用下划线代表引用某个功能的所有compatible
(function(){
var _g_compatible={
    init:function(opts){
        var defaults={
           // features:[],//features 代表着整个网站的功能性列表，以及这些功能所对应的module列表
            //modules:{}//modules对应的是所有的modules的兼容性列表
        }
        var options=opts?($.extend(true,{},opts,defaults)):defaults;
        console.log(options);
        if(!options.features||!options.modules) return false;
        var results={};
        var compall={"msie":1,"chrome":1,"safari":1,"mozilla":1,"opera":1};
        _.each(options.features,function(feature_modules,feature_name){
            var comp={"msie":1,"chrome":1,"safari":1,"mozilla":1,"opera":1};//假定初始状态是全适应
            //comp=_getCompatible(comp,feature_name);  
            comp=_g.compatible.getFeatureCompatible(options.features,options.modules,feature_name,comp);            
            results[feature_name]=comp;
            compall=_g.compatible.getComp(compall,comp);
        })
        results.all=compall;
        results.features=options.features;
        results.modules=options.modules;
        console.log(results);
        return results;
    },
    testCompatible:function(comp,opts){
        //首先是知道全站的适应性
        //其次，发现其中无法适应的因子
        //提供相应的解决对策，比如说使用其他升级版本，或者采用别的浏览器
        var results={
            compatible:true,//返回兼容的测试结果
            features:{},//各个功能的测试结果
            all:comp.all
        }
        var version,browser;
        if(opts){
            version=opts.version;
            browser=opts.browser;
        }
        else{
            if(_g.isMSIE11()){
                browser='msie';
                version=11;
                //return 11>=comp.msie;
            }
            else{
                version=parseInt($.browser.version,10);
                if($.browser.msie) browser='msie';
                if($.browser.chrome) browser="chrome";
                if($.browser.safari) browser="safari";
                if($.browser.mozilla) browser="mozilla";
                if($.browser.opera) browser="opera";
            }
       }
        if(browser){
            if(comp.all[browser]!=0&&version>=comp.all[browser]){
            }
            else{
                results.compatible=false;
                results.recommend={browser:comp.all[browser]};
                var features=comp.features;
                var modules=comp.modules;
                results.reason={};
                comp=_.omit(comp,'all','features','modules');
                _.each(comp,function(value,key){
                    if(comp[key][browser]!=0&&version>=comp[key][browser]){
                    }
                    else{
                        //如果说是因为这个module的兼容性问题，我们需要知道
                        //1. 这个module的什么模块的兼容性影响了
                        //2. 这个module的替代浏览器推荐
                        results.features[key]=comp[key];
                        results.features[key].reason={};
                        results.features[key].recommend={browser:comp[key][browser]};
                        if(features[key]){
                            _.each(features[key],function(feature_module){
                                if(modules[feature_module]){
                                    var module_compatibility=_g.compatible.getModuleCompatible(modules,feature_module);
                                       if(module_compatibility[browser]==0||version<module_compatibility[browser]){
                                            results.features[key].reason[feature_module]=modules[feature_module];
                                            results.reason[feature_module]=modules[feature_module];
                                       }
                                }
                            })
                        }
                    }
                })
            }
        }
        return results;
    },
    getComp:function(source,dest){
        var returned=source;
        if(typeof dest=="object"){
             _.each(source,function(value,key){
                returned[key]=value&&dest[key];
            })               
       }   
       return returned;     
    },
    getFeatureCompatible:function(features,modules,feature_name,comp){//comp是参照，如果没有用默认的
        if(!comp) comp={"msie":1,"chrome":1,"safari":1,"mozilla":1,"opera":1};
        var feature_modules=features[feature_name];
        if(!feature_modules) return comp;
            _.each(feature_modules,function(feature_module){
                if(feature_module.indexOf('__')==0){
                    //代表是包含包
                    var sub_feature_module=feature_module.slice(2);
                    if(features[sub_feature_module]){
                        comp=_g.compatible.getFeatureCompatible(features,modules,sub_feature_module,comp);
                    }
                }
                else if(modules[feature_module]){
                    comp=_g.compatible.getModuleCompatible(modules,feature_module,comp);
                    //comp=_combine_compatible(comp,options.modules[feature_module]);
                }
            })  
            return comp;          
    },
    getModuleCompatible:function(modules,module_name,comp){
        if(!comp) comp={"msie":1,"chrome":1,"safari":1,"mozilla":1,"opera":1};
        var returned=comp;
        var module_compatibilities=modules[module_name];
        if(!module_compatibilities) return comp;
        if(_.isArray(module_compatibilities)){
            //如果是数组，代表其中可能有引用其他module包,同时还有自身的附加属性
            _.each(module_compatibilities,function(module){
                if(typeof module=="string"){
                    if(module.indexOf('__')==0){
                        //代表是包含包
                        var submodule=module.slice(2);
                        if(modules[submodule]){
                            returned=_g.compatible.getModuleCompatible(modules,submodule,returned);
                        }
                    }
                }
                else{
                    if(typeof module=="object"){
                        returned=_g.compatible.getComp(returned,module);
                    }
                }
            })
        }
        else if(typeof module_compatibilities=="object"){
            returned=_g.compatible.getComp(returned,module_compatibilities);
             // _.each(module_compatibilities,function(value,key){
                // returned[key]=value&&module_compatibilities[key];
            // })               
        }
        return returned;        
    }
}
if(typeof require=="undefined"){
    if(!window._g) window._g={};
    window._g.compatible=_g_compatible;
}
else{
    define(['_g/base','underscore'],function(){
        window._g.compatible=_g_compatible;
        return window._g.compatible; 
    })
}
})(window);