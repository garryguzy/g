// form.js 包含有所有的widget组件
//dependencies:[_g/base]
(function(){
var _g_form={

}
if(typeof require=="undefined"){
    if(!window._g) window._g={};
    window._g.form=_g_form;
}
else{
    define(['_g/base'
            ,'_g/form_widget/spinner'
            ,'_g/form_widget/color'
            ,'_g/form_widget/slider'
           ],function(){
        window._g.form=_g_form;
        _g.form.spinner=require('_g/form_widget/spinner');
        _g.form.color=require('_g/form_widget/color');
        _g.form.slider=require('_g/form_widget/slider');
        return window._g.form; 
    })
}
})(window);