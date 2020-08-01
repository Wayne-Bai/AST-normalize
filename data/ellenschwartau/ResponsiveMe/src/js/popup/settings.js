define([
    'jquery', 'modules', 'tools'
],
/**
 * Die settings.js übernimmt das Initialisieren und Behandeln der Einstellungen.
 * Über die Einstellungen können alle Module zeitgleich ein- und ausgeblendet
 * sowie die Hinweistexte der Module aktiviert oder deaktiviert werden.
 * @exports settings
 * @param {Object} $ - JQuery
 * @param {module} modules - modules-Modul
 * @see module:modules
 * @param {module} tools - tools-Modul
 * @see module:tools
 * @returns {{init: Function}}
 */
function($, modules, tools) {
    var $content = $("#popup-content"),                             // Wrapper-Element für den Content des Popups
        $footer = $("#popup-footer"),                               // Wrapper-Element für den Footer
        $settings = $footer.find(".settings"),                      // Formular, das die Settings enthält
        $showDescriptionsCb = $settings.find("#showDescriptionCb"), // Checkbox für die Anzeige der Beschreibungen
        $showAllModulesCb = $settings.find("#showAllModulesCb"),    // Checkbox für die Anzeige der Module
        MODULE_CONTENT = ".module-content",                         // Selektor des Modul-Inhalts
        SETTINGS_ICON = ".settings-icon",                           // Selektor des Settings-Icon
        MODULE = ".module";                                         // Selektor der Module

    /**
     * Initialisiert das Ein- und Ausblenden der Einstellungen bei Klick auf das Einstelluns-Icon im Footer.
     */
    var initSettingsDisplay = function() {
        $footer.find(SETTINGS_ICON).click(function() {
            $settings.toggle();
            if(tools.properties.isVisible($settings)) {
                $settings.css("display", "inline-block");
            }
        });
    };

    /**
     * Initialisiert das  Ein- und Ausblenden der Hinweise über die Checkbox.
     */
    var initDescriptionToggle = function() {
        $showDescriptionsCb.change(function(){
            $content.find(MODULE).each(function(i, item) {
                if(tools.properties.isChecked($showDescriptionsCb)) {
                    modules.setSlideCallbacks($(item));
                } else {
                    modules.resetSlideCallbacks($(item));
                }
            });
        });
    };

    /**
     * Initialisiert das Ein- und Ausblenden der Modul-Inhalte über die Einstellungen.
     */
    var initModuleToggle = function() {
        $showAllModulesCb.change(function(){
            $content.find(MODULE).each(function(i, item) {
                var $item = $(item);
                if(tools.properties.isChecked($showAllModulesCb)) {
                    $item.find(MODULE_CONTENT).slideDown("slow");
                    modules.resetSlideCallbacks($item);
                    $item.addClass(modules.activeClass);
                } else {
                    $item.find(MODULE_CONTENT).slideUp("slow");
                    modules.setSlideCallbacks($item);
                    $item.removeClass(modules.activeClass);
                }
            });
        });
    };

    /**
     * Initialisiert die Funktionen der Einstellungen.
     * Dazu gehört das Ein- und Ausblenden der Settings über das Settings Icon,
     * das Aktivieren und Deaktivieren der Beschreibungen der Module
     * und das Ein- und Ausblenden der Modul-Inhalte.
     */
    var initSettings = function() {
        initSettingsDisplay();
        initDescriptionToggle();
        initModuleToggle();
    };

    return {
        init: initSettings
    };
});