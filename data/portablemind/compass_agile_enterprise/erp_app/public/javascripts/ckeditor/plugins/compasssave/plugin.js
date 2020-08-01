(function(){
    //Section 1 : Code to execute when the toolbar button is pressed
    var a = {
        exec:function(editor){
            var extjsPanel = editor.extjsPanel;
            var contents = extjsPanel.getValue();
            extjsPanel.fireEvent('save', extjsPanel, contents);
        }
    },
    //Section 2 : Create the button and add the functionality to it
    b = 'compasssave';
    CKEDITOR.plugins.add(b,{
        init:function(editor){
            editor.addCommand(b,a);
            editor.ui.addButton('CompassSave',{
                label:'Save',
                icon: '/assets/icons/save/save_16x16.png',
                command:b
            });
        }
    });
})();
