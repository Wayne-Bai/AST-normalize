Compass.ErpApp.Widgets.ResetPassword = {
    template: new Ext.Template('<%= render_widget :reset_password, :params => {:login_url => "/login"}%>'),

    addResetPassword:function(){
        Ext.getCmp('knitkitCenterRegion').addContentToActiveCodeMirror(Compass.ErpApp.Widgets.ResetPassword.template.apply());
    }
}

Compass.ErpApp.Widgets.AvailableWidgets.push({
    name:'Reset Password',
    iconUrl:'/assets/icons/reset_password/reset_password_48x48.png',
    onClick:Compass.ErpApp.Widgets.ResetPassword.addResetPassword,
    about:"This widget creates a form to submit for a user's password to be reset."
});


