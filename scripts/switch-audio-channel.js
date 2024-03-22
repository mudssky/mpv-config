(function (mp) {
    // 切换声道用的插件，可以切换左右声道，
    // 或者把两个声道都设为左声道或者右声道
    // const envOptions = {
    //   switchFRtoFL: false,
    //   mixAll: false,
    // }
    var envOptions = {
        switchFRtoFL: false,
    };
    function switchFRtoFL() {
        if (!envOptions.switchFRtoFL) {
            var afstr = 'lavfi=[pan=stereo|c0=c1|c1=c0]';
            mp.set_property('af', afstr);
            envOptions.switchFRtoFL = true;
            mp.osd_message('swith FR and LR.');
            mp.msg.debug(afstr);
        }
        else {
            resetAF();
        }
    }
    function switchAllFR() {
        var afstr = 'lavfi=[pan=stereo|c0=c1|c1=c1]';
        mp.set_property('af', afstr);
        mp.osd_message('change all channels to FR.');
        mp.msg.debug(afstr);
    }
    function switchSingleFR() {
        var afstr = 'lavfi=[pan=stereo|c1=c1]';
        mp.set_property('af', afstr);
        mp.osd_message('change to single FR.');
        mp.msg.debug(afstr);
    }
    function switchSingleFL() {
        var afstr = 'lavfi=[pan=stereo|c0=c0]';
        mp.set_property('af', afstr);
        mp.osd_message('change to single FL.');
        mp.msg.debug(afstr);
    }
    function switchAllFL() {
        var afstr = 'lavfi=[pan=stereo|c0=c0|c1=c0]';
        mp.set_property('af', afstr);
        mp.osd_message('change all channels to LR');
        mp.msg.debug(afstr);
    }
    function mixAll() {
        var afstr = 'lavfi=[pan=stereo|FL=FL+FR|FR=FL+FR]';
        mp.set_property('af', afstr);
        // envOptions.mixAll = true
        mp.osd_message('change all channels to all');
        mp.msg.debug(afstr);
    }
    function resetAF() {
        var afstr = 'lavfi=[pan=stereo|c0=c0|c1=c1]';
        mp.set_property('af', afstr);
        envOptions.switchFRtoFL = false;
        mp.osd_message('reset AF.');
        mp.msg.debug(afstr);
    }
    mp.add_key_binding('alt+t', 'switchFRtoFL', switchFRtoFL);
    mp.add_key_binding('alt+r', 'switchAllFR', switchAllFR);
    mp.add_key_binding('alt+l', 'switchAllFL:', switchAllFL);
    mp.add_key_binding('alt+shift+r', 'switchSingleFR:', switchSingleFR);
    mp.add_key_binding('alt+shift+l', 'switchSingleFL:', switchSingleFL);
    mp.add_key_binding('alt+a', 'mixAll', mixAll);
    mp.add_key_binding('shift+alt+i', 'resetAF', resetAF);
})(mp);
