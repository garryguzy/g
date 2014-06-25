// _g 的ui 库主要提供界面功能
//dependencies: [ jquery , _g/base ,_g/error]
/*jshint asi: true*/
(function(){
var _g_ui={
    buttonGroupT:[
        '<div class="_g_btn_group <%=opts.className||""%>">',
        '</div>'
    ].join(""),
    buttonT:'   <button class="btn _g_btn _g_btn_confirm <%=opts.className||""%>" type="button" data-name="<%=opts.name%>"><%=opts.name%></button>',
    buttonGroupList:[],//buttonGrouplist是一个button组的集合，可以很方便的通过预先设定的buttongroup的名字来找到这个button组
    scale:function(obj,value){//进行css缩放，value为缩放的倍数（depandencies: jquery)
        $(obj)
        .css('zoom', value)/* IE */ 
        .css('-moz-transform','scale('+value+')') /* Firefox */ 
        .css('-o-transform','scale('+value+')') /* Opera */ 
    },
    center:function(opts){//使一个dom元素进行居中
        var defaults={
            containment:null,//设为null，默认没有parent，根据当前页面来定位居中，否则的话将根据设定的
            //Item:null//设定需要居中的元素，
        }
        if(typeof opts=='string') opts={containments:null,Item:opts};
        else opts=opts?$.extend({},defaults,opts):defaults; 
        if(!opts.Item) return false;
        $(opts.Item).css(
        {
            'left':'50%',
            'top':'50%',
            'margin-top': function () {
                return -($(this).height() / 2);
            },
            'margin-left':function(){
                return -($(this).width() / 2);
            }
        })      
    },
    centerImage:function(opts){//使一个Image能够在一个Dom中自适应居中
        var defaults={
            containment:null,//Image对象的父对象，必须有
            //Item:null,//设定需要居中的元素，
            parentWidth:null,//父对象的宽度，用来作为居中的参照
            parentHeight:null,//父对象的高度
            width:null,//图片的宽度
            height:null,//图片的高度
            setParent:true//是否在设置item的属性的同时也修改父对象的属性，即containment
        }
        opts=opts?$.extend({},defaults,opts):defaults; 
        if(!opts.Item||!opts.containment) return false;
        var heigth=0;
        var width=0;
        if(opts.setParent){
            $(opts.containment)
            .css({
                'line-height':opts.parentHeight+'px',
                'text-align':'center'
            })            
        }
        if(opts.width/opts.height>=opts.parentWidth/opts.parentHeight){
                $(opts.Item).css({
                    'width':'100%',
                    'height':'auto',
                    'verticle-align':'middle'
                });
                width=opts.parentWidth;
                height=opts.parentWidth/(opts.width/opts.height);
        }
        else {
                 $(opts.Item).css({
                    'width':'auto',
                    'height':'100%',
                    'verticle-align':'middle'
                });  
                height=opts.parentHeight;
                width=opts.parentHeight*(opts.width/opts.height);         
        };   
        return {width:width,height:height}; 
    },
    fitImage:function(opts){
        //使得图片在父对象内部按照一定的情况来适应
        //参数,opts.items :图片对象,相对于他的父对象
        //opts.fit : 0,1,2 0:表示全铺满， 1：代表缩小适应， 2， 代表缩小撑满
        //opts.width, opts.height 代表图片的尺寸
        //opts.lock , true/false ,表示是否锁定，一旦锁定，该image的大小就会自动锁定在parent下面，依据parent的尺寸变化进行相应的调整。
        //opts.useMargin ： 表示使用margin精准定位来替代auto margin
        if(!opts||!opts.items) return false;
        if(!opts.fit) opts.fit=0;
        $(opts.items).each(function(){
            var $this=$(this);
            if(opts.width==undefined) opts.width=$(this).width();
            if(opts.height==undefined) opts.height=$(this).height();
            var itemWidth=opts.width;
            var itemHeight=opts.height;
            var parent=$(this).parent();
            opts.parentHeight=opts.parentHeight||parent.height();
            opts.parentWidth=opts.parentWidth||parent.width();
            if(opts.fit==0){
                //撑满 100%就行
                $this.css({
                    width:'100%',
                    height:'100%',
                    top:'',
                    left:''
                })
                itemWidth=opts.parentWidth;
                itemHeight=opts.parentHeight;
            }
            if(opts.fit==1){
                parent.css({
                    'line-height':opts.parentHeight+'px'
                    //'text-align':'center'
                })  
                if(!opts.useMargin){
                    parent.css('text-align','center');
                }
                //代表缩小自适应
                if(opts.width/opts.height>=opts.parentWidth/opts.parentHeight){
                        itemWidth=opts.parentWidth;
                        itemHeight=opts.parentWidth/(opts.width/opts.height);
                        $this.css({
                            'width':'100%',
                            'height':'auto',
                            'vertical-align':'middle',
                            'left':'',
                            'top':'',
                            'display':'inline-block',
                            'position':'relative'
                        });
                        if(opts.useMargin){
                            var resultHeight=opts.parentWidth/(opts.width/opts.height);
                            $this.css('margin-top',(opts.parentHeight-resultHeight)/2+"px");
                            $this.css('margin-bottom',(opts.parentHeight-resultHeight)/2+"px");
                            $this.css({
                                'margin-left':0,
                                'margin-right':0
                            })
                            $this.css('position','absolute');
                        }
                }
                else {
                        itemHeight=opts.parentHeight;
                        itemWidth=opts.parentHeight*(opts.width/opts.height);
                         $this.css({
                            'width':'auto',
                            'height':'100%',
                            'vertical-align':'middle',
                            'left':'',
                            'top':'',
                            'display':'inline-block',
                            'position':'relative'
                        });  
                        if(opts.useMargin){
                           var resultWidth=opts.parentHeight*(opts.width/opts.height);  
                           $this.css('margin-left',(opts.parentWidth-resultWidth)/2+"px");
                            $this.css('margin-right',(opts.parentWidth-resultWidth)/2+"px");
                            $this.css({
                                'margin-top':0,
                                'margin-bottom':0
                            })
                             $this.css('position','absolute');
                        }
                         // view.$el.find('.slidecontent').children('[data-index='+detail.iImg.indexOf(i)+']').css('margin-right',(common.iWidth-result.width)/2+"px"); 
                };                 
            }
            if(opts.fit==2){
                //这个适应有点像是剪切掉一部分的图片
                parent.css({
                    'line-height':opts.parentHeight+'px',
                    'text-align':'center',
                    'overflow':'hidden'
                })  
                if(opts.width/opts.height>=opts.parentWidth/opts.parentHeight){
                        $this.css({
                            'width':opts.parentHeight*opts.width/opts.height+'px',
                            'height':opts.parentHeight+'px',
                            'verticle-align':'middle',
                            'position':'absolute',
                            'left':'-'+(opts.parentHeight*opts.width/opts.height-opts.parentWidth)/2+'px',
                            'top':0,
                            'max-width':'none'
                        });
                        if(opts.useMargin){
                            $this.css('left','');
                            $this.css('margin-left','-'+(opts.parentHeight*opts.width/opts.height-opts.parentWidth)/2+'px');
                        }
                }
                else {
                         $this.css({
                            'position':'absolute',
                            'width':opts.parentWidth+'px',
                            'height':opts.parentWidth/(opts.width/opts.height)+'px',
                            'verticle-align':'middle',
                            'top':'-'+(opts.parentWidth/(opts.width/opts.height)-opts.parentHeight)/2+'px',
                            'left':0,
                            'max-height':'none'
                        }); 
                        if(opts.useMargin){
                            $this.css('top','');
                            $this.css('margin-top','-'+(opts.parentWidth/(opts.width/opts.height)-opts.parentHeight)/2+'px');
                        }        
                };                  
            }
            if(opts.explicitSize){
                $this.css({
                    width:itemWidth,
                    height:itemHeight
                })
            }
        })
    },
    opacity:function(obj,value){
        
    },
    addShade:function(opts){//创建阴影或遮罩 opts={...} 
        var defaults={
            name:'_g_shadow',
            zindex:99999,
            color:'#000000',
            opacity:0.8,
            containment:'body'
        }
        opts=opts?$.extend({},defaults,opts):defaults;  
        $(containment).append(
            '<div id="'+opts.name+'" style="z-index:'+opts.zindex+';background:'+opts.color+';opacity:'+opts.opacity+';"></div>'
        )
    },
    addButtonGroup:function(opts){//添加一个最基本的button组的功能，通常包括确认/保存, 取消，或者删除，返回这个button例子，同时支持一些基本的添加功能
        var defaults={
            containment:null,//button组所添加在什么元素内，必须要指定
            position:0,//0默认表示该button组是嵌入在containment内部，1表示button组加在containment的后面
            name:'_g_button'+_g.uuid(),//button组的名称，你可以自己定义，也可以有自动生成
            className:null,//对于buttongroup默认已有的class为_g_btn,_g_btn_group，但是也可以增加自定义的class
            confirmButton:{//confirmbutton是比较常用的button。默认为确认按钮，
                name:'确认',
                enable:true,//enable为false的时候可以屏蔽他
                className:'btn-small btn-primary',//默认的class为_g_btn,_g_btn_confirm，你可以增加class
                onClick:null//确认按钮按下的事件
            },
            cancelButton:{//取消按钮，默认设定
                name:'取消',
                enable:true,
                className:'btn-small',//默认的class为_g_btn_cancel,
                onClick:null
            },
            remove:function(){
                if(opts.$el){
                    opts.$el.remove();
                }
            },
            getButton:function(name){
                return opts.$el.find('[data-name="'+name+'"]');
            },
            addButton:function(buttonopts){//添加button函数
                var optdefaults={
                    name:null,//按钮的名字不能为空
                    className:null,//按钮的扩展class ,基本的class为_g_btn
                    onClick:null//绑定button点击事件
                }
                buttonopts=buttonopts?$.extend(true,{},optdefaults,buttonopts):optdefaults;
                if(!buttonopts.name) return false;
                opts.$el.append(_.template(_g.ui.buttonT,{opts:buttonopts}));
                if(buttonopts.onClick){
                    opts.getButton(buttonopts.name).on('click',function(){
                        buttonopts.onClick();
                    })
                }
            },
            removeButton:function(name){
                if(!name) return;
                opts.$el.find('[data-name="'+name+'"]').remove();
            }
        }
        opts=opts?$.extend(true,{},defaults,opts):$.extend(true,{},defaults);
        if(!opts.containment) return false;
        if(opts.position==0){
            $(opts.containment).append(_.template(_g.ui.buttonGroupT,{opts:opts}));
            opts.$el=$(opts.containment).children('._g_btn_group');
        }
        else {
            $(_.template(_g.ui.buttonGroupT,{opts:opts})).insertAfter($(opts.containment));
            opts.$el=$(opts.containment).next('._g_btn_group');
        }
        if(opts.confirmButton.enable){
            opts.addButton(opts.confirmButton);
        }
        if(opts.cancelButton.enable){
            opts.addButton(opts.cancelButton);
        }
        return opts;
    },
    contenteditable:function(opts){//激活一个可编辑的区域
        var defaults={
            eventType:0,//激活该编辑功能的方式，0代表单击事件来触发，1代表双击事件来触发
            mutiple:0,//0 : 单行 1: 多行
            element:null,//dom or selector,必须有
            callback:null,//设定callback将返回变更的结果
            type:0, //0 : 代表text文本， 1：代表富媒体文本html
            enableControl:false //设定是否增加确认和取消的按钮控制
        }
        opts=opts?$.extend(true,{},defaults,opts):$.extend(true,{},defaults);
        opts.onKeyDown=function(event,$this){
            var code = (event.keyCode ? event.keyCode : event.which);
            if(code==13&&opts.mutiple==0){
                opts.enableClose=true;
                opts.$this.blur();
                $(document).off('keydown',opts.onKeyDown);
                opts.result();
            }           
        }
        opts.result=function(){
            if (opts.$this.data('before') !== opts.$this.html()) {
                opts.$this.data('before', opts.$this.html());
                var result=opts.type==0?opts.$this.text():opts.$this.html();
                if(opts.callback) opts.callback(result);
            }           
        }
        opts.enableEdit=false;
        if(!opts.element) return false;
        if(opts.element){
            opts.$this=$(opts.element);
            opts.$this.addClass('_g_contenteditable');
            if(opts.eventType==0){
                $(opts.element).attr('contenteditable','true');
            }
            if(opts.eventType==1){
                $(opts.element).attr('contenteditable','false');
                $(opts.element).on('dblclick',function(){
                    $(this).attr('contenteditable','true');
                    $(this).focus();
                })
            }
            $(opts.element).on('focus', function() {
                if(opts.focus) return false;
                opts.focus=true;
                opts.$this.data('before', opts.$this.html());
                $(document).on('keydown',opts.onKeyDown);
                if(opts.enableControl){
                    opts.buttonGroup=_g.ui.addButtonGroup({
                        containment:opts.$this,
                        position:1,
                        confirmButton:{
                            onClick:function(){
                                opts.enableClose=true;
                                opts.$this.blur();
                            }
                        },
                        cancelButton:{
                            onClick:function(){
                                opts.enableClose=true;
                                opts.$this.html(opts.$this.data('before'));
                                opts.$this.blur();
                            }
                        }
                    })
                }
                return opts.$this;
            }).on('blur', function(event) {
                if(opts.enableControl){
                    if(opts.enableClose){
                        opts.enableClose=false;
                        opts.buttonGroup.remove();
                    }
                    else {
                        opts.$this.focus();
                        return false;
                    }
                }               
                opts.focus=false;
                $(document).off('keydown',opts.onKeyDown);
                if(opts.eventType==1){
                    $(opts.element).attr('contenteditable','false');
                }
                opts.result();
                return false;
            });     
        }
    },
    sortByIds:function(opts){//根据给定的ids来对相应的domlist进行元素排序
        var defaults={
            containment:null,
            items:'li',//对父对象范围内的什么元素进行排序
            ids:null
        }
        opts=opts?$.extend({},defaults,opts):defaults;
        if(!opts.containment||!opts.ids) return;
        _.each(opts.ids,function(id){
            if($(opts.containment).children(opts.items+'[id="'+id+'"]').length>0){
                var i=$(opts.containment).children(opts.items+'[id="'+id+'"]').detach();
                $(opts.containment).append(i);
            }
        })
    },
    sortTreeByIds:function(opts,referenceRoot){
        //对一个树下的元素进行重新整理排序，根据ids的顺序
        //通常对一个树形结构排序来说，我们假设所有的元素都已经平行化了
        var defaults={
            containment:null,
            items:'li',//对父对象范围内的什么元素进行排序
            ids:null,
            childrenKey:'children',
            wrap:'ul',//默认是ul
            wrapClass:null
        }
        //referenceRoot:对于tree遍历来说的话需要知道这个参考的父节点
        opts=opts?$.extend({},defaults,opts):defaults;
        if(!opts.containment||!opts.ids) return;
        opts.root=referenceRoot||opts.containment;
        _.each(opts.ids,function(i){
            if($(opts.root).find(opts.items+'[id="'+i.id+'"]').length>0){
                var el=$(opts.root).find(opts.items+'[id="'+i.id+'"]').detach();
                if(!$(opts.containment).is(opts.wrap)&&!$(opts.containment).children(opts.wrap).length) {
                    $(opts.containment).append(document.createElement(opts.wrap));
                    if(opts.wrapClass) $(opts.containment).children(opts.wrap).addClass(opts.wrapClass);
                    opts.containment=$(opts.containment).children(opts.wrap);
                }
                $(opts.containment).append(el);
            }
            if(i[opts.childrenKey]){
                _g.ui.sortTreeByIds({
                    containment:$(opts.containment).find(opts.items+'[id="'+i.id+'"]'),
                    items:opts.items,
                    ids:i[opts.childrenKey],
                    childrenKey:opts.childrenKey
                },referenceRoot?referenceRoot:opts.containment);
            }
        })        
    },
    findById:function(opts){//在containment的下面找到对应id的元素
        var defaults={
            containment:null,
            id:null
        }
        opts=opts?$.extend({},defaults,opts):defaults;
        if(!opts.containment||!opts.id) return [];
        return $(opts.containment).find('[id="'+opts.id+'"],[data-id="'+opts.id+'"]').first();
    },
    moveTo:function(opts){//move方法可以很方便的在一个containment下面，对不同的id的元素进行调整移动，移动任何的id元素到另外一个id元素的下面
        var defaults={
            containment:null,
            sourceId:null,//需要移动的对象的id
            targetId:null,//移动到某个对象下面的id
            wrap:null,//是否要添加包裹
            wrapClass:null,//wrap是否有class属性需要添加
            position:0//0表示移动到第一个位置，-1表示表示移动到最后一个位置
        }
        opts=opts?$.extend({},defaults,opts):defaults;
        if(!opts.containment) return false;
        var sourceDom=_g.ui.findById({
            containment:opts.containment,
            id:opts.sourceId
        })  
        var targetDom=_g.ui.findById({
            containment:opts.containment,
            id:opts.targetId
        })  
        if(opts.wrap){
            if(targetDom.has(opts.wrap).length==0){
                targetDom.append(document.createElement(opts.wrap));
                targetDom=targetDom.children(opts.wrap);
                if(opts.wrapClass) targetDom.addClass(opts.wrapClass);
            }
            else{
                targetDom=targetDom.children(opts.wrap);
            }
        }
        var sourceCopy=sourceDom.detach();
        if(opts.position==0){
            targetDom.prepend(sourceCopy);
        }
        else{
            targetDom.append(sourceCopy);
        }
    },
    getTreeIds:function(opts){//返回树状结构的ids，用于对树状结构的数组或者models进行排序，返回的结构以children为子元素集key
        var defaults={
            containment:null,//为树结构的root节点的Dom
            items:null,//树状结构dom的每一个元素节点
            idAttribute:'id',//默认的属性取的attr('id')
            wrap:'ul'//包裹的设定，默认为'ul'
        }
        opts=opts?$.extend({},defaults,opts):defaults;      
        var returned=[];
        if(!opts.containment||!opts.items) return false;
        if(opts.wrap){
            if($(opts.containment).is(opts.wrap)) ;
            else{
                if($(opts.containment).children('ul').length>0) opts.containment=$(opts.containment).children('ul');
                else return [];
            }
        }
        else ;
        $(opts.containment).children(opts.items).each(function(){
            var dict={};
            dict.id=$(this).attr(opts.idAttribute);
            dict.children=_g.ui.getTreeIds({
                containment:$(this),
                items:opts.items,
                idAttribute:opts.idAttribute,
                wrap:opts.wrap
            });
            returned.push(dict);
        })
        return returned;        
    },
    dialog:function(opts){//生成一个根据指定大小的对话窗口,本功能为bootboxjs功能的扩展，opts属性可以参照bootboxjs需要的属性
        //对全局的弹窗进行管理，控制弹窗的最小z-index，然后设定弹窗的弹出顺序
        var defaults={
            className:null//className是必须的参数，用于后面
        }
    },
    createDomMask:function(opts){//给一个dom添加一个遮罩
        var defaults={
            containment:null,//是需要添加mask的对象的包裹区，也就是mask遮罩的dom
            item:null,//指向需要mask的对象,通常这个对象在遮罩包裹下面
            x:null,
            y:null,
            height:null,
            width:null,//坐标尺寸用来设定mask的区域的大小
            moveTo:function(position){//调整mask的位置,position.x,position.y为遮罩的坐标点
                opts.offsetX=0-position.x;//因为遮罩所引起的偏移量
                opts.offsetY=0-position.y;//因为遮罩所引起的偏移量
                $(opts.item).css('left',opts.offsetX);
                $(opts.item).css('top',opts.offsetY);
            },
            resize:function(size){//重新调整尺寸，传递size.w, size.h为参数
                $(opts.containment).width(size.w);
                $(opts.containment).height(size.h);             
            }
        }
        opts=opts?$.extend({},defaults,opts):defaults;
        if(!opts.containment||!opts.item) return false;
        $(opts.containment).css('overflow','hidden');
        opts.moveTo({x:opts.x,y:opts.y});
        opts.resize({w:opts.width,h:opts.height});
        return opts;
    },
    clearSelection:function() {
        if(document.selection && document.selection.empty) {
            document.selection.empty();
        } else if(window.getSelection) {
            var sel = window.getSelection();
            sel.removeAllRanges();
        }
    },
    isOverflowed:function(element){
        //检查一个dom元素是否overflow
        var returned={
            x:false,
            y:false
        }
        var patchSize=0;
        if($.zoom&&$.zoom!=1) patchSize=2;
        if(($(element)[0].offsetHeight+patchSize) < $(element)[0].scrollHeight){
            returned.y=true;
        }
        if(($(element)[0].offsetWidth+patchSize) < $(element)[0].scrollWidth){
            returned.x=true;
           // your element have overflow
        }
        return returned;
    }
}
if(typeof require=="undefined"){
    if(!window._g) window._g={};
    window._g.ui=_g_ui;
}
else{
    define(['jquery','_g/base','_g/error'],function(){
        window._g.ui=_g_ui;
        return window._g.ui;    
    })
}
})(window);