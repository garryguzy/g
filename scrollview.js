//模拟scrollview而不用系统本身的scroll系统的原因，是因为希望能够赋予scrollview本身更多的控制
//dependencies ['_g/base','jquery.hammer','underscore'] 
//scrollview可以在横向或者竖向开启
//scrollview还有throw的效果提现，所以需要判别scrollview的速度
(function(){
var _g_scrollview=function(options){
    this.init(options);
}
_g_scrollview.prototype={
    init:function(opts){
        var defaults={
            containment:'.mask',//也就是通常的mask遮罩的containment，用来遮盖content的外层layer
            contentel:'.layer-content',//遮罩的内容区域
            mask_width:200,
            mask_height:100,
            content_width:1024,
            content_height:768,
            content_x:0,
            content_y:0,//content的初始位置
            throw_enabled:true,
            scrollX:true,
            scrollY:true,
            onScrollStart:null,
            onScrolling:null,
            onScrollEnd:null
        };
        this.options=opts?$.extend(true,{},defaults,opts):defaults; 
        _.bindAll(this);  
        this._initVaribles();
        this._initScrollItems();
        return this.iScroll;
        //this._initControls();
    },
    _initVaribles:function(){
        //对slide会用到的全局属性做定义
        this.dragged=false;//当前的Slide移动方向，当一个方向开始后，别的方向将自动锁定
        this.dragstart=false;//判断是否已经开始移动了
        this.dragging=false;//判断是否在移位控制中
        this.sliding=false;
    },
    _initControls:function(){
        var $this=this,deltastartX=0,deltastartY=0;
        $(this.options.containment).hammer().on('dragstart',function(event){
            if($this.sliding) return ; //判断是不是在slide切换中，切换中不允许有新的拖动出现
            $this.dragstart=true;
            $this.startposition=$this._getCurrentPosition();
            $this.dragX=$this.dragY=0;
            if($this.options.onScrollstart){
                $this.options.onScrollstart();
            }
        })
        if(this.options.scrollX&&this.options.scrollY){
            $(this.options.containment).hammer().on('drag',function(event){
                console.log(event);
                if(!$this._testMaskDragEventAccess(event)) return;
                console.log(event.gesture.deltaX);
                $this._doDragingEvent(event);
                event.gesture.preventDefault();
                return false;
            })   
            $(this.options.containment).hammer().on('dragleft',function(event){
                console.log('dragleft');
                if(!$this._testMaskDragEventAccess(event)) return;
                event.gesture.preventDefault();
                return false;
            })  
            $(this.options.containment).hammer().on('dragright',function(event){
                if(!$this._testMaskDragEventAccess(event)) return;
                event.gesture.preventDefault();
                return false;
            })  
            $(this.options.containment).hammer().on('dragup',function(event){
                if(!$this._testMaskDragEventAccess(event)) return;
                event.gesture.preventDefault();
                return false;
            })   
            $(this.options.containment).hammer().on('dragdown',function(event){
                if(!$this._testMaskDragEventAccess(event)) return;
                event.gesture.preventDefault();
                return false;
            })     
        }
        else{
            if(this.options.scrollX||this.options.scrollY){
                $(this.options.containment).hammer().on('dragleft',function(event){
                    console.log('dragleft');
                    if(!$this._testMaskDragEventAccess(event)) return;
                    $this.currentSlideDirection=1;//代表横向
                    console.log(event.gesture.deltaX);
                    $this._doDragingEvent(event);
                    event.gesture.preventDefault();
                    return false;
                })
                $(this.options.containment).hammer().on('dragright',function(event){
                    console.log('dragright');
                    if(!$this._testMaskDragEventAccess(event)) return;
                    $this.currentSlideDirection=1;
                    console.log(event.gesture.deltaX);
                    $this._doDragingEvent(event);
                    event.gesture.preventDefault();
                    return false;
                })
                $(this.options.containment).hammer().on('dragup',function(event){
                    console.log('dragup');
                    if(!$this._testMaskDragEventAccess(event)) return;
                    $this.currentSlideDirection=2;
                    console.log(event.gesture.deltaY);
                    $this._doDragingEvent(event);
                    event.gesture.preventDefault();
                    return false;                
                })
                $(this.options.containment).hammer().on('dragdown',function(event){
                    console.log('dragdown');
                    if(!$this._testMaskDragEventAccess(event)) return;
                    $this.currentSlideDirection=2;
                    console.log(event.gesture.deltaY);
                    $this._doDragingEvent(event);
                     event.gesture.preventDefault();
                     return false;                
                })                
            }
        }
        $(this.options.containment).hammer().on('dragend',function(event){
            if(!$this._testMaskDragEventAccess(event)) return;
            $this._doDragEndEvent(event);
            $this.dragstart=false;
            $this.dragged=false;
            $this.currentSlideDirection=null;
            $this.dragX=$this.dragY=0;
            event.gesture.preventDefault();
            return false;
         })       
    },
    _initScrollItems:function(){
        var $this=this;
        this.containment=this.mask=$(this.options.containment);
        this.content=$(this.options.contentel);
        this.containment.css({
            width:this.options.mask_width,
            height:this.options.mask_height,
            overflow:'hidden'
        })
        this.content.css({
            width:this.options.content_width,
            height:this.options.content_height
        })
        // if(this.options.content_x!=null&&this.options.content_y!=null){
            // this.content.css({
                // translate:[this.options.content_x,this.options.content_y]
            // })            
        // }
        this.iScroll = new IScroll(this.containment[0], {
            mouseWheel: true,
            probeType:3,
            click:true,
            scrollX:this.options.scrollX,
            scrollY:this.options.scrollY,
            wrapperWidth:this.options.mask_width,
            wrapperHeight:this.options.mask_height,
            scrollerWidth:this.options.content_width,
            scrollerHeight:this.options.content_height
        });
        this.iScroll.scrollTo(this.options.content_x,this.options.content_y);
        this.iScroll.on('scrollStart',function(){
            if($this.options.onScrollStart){
                $this.options.onScrollStart();
            }
        })
        this.iScroll.on('scroll',function(){
            if($this.options.onScrolling){
                $this.options.onScrolling({
                    deltaX:this.x,
                    deltaY:this.y
                })
            }
        });
    },
    _testMaskDragEventAccess:function(event){
        //判断是否能够drag有几个条件
        //首先是否支持在该方向上的drag
        //在该方向上是否还有可以移动的距离
        var returned=true;
        if(this.dragstart){
            if(this.options.scrollX&&this.options.scrollY){
                               
            }
            else{
                if(!this.options.scrollY){
                    if(event.type=="dragup"||event.type=="dragdown"||event.type=="drag"){
                        returned=false;
                    }                
                }
                if(!this.options.scrollX){
                    if(event.type=="dragleft"||event.type=="dragright"||event.type=="drag"){
                        returned=false;
                    }                 
                }
            }
            if(event.type=="dragend"){
                if(!this.dragged){
                    //判断是不是有移动
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
        var position=this.startposition;
        if(event.type=="dragleft"||event.type=="dragright"){
            //代表横向位移
            var deltaX=event.gesture.deltaX+event.gesture.velocityX*event.gesture.deltaX;
            this.dragX=deltaX;
            $(this.content).css({ translate: [this._checkX(position.x+deltaX),this._checkY(position.y+this.dragY)] }); 
            if(this.options.onScrolling){
                this.options.onScrolling({
                    deltaX:deltaX,
                    deltaY:this.dragY
                })
            }
        }
        if(event.type=="dragup"||event.type=="dragdown"){
            //代表纵向位移
            var deltaY=event.gesture.deltaY+event.gesture.velocityY*event.gesture.deltaY;
            this.dragY=deltaY;
            $(this.content).css({ translate: [this._checkX(position.x+this.dragX),this._checkY(position.y+deltaY)] }); 
            if(this.options.onScrolling){
                this.options.onScrolling({
                    deltaX:this.dragX,
                    deltaY:deltaY
                })
            }            
        }   
        if(event.type=="drag"){
            var deltaX=event.gesture.deltaX+event.gesture.velocityX*event.gesture.deltaX;
            var deltaY=event.gesture.deltaY+event.gesture.velocityY*event.gesture.deltaY;
            this.dragX=deltaX;
            this.dragY=deltaY;
            $(this.content).css({ translate: [this._checkX(position.x+deltaX),this._checkY(position.y+deltaY)] });
            if(this.options.onScrolling){
                this.options.onScrolling({
                    deltaX:deltaX,
                    deltaY:deltaY
                })
            }
        } 
        this.dragged=true;    
    },
    _doDragEndEvent:function(){
        if(this.options.onScrollend){
            this.options.onScrollend({
                deltaX:this.dragX,
                deltaY:this.dragY
            })
        }        
    },
    _checkX:function(x){
        if((x-this.options.mask_width)<-this.options.content_width) x=this.options.mask_width-this.options.content_width;
        if(x>0) x=0;
        return x;
    },
    _checkY:function(y){
        if((y-this.options.mask_height)<-this.options.content_height) y=this.options.mask_height-this.options.content_height;
        if(y>0) y=0;
        return y;          
    },
    _getCurrentPosition:function(){
        //获取当前x,y方向的位置，为移动做准备
        var returned={
            x:0,
            y:0
        }
        //var position=this.content.css('translate');
        // if(position==0){
//             
        // }
        // else{
        returned.x=this.iScroll.x;
        returned.y=this.iScroll.y;
        //}
        return returned;
    }
}
if(typeof require=="undefined"){
    if(!window._g) window._g={};
    window._g.scrollview=_g_scrollview;
}
else{
    define(['_g/base','jquery.hammer','underscore','jquery.transit','iScroll'],function(){
        window._g.scrollview=_g_scrollview;
        return window._g.scrollview; 
    })
}
})(window);