chorus.alerts.NoLdapUser = chorus.alerts.Base.extend({
    constructorName: "NoLdapUser",
    cancel: t("actions.close_window"),
    text: t("users.ldap.must_match"),

    setup: function() {
        this.title = t("users.ldap.none_found", { username: this.options.username });
    }
});
