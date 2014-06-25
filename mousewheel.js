//mousewheel 在浏览器上的应用非常广泛，此module就是为了提供鼠标的滚轴触控功能
//dependencies: [base]
(function(){
var _g_mousewheel={
    support:function(){

    },
    init:function(){
        //初始化mousewheel事件
        _g.mousewheel.wheelstart=false;
        _g.mousewheel.wheeltimer=null;
        _g.mousewheel.checkflag=false;
        _g.mousewheel.preventDefault=true;//判断是否默认屏蔽鼠标事件，当没有任何元素需要触发这类事件的情况
        _g.mousewheel.direction=null;//0横向 ，1 竖向
        _g.mousewheel.direction_lock=true;//锁定方向
        _g.mousewheel.currentTarget=null;//有的时候我们需要绑定这样一个currentEvent,使得哪怕在滚轴滑动的过程中，事件离开了该元素，也能够使得事件的触发得以继续
        _g.mousewheel.mouseWheelSpeed=20;
        //直到wheelend事件触发结束
        var handler=function(e){
            //console.log(wheelDeltaX);
            if(_g.mousewheel.disabled) return ;
            _g.mousewheel.e=e;//始终保持最后的e的数据
            var wheelData=_g.mousewheel.getMouseWheel(e);
            var wheelDeltaX=wheelData.x;
            var wheelDeltaY=wheelData.y;
            //console.log('X'+wheelDeltaX);
            //console.log('Y'+wheelDeltaY);
            if(wheelDeltaX==undefined&&wheelDeltaY==undefined) return ;
            if(_g.mousewheel.direction_lock){
                if(_g.mousewheel.direction==null){
                    if (wheelDeltaY!= 0){
                        _g.mousewheel.direction=1;
                    }
                    if(wheelDeltaX!=0){
                        _g.mousewheel.direction=0;
                    }
                }
            }
            else{
                if (wheelDeltaY!= 0){
                    _g.mousewheel.direction=1;
                    // Anything that makes vertical wheelscroll keeps normal
                }
                if(wheelDeltaX!=0){
                    _g.mousewheel.direction=0;
                }                
            }
            //console.log(_g.mousewheel.direction);
            if(!_g.mousewheel.wheelstart){//开启一个新的鼠标事件
                _g.mousewheel.wheelstart=true;
                _g.mousewheel.onStart(e);
                _g.mousewheel.checkflag=true;
                _g.mousewheel.wheeltimer=window.setInterval(function(){
                    if(_g.mousewheel.checkflag){//证明在1s内没有再发生鼠标移动
                        //console.log('wheelend');
                        _g.mousewheel.checkflag=false;
                        _g.mousewheel.wheelstart=false;
                        window.clearInterval(_g.mousewheel.wheeltimer);
                        _g.mousewheel.onEnd(_g.mousewheel.e);
                        _g.mousewheel.direction=null;
                    }
                    else{
                        _g.mousewheel.checkflag=true;
                    }
                },250);//250毫秒内没有动作表示mousewheel的执行结束
            }
            else{//说明已经有鼠标事件在处理了，是move事件
                _g.mousewheel.checkflag=false;
                //console.log('wheelmove');
                _g.mousewheel.onWheel(e);
                if(!_g.mousewheel.direction) {
                    if(wheelDeltaX<0)
                        _g.mousewheel.onWheelLeft(e);
                    else
                        _g.mousewheel.onWheelRight(e);
                }
                else{
                    if(wheelDeltaY<0)
                        _g.mousewheel.onWheelUp(e);
                    else
                        _g.mousewheel.onWheelDown(e);                    
                }
            }
            if(_g.mousewheel.preventDefault){
                _g.mousewheel.preventDefault=false;
                e.preventDefault();
                return false;
            }
        }
        _g.event.addEvent(window, 'wheel', handler);
        _g.event.addEvent(window, 'mousewheel', handler);
        _g.event.addEvent(window, 'DOMMouseScroll', handler);
        // var toBind = 'onwheel' in document || document.documentMode >= 9 ? ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'];
        // // if($.browser.mozilla&&!_.include(toBind,'DomMouseScroll')){
            // // toBind.push('DomMouseScroll');
        // // }
        // if ( window.addEventListener ) {
            // for ( var i = toBind.length; i; ) {
                // window.addEventListener( toBind[--i], handler, false );
            // }
        // } else {
            // window.onmousewheel = handler;
        // }        
    },
    getMouseWheel:function(e){
        _g.mousewheel.mouseWheelSpeed=20;
        var wheelDeltaX,wheelDeltaY;
            if ( 'deltaX' in e ) {
                wheelDeltaX = -e.deltaX;
                wheelDeltaY = -e.deltaY;
            } else if ( 'wheelDeltaX' in e ) {
                wheelDeltaX = e.wheelDeltaX / 120 * _g.mousewheel.mouseWheelSpeed;
                wheelDeltaY = e.wheelDeltaY / 120 * _g.mousewheel.mouseWheelSpeed;
            } else if ( 'wheelDelta' in e ) {
                wheelDeltaX = wheelDeltaY = e.wheelDelta / 120 * _g.mousewheel.mouseWheelSpeed;
            } else if ( 'detail' in e ) {
                wheelDeltaX = wheelDeltaY = -e.detail / 3 * _g.mousewheel.mouseWheelSpeed;
            } else {
                wheelDeltaX = wheelDeltaY = undefined;
            }
         return {x:wheelDeltaX,y:wheelDeltaY};        
    },
    getElement:function(e,directionX,directionY){
        var element;
        var target=directionX?'.iMouseWheel.enableMouseWheelX,.iMouseWheel.enableMouseWheel':directionY?'.iMouseWheel.enableMouseWheelY,iMouseWheel.enableMouseWheel':'.iMouseWheel';
        if(_g.mousewheel.currentTarget) element=_g.mousewheel.currentTarget;
        else if(!directionX&&!directionY){
             if($(e.target).is('.iMouseWheel')) element=$(e.target);
             else element=$(e.target).closest('.iMouseWheel');
        }
        else if(directionX){
             if($(e.target).is(target)) element=$(e.target);
             else element=$(e.target).closest('.iMouseWheel.enableMouseWheelX').length?$(e.target).closest('.iMouseWheel.enableMouseWheelX'):$(e.target).closest('.iMouseWheel.enableMouseWheel');           
        }
        else if(directionY){
             if($(e.target).is(target)) element=$(e.target);
             else element=$(e.target).closest('.iMouseWheel.enableMouseWheelY').length?$(e.target).closest('.iMouseWheel.enableMouseWheelY'):$(e.target).closest('.iMouseWheel.enableMouseWheel');           
        }
        //找到这样一个带标示的element
        return element;       
    },
    available:function(e){
        //用来判断当前元素是否适用于mousewheel事件的触发
        //通常我们会给用于mousewheel探测的dom一些特定的class标示
        //iMouseWheel : 这个class表示当前的这个物体是属于最近一个可供mousewheel探测的dom
        //disableMouseWheel ：表示当接受到这个信号时，屏蔽mousewheel事件触发
        //disableMouseWheelX : 表示在X方向屏蔽
        //disableMouseWheelY : 表示Y方向
        //enableMouseWheel : 
        //enableMouseWheelX
        //enableMouseWheelY
        //enableMutipleMouseDirection : 是否允许多方向mousewheel触发，默认是屏蔽的
        var element=_g.mousewheel.getElement(e);
        //找到这样一个带标示的element
        if(!element.length){
            //表示目前的鼠标触发
            if(_g.mousewheel.preventDefault) e.preventDefault();
            return null;
        }
        else{
            if(element.hasClass('disableMouseWheel')){
                //表示当前的元素不需要mousewheel事件的触发
                //也就是说需要放行
                return false;
            }
            else if(element.hasClass('disableMouseWheelX')&&_g.mousewheel.direction==0){
                //X轴向
                return false;
            }
            else if(element.hasClass('disableMouseWheelY')&&_g.mousewheel.direction==1){
                return false;
            }
            else if(element.hasClass('enableMouseWheel')){
                //全方向许可
                e.preventDefault();
                return element;
            }
            else if(element.hasClass('enableMouseWheelX')&&_g.mousewheel.direction==0){
                e.preventDefault();
                return element;               
            }
            else if(element.hasClass('enableMouseWheelY')&&_g.mousewheel.direction==1){
                e.preventDefault();
                return element;             
            }
            else {
                //代表x轴向
                //那么我们应该去查找x轴向的元素
                element=_g.mousewheel.getElement(e,!_g.mousewheel.direction,_g.mousewheel.direction);
                if(element.length){
                    e.preventDefault();
                    return element;                    
                }
                else return null;
            }
        }
    },
    onStart:function(e){
        var element=_g.mousewheel.available(e);
        if(element){
            //var element=_g.mousewheel.getElement(e);
            element.trigger('wheelstart',e);
        }
    },
    onWheel:function(e){
        var element=_g.mousewheel.available(e);
        if(element){
            //var element=_g.mousewheel.getElement(e,!_g.mousewheel.direction,_g.mousewheel.direction);
            element.trigger('wheelmove',e);
        }
    },
    onEnd:function(e){
        var element=_g.mousewheel.available(e);
        //无论什么情况_g.mousewheel.currentTarget都需要解绑定
        if(element){
            //var element=_g.mousewheel.getElement(e,!_g.mousewheel.direction,_g.mousewheel.direction);
            element.trigger('wheelend',e);
        }
        _g.mousewheel.currentTarget=null;
    },
    onWheelLeft:function(e){
        var element=_g.mousewheel.available(e);
        if(element){
          //  var element=_g.mousewheel.getElement(e);
            element.trigger('wheelleft',e);
        }
    },
    onWheelRight:function(e){
        var element=_g.mousewheel.available(e);
        if(element){
           // var element=_g.mousewheel.getElement(e);
            element.trigger('wheelright',e);
        }
    },
    onWheelUp:function(e){
        var element=_g.mousewheel.available(e);
        if(element){
           // var element=_g.mousewheel.getElement(e);
            element.trigger('wheelup',e);
        }
    },
    onWheelDown:function(e){
        var element=_g.mousewheel.available(e);
        if(element){
            //var element=_g.mousewheel.getElement(e);
            element.trigger('wheeldown',e);
        }
    }
}
if(typeof require=="undefined"){
    if(!window._g) window._g={};
    window._g.mousewheel=_g_mousewheel;
}
else{
    define(['_g/base','_g/event'],function(){
        window._g.mousewheel=_g_mousewheel;
        return window._g.mousewheel; 
    })
}
})(window);
