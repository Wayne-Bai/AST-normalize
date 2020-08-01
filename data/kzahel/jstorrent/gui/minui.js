// minimal, simplified UI

(function() {
    function MinUI(opts) {
        this.client = opts.client
        $('#minui-wrapper').show()

        function renderTorrent(torrent) {
            var pct = (torrent.get('complete')*100).toFixed(1)
            var html = '<div class="progress">' + 
                '<div class="progress-bar" role="progressbar" style="width: '+pct+'%">' +
                '<span style="color:black">' + _.escape(torrent.get('name')) + '</span>' +
                '</div>' +
                '</div>';
            return html
        }

        this.coldefs = {
            'torrent': [
                {id: "name", name: "Name", width:275 - 60, displayFunc: renderTorrent },
                {id:'eta', name: "ETA", formatVal: formatValETA, width:60}
            ]
        }

        var slickOptions = {
            showHeader: false
        }
        var t = this.client.activeTorrents
        t.on('change', this.onTorrentChange.bind(this,t))
        //var t = this.client.torrents
        this.torrenttable = new SlickCollectionTable( { collection: t,
                                                        domid: 'mintorrentGrid',
                                                        slickOptions: slickOptions,
                                                        columns: this.coldefs.torrent
                                                      } )
        
    }
    var MinUIproto = {
        onTorrentChange: function(collection, torrent, newval, oldval, attr) {
            var idx = collection.indexOf( torrent.get_key() )
            if (attr == 'name') {
                this.torrenttable.grid.updateCell(idx, 0)
            } else if (attr == 'complete') {
                var pct = (torrent.get('complete')*100).toFixed(1)
                var node = $('.progress-bar',this.torrenttable.grid.getCellNode(idx,0))
                node.css('width', pct + '%')
            }
        },
        destroy: function() {
            $('#minui-wrapper').hide()
        }
    }
    jstorrent.MinUI = MinUI

    _.extend(MinUI.prototype, MinUIproto)
})()