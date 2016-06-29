/*
  解析歌词并渲染到界面
*/

(function($){

  window.MusicPlayer = function(obj){
    this.lrcPath = obj.lyric;
    this.lrcContainer = $(obj.container);
    this.player = $(obj.audio);
    this.paused = false;
    if(typeof obj.lyricChange == 'function'){
      this.lyricChange = obj.lyricChange;
    }

    var that = this;
    $.ajax({
      url: this.lrcPath,
      success: function(lrc){
        var lyric = that.parseLyric(lrc);
        if(that.lrcSuccess) that.lrcSuccess(lyric);
      },
      error:function(e){
        if(that.lrcError) that.lrcError(e);
      }
    });

  }

  MusicPlayer.prototype.parseLyric = function(lrc){
    var lyrics = lrc.split("\n");
    var lrcObj = {};
    for(var i = 0; i < lyrics.length; i++){
      var lyric = decodeURIComponent(lyrics[i]);
      var timeReg = /\[\d*:\d*((\.|\:)\d*)*\]/g;
      var timeRegExpArr = lyric.match(timeReg);
      if(!timeRegExpArr) continue;
      var clause = lyric.replace(timeReg,'');

      for(var k = 0, h = timeRegExpArr.length; k < h; k++) {
        var t = timeRegExpArr[k];
        var min = Number(String(t.match(/\[\d*/i)).slice(1)),
        sec = Number(String(t.match(/\:\d*/i)).slice(1));
        var time = min * 60 + sec;
        lrcObj[time] = $.trim(clause);
      }
    }
    return lrcObj;
  }

  MusicPlayer.prototype.lrcSuccess = function(lyric){
    this.lyric = lyric;
    this.lrcContainer.html('');
    for(var x in lyric){
      $('<li/>').attr('data-time', x).text(lyric[x]).appendTo(this.lrcContainer);
    }
    var that = this, nt = 0;
    this.player.on('timeupdate', function(e){
      if(that.paused) return;

      var t = Math.floor(that.player[0].currentTime);
      if(nt == t) return;
      nt = t;
      if(typeof that.lyric[t] != 'undefined'){
        var $nl = that.lrcContainer.find('li').removeClass('active').filter('[data-time="'+ t + '"]').addClass('active');
        if(that.lyricChange) that.lyricChange({
          time: t,
          target: $nl
        });
      }
    });
  }

  MusicPlayer.prototype.lrcError = function(){
    console.error("歌词加载失败！");
  }

  MusicPlayer.prototype.pause = function(){
    this.paused = true;
  }

  MusicPlayer.prototype.restart = function(){
    this.paused = false;
  }

})(jQuery);