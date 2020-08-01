define(function(require,exports,module){
   var base = require('./dialogBase');
   var CheckBox = require('../checkbox');
   var Slider = require('../slider');

   function MetaDialog(){
       this.init();
   }

   MetaDialog.inherits(base);
   MetaDialog.methods({
       init: function(){
           var checkbox = CheckBox.getInstance();
           checkbox.on({
               target: 'J_cbCountdown',
               value: false
           });
           checkbox.on({
               target: 'J_cbLetter',
               value: false
           });
           checkbox.on({
               target: 'J_cbSpecial',
               value: false
           });
           this.checkbox = checkbox;

           var slider = Slider.getInstance();
           slider.on({
               target:'J_sdHP',
               min: 1,
               max: 10,
               width: 260
           });
           slider.on({
               target:'J_sdCS',
               min: 3,
               max: 8,
               width: 260
           });
           slider.on({
               target:'J_sdOD',
               min: 1,
               max: 10,
               width: 260
           });
           slider.on({
               target:'J_sdAR',
               min: 3,
               max: 10,
               width: 260
           });
           slider.on({
               target:'J_sdSM',
               min: 0.5,
               max: 5,
               digits: 1,
               width: 260
           });
           slider.on({
               target:'J_sdAL',
               min: 0,
               max: 3,
               width: 260
           });

           this.slider = slider;
       },

       setData: function(data){
           if(!data) return;
           $('#J_tbArtist').val(data.Artist || '');
           $('#J_tbArtistU').val(data.ArtistUnicode || data.Artist || '');
           $('#J_tbTitle').val(data.Title || '');
           $('#J_tbTitleU').val(data.TitleUnicode || data.Title || '');
           $('#J_tbVersion').val(data.Version || '');
           $('#J_tbSource').val(data.Source || '');
           $('#J_tbCreator').val(data.Creator || '');
           $('#J_tbTags').val(data.Tags || '');
           this.checkbox.changeStatus('J_cbCountdown', !!data.Countdown);
           this.checkbox.changeStatus('J_cbLetter', !!data.LetterboxInBreaks);
           this.checkbox.changeStatus('J_cbSpecial', !!data.SpecialMode);
           this.slider.setValue('J_sdHP',data.HPDrainRate || 5);
           this.slider.setValue('J_sdCS',data.CircleSize || 5);
           this.slider.setValue('J_sdOD',data.OverallDifficulty || 5);
           this.slider.setValue('J_sdAR',data.ApproachRate || 5);
           this.slider.setValue('J_sdSM',data.SliderMultiplier || 2);
           this.slider.setValue('J_sdAL',data.AudioLeadIn || 0);
       }
   });

   return MetaDialog;
});