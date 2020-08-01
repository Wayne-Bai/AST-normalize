function onDisplayRenderScreen() {
    renderReviews();
}

function onHideRenderScreen() {
    if (renderYielder)
        renderYielder.cancel();
}

var renderYielder;
function renderReviews() {
    renderYielder = new Yielder();
    var container = $('.reconciliationsToReview').empty();
    var newTemplate = $(".templates .reviewNewTemplate");
    var skippedTemplate = $(".templates .reviewSkippedTemplate");
    var reconciledTemplate = $(".templates .reviewReconciledTemplate");
    politeEach(entities, function(idx,entity){ 
        if (!entity) return;
        if (entity["/rec_ui/is_cvt"] || null == entity.id || $.isArray(entity.id))
            return;

        var template;
        switch(entity.id){
          case "None": template = newTemplate.clone(); break;
          case ""    : template = skippedTemplate.clone(); break;
          default    : template = reconciledTemplate.clone(); break;
        }
        
        $(".candidateName",template).html("<a class='internalLink' href='#" + entity['/rec_ui/id'] + "'>" + textValue(entity) + "</a>");
        var freebaseName = null;
        if (entity['/rec_ui/freebase_name']){
            $.each(entity['/rec_ui/freebase_name'],function(idx,name){
                if (name.toLowerCase() === textValue(entity).toLowerCase())
                    freebaseName = name;
            })
            freebaseName = freebaseName || entity['/rec_ui/freebase_name'][0];
        }
        freebaseName = "" + (freebaseName || entity.id);
        
        $(".freebaseName", template).html(entity.freebaseLink(freebaseName));
        if (freebaseName && textValue(entity).toLowerCase() === freebaseName.toLowerCase())
            $(".freebaseName", template).addClass("identicalMatch");
            
        $(".internalLink", template).click(function(val) {
            $.historyLoad(entity["/rec_ui/id"]);
            $("#tabs > ul").tabs("select",0);})
        container.append(template);
    }, undefined, renderYielder);
}