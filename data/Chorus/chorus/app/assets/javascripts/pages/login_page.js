chorus.pages.LoginPage = chorus.pages.Bare.extend({
    setup:function () {
        this.mainContent = new chorus.views.Login({model:chorus.session, el:this.el});
    },

    render:function () {
        this.mainContent.render();
        return this;
    }
});