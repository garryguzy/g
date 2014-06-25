// This slide package is used for touch
// dependencies : ['base','device','hammer.js'，'jquery.transit']
//在touch_slide控制中有些关键的部分
//1. 判断当前页可以支持的移动方向
//2 . 判断当前用户的touch方向，对已经发生的touch方向捕获后开始移动，这时候需要对此方向进行锁定
//3 . 需要判断当前的移动是否被许可
//4. 当移动开始后需要对移动进行锁定，不能再接受新的运动，知道这次移动结束
//5 考虑缩小的显示和控制系统
// 6 . 需要很明确的知道当前的slide是哪一张，并且能够判断他的位置，他的左边右边，上边，下边分别是哪一张，更重要的是判别上下左右的可操作性
//7. 需要支持的库包括animation库, screen控制库,touch支持库等
//touch.js for _g is a module lib extend the touch event and controls 
//在触摸或者移动设备上提供许多触控的功能是非常必须的，如果来管理这些触控的事件以达到效果，是这个控件的原理
//dependencies: [base ,jquery]
//
(function(){
var _g_touchslide=function(options){
    this.init(options);
}
_g_touchslide.prototype={
    init:function(opts){
        var defaults={
            body:'window',//整个touchslide的包裹区域
            containment:'.touchslide',
            slidesclass:'.slides',
            groupclass:'.group',
            itemclass:'.Presentation',
            width:1024,
            height:768,
            overview:true,
            // Display controls in the bottom right corner
            controls: true,       
            // Display a presentation progress bar
            progress: true,
            // Display the page number of the current slide
            slideNumber: false,     
            // Push each slide change to the browser history
            history: false,        
            // Enable keyboard shortcuts for navigation
            keyboard: true,       
            // Enable the slide overview mode
            overview: true,
            // Vertical centering of slides
            center: true,       
            // Enables touch navigation on devices with touch input
            touch: true,        
            // Loop the presentation
            loop: false,       
            // Change the presentation direction to be RTL
            rtl: false,        
            // Turns fragments on and off globally
            fragments: true,       
            // Flags if the presentation is running in an embedded mode,
            // i.e. contained within a limited portion of the screen
            embedded: false,        
            // Number of milliseconds between automatically proceeding to the
            // next slide, disabled when set to 0, this value can be overwritten
            // by using a data-autoslide attribute on your slides
            autoSlide: 0,
        
            // Stop auto-sliding after user input
            autoSlideStoppable: true,
        
            // Enable slide navigation via mouse wheel
            mouseWheel: false,
        
            // Hides the address bar on mobile devices
            hideAddressBar: true,
        
            // Opens links in an iframe preview overlay
            previewLinks: false,
        
            // Transition style
            transition: 0, // default/cube/page/concave/zoom/linear/fade/none
        
            // Transition speed
            transitionSpeed: 'default', // default/fast/slow    
            onReady:null,
            onSlideChange:null,
            canDragX:null,
            canDragY:null,//设定是否可以在Y轴或X轴向移动
            adapt:false,//是否开启屏幕布局自适应
            screen_mode:1,//屏幕自适应模式，0代表1：1， 1：代表缩放以适合， 2：代表缩放以适应
            show_excontent:false//是否显示超出屏幕外的元素
        }
        this.options=opts?$.extend(true,{},defaults,opts):defaults; 
        
        // 对于 IE8，取消拖拽切换页面
        if(!(_g.browserSupport({msie:9})))
            this.options.canDragX = this.options.canDragY = function(e){return false;};

        _.bindAll(this);  
        this._initVaribles();
        this._initControls(); 
        this._initScreenSet();
        this._initSlideItems(); 
        this._initSlideStyle();
        if(this.options.onReady){
            //window.Reveal=this;
            var current=this.slideType==3?this.indexes[0][0]:this.indexes[0];
            this.options.onReady(this,current);
        }
        if(this.options.controls){
            this._bindControllers();
            this.setControllers();
        }
        if(this.options.progress) this.setProgressBar();
        if(this.options.keyboard){
            this._bindKeyboard();
        }
        if(this.options.mouseWheel){
            this._bindMouseWheel();
        }
        if(this.options.history) this._bindRoute();
        return this;
    },
    _compatible_css_translate: function(item, x, y){
        if(_g.browserSupport({msie:9}))
            $(item).css({
               translate: [x, y] 
            });
        else
            $(item).css({
               "margin-left": x+"px",
               "margin-top": y+"px"
            });
    },
    _bindRoute:function(){
        var $this=this;
       var app_Router= Backbone.Router.extend({
        
          routes: {
              "page/:query":"page"
          }
        
        });   
       this.Router = new app_Router;
    
       this.Router.on('route:page', function(query,event) {
            console.log(query);
            console.log(event);
            var slideposition=$this.getSlidePositionById(query);
            if(slideposition) $this.slide(slideposition.h,slideposition.v);
       })
    
        // Start Backbone history a necessary step for bookmarkable URL's
       Backbone.history.start();
       this.Router.navigate('page/'+this.getCurrentSlideId());
        //Backbone.history.start({pushState: true, root: "/touchplayer"});     
    },
    _initVaribles:function(){
        //对slide会用到的全局属性做定义
        this.indexv=0;
        this.indexh=0;
        this.currentSlideDirection=null;//当前的Slide移动方向，当一个方向开始后，别的方向将自动锁定
        this.dragstart=false;//判断是否已经开始移动了
        this.dragging=false;//判断是否在移位控制中
        this.sliding=false;
    },
    _initControls:function(){
        var $this=this,deltastartX=0,deltastartY=0,deltaX=0,deltaY=0;
        $(this.options.containment).hammer().on('dragstart',function(event){
            if($this.sliding) return ; //判断是不是在slide切换中，切换中不允许有新的拖动出现
            if($this.options.canDrag){
                if(!$this.options.canDrag(event)) return ;
            }
            $this.dragstart=true;
            //event.preventDefault();
           // return false;
        })
        $(this.options.containment).hammer().on('dragleft',function(event){
            console.log('dragleft');
            if($this.currentSlideDirection==null) $this.currentSlideDirection=1;//代表横向
            if($this.options.canDragX){
                if(!$this.options.canDragX(event)) {
                    return ;
                }
            }
            if(!$this._testSlideDragEventAccess(event)) return;
            $this.dragstart=true;
            if($.zoom&&$.zoom!=1) event.gesture.deltaX=event.gesture.deltaX/$.zoom;
            deltaX=event.gesture.deltaX;
            $this._doDragingEvent(event);
            event.gesture.preventDefault();
            return false;
        })
        $(this.options.containment).hammer().on('dragright',function(event){
            console.log('dragright');
            if($this.currentSlideDirection==null) $this.currentSlideDirection=1;
            if($this.options.canDragX){
                if(!$this.options.canDragX(event)){
                    return ;
                }
            }
            if(!$this._testSlideDragEventAccess(event)) return;
            $this.dragstart=true;
            if($.zoom&&$.zoom!=1) event.gesture.deltaX=event.gesture.deltaX/$.zoom;
             deltaX=event.gesture.deltaX;
            $this._doDragingEvent(event);
            event.gesture.preventDefault();
            return false;
        })
        $(this.options.containment).hammer().on('dragup',function(event){
            console.log('dragup');
            if($this.currentSlideDirection==null) $this.currentSlideDirection=2;
            if($this.options.canDragY){
                if(!$this.options.canDragY(event)){
                    return ;
                } 
            }
            if(!$this._testSlideDragEventAccess(event)) return;
            $this.dragstart=true;
            if($.zoom&&$.zoom!=1) event.gesture.deltaY=event.gesture.deltaY/$.zoom;
            deltaY=event.gesture.deltaY;
            $this._doDragingEvent(event);
            event.gesture.preventDefault();
            return false;                
        })
        $(this.options.containment).hammer().on('dragdown',function(event){
            console.log('dragdown');
            if($this.currentSlideDirection==null) $this.currentSlideDirection=2;
            if($this.options.canDragY){
                if(!$this.options.canDragY(event)){
                    return ;
                }
            }
            if(!$this._testSlideDragEventAccess(event)) return;
            $this.dragstart=true;
            if($.zoom&&$.zoom!=1) event.gesture.deltaY=event.gesture.deltaY/$.zoom;
            deltaY=event.gesture.deltaY;
            $this._doDragingEvent(event);
             event.gesture.preventDefault();
             return false;                
        })
        $(this.options.containment).hammer().on('dragend',function(event){
            if(!$this.dragstart) $this.currentSlideDirection=null;
            if($this.options.canDrag){
                if(!$this.options.canDrag(event)) return ;
            }
            if(!$this._testSlideDragEventAccess(event)) return;
            if(($this.currentSlideDirection==1&&deltaX)||($this.currentSlideDirection==2&&deltaY)){
                if($.zoom&&$.zoom!=1) {
                    if(($this.currentSlideDirection==2&&deltaY)) event.gesture.deltaY=event.gesture.deltaY/$.zoom;
                    if(($this.currentSlideDirection==1&&deltaX)) event.gesture.deltaX=event.gesture.deltaX/$.zoom;
                }
                $this._doDragEndEvent(event);
            }
            $this.dragstart=false;
            $this.currentSlideDirection=null;
            deltaX=0;
            deltaY=0;
            event.gesture.preventDefault();
            return false;
         })       
    },
    _initSlideItems:function(){
        //初始化slide items网格图
        //slideType 1:横向顺序 2：纵向顺序 3： 交互模式
        //当引入自适应后，我们就需要将slideitems和slidestyle分开了
        //升级后的touchslide需要对这些slideitems进行处理
        //而处理的结果就是找个地方来临时存放这些，而在reveal区域只保留4个方向和当前的
        var indexv=0,indexh=0;
        var $this=this;
        var slideIndexes=[];
        //通常情况下slidewidth和页面width是一样的，但是不排除在某些情况下会不同
        this.slideItems=[];
        this.slideContent.append('<div class="slideTempContainer" style="position:absolute;left:-99999px;top:-99999px;"></div>');
        this.slideTempContainer=this.slideContent.children('.slideTempContainer');
        //在slideContent下面建立一个临时容器，用来临时存放暂时不用的那些slides
        if(this.slideContent.children(this.options.groupclass).length>0){
            this.slideType=3;
            this.slideContent.children(this.options.groupclass).each(function(){
                slideIndexes[indexh]=[];
                $this.slideItems[indexh]=[];
                $(this).children($this.options.itemclass).each(function(){
                    slideIndexes[indexh][indexv]=$(this).attr('id')||1;
                    $this.slideItems[indexh][indexv]=this;
                    indexv+=1;
                })
                indexh+=1;
                indexv=0;
            })
            var tempItems=this.slideContent.children(this.options.groupclass).detach();
            this.slideTempContainer.append(tempItems);
        }
        else{
            this.slideType=1;
            this.slideContent.children(this.options.itemclass).each(function(){
                slideIndexes[indexh]=$(this).attr('id')||1;
                $this.slideItems[indexh]=this;
                indexh+=1;
            })
            var tempItems=this.slideContent.children(this.options.itemclass).detach();
            this.slideTempContainer.append(tempItems);
        }
        this.indexes=slideIndexes;
        if(this.options.show_overview) this._drawOverview();
    },
    _initSlideStyle:function(){
        var $this=this;
        var indexv=0,indexh=0;
        //这时候所有的元素都到tempContainer去了
        this.slideContent.find(this.options.itemclass).each(function(){
            $(this).css({
                width:$this.slideScreenWidth,
                height:$this.slideScreenHeight
            })
            $(this).children('.interaction-area').css({
                width:$this.slideWidth,
                height:$this.slideHeight
            })
        })
        // if(this.slideContent.children(this.options.groupclass).length>0){
            // this.slideContent.children(this.options.groupclass).each(function(){
                // $($this.slideGroup[indexh]).css({
                    // top:0,
                    // left:indexh*$this.slideScreenWidth
                // })
                // $(this).children($this.options.itemclass).each(function(){
                    // $(this).css({
                        // left:0,
                        // top:indexv*$this.slideScreenHeight,
                        // width:$this.slideScreenWidth,
                        // height:$this.slideScreenHeight
                    // })
                    // $(this).children('.interaction-area').css({
                        // width:$this.slideWidth,
                        // height:$this.slideHeight
                    // })
                    // indexv+=1;
                // })
                // indexh+=1;
                // indexv=0;
            // })
        // }
        // else{
            // this.slideContent.children(this.options.itemclass).each(function(){
                // $(this).css({
                    // left:indexh*$this.slideScreenWidth,
                    // top:0,
                    // width:$this.slideScreenWidth,
                    // height:$this.slideScreenHeight
                // })
                // $(this).children('.interaction-area').css({
                    // width:$this.slideWidth,
                    // height:$this.slideHeight
                // })
                // indexh+=1;
            // })
        // } 
        //和之前的设定slide样式不同的是，更新后slide方式，是设定相邻元素的摆放位置，以便于实现上下左右的方式切换
        //为此，我们也会增加一个新的slide function
        this.setSlideItems();
        //if($this.options.adapt){
            $this.setAdaptSlideItems();
        //}       
    },
    _initScreenSet:function(){
       //touchslide最重要的部分是支持屏幕的各种布局的自适应  
        this.slideScreenWidth=this.options.width;
        this.slideScreenHeight=this.options.height;
        this.slideWidth=this.options.width;
        this.slideHeight=this.options.height;
        //考虑到自适应的扩展功能，需要将slides区域包裹起来
        this.slideContainment=$(this.options.containment);
        this.slideContent=$(this.options.containment).children(this.options.slidesclass);
        this.slideContent.wrap('<div class="slides-wrap" style="position:absolute;width:100%;height:100%;left:0;top:0;"></div>');
        this.slideWrap=this.slideContainment.children('.slides-wrap');
        this.slideContainment.css({
            width:this.slideScreenWidth,
            height:this.slideScreenHeight,
        })
        this.slideContent.css({
            width:this.slideScreenWidth,
            height:this.slideScreenHeight,
        })
        this.slideGroup=this.slideContent.children();//指向slide组，如果对应单列的话，就是slide项
        if(this.options.adapt) {
            this.adapt=true;
        }
        this.setAdaptScreen();
    },
    sendSlide2Content:function(slideItem){
        //把一个slideItem放到Content中去
        var tempItem=$(slideItem).detach();
        this.slideContent.append(tempItem);
    },
    sendSlide2Temp:function(slideItem){
        var tempItem=$(slideItem).detach();
        this.slideTempContainer.append(tempItem);        
    },
    setSlideItems:function(){
       //新的模块用来设定4个方向或者2个方向的当前页面元素  
        //放当前方向和左右两个方向的元素，这是必须的
        var $this=this;
        this.currentItem=this.getCurrentSlide();
        var acceptIds=[];
        acceptIds.push(this.getCurrentSlideId());
        if(!$(this.currentItem).parent().is(this.slideContent)){
            this.sendSlide2Content(this.currentItem);
        }

        // $(this.currentItem).css({
        //    translate: [0,0] 
        // });
        this._compatible_css_translate(this.currentItem, 0, 0);

        var directions=this.getSlideDirections();
        if(directions.left){
            acceptIds.push(this.getLeft());
            this.leftItem=this.getSlideItemById(this.getLeft());
            // $(this.leftItem).css({
            //     translate: [-this.slideScreenWidth,0]
            // })
            this._compatible_css_translate(this.leftItem, -this.slideScreenWidth, 0);
            if(!$(this.leftItem).parent().is(this.slideContent)){
                this.sendSlide2Content(this.leftItem);
            }           
        }
        if(directions.right){
            acceptIds.push(this.getRight());
            this.rightItem=this.getSlideItemById(this.getRight());
            // $(this.rightItem).css({
            //      translate: [this.slideScreenWidth,0]
            // }) 
            this._compatible_css_translate(this.rightItem, this.slideScreenWidth, 0);
            if(!$(this.rightItem).parent().is(this.slideContent)){
                this.sendSlide2Content(this.rightItem);
            }           
        }
        if(this.slideType==3){
            //如果是交互模式，实际上显示4个方向的slide元素
            if(directions.up){
                acceptIds.push(this.getUp());
                this.upItem=this.getSlideItemById(this.getUp());
                // $(this.upItem).css({
                //     translate: [0,-this.slideScreenHeight]
                // }) 
                this._compatible_css_translate(this.upItem, 0, -this.slideScreenHeight);
                if(!$(this.upItem).parent().is(this.slideContent)){
                    this.sendSlide2Content(this.upItem);
                }           
            }
            if(directions.down){
                acceptIds.push(this.getDown());
                this.downItem=this.getSlideItemById(this.getDown());
                // $(this.downItem).css({
                //     translate: [0,this.slideScreenHeight]
                // }) 
                this._compatible_css_translate(this.downItem, 0, this.slideScreenHeight);
                if(!$(this.downItem).parent().is(this.slideContent)){
                    this.sendSlide2Content(this.downItem);
                }            
            }            
        }  
        else{
            
        }  
        //需要清理那些并不属于content的slide元素
        this.slideContent.children(this.options.itemclass).each(function(){
            var id=$(this).attr('id');
            if(!_.include(acceptIds,id)){
                $this.sendSlide2Temp(this);
            }
        })  
    },
    setAdaptScreen:function(){
       if(this.options.adapt){
            var screensize=this._getScreenSize();
             var scale=this._getScreenScale();
             if(this.options.screen_mode==0){
                 this.slideScreenWidth=screensize.x;
                 this.slideScreenHeight=screensize.y;
             }
             else if(this.options.screen_mode==1){
                if(scale.x) screensize.x=parseInt(screensize.x/scale.x,10);
                if(scale.y) screensize.y=parseInt(screensize.y/scale.y,10);
                if(scale.x) {
                    this.slideScreenWidth=screensize.x>this.options.width?screensize.x:this.options.width;
                    this.slideScreenHeight=this.options.height;
                }
                if(scale.y){
                    this.slideScreenHeight=screensize.y>this.options.height?screensize.y:this.options.height;
                    this.slideScreenWidth=this.options.width;
                }
            }
            else{
                if(scale.y) screensize.x=parseInt(screensize.x/scale.y,10);
                if(scale.x) screensize.y=parseInt(screensize.y/scale.x,10);
                if(scale.y) {
                    this.slideScreenWidth=screensize.x<this.options.width?screensize.x:this.options.width;
                    this.slideScreenHeight=this.options.height;
                }
                if(scale.x){
                    this.slideScreenHeight=screensize.y<this.options.height?screensize.y:this.options.height;
                    this.slideScreenWidth=this.options.width;
                }
            }
            //引入scale来进行补偿算法，因为如果我们想让超出部分全屏化显示的时候，我们就得考虑补偿那些因为自适应比例调整而产生的影响
            //目的是为了使覆盖区域实现最大化
            this.slideContainment.css({
                width:this.slideScreenWidth,
                height:this.slideScreenHeight,
            })
            this.slideContent.css({
                width:this.slideScreenWidth,
                height:this.slideScreenHeight,
            })
            this.slideContent.find('.Presentation').css({
                'overflow':'hidden'
            })
            if(this.options.show_excontent){
                this.slideContent.find('.interaction-view').css({
                    'overflow':'visible'
                })                
            }
           //如果支持屏幕自适应
           //这时候对于masterpage来说肯定是可以超出显示元素了
           //当启动屏幕自适应以后，其实整个滑动的参照就变成了所有的可视区域了
           //这时候Reveal的区域应该是根据屏幕的大小的区域
           //每个页面外框也是这个大小，来调整左右，上下的间距
           //每个内部页面的尺寸还是这个尺寸
           //然后根据屏幕尺寸比列来相应的调整内部interaction_view的margin样式
           this.slideWrap.css({
               overflow:'hidden'
           })
           this.slideContainment.css({
               overflow:'visible'
           })
       }  
       else{
           if(this.options.screen_mode==2){//如果是填充模式
                var screensize=this._getScreenSize();
                var scale=this._getScreenScale();
                if(scale.y) screensize.x=parseInt(screensize.x/scale.y,10);
                if(scale.x) screensize.y=parseInt(screensize.y/scale.x,10);
                if(scale.y) {
                    this.slideScreenWidth=screensize.x<this.options.width?screensize.x:this.options.width;
                    this.slideScreenHeight=this.options.height;
                }
                if(scale.x){
                    this.slideScreenHeight=screensize.y<this.options.height?screensize.y:this.options.height;
                    this.slideScreenWidth=this.options.width;
                }
                this.slideContainment.css({
                    width:this.slideScreenWidth,
                    height:this.slideScreenHeight,
                })
                this.slideContent.css({
                    width:this.slideScreenWidth,
                    height:this.slideScreenHeight,
                })
                this.slideContent.find('.Presentation').css({
                    'overflow':'hidden'
                })
               //如果支持屏幕自适应
               //这时候对于masterpage来说肯定是可以超出显示元素了
               //当启动屏幕自适应以后，其实整个滑动的参照就变成了所有的可视区域了
               //这时候Reveal的区域应该是根据屏幕的大小的区域
               //每个页面外框也是这个大小，来调整左右，上下的间距
               //每个内部页面的尺寸还是这个尺寸
               //然后根据屏幕尺寸比列来相应的调整内部interaction_view的margin样式
               this.slideWrap.css({
                   overflow:'hidden'
               })
               this.slideContainment.css({
                   overflow:'visible'
               })
            }           
       }      
    },
    setAdaptSlideItems:function(){
        //这个自适应补偿算法所遇到的问题就是当高度，宽度都同时超出的情况
        //这个时候实际上有一个方向是顶格的，我们需要根据scale来了解到底是哪个方向
        var scale=this._getScreenScale();
        var marginLeft=(this.slideScreenWidth-this.slideWidth)/2;
        var marginTop=(this.slideScreenHeight-this.slideHeight)/2;
        this.slideContent.find('.interaction-area').css({
            'margin-left':marginLeft
        })
        this.slideContent.find('.interaction-area').css({
            'margin-top':marginTop
        })
    },
    _getScreenSize:function(){
        //在默认的情况下是以当前屏幕为参照，但是也有可能外框架不是屏幕，比如当嵌在一个预览框里面的时候
        var x,y;
        if(this.options.body=="window"){
            var w = window,
                d = document,
                e = d.documentElement,
                g = d.getElementsByTagName('body')[0];
                x = w.innerWidth || e.clientWidth || g.clientWidth;
                y = w.innerHeight|| e.clientHeight|| g.clientHeight;
        }
        else{
            x=parseInt($(this.options.body).css('width'),10);
            y=parseInt($(this.options.body).css('height'),10);
        }
        return {x:x,y:y};
    },
    _getScreenScale:function(){
      //得到当前屏幕的一个缩放比率
        var windowsize=this._getScreenSize();
        var windowWidth=windowsize.x,windowHeight=windowsize.y;
        var sw = this.options.width;
        var sh = this.options.height;
        var x=null,y=null;
        if( sw>=sh )
            x=(windowWidth/windowHeight)>=(sw/sh)?(windowHeight/sh):(windowWidth/sw);
        else
            x=(windowHeight/windowWidth)>(sh/sw)?(windowWidth/sw):(windowHeight/sh); 
        if($.zoom) x=$.zoom;
        //解决外面比例和内部比例不同步的问题
        if((windowWidth/windowHeight)>=(sw/sh)){
            return {x:x,y:null};
        }
        else return {x:null,y:x};
    },
    _bindControllers:function(){
       //绑定控制箭头的功能  
       var $this=this;
       $('.action-control').children('button').on('click',function(){
           if($(this).hasClass('enabled')){
               if($(this).hasClass('navigate-right')) $this.next();
               if($(this).hasClass('navigate-left')) $this.prev();
               if($(this).hasClass('navigate-up')) $this.up();
               if($(this).hasClass('navigate-down')) $this.down();
           }
       })
    },
    _bindKeyboard:function(){
        //_g.keyboard.init();
        var $this=this;
        $(document).on('keydown',function(e){
            var keyshandle=false;
            var directions=$this.getSlideDirections();
            if(e.keyCode == 37&&directions.left){//left
                $this.prev();
                keyshandle=true;
            }
            if(e.keyCode == 38&&directions.up){//up
                $this.up();
                keyshandle=true;
            }
            if(e.keyCode==39&&directions.right){//right
                $this.next();
                keyshandle=true;
            }
            if(e.keyCode == 40&&directions.down){//down
                $this.down();
                keyshandle=true;
            }
            if(e.keyCode == 27){//down
                if($this.options.overview&&$this.options.show_controlbar){
                    if($this.show_overview) $this.toggleOverview(false);
                    else $this.toggleOverview(true);
                }
            }
            if(keyshandle) e.preventDefault();
        })
    },
    _bindMouseWheel:function(){
        //改进的mousewheel切换会有所不同，
        //当wheelstart的时候一定程度的时候启动，然后在一定时间内锁定，直到移动完成，且触发了wheelend以后
        var $this=this,deltaX=0,deltaY=0;
        $this.wheelLock=false;
        $(this.options.containment).addClass('iMouseWheel enableMouseWheel');
        $(this.options.containment).on('wheelstart',function(event,e){
            console.log('wstart');
            if(!$(event.target).is(this)) return ;
            if($this.sliding) return ; //判断是不是在slide切换中，切换中不允许有新的拖动出现
            if($this.wheelLock) return ;
            $this.wheelstart=true;
           // $this.countTime=new Date().getTime();
        })
        $(this.options.containment).on('wheelleft',function(event,e){
            if(!$(event.target).is(this)) return ;
            var wheelData=_g.mousewheel.getMouseWheel(e);
            var wheelDeltaX=wheelData.x;
            var wheelX= Math.max(-1, Math.min(1, (wheelDeltaX || 0)));
            if($this.currentSlideDirection==null) $this.currentSlideDirection=1;//代表横向
            if(!$this._testSlideDragEventAccess(event)) return;
            $this.wheelstart=true;
            _g.mousewheel.currentTarget=$($this.options.containment);
            var wheelrate=parseInt($this.slideScreenWidth/25,10);
            deltaX+=wheelX/Math.abs(wheelX)*wheelrate;
            event.gesture={
                deltaX:-1
            }
            //当deltaX积累到一定程度
            if(deltaX<-100&&!$this.wheelLock){
                $this.wheelLock=true;
                //$this._doDragingEvent(event);
                $this._doDragEndEvent(event,1000);
            }
        })
        $(this.options.containment).on('wheelright',function(event,e){
            if(!$(event.target).is(this)) return ;
            var wheelData=_g.mousewheel.getMouseWheel(e);
            var wheelDeltaX=wheelData.x;
            var wheelX= Math.max(-1, Math.min(1, (wheelDeltaX || 0)));
            if($this.currentSlideDirection==null) $this.currentSlideDirection=1;//代表横向
            if(!$this._testSlideDragEventAccess(event)) return;
            $this.wheelstart=true;
            _g.mousewheel.currentTarget=$($this.options.containment);
            var wheelrate=parseInt($this.slideScreenWidth/25,10);
            deltaX+=wheelX/Math.abs(wheelX)*wheelrate;
            event.gesture={
                deltaX:1
            }
            if(deltaX>100&&!$this.wheelLock){
                $this.wheelLock=true;
                $this._doDragEndEvent(event,1000);
            }
        })
        $(this.options.containment).on('wheelup',function(event,e){
            console.log(event.currentTarget);
            if(!$(event.target).is(this)) return ;
            var wheelData=_g.mousewheel.getMouseWheel(e);
            var wheelDeltaY=wheelData.y;
            var wheelY= Math.max(-1, Math.min(1, (wheelDeltaY)));
            if($this.currentSlideDirection==null) $this.currentSlideDirection=2;
            if(!$this._testSlideDragEventAccess(event)) return;
            $this.dragstart=true;
            _g.mousewheel.currentTarget=$($this.options.containment);
            var wheelrate=parseInt($this.slideScreenHeight/25,10);
            deltaY+=wheelY/Math.abs(wheelY)*wheelrate;
            event.gesture={
                deltaY:-1
            }
            if(deltaY<-50&&!$this.wheelLock){
                $this.wheelLock=true;
                $this._doDragEndEvent(event,1000);
            }
        })
        $(this.options.containment).on('wheeldown',function(event,e){
            if(!$(event.target).is(this)) return ;
            var wheelData=_g.mousewheel.getMouseWheel(e);
            var wheelDeltaY=wheelData.y;
            var wheelY= Math.max(-1, Math.min(1, (e.wheelDeltaY)));
            if($this.currentSlideDirection==null) $this.currentSlideDirection=2;
            if(!$this._testSlideDragEventAccess(event)) return;
            $this.wheelstart=true;
            _g.mousewheel.currentTarget=$($this.options.containment);
            var wheelrate=parseInt($this.slideScreenHeight/25,10);
            deltaY+=wheelY/Math.abs(wheelY)*wheelrate;
            event.gesture={
                deltaY:1
            }
            if(deltaY>50&&!$this.wheelLock){
                $this.wheelLock=true;
                $this._doDragEndEvent(event,1000);
            }
        })
        $(this.options.containment).on('wheelend',function(event,e){
            console.log('wend');
            if(!$(event.target).is(this)) return ;
            if(!$this.wheelstart) $this.currentSlideDirection=null;
            //if(!$this._testSlideDragEventAccess(event)) return;
            // if(($this.currentSlideDirection==1&&deltaX)||($this.currentSlideDirection==2&&deltaY)){
                // event.gesture={
                    // deltaX:deltaX,
                    // deltaY:deltaY
                // }
                // //$this.countTime=(new Date().getTime())-$this.countTime;
                // //console.log($this.countTime);
                // //countTime是用来补偿剩余的距离移动属性的
                // //有了countTime我们就能得出速率多少了
                // //var speedrate=($this.currentSlideDirection==1?deltaX:deltaY)/$this.countTime;
               // // $this._doDragEndEvent(event);
            // }
            $this.wheelstart=false;
            $this.wheelLock=false;
            $this.currentSlideDirection=null;
            deltaX=0;
            deltaY=0;
        })
    },
    _bindOverviewEvents:function(){
        var $this=this;
        this.touchoverviewelement.hammer().on('tap',function(event){
            console.log(event.target);
            if($(event.target).is('.touchslide_overview_item')){
                var indexh=$(event.target).attr('data-indexh');
                var indexv=$(event.target).attr('data-indexv');
                if(indexh&&indexv){
                    $this.slide(Number(indexh),Number(indexv));
                }
            }
            $this.toggleOverview(false);
            return false;
        })
        // this.touchoverviewelement.hammer().on('drag', function(e) {
            // // Only block default if internal div contents are large enough to scroll
            // // Warning: scrollHeight support is not universal. (http://stackoverflow.com/a/15033226/40352)
            // if($(this)[0].scrollHeight > $(this).innerHeight()) {
                // e.stopPropagation();
            // }
            // if($(this)[0].scrollTop > $(this).innerWidth()) {
                // e.stopPropagation();
            // }
        // });
    },
    _drawOverview:function(){
        //根据slide画缩略图
        var $this=this;
        //计算overview的尺寸，应该以当前屏幕尺寸为参照，屏幕尺寸的1/4，且不超过250 * 200
        //升级后的overview 需要具备几个特点
        //1. overview覆盖全屏幕的区域不变，支持滑动
        //2. overview-container是容器，需要锁定在屏幕中央位置，这个需要算法计算，根据当前屏幕特征
        //3. overview-wrap wrap区域的宽度和高度是相对于container的，宽度是可以算出的,高度应该并无所谓，只要overflow :visible就行
        //4. 横向位置根据touchslide位置同步移动， 竖向位置根据touchslide 同步移动，所有的overview数据都放在wrap下面
        var screensize=this._getScreenSize();
        var slideratio=this.slideScreenWidth/this.slideScreenHeight;//得到slide的尺寸比例
        var overview_width=parseInt(screensize.x/4<250?screensize.x/4:250,10);
        var overview_height=parseInt(overview_width/slideratio,10);
        this.overview_width=overview_width;
        this.overview_height=overview_height;
       // $('body').append('<div class="touchslide_overview" style="width:100%'+screensize.x+'px;height:'+screensize.y+'px;position:absolute;left:0;z-index:10000;overflow:auto;display:none;"></div>');
        $('body').append('<div class="touchslide_overview disableMouseWheel iMouseWheel" style="width:100%;height:100%;position:absolute;left:0;z-index:10000;overflow:auto;top:0;display:none;"></div>');
        this.touchoverviewelement=$('body').children('.touchslide_overview');
        this.touchoverviewelement.append('<div class="touchslide_overview_container"></div>');
        this.touchoverviewcontainerel=this.touchoverviewelement.children('.touchslide_overview_container');
        this.touchoverviewcontainerel.append('<div class="touchslide_overview_wrap disableMouseWheel iMouseWheel"></div>');
        this.touchoverviewel=this.touchoverviewcontainerel.children('.touchslide_overview_wrap');
        this.touchoverviewel.css('top',0);
        this.touchoverviewcontainerel.css({
            width:overview_width+'px',
            height:overview_height+'px',
            'margin-left':'-'+overview_width/2+'px',
            'margin-top':'-'+overview_height/2+'px'
        })
        if(this.slideType==3){
            //交互缩略图
            for(i=0;i<this.indexes.length;i++){
                var left=i*overview_width+i*10;
                $this.touchoverviewel.append('<div class="touchslide_overview_group" data-index="'+i+'" style="position:absolute;left:'+left+'px;top:0;"></div>');
                for(j=0;j<this.indexes[i].length;j++){
                    var top=j*overview_height+j*10;
                    var overviewimage=this.options.getOverview?this.options.getOverview(this.indexes[i][j]):null;
                    $($this.touchoverviewel.children()[i]).append('<div class="touchslide_overview_item" data-indexh="'+i+'" data-indexv="'+j+'" style="position:absolute;top:'+top+'px;left:0;width:'+overview_width+'px;height:'+overview_height+'px;"></div>');
                    $($this.touchoverviewel.children()[i]).children('[data-indexv="'+j+'"]')
                    .css({
                        'background-color':'#FFF',
                        'outline':'1px solid #ccc'
                    });
                    if(overviewimage){
                        $($this.touchoverviewel.children()[i]).children('[data-indexv="'+j+'"]')
                        .css({
                            'background-image':'url('+overviewimage+')',
                            'background-size':'contain',
                            'background-position':'center center',
                            'background-repeat':'no-repeat'
                        });                       
                    }
                }
            }
            $($($this.touchoverviewel.children()[0]).children()[0]).css('outline','2px solid red');
        }
        else{
            for(i=0;i<this.indexes.length;i++){
                var left=i*overview_width+i*10;
                var overviewimage=this.options.getOverview?this.options.getOverview(this.indexes[i]):null;
                $this.touchoverviewel.append('<div class="touchslide_overview_item" data-indexh="'+i+'" data-indexv="0" style="position:absolute;left:'+left+'px;bottom:0;width:'+overview_width+'px;height:'+overview_height+'px;top:0;"></div>');
                $($this.touchoverviewel.children()[i])
                .css({
                    'background-color':'#FFF',
                    'outline':'1px solid #ccc'
                });
                if(overviewimage){
                    $($this.touchoverviewel.children()[i])
                    .css({
                        'background-image':'url('+overviewimage+')',
                        'background-size':'contain',
                        'background-position':'center center',
                        'background-repeat':'no-repeat'
                    });                       
                }
            }    
            $($this.touchoverviewel.children()[0]).css('outline','2px solid red');        
        }
        this._bindOverviewEvents();
    },
    toggleOverview:function(val){
       if(!this.options.show_overview) return ;
       if(val){
           $('.reveal').css('opacity',0.1);
            var x=this.indexh*this.overview_width +10*this.indexh;
           this.touchoverviewelement.show();
            this.touchoverviewelement.scrollLeft(x);
            this.touchoverviewelement.scrollTop(0);
            this.show_overview=true;
       } 
       else{
           $('.reveal').css('opacity','');
           this.touchoverviewelement.hide();
           this.show_overview=false;
       } 
    },
    getSlideDirections:function(){
        //获取当前可以slide的方向
        var returned={
            left:false,
            right:false,
            up:false,
            down:false
        }
        if(this.slideType==1){
            //顺序模式
            if(this.indexh>0) returned.left=true;
            if(this.indexh<this.indexes.length-1) returned.right=true;
        }
        else{
            //交互模式
            if(this.indexh>0) {
                if(this.options.checkSlidePermission){
                    if(this.options.checkSlidePermission(this,this.slideType,'left',this.indexh,this.indexv)) returned.left=true;
                }
                else returned.left=true;
            }
            if(this.indexh<this.indexes.length-1){
                if(this.options.checkSlidePermission){
                    if(this.options.checkSlidePermission(this,this.slideType,'right',this.indexh,this.indexv)) returned.right=true;
                }               
                else returned.right=true;
            }
            if(this.indexv>0) returned.up=true;
            if(this.indexv<this.indexes[this.indexh].length-1) returned.down=true;            
        }
        return returned;
    },
    _testSlideDragEventAccess:function(event){
        //判断Slide event的是否可以执行
        var returned=true;
        if(this.dragstart||this.wheelstart){
            if(this.currentSlideDirection==1){
                if(event.type=="dragup"||event.type=="dragdown"||event.type=="wheelup"||event.type=="wheeldown"){
                    returned=false;
                }                
            }
            if(this.currentSlideDirection==2){
                if(event.type=="dragleft"||event.type=="dragright"||event.type=="wheelleft"||event.type=="wheelright"){
                    returned=false;
                }                 
            }
            if(this.slideType==1){
                //横向正常模式
               if(event.type=="dragup"||event.type=="dragdown"||event.type=="wheelup"||event.type=="wheeldown"){
                    returned=false;
               }             
            }
            if(this.slideType==2){
                //纵向正常模式
               if(event.type=="dragleft"||event.type=="dragright"||event.type=="wheelleft"||event.type=="wheelright"){
                    returned=false;
                }             
            }
            if(event.type=="dragend"||event.type=="wheelend"){
                if(!this.currentSlideDirection){
                    returned=false;
                }
            }
        }
        else{
            returned=false;
        }
        return returned;
    },
    _doDragingEvent:function(event){
        //执行drag操作，传递delatX,deltaY参数，同时需要对该位移操作作判断
        //在控制位移上
        //由于新的slide展现方式，现在的移动不是移动slideContent,而是移动里面的2个slide元素了
        var distance=this._getDragDistance(event);
        var direction=this.getSlideDirections();
        console.log(distance);
        if(event.type=="dragleft"||event.type=="dragright"||event.type=="wheelleft"||event.type=="wheelright"){
            //代表横向位移
            var deltaX=event.gesture.deltaX;
            if(deltaX<distance.min) deltaX=distance.min;
            if(deltaX>distance.max) deltaX=distance.max;

            // for ie8
            if(_g.browserSupport({msie:9})){
                //$(this.slideContent).css({ translate: [this._getCurrentPosition().x+deltaX,0] });
                if(this.options.transition==0){
                    // $(this.currentItem).css({ translate: [deltaX,0] });
                    this._compatible_css_translate(this.currentItem, deltaX, 0);
                }
                if(this.options.transition==1){
                    $(this.currentItem).css({
                        'z-index':1
                    })
                }
                if(deltaX>=0){
                    if(direction.left){
                         if(this.options.transition==1) $(this.leftItem).css({'z-index':2});
                         // $(this.leftItem).css({ translate: [-this.slideScreenWidth+deltaX,0] });
                         this._compatible_css_translate(this.leftItem, -this.slideScreenWidth+deltaX, 0);
                    }
                }
                if(deltaX<=0){
                    if(direction.right){
                        if(this.options.transition==1) $(this.rightItem).css({'z-index':2});
                        // $(this.rightItem).css({ translate: [this.slideScreenWidth+deltaX,0] });
                        this._compatible_css_translate(this.rightItem, this.slideScreenWidth+deltaX, 0);
                    }
                }
            } 
            else
                $(this.slideContent).css({ "margin-left": this._getCurrentPosition().x+deltaX+"px" }); 
        }
        if(event.type=="dragup"||event.type=="dragdown"||event.type=="wheelup"||event.type=="wheeldown"){
            //代表纵向位移
            var deltaY=event.gesture.deltaY;
            if(deltaY<distance.min) deltaY=distance.min;
            if(deltaY>distance.max) deltaY=distance.max;
            if(this.options.transition==0)
                // $(this.currentItem).css({ translate: [0,deltaY] });
                this._compatible_css_translate(this.currentItem, 0, deltaY);
            if(this.options.transition==1){
                $(this.currentItem).css({
                        'z-index':1
                 })               
            }
            if(deltaY>=0){
                if(direction.up){
                    if(this.options.transition==1) $(this.upItem).css({'z-index':2})
                    // $(this.upItem).css({ translate: [0,-this.slideScreenHeight+deltaY] });
                    this._compatible_css_translate(this.upItem, 0, -this.slideScreenHeight+deltaY);
                }
            }
            if(deltaY<=0){
                if(direction.down) {
                    if(this.options.transition==1) $(this.downItem).css({'z-index':2});
                    // $(this.downItem).css({ translate: [0,this.slideScreenHeight+deltaY] });
                    this._compatible_css_translate(this.downItem, 0, this.slideScreenHeight+deltaY);
                }
            }
            //$(this.slideGroup[this.indexh]).css({ translate: [0,this._getCurrentPosition().y+deltaY] });             
        }
    },
    _doRevertEvent:function(event){
       //当某些情况下我们需要撤销本次的移动动作 
        var $this=this;
        var distance=this._getDragDistance({type:this.currentSlideDirection==1?"dragleft":"dragup"}),translate=[0,0],move=false;
        if(this.currentSlideDirection==1){
            //代表横向位移
            var deltaX=event.gesture.deltaX;
            if(deltaX!=0){
                move=true;
                translate=[this._getCurrentPosition().x,0];
            }
            if(move){
                this.sliding=true;
                function complete1(){
                    $this.sliding=false;                     
                }

                if(_g.browserSupport({msie:9}))
                    $(this.slideContent).transition({
                      duration: 100,
                      translate:translate,
                      complete: complete1
                    });
                else
                {
                    $(this.slideContent).css({ "margin-left": translate[0]+"px" });
                    complete1();
                }
            }
        }
        if(this.currentSlideDirection==2){
            //代表纵向位移
            var deltaY=event.gesture.deltaY;
            if(deltaY!=0){
                    //代表往右
               move=true;
                   // if(&&deltaY!=distance.min)
               translate=[0,this._getCurrentPosition().y];
            }   
            if(move){
                this.sliding=true;

                function complete2(){
                    $this.sliding=false;
                }
                if(_g.browserSupport({msie:9}))
                    $(this.slideGroup[this.indexh]).transition({
                      duration: 100,
                      translate:translate,
                      complete:complete2
                    });
                else
                {
                    $(this.slideContent).css({ "margin-top": translate[1]+"px" });
                    complete2();
                }
            }       
        } 
    },
    _doDragEndEvent:function(event,time){
        //当drag结束后，需要对
        //当速度比超过100时，拖动成型
        var $this=this;
        var distance=this._getDragDistance({type:this.currentSlideDirection==1?"dragleft":"dragup"}),translate=[0,0],move=false;
        var direction=this.getSlideDirections();
        if(!time) time=300;
        var easing='linear';
        if(this.options.transition==1) easing='';
        if(this.currentSlideDirection==1){
            //代表横向位移
            var deltaX=event.gesture.deltaX;
            if(deltaX<distance.min) deltaX=distance.min;
            if(deltaX>distance.max) deltaX=distance.max;
            if(deltaX!=0){
                // if(Math.abs(deltaX)<this.options.width/3) {
                    // this._doRevertEvent(event);
                    // return ;
                // }
                this.originh=this.indexh;
                this.originv=this.indexv;
                if(deltaX<0){
                    //代表往右
                    move=true;
                    //if(deltaX!=distance.min)
                    //translate=[this._getCurrentPosition().x+distance.min,0];
                    translate=[distance.min,0];
                    this.indexh+=1;
                }
                if(deltaX>0){
                    move=true;
                   // if(&&deltaX!=distance.max)
                    translate=[distance.max,0];
                    this.indexh-=1;
                }
                this.indexv=0;
            }
            if(move){
                this.sliding=true;
                function complete1(){
                    if($this.slideType==3){
                        //对于交互模式，需要对v轴进行复位
                        //$($this.slideGroup[$this.originh]).css({ translate: [0,0] }); 
                    } 
                    var current=$this.slideType==3?$this.indexes[$this.indexh][$this.indexv]:$this.indexes[$this.indexh];
                    var prev=$this.slideType==3?$this.indexes[$this.originh][$this.originv]:$this.indexes[$this.originh];
                    $this.onSlideChange(current,prev);
                    $this.sliding=false; 
                    //$this.changeOverview($this.indexh,$this.indexv);                     
                }

                if(_g.browserSupport({msie:9})){
                    if(deltaX>0){
                        if(direction.left) {
                            $(this.leftItem).css({
                                    'z-index':2
                             })  
                             $(this.leftItem).transition({ 
                                duration:time,
                                translate: [0,0] ,
                                easing:easing
                            });
                        }
                     }
                    if(deltaX<0){
                        if(direction.right) {
                            $(this.rightItem).css({
                                    'z-index':2
                             })  
                            $(this.rightItem).transition({ 
                                duration:time,
                                translate: [0,0],
                                easing:easing
                            });
                        }
                    }
                    if(this.options.transition==0){
                        $(this.currentItem).transition({
                          duration: time,
                          translate:translate,
                          complete: complete1,
                          easing:easing
                        });
                    }
                    if(this.options.transition==1){
                        $(this.currentItem).css({
                                'z-index':1
                        })  
                        $(this.currentItem).transition({
                          duration: time,
                          translate:[0,0],
                          complete: complete1,
                          easing:easing
                        });                        
                    }
                 }
                 else
                {
                    $(this.slideContent).css({ "margin-left": translate[0]+"px" });
                    complete1();
                }
            }
        }
        if(this.currentSlideDirection==2){
            //代表纵向位移
            var deltaY=event.gesture.deltaY;
            if(deltaY<distance.min) deltaY=distance.min;
            if(deltaY>distance.max) deltaY=distance.max;
            if(deltaY!=0){
                // if(Math.abs(deltaY)<this.options.height/3) {
                    // this._doRevertEvent(event);
                    // return ;
                // }
                this.originh=this.indexh;
                this.originv=this.indexv;
                if(deltaY<0){
                    //代表往右
                    move=true;
                   // if(&&deltaY!=distance.min)
                    translate=[0,distance.min];
                    this.indexv+=1;
                }
                if(deltaY>0){
                    move=true;
                    //if(&&deltaY!=distance.max)
                    translate=[0,distance.max];
                    this.indexv-=1;
                }
            }   
            if(move){
                this.sliding=true;

                function complete2(){
                    $this.onSlideChange($this.indexes[$this.indexh][$this.indexv],$this.indexes[$this.originh][$this.originv]);
                    $this.sliding=false; 
                    //$this.changeOverview($this.indexh,$this.indexv);
                }
                if(_g.browserSupport({msie:9})){
                    if(deltaY>0){
                        if(direction.up) {
                            $(this.upItem).css({
                                    'z-index':2
                             })  
                            $(this.upItem).transition({ 
                                duration:time,
                                translate: [0,0],
                                easing:easing 
                            });
                        }
                    }
                    if(deltaY<0){
                        if(direction.down) {
                            $(this.downItem).css({
                                    'z-index':2
                             })  
                            $(this.downItem).transition({ 
                                duration:time,
                                translate: [0,0] ,
                                easing:easing
                            });
                        }
                    }
                    if(this.options.transition==0){
                        $(this.currentItem).transition({
                          duration: time,
                          translate:translate,
                          complete:complete2,
                          easing:easing
                        });
                     }
                    if(this.options.transition==1){
                        $(this.currentItem).css({
                                'z-index':1
                         })  
                        $(this.currentItem).transition({
                          duration: time,
                          translate:[0,0],
                          complete: complete2,
                          easing:easing
                        });                        
                    }
                }
                else
                {
                    $(this.slideContent).css({ "margin-top": translate[1]+"px" });
                    complete2();
                }
            }       
        }
        if(move){
            if(this.options.onSlideChangeStart) this.options.onSlideChangeStart();
        }
    },
    _getDragDistance:function(event){
        //获取可移动的距离
        var returnedValue={
            min:0,
            max:0
        };
        var directions=this.getSlideDirections();
        if(event.type=="dragleft"||event.type=="dragright"||event.type=="wheelleft"||event.type=="wheelright"){
            //代表横向位移
            if(directions.right){
                returnedValue.min=-this.slideScreenWidth;
            }
            if(directions.left){
                returnedValue.max=this.slideScreenWidth;
            }
        }
        if(event.type=="dragup"||event.type=="dragdown"||event.type=="wheelup"||event.type=="wheeldown"){
            //代表纵向位移
            if(directions.down){
                returnedValue.min=-this.slideScreenHeight;
            }
            if(directions.up){
                returnedValue.max=this.slideScreenHeight;
            }            
        } 
        return returnedValue;       
    },
    _getCurrentPosition:function(){
        //获取当前x,y方向的位置，为移动做准备
        var x=-this.indexh*this.slideScreenWidth;
        var y=-this.indexv*this.slideScreenHeight;
        return {x:x,y:y};
    },
    isOverview:function(){
        return false;
    },
    getSlideItem:function(h,v){
        //和getSlideItemById 用来查找一个Slide的dom
        return (this.slideType==3?this.slideItems[h][v]:this.slideItems[h]);
    },
    getSlideItemById:function(id){
        var slideposition=this.getSlidePositionById(id);
        if(slideposition){
            return (this.slideType==3?this.slideItems[slideposition.h][slideposition.v]:this.slideItems[slideposition.h]);
        }
        else return null;
    },
    getCurrentSlide:function(){
        return (this.slideType==3?this.slideItems[this.indexh][this.indexv]:this.slideItems[this.indexh]);
    },
    getCurrentSlideId:function(){
        return (this.slideType==3?this.indexes[this.indexh][this.indexv]:this.indexes[this.indexh]);
    },
    getIndices:function(){
        return {h:this.indexh,v:this.indexv};
    },
    getAllSlideIds:function(){
        var returned=[];
        if(this.slideType==3){
            for(i=0;i<this.indexes.length;i++){
                for(j=0;j<this.indexes[i].length;j++){
                    returned.push(this.indexes[i][j]);
                }
            }
            return returned;
        }
        else{
            return this.indexes;
        }
    },
    getRight:function(){
        if(this.getSlideDirections().right){
            return (this.slideType==3?this.indexes[this.indexh+1][0]:this.indexes[this.indexh+1]);
        }
        return null;
    },
    getLeft:function(){
        if(this.getSlideDirections().left){
            return (this.slideType==3?this.indexes[this.indexh-1][0]:this.indexes[this.indexh-1]);
        }
        return null;
    },
    getUp:function(){
        if(this.getSlideDirections().up){
            return (this.slideType==3?this.indexes[this.indexh][this.indexv-1]:null);
        }
        return null;
    },
    getDown:function(){
        if(this.getSlideDirections().down){
            return (this.slideType==3?this.indexes[this.indexh][this.indexv+1]:null);
        }
        return null;
    },
    getSlidePositionById:function(id){
        var returned=null;
        if(this.slideType==3){
            for(i=0;i<this.indexes.length;i++){
                for(j=0;j<this.indexes[i].length;j++){
                    if(this.indexes[i][j]==id) return {h:i,v:j};
                }
            }
            return returned;
        }
        else{
            if(this.indexes.indexOf(id)!=-1) return {h:this.indexes.indexOf(id),v:null};
            else return null;
        }
    },
    getVerticalLength:function(){
      //获取当前竖直方向的slide数目
      return (this.slideType==3?this.indexes[this.indexh].length:1);
    },
    getHorizontalLength:function(){
      //获取当前竖直方向的slide数目
      return this.indexes.length;
    },
    slide:function(h,v){
        if(h==undefined) return;
        if(h==this.indexh&&v==this.indexv) return ;
        var prev=this.getCurrentSlideId();
        this.indexh=h;
        this.indexv=v?v:0;
        var x=h*this.slideScreenWidth;
        var y=v?v*this.slideScreenHeight:0;
        // $(this.slideContent).css({ translate: [-x,0] }); 
        // if(this.slideType==3){
            // $(this.slideGroup[this.indexh]).css({ translate: [0,-y] });
        // }
        //与之前的切换方式不同，新的slide切换方式将会激活方位切换方式
        var current=this.getCurrentSlideId();
        this.onSlideChange(current,prev);
        //this.changeOverview(this.indexh,this.indexv);
    },
    setControllers:function(){
        var directions=this.getSlideDirections();
        $('.action-control').children('button').removeClass('enabled');
        if(directions.right) $('.action-control').children('.navigate-right').addClass('enabled');
        if(directions.left) $('.action-control').children('.navigate-left').addClass('enabled');
        if(directions.up) $('.action-control').children('.navigate-up').addClass('enabled');
        if(directions.down) $('.action-control').children('.navigate-down').addClass('enabled');
    },
    setProgressBar:function(){
        var progress=parseInt((this.indexh+1)/this.indexes.length*100,10);
        $('.controlbar').children('.progress').children('span').css({
            width:progress+'%'
        })
    },
    onSlideChange:function(current,prev){
        var $this=this;
        this.setSlideItems();
        this.previousSlide=prev;
        this.currentSlide=current;
        if(this.options.history) this.Router.navigate('page/'+current);
        if($this.options.onSlideChange) $this.options.onSlideChange($this.currentSlide,$this.previousSlide); 
        if($this.options.controls){
            $this.setControllers();
        }
        if($this.options.progress) $this.setProgressBar();
        $this.changeOverview($this.indexh,$this.indexv);
    },
    prev:function(){
        if(this.indexh==0||this.indexes.length<2){
            return ;
        }
        this.slide(this.indexh-1);
    },
    next:function(){
        if(this.indexh==(this.indexes.length-1)||this.indexes.length<2){
            return ;
        }
        this.slide(this.indexh+1);        
    },
    up:function(){
        if(this.slideType!=3) return ;
        if(this.indexes[this.indexh][this.indexv-1]){
            this.slide(this.indexh,this.indexv-1);
        }
    },
    down:function(){
        if(this.slideType!=3) return ;
        if(this.indexes[this.indexh][this.indexv+1]){
            this.slide(this.indexh,this.indexv+1);
        }
    },
    changeOverview:function(indexh,indexv){
         if(!this.options.show_overview) return ;
      //  var x=indexh*this.overview_width +10*indexh;
        var y=indexv?(indexv*this.overview_height+10*indexv):0;
        $(this.touchoverviewel).find('.touchslide_overview_item').css('outline','1px solid #ccc');
       // this.touchoverviewel.css({
       //     left : -x
       // })
        if(this.slideType==3){
            $($(this.touchoverviewel.children()[this.indexh]).children()[this.indexv]).css('outline','2px solid red');
            this.touchoverviewel.children().css('top',0);
            this.touchoverviewel.children().eq(indexh).css({
                top:-y
            })
        }
        else{
            $(this.touchoverviewel.children()[this.indexh]).css('outline','2px solid red');
        }
    }
}
if(typeof require=="undefined"){
    if(!window._g) window._g={};
    window._g.touchslide=_g_touchslide;
}
else{
    define(['_g/base','_g/touch','jquery.hammer','underscore','jquery.transit','backbone','_g/keyboard'],function(){
        window._g.touchslide=_g_touchslide;
        return window._g.touchslide; 
    })
}
})(window);