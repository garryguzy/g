//mvc模块用于扩展mvc的功能
//dependencies:[jquery,backbone,underscore,_g.base, _g.ui]
/*jshint asi: true*/
(function(){
var _g_mvc={
    _loadTemplate:function(T,type){//用于加载模板,返回可用于生成模板代码的T,返回的T为函数，输入的T可以是函数，url，string,
    },
    _CollectionforSaveAll:function(){//临时用来建立一个批量保存的collection
        var ListForSave=Backbone.Model.extend({
                initialize:function(){
                    this.set('id','GlobalSave');
                },
                sync: function(method, model, options) {
                    var Model_JSON=this.data;
                    this.attributes=Model_JSON;
                    if(method=='create'){
                        return;
                    }
                    if(method=='update'){
                        options.url=this.url;
                    }
                    if(method=='delete'){
                        return;
                    }
                    if(method=='read'){
                        return;
                    }
                    Backbone.emulateHTTP = true ;
                    Backbone.emulateJSON = true ;
                    Backbone.sync(method, model, options);
                }
        });
        return (new ListForSave());
    },
    createModel:function(opts){//opts为model
        var defaults={//用作opts属性的参考
            defaults:{},//设定model的初始值
            //id://指定是否id初始存在
            autoIndex:true,//指定是否自动设置id, 默认为true，当元素没有默认id的时候将由系统自动设置
            autoUpdate:true,//比较方便的方式来自动更新所有的view，只要当model变化时候，就会执行view的自动更新，当你不希望使用bindChange去自定义函数的时候这个方式就会很方便。
            enableSync:true,//是否支持服务器端存取值,默认为true，
            createUrl:null,//创建时候取的创建地址，仅当autoIndex为false时用，当url为字符串的时候，取字符串的值，当url为function时，会将model attributes作为属性传递过来
            updateUrl:null,//用作update的时候用,同上，当为函数的时候将传递model数据作为参数来取url的值
            removeUrl:null,//设定删除改元素的地址
            fetchUrl:null,//用来取model数据，同上
            staticFetchUrl:null,//同ajax功能一样，mvc也支持静态Url的功能来模拟测试,静态url仅当debug模式开启时来使用
            staticRemoveUrl:null,
            staticCreateUrl:null,
            staticUpdateUrl:null,
            debug:false,//开启debug模式后，数据的读取存储会走静态路径,如果没有静态路径，则依旧取服务器路径
            //parse: //parse是backbone自身的功能，开启次函数，支持对fetch
            bindRemove:true,//当一个model删除的时候，同步删除所有相关的view
            bindChange:null,//绑定一个model的改变将执行对应的函数来操作或改变view，该函数需要自定义
            callback:null,//当model生成完毕后返回的函数，用来对model进行后续的处理,callback将在initView建立之前执行
            initView:null,//任何一个Model都可以设定一个初始的view
            initialize:function(){
                this.iViewlist=[];
                this.iCollectionlist=[];
                if(!this.get('id')){
                    this.set('isNew',true);
                    if(this.autoIndex){
                        var prefix=this.get('type')||this.get('iType')||'M';
                        this.set('id', prefix+'_'+_g.uuid());
                        this.preset();
                    }
                    else{
                        this.save({},{
                            wait : true,
                            success:function(model,response){
                                var returned = eval(response);
                                if(returned.Status == "Success"||returned.code == 200){
                                    model.set('id', returned.ID.toString());
                                }   
                                model.preset();                 
                            }
                        })
                    }                   
                }
                else{
                    this.preset();
                }
            },
            sync : function(method, model, options) {
                var url;
                var isDebug=(typeof _gDebug!="undefined"&&_gDebug)||this.debug;
                if(!this.enableSync) return false;
                if (method == 'create') {
                    url=isDebug?(this.staticCreateUrl?this.staticCreateUrl:this.createUrl):this.createUrl;
                    if(!url) return;
                    options.url=url;
                }
                if (method == 'update'||method=="patch") {
                    url=isDebug?(this.staticUpdateUrl?this.staticUpdateUrl:this.updateUrl):this.updateUrl;
                    if(!url) return;
                    options.url=url;
                }
                if (method == 'delete') {
                    url=isDebug?(this.staticRemoveUrl?this.staticRemoveUrl:this.removeUrl):this.removeUrl;
                    if(!url) return;
                    options.url=url;
                }
                if (method == 'read') {
                    url=isDebug?(this.staticFetchUrl?this.staticFetchUrl:this.fetchUrl):this.fetchUrl;
                    if(!url) return;
                    options.url=url;
                }
                options.url=(typeof options.url=="string")?options.url:options.url(model.attributes);
                Backbone.emulateHTTP = true;
                Backbone.emulateJSON = true;
                Backbone.sync(method, model, options);
            },
            addView:function(viewname,view){//添加一个View到这个model，定义view的名称，view参数可以是object或者已经设定的View
                if(typeof view=='function')
                    this[viewname]=new view({model:this});
                if(typeof view=='object'){
                    var viewShall=_g.mvc.createView(view);
                    this[viewname]=new viewShall({model:this});
                }
                if(this[viewname]) this.iViewlist.push(this[viewname]);
            },
            addCollection:function(collectionname,collection){//添加子集合
                if(typeof collection=='function')
                    this[collectionname]=new collection();
                if(typeof view=='object'){
                    var collectionShall=_g.mvc.createCollection(collection);
                    this[collectionname]=new collectionShall();
                }
                if(this[collectionname]) this.iCollectionlist.push(this[collectionname]);               
            },
            preset:function(){
                if(this.callback) this.callback(this);
                var model=this;
                if(this.autoUpdate){
                    this.on('change',function(){
                        model.updateAllViews();
                    })  
                }
                if(this.bindRemove){
                    this.on('destroy',function(){
                        model.removeAllViews();
                    })
                }
                if(this.bindchange){
                    this.bindchange();
                }
                if(this.initView){
                    this.addView('iview',this.initView);
                }
            },
            updateAllViews:function(){
                _.each(this.iViewlist,function(view){
                    if(view.$el) view.update();
                })                  
            },
            removeView:function(viewname){
                if(this[viewname]){
                    this[viewname].$el.remove();
                    this.iViewlist=_.reject(this.iViewlist,function(i){
                        return i==this[viewname];
                    })
                    this[viewname]=null;
                }
            },
            removeAllViews:function(){
                _.each(this.iViewlist,function(view){
                    if(view.$el) view.$el.remove();
                })              
            }
        };
        opts=opts?$.extend(true,{},defaults,opts):defaults;
        var Model=Backbone.Model.extend(opts);
        return Model;
    },
    createView:function(opts){
        var defaults={
            template:null,//设置view所使用的模板
            className:null,//定义单个View的class,可以追加特定的class
            containment:null,//设置该View对象的父对象
            wrap:null,//设定这个View是否需要包裹，比如'ul'之类的，如果设定了包裹，则在render的时候会判断父对象是否为包裹，如果没有的话，就会创建'ul'包裹
            wrapClassName:null,//定义wrap的class， 缺省为空，该选项只有当wrap存在时才有效
            autoRender:true,//设置是否自动Render，默认为true
            position:1,//当一个集合的时候，需要判断该元素所插入的位置，1表示添加到最后，0表示添加到最前面,默认是将View元素添加到最后面
            parseData:null,//对model的JSON数据进行处理，然后返回的数据用来生成一个View的数据
            callback:null,//如果设定了callback，则将返回该view对象，当一个view创建后
            bindChange:null,//对于特定的view，可以有针对性的绑定一些model的改变事件，来执行相应的代码
            parseTemplate:null,//对模板数据进行处理，通常用于根据model的key来通过函数返回不同的模板
            initialize:function(){
                _.bindAll(this);
                if(this.autoRender) this.render();
                if(this.callback) this.callback(this);
            },
            createEl:function(){//该函数返回一个View的Dom，供创建或替换
                var JSON = this.model.toJSON(),T;
                if(this.parseData){
                    JSON=this.parseData();
                }   
                if(this.parseTemplate){
                    T=this.parseTemplate(this.template);
                }
                else T=_g.parseTemplate(this.template);     
                var el=T(JSON);
                return el;  
            },
            render:function(callback){
                var view=this;
                if(!this.model||!this.template||!this.containment) return false;
                // if(typeof this.containment=="object"){
                    // if(!_g.util.domExist(this.containment)) this.containment=$(this.containment.selector);
                // }
                var containment=$(this.containment);
                if(this.wrap&&!$(this.containment).is(this.wrap)){
                    if($(this.containment).children(this.wrap).length==0) $(this.containment).append(document.createElement(this.wrap));
                    containment=$(this.containment).children(this.wrap);
                    if(this.containment&&this.wrapClassName) containment.addClass(this.wrapClassName);
                }
                var el=this.createEl();
                if(this.position==1) containment.append(el);
                else containment.prepend(el);
                var $el=_g.ui.findById({
                    containment:containment,
                    id:view.model.id
                })
                if($el.length>0){
                    this.setElement($el);
                    if(this.className) this.$el.addClass(this.className);
                }
                return this;
            },
            update:function(callback){
                if(!this.model||!this.template||!this.containment) return false;
                if(!_g.util.domExist(this.$el)) this.render();
                else{
                    var el=this.createEl();
                    this.$el.replaceWith(el);
                    var $el=_g.ui.findById({
                        containment:this.containment,
                        id:this.model.id
                    })
                    if($el.length>0){
                        this.setElement($el);
                        if(this.className) this.$el.addClass(this.className);
                    }                   
                }
                if(callback) callback(this);
                if(this.afterUpdate) this.afterUpdate(this);
            },
            events:{}//bind Events  绑定对应元素的View的事件
        }
        opts=opts?$.extend(true,{},defaults,opts):defaults;
        var View=Backbone.View.extend(opts);
        return View;
    },
    createCollection:function(opts){//创建一个collection集合用来存放相应的model
        var defaults={
            //model://设定相对应的model
            enableSync:false,//如果我们使用collection的fetch功能来取数据，可以开启该参数，否则默认为false
            fetchUrl:null,//url用来取得元数据，通过parse来处理，只有当enableSync为true的时候才起作用
            staticFetchUrl:null,//类似model，当在debug模式下的时候，通过静态地址来进行测试
            saveUrl:null,//saveUrl用来指定批量保存的地址，可以为函数也可以是字符串
            staticSaveUrl:null,//静态的save地址
            debug:false,//当debug模式开启的时候，将启用静态路径进行测试
            bindRemove:false,//该属性用来确认是否在集合中对model的View进行同步删除，通常已经在model中绑定了删除View的方法，这里就设为false,该属性可以是true，也可以是函数，对model进行特定的操作
            bindReset:true,//当我们重置一个collection里面的models的时候，需要同步对model的所有view进行重置
            bindAdd:null,//当添加一个元素到collection的时候执行的操作
            callback:null,//当一个collection建立以后会自动执行callback里面的函数，来调用后续的方法处理。比如fetch之类的方法
            initialize:function(){
                var collection=this;
                if(this.bindRemove){
                    this.on('remove',function(model){
                        if(typeof collection.bindRemove=="function"){
                            collection.bindRemove(model);//自定义可以删除特定的view
                        }
                        else{
                            model.removeAllViews();
                        }
                    })
                }
                if(this.bindReset){
                    this.on('reset',function(models,opts){
                        if(typeof collection.bindReset=="function"){
                            collection.bindReset(models,opts);//自定义可以删除特定的view,opts.previousModels取reset之前的models
                        }
                        else{
                            _.each(opts.previousModels,function(model){
                                model.removeAllViews();
                            })
                        }                       
                    })
                }
                if(this.bindAdd){
                    this.on('add',function(model){
                        collection.bindAdd();
                    })
                }
                if(this.callback) this.callback(this);
            },
            //parse://设置通过fetch得到的collection数据在生成model之前的处理
            sortByIds:function(ids){//根据一个ids的列表来进行排序，collection的model会根据,这个函数主要用来给collection里面的数据进行排序
                var collection=this;
                this.reset(_.map(ids,function(i){
                    return collection.get(i);
                }),{silent:true});//排序并不是变更其中models的属性内容，所以不需要激活reset事件
            },
            sync: function(method, model, options) {
                var isDebug=(typeof _gDebug!="undefined"&&_gDebug)||this.debug;
                if(!this.enableSync) return false;
                if(method=='read'){
                    var url=isDebug?(this.staticFetchUrl?this.staticFetchUrl:this.fetchUrl):this.fetchUrl;
                    if(!url) return;
                    options.url=url;
                }
                if(!options.url) return false;
                options.url=(typeof options.url=="string")?options.url:options.url(model.toJSON());
                Backbone.emulateHTTP = true ;
                Backbone.emulateJSON = true ;
                Backbone.sync(method, model, options);
            },
            //comparator://用来设定collection里面元素的排序规则
            saveAll:function(callback){//用来保存collection,必须设定了saveUrl，保存功能才有效
                var isDebug=(typeof _gDebug!="undefined"&&_gDebug)||this.debug;
                var url=isDebug?(this.staticSaveUrl?this.staticSaveUrl:this.saveUrl):this.saveUrl;
                if(!url) return false;
                var savelist=_g.mvc._CollectionforSaveAll();
                savelist.data=this.toJSON();
                savelist.url=url;
                savelist.save({},
                    {
                        wait:true,
                        success: function(m,response){
                            if(callback) callback(response);
                        },
                        error:function(){
                        }
                    }
                )
            },
            refreshView:function(opts){//refresh功能提供使得整个collection能够重新刷新一遍，更新其下每个model的view
                var defaults={
                    containment:null//
                }
                opts=opts?$.extend({},defaults,opts):defaults;
                if(this.length>0){
                    _.each(this.at(0).iViewlist,function(view){
                        containment=opts.containment||view.containment;
                        if(containment){
                            if(view.wrap&&!$(containment).is(view.wrap)) $(containment).children(view.wrap).empty();
                            else $(containment).empty();
                        }
                    })  
                    this.each(function(model){
                        if(opts.containment) model.iview.containment=opts.containment;
                        model.iview.update();
                    })
                }
            }
        };
        opts=opts?$.extend(true,{},defaults,opts):defaults;
        var Collection=Backbone.Collection.extend(opts);
        return Collection;
    },
    createTreeByData:function(opts){//建立一整套完整的tree model，由树形结构组成，
        var defaults={
            collection:null,//指定collection的类型，可以是Backbone的collection 或者是obj,这个参数是必须的
            data:null,//必要属性，用来生成树形collection的数据，data的结构类似[{id:...,children:[]}..]
            treeLevel:0,//作为树结构，它有一个level属性设定，通常也就是root根节点的level为0，依次累加，你也可以设定默认的根节点的level值
            parent:null//作为树形结构，必然有他的父节点，对于root element来说，parent为null,
        }
        var parent=opts.parent,collection;
        opts=opts?$.extend(true,{},defaults,opts):defaults;
        opts.parent=parent;
        if(!opts.collection||!opts.data) return null;
        var clonedata=$.extend(true,{},opts.data);
        if(typeof opts.collection=="function") collection=new opts.collection();
        else {
            var collectionShall=_g.mvc.createCollection(opts.collection);
            collection=new collectionShall();
        }
        collection.parent=parent;
        collection.refreshTreeView=function(arg){//根据当前的数据，更新整个treemodel，包括treemodel的View
            this.refreshView(arg);
            this.each(function(model){
                model.icollection.refreshTreeView({
                    containment:model.iview.$el
                })
            })
        }
        collection.getModels=function(){//返回树的models集合
            var models=_g.mvc.getTreeModels(collection);
            return models;  
        }
        collection.getModelsJSON=function(){
            var models=collection.getModels();
            models=_.map(models,function(i){
                return i.toJSON();
            })
            return models;
        }
        collection.getModel=function(id){//通过id来找寻一个model
            return _g.mvc.getTreeModel(collection,id);
        }
        collection.on('add',function(model){
            model.treeLevel=opts.treeLevel;
            model.icollection=_g.mvc.createTreeByData({
                    collection:opts.collection,
                    data:[],
                    treeLevel:opts.treeLevel+1
            })  
            if(collection.parent){
                collection.View=(typeof collection.View=="object")?$.extend(true,{},collection.View,{containment:collection.parent.iview.$el}):collection.View.extend({
                    containment:collection.parent.iview.$el
                })              
            }
            model.addView('iview',collection.View);
            _g.ui.sortByIds({
                containment:model.iview.wrap?model.iview.$el.parent(model.iview.wrap):model.iview.$el.parent(),
                ids:collection.pluck('id')
            })  
            model.icollection.parent=model;
            model.icollection.View=collection.View;
        })
        collection.saveAll=function(callback){//用来保存collection,必须设定了saveUrl，保存功能才有效,对于树形结构进行优化，取树形结构数据
                var isDebug=(typeof _gDebug!="undefined"&&_gDebug)||this.debug;
                var url=isDebug?(this.staticSaveUrl?this.staticSaveUrl:this.saveUrl):this.saveUrl;
                if(!url) return false;
                var savelist=_g.mvc._CollectionforSaveAll();
                savelist.data=_g.mvc.getTreeData(this);
                savelist.url=url;
                savelist.save({},
                    {
                        wait:true,
                        success: function(m,response){
                            if(callback) callback(response);
                        },
                        error:function(){
                        }
                    }
                )
        }
        _.each(clonedata,function(i){
            var childrendata;
            if(!i.children) childrendata=[];
            else childrendata=$.extend(true,{},i.children);
            delete i.children;
            collection.add(i,{silent:true});
            var model=collection.at(collection.length-1);
            model.treeLevel=opts.treeLevel;
            if(childrendata) {
                model.icollection=_g.mvc.createTreeByData({
                    collection:opts.collection,
                    data:childrendata,
                    treeLevel:opts.treeLevel+1,
                    parent:model
                })              
            }
        })
        return collection;
    },
    createTreeView:function(opts){//为一个tree collection建立对应的View，通常用作树形列表
        var defaults={
            collection:null,//设定根列表collection，这个collection是已经有的树对象集合
            view:null,//指定用来映射给每一个model的view，可以是object或者已经产生的view对象 
            containment:null,//指定这个TreeView所放置的父对象，如果没有则使用View的containment
            wrap:null,//指定包裹列表元对象的dom， 例如'ul',等等，有的时候可能没有，比如tr之类的
            wrapClassName:null,//定义wrap的class， 缺省为空，该选项只有当wrap存在时才有效
            template:null,//如果在这里设定了template参数，那么View里面的template参数就会被替换
            className:null,//定义当个View的class
            parseTemplate:null,//同createView的parseTemplate, 只不过如果在这里设定，将会替换调View的parseTemplate
            update:function(callback){
                if(!this.model||!this.template||!this.containment) return false;
                if(!_g.util.domExist(this.$el)) this.render();
                else{
                    var el=this.createEl();
                    var childrenContent=null;
                    if(this.wrap) childrenContent=this.$el.children(this.wrap).detach();
                    this.$el.replaceWith(el);
                    var $el=_g.ui.findById({
                        containment:this.containment,
                        id:this.model.id
                    })
                    if($el.length>0){
                        this.setElement($el);
                        if(this.className) this.$el.addClass(this.className);
                        if(childrenContent) this.$el.append(childrenContent);
                    }                   
                }
                if(callback) callback(this);    
                if(this.afterUpdate) this.afterUpdate(this);            
            }
        }
        var collection=opts.collection;
        opts=opts?$.extend(true,{},defaults,opts):defaults;
        var viewextend={};
        opts.collection=collection;
        if(!opts.collection||!opts.view) return false;
        if(opts.containment) viewextend.containment=opts.containment;
        if(opts.wrap) viewextend.wrap=opts.wrap;
        if(opts.template) viewextend.template=opts.template;
        if(opts.parseTemplate){
            viewextend.parseTemplate=opts.parseTemplate;
        }
        if(opts.parseData){
            viewextend.parseData=opts.parseData;
        }
        if(opts.callback) viewextend.callback=opts.callback;
        if(opts.wrapClassName) viewextend.wrapClassName=opts.wrapClassName;
        if(opts.className) viewextend.className=opts.className;
        viewextend.update=opts.update;
        var View=(typeof opts.view=="function")?opts.view.extend(viewextend):$.extend(true,opts.view,viewextend);
        opts.collection.View=View;      
        opts.collection.each(function(model){
            model.addView('iview',View);
            if(model.icollection){
                if(typeof opts.containment!="string"){
                    opts.containment=opts.containment.selector;
                }
                var containment=opts.containment+(opts.wrap?(' >'+opts.wrap):'')+' >[id="'+model.id+'"]';
                _g.mvc.createTreeView({
                    collection:model.icollection,
                    view:opts.view,
                    containment:containment,
                    wrap:opts.wrap||null,
                    template:opts.template||null
                })
            }
        })
    },
    sortTreeByIds:function(opts){//对tree model进行排序，参数为tree结构的ids，以及需要排序的list
        var sortexecute=function(list,ids,level){
            if(!list) return null;
            list.reset([],{silent:opts.silent});
            _.each(ids,function(i){
                i.children=i.children||[];
                var model=TempCollection.get(i.id);
                model.treeLevel=level;
                model.icollection=sortexecute(model.icollection,i.children,level+1);
                list.add(model,{silent:opts.silent});
                model.collection=list;
            })
            return list;
        }
        var defaults={
            collection:null,//设定根列表collection，这个collection是已经有的树对象集合
            ids:null ,//树形结构的ids，用来对树形结构的tree元素进行排序
            treeLevel:0,
            silent:true//如果是false则不会激发reset事件
        }
        var collection=opts.collection;
        opts=opts?$.extend(true,{},defaults,opts):defaults; 
        opts.collection=collection; 
        if(!opts.collection||!opts.ids) return false;
        var TempCollection=new Backbone.Collection();
        TempCollection.add(_g.mvc.getTreeModels(opts.collection));
        var results=sortexecute(opts.collection,opts.ids,opts.treeLevel);
        return results;
    },
    getTreeModels:function(collection){
        var results=[];
        collection.each(function(model){
            results.push(model);
            if(model.icollection){
                var childrenresults=_g.mvc.getTreeModels(model.icollection);
                _.each(childrenresults,function(i){
                    results.push(i);
                })
            }
        })
        return results;
    },
    getTreeModel:function(collection,id){//通过id找到tree中的某个model
        if(!collection||!id) return false;
        var models=_g.mvc.getTreeModels(collection);
        return _.find(models,function(i){return i.id==id});
    },
    getTreeData:function(collection){//通过一个tree的collection来获得这个Tree的Data，这个Data可以供保存排序或者生成新的tree collection
        var data=[];
        collection.each(function(model){
            var dict=$.extend(true,{},model.toJSON());
            if(model.icollection){
                dict.children=_g.mvc.getTreeData(model.icollection);
            }
            data.push(dict);
        })
        return data;
    }
}
if(typeof require=="undefined"){
    if(!window._g) window._g={};
    window._g.mvc=_g_mvc;
    _g_mvc=undefined;
}
else{
    define(['jquery','backbone','_g/base','_g/ui','_g/util'],function(){
        window._g.mvc=_g_mvc;
        _g_mvc=undefined;
        return window._g.mvc;   
    })
}
})(window);