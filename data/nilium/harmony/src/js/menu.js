function Menu()
{
    this.init();
}

Menu.prototype =
{
    container: null,

    foregroundColor: null,
    backgroundColor: null,

    selector: null,
    save: null,
    exportImage: null,
    resetBrush: null,
    clear: null,
    about: null,

    init: function()
    {
        function newColorWell(width, height, identifier)
        {
            var well = document.createElement("canvas");
            well.style.cursor = 'pointer';
            well.width = width;
            well.height = height;
            well.className = 'well ' + identifier;
            return well;
        }

        var option, space, separator, color_width = 48, color_height = 20;

        this.container = document.createElement("div");
        this.container.className = 'gui menu';
        this.container.style.position = 'absolute';
        this.container.style.top = '0px';

        this.foregroundColor = newColorWell(color_width, color_height, 'fg-color');
        this.container.appendChild(this.foregroundColor);

        this.setForegroundColor( COLOR );

        space = document.createTextNode(" ");
        this.container.appendChild(space);

        this.backgroundColor = newColorWell(color_width, color_height, 'bg-color');
        this.container.appendChild(this.backgroundColor);

        this.setBackgroundColor( BACKGROUND_COLOR );

        space = document.createTextNode(" ");
        this.container.appendChild(space);

        this.selector = document.createElement("select");
        this.selector.style.marginRight = '30px';

        for (i = 0; i < BRUSHES.length; i++)
        {
            option = document.createElement("option");
            option.id = i;
            option.textContent = BRUSHES[i].toUpperCase();
            this.selector.appendChild(option);
        }

        this.container.appendChild(this.selector);

        space = document.createTextNode(" ");
        this.container.appendChild(space);

        this.save = document.createElement("span");
        this.save.className = 'button';
        this.save.textContent = 'S';
        this.save.style.marginRight = '16px';
        this.container.appendChild(this.save);

        space = document.createTextNode(" | ");
        this.container.appendChild(space);

        this.exportImage = document.createElement("span");
        this.exportImage.className = 'button';
        this.exportImage.textContent = 'E';
        this.exportImage.style.marginLeft = '16px';
        this.exportImage.style.marginRight = '16px';
        this.container.appendChild(this.exportImage);

        this.resetBrush = document.createElement("span");
        this.resetBrush.className = 'button';
        this.resetBrush.textContent = 'R';
        this.resetBrush.style.marginRight = '16px';
        this.container.appendChild(this.resetBrush);

        this.clear = document.createElement("Clear");
        this.clear.className = 'button';
        this.clear.textContent = 'C';
        this.clear.style.marginRight = '16px';
        this.container.appendChild(this.clear);

        this.about = document.createElement("About");
        this.about.className = 'button';
        this.about.textContent = '?';
        this.container.appendChild(this.about);
    },

    setForegroundColor: function( color )
    {
        this.foregroundColor.style.backgroundColor = 'rgb(' + color[0] + ', ' + color[1] +', ' + color[2] + ')';
    },

    setBackgroundColor: function( color )
    {
        this.backgroundColor.style.backgroundColor = 'rgb(' + color[0] + ', ' + color[1] +', ' + color[2] + ')';
    }
}
