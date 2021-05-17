"use strict";
// 用户可配置的选项
var userOptions = {
    dir: mp.get_property('working-directory'),
    // frameSize: 'iw/2:i/2',
    frameSize: 'iw/3:ih/3',
    // fps: 15,
    fps: 8,
    // 设置动图循环播放次数,0是无限循环播放
    loop: 0,
    // 是否带声音
    audio: false,
};
// const userOptions = {
//   dir: mp.get_property('working-directory'),
//   // frameSize: 'iw/2:i/2',
//   frameSize: 'iw/2:ih/2',
//   // fps: 15,
//   fps: 15,
//   // 设置动图循环播放次数,0是无限循环播放
//   loop: 0,
//   // 是否带声音
//   audio: false,
// }
// 从环境中获取的参数
var envOptions = {
    startTime: -1,
    endTime: -1,
    filename: '',
    basename: '',
    currentSubFilter: '',
    tracksList: [],
    audioCodec: '',
};
var animatePicType;
(function (animatePicType) {
    animatePicType["webp"] = ".webp";
    animatePicType["gif"] = ".gif";
    animatePicType["png"] = ".png";
})(animatePicType || (animatePicType = {}));
// 检查时间参数，必须设置开始时间和结束时间，两个有一个是负数的情况，或者结束时间大于开始时间返回false
function validateTime() {
    if (envOptions.startTime === -1 ||
        envOptions.endTime === -1 ||
        envOptions.startTime >= envOptions.endTime) {
        mp.osd_message('Invalid start/end time. ');
        return false;
    }
    return true;
}
function initEnvOptions() {
    envOptions.filename = mp.get_property('filename') || '';
    envOptions.basename = mp.get_property('filename/no-ext') || '';
    envOptions.tracksList = JSON.parse(mp.get_property('track-list') || '');
    dump('userOption:', userOptions);
    dump('envOptions', envOptions);
}
function setStartTime() {
    // mp.get_property_number 用number类型返回参数，这里是失败时返回-1，也可以设置回调函数
    envOptions.startTime = mp.get_property_number('time-pos', -1);
    mp.osd_message("GIF Start: " + envOptions.startTime);
}
function setEndTime() {
    envOptions.endTime = mp.get_property_number('time-pos', -1);
    mp.osd_message("GIF End: " + envOptions.endTime);
}
function pathCorrect(path) {
    return path.replace(/\\/g, '/');
}
//
function getCurrentSub() {
    for (var index in envOptions.tracksList) {
        var currentObj = envOptions.tracksList[index];
        // 两种情况，外挂字幕时，需要指定外挂字幕的文件路径还有si指定为0
        //内置字幕的时候，直接指定当前文件名，ffmpeg会自动寻找字幕
        if (currentObj['selected'] && currentObj['type'] === 'sub') {
            if (currentObj['external'] === true) {
                envOptions.currentSubFilter = "subtitles='" + pathCorrect(currentObj['external-filename']) + "':si=0";
            }
            else {
                envOptions.currentSubFilter = "subtitles='" + envOptions.filename + "'";
            }
        }
    }
}
// 获取当前音轨的编码类型，暂时不考虑外挂音轨的情况
function getAudioType() {
    // 检测到当前音轨为内置音轨时返回codec，反之不做处理
    for (var index in envOptions.tracksList) {
        var currentObj = envOptions.tracksList[index];
        if (currentObj['selected'] &&
            currentObj['type'] === 'audio' &&
            currentObj['external'] !== true) {
            envOptions.audioCodec = currentObj['codec'];
            return currentObj['codec'];
        }
    }
    return '';
}
// 指定动图格式（png,webp,gif）和生成动图，可选择是否带字幕
function geneRateAnimatedPic(picType, hasSubtitles) {
    // 如果不设置开始或结束时间，无法生成动图
    // envOptions.filename = mp.get_property('filename')
    // envOptions.basename = mp.get_property('filename/no-ext')
    if (!validateTime()) {
        return;
    }
    mp.osd_message('Creating GIF.');
    // 取得当前字幕处理的参数
    getCurrentSub();
    var commands = [];
    // 如果有字幕就能正常生成参数，并且还需要我们指定有字幕模式才会执行有字幕动图生成
    if (envOptions.currentSubFilter && hasSubtitles) {
        commands = [
            'ffmpeg',
            '-v',
            'warning',
            '-i',
            "" + envOptions.filename,
            '-ss',
            "" + envOptions.startTime,
            '-to',
            "" + envOptions.endTime,
            '-loop',
            "" + userOptions.loop,
            '-vf',
            "fps=" + userOptions.fps + ",scale=" + userOptions.frameSize + "," + envOptions.currentSubFilter,
            envOptions.basename + "[" + envOptions.startTime.toFixed() + "-" + envOptions.endTime.toFixed() + "]" + picType,
        ];
    }
    else {
        commands = [
            'ffmpeg',
            '-v',
            'warning',
            '-i',
            "" + envOptions.filename,
            '-ss',
            "" + envOptions.startTime,
            '-to',
            "" + envOptions.endTime,
            '-loop',
            "" + userOptions.loop,
            '-vf',
            "fps=" + userOptions.fps + ",scale=" + userOptions.frameSize,
            envOptions.basename + "[" + envOptions.startTime.toFixed() + "-" + envOptions.endTime.toFixed() + "]" + picType,
        ];
    }
    // 对秒数执行四舍五入
    // const commands = `ffmpeg -v warning -i '${envOptions.filename}' -ss ${envOptions.startTime} -to ${envOptions.endTime} -vf "fps=${userOptions.fps},scale=${userOptions.frameSize}" '${envOptions.basename}${picType}' `
    // mp.msg.debug(commands)
    print(commands.join(' '));
    // dump(commands)
    mp.command_native_async({
        name: 'subprocess',
        // 视频回放进程结束后，不结束子进程
        playback_only: false,
        args: commands,
        // 捕获过程输出到stdout的所有数据，并在过程结束后将其返回
        capture_stdout: true,
    }, function (success, result, err) {
        if (success) {
            mp.msg.info("generate " + picType + ":" + envOptions.filename + " succeed");
            mp.osd_message("generate " + picType + ":" + envOptions.filename + " succeed");
        }
        else {
            mp.msg.warn("generate " + picType + ":" + envOptions.filename + " failed");
            mp.osd_message("generate " + picType + ":" + envOptions.filename + " failed");
        }
    });
    if (userOptions.audio) {
        cutAudio();
    }
}
// 获取文件名的后缀，不包含'.'
function getExt(filename) {
    var splitIndex = filename.lastIndexOf('.');
    var res = filename.substring(splitIndex + 1);
    dump('res', res);
    return res;
}
// 添加剪切音频功能
function cutAudio() {
    // 检查时间是否有误
    if (!validateTime()) {
        return;
    }
    var AudioType = getAudioType();
    // 如果音频类型没有确定，那么就会用aac转码
    var commands;
    if (AudioType) {
        commands = [
            'ffmpeg',
            '-v',
            'warning',
            '-i',
            "" + envOptions.filename,
            '-ss',
            "" + envOptions.startTime,
            '-to',
            "" + envOptions.endTime,
            '-vn',
            '-acodec',
            'copy',
            envOptions.basename + "." + AudioType,
        ];
    }
    else {
        commands = [
            'ffmpeg',
            '-v',
            'warning',
            '-i',
            "" + envOptions.filename,
            '-ss',
            "" + envOptions.startTime,
            '-to',
            "" + envOptions.endTime,
            '-vn',
            envOptions.basename + ".aac",
        ];
    }
    print(commands.join(' '));
    mp.command_native_async({
        name: 'subprocess',
        // 视频回放进程结束后，不结束子进程
        playback_only: false,
        args: commands,
        // 捕获过程输出到stdout的所有数据，并在过程结束后将其返回
        capture_stdout: true,
    }, function (success, result, err) {
        if (success) {
            mp.msg.info("cut audio succeed");
            mp.osd_message("Cut Audio Succeed.");
        }
        else {
            mp.msg.warn("cut audio failed");
            mp.osd_message("Cut Audio Failed.");
        }
    });
}
function cutVideo() {
    if (!validateTime()) {
        return;
    }
    var commands = [
        'ffmpeg',
        '-v',
        'warning',
        '-i',
        "" + envOptions.filename,
        '-ss',
        "" + envOptions.startTime,
        '-to',
        "" + envOptions.endTime,
        '-c',
        'copy',
        envOptions.basename + "[" + envOptions.startTime.toFixed() + "-" + envOptions.endTime.toFixed() + "]." + getExt(envOptions.filename),
    ];
    print(commands.join(' '));
    mp.command_native_async({
        name: 'subprocess',
        // 视频回放进程结束后，不结束子进程
        playback_only: false,
        args: commands,
        // 捕获过程输出到stdout的所有数据，并在过程结束后将其返回
        capture_stdout: true,
    }, function (success, result, err) {
        if (success) {
            mp.msg.info("cut video succeed");
            mp.osd_message("Cut Video Succeed ");
        }
        else {
            mp.msg.warn("cut video failed");
            mp.osd_message("Cut Video failed ");
        }
    });
}
function generateGif() {
    geneRateAnimatedPic(animatePicType.gif, false);
}
function generateGifWithSub() {
    geneRateAnimatedPic(animatePicType.gif, true);
}
function generateWebp() {
    geneRateAnimatedPic(animatePicType.webp, false);
}
function generateWebpWithSub() {
    geneRateAnimatedPic(animatePicType.webp, true);
}
mp.add_key_binding('g', 'setStartTime', setStartTime);
mp.add_key_binding('G', 'setEndTime', setEndTime);
mp.add_key_binding('Ctrl+g', 'generateGif', generateGif);
mp.add_key_binding('Ctrl+G', 'generateGifWithSub', generateGifWithSub);
mp.add_key_binding('Ctrl+w', 'generateWebp', generateWebp);
mp.add_key_binding('Ctrl+W', 'generateWebpWithSub', generateWebpWithSub);
mp.add_key_binding('Ctrl+a', 'cutAudio', cutAudio);
mp.add_key_binding('Ctrl+v', 'cutVideo', cutVideo);
mp.register_event('file-loaded', initEnvOptions);
// mp.msg.info(userOptions.dir, userOptions.frameSize, userOptions.fps)
