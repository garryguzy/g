//slider 在浏览器上的应用非常广泛，此module就是为了提供键盘的响应控制
//提供全局范围内的键盘按键控制
//dependencies: [base,hammer]
(function(){
var _g_slider=function(options){
    this.init(options);
}
_g_slider.prototype={
    init:function(opts){
        var defaults={
            containment:'.g-slider',//
            handle:'.g-slider-handle',
            range:'.g-slider-range'
        };
        this.options=opts?$.extend(true,{},defaults,opts):defaults; 
        _.bindAll(this);  
        this.handle=$(this.options.containment).find(this.options.handle).first();
        this.range=$(this.options.containment).find(this.options.range).first();
        this._bindControl();
        return this;
    },
    _bindControl:function(){
        var $this=this,deltastartX=0,deltastartY=0,deltaX=0,deltaY=0;
        this.handle.hammer().on('dragstart',function(event){
            $this.dragstart=true;
            $this.startleft=parseInt($this.handle.css('left'),10);
        })
        this.handle.hammer().on('drag',function(event){
            console.log('dragleft');
            $this.dragstart=true;
            deltaX=event.gesture.deltaX;
            $this._doDragingEvent(event);
            event.gesture.preventDefault();
            return false;
        }) 
        this.handle.hammer().on('dragend',function(event){
            if(!$this.dragstart) return ;
            $this.dragstart=false;
            deltaX=0;
            deltaY=0;
            $this._doDragEndEvent(event);
            event.gesture.preventDefault();
            return false;
         })     
    },
    _doDragingEvent:function(event){
        console.log(event);
        var left=this.startleft;
        var width=this.handle.parent().width();
        left=left+event.gesture.deltaX;
        if(left<0) left=0;
        if(left>width) left=width;
        var percent=_g.number.decimal(left/width,2)*100;
        this.handle.css('left',percent+'%');
        this.range.css('width',percent+'%'); 
    },
    _doDragEndEvent:function(event){
        var left=this.startleft;
        var width=this.handle.parent().width();
        left=left+event.gesture.deltaX;
        if(left<0) left=0;
        if(left>width) left=width;
        var percent=_g.number.decimal(left/width,2)*100;
        this.handle.css('left',percent+'%');
        this.range.css('width',percent+'%'); 
        if(this.options.onChange){
            this.options.onChange(percent);
        }        
    },
    change:function(percent){
        if(!this.dragstart){
            this.handle.css('left',percent+'%');
            this.range.css('width',percent+'%');     
        }  
    }
}
if(typeof require=="undefined"){
    if(!window._g) window._g={};
    window._g.slider=_g_slider;
}
else{
    define(['_g/base','_g/event','jquery.hammer'],function(){
        window._g.slider=_g_slider;
        return window._g.slider; 
    })
}
})(window);
