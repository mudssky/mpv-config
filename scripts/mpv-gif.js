'use strict'
;(function (mp) {
  var userOptions = {
    dir: mp.get_property('working-directory'),
    frameSize: 'iw/3:ih/3',
    fps: 8,
    loop: 0,
    audio: false,
  }
  var envOptions = {
    startTime: -1,
    endTime: -1,
    filename: '',
    basename: '',
    currentSubFilter: '',
    tracksList: [],
    audioCodec: '',
  }
  var animatePicType
  ;(function (animatePicType) {
    animatePicType['webp'] = '.webp'
    animatePicType['gif'] = '.gif'
    animatePicType['png'] = '.png'
  })(animatePicType || (animatePicType = {}))
  function validateTime() {
    if (
      envOptions.startTime === -1 ||
      envOptions.endTime === -1 ||
      envOptions.startTime >= envOptions.endTime
    ) {
      mp.osd_message('Invalid start/end time. ')
      return false
    }
    return true
  }
  function initEnvOptions() {
    envOptions.filename = mp.get_property('filename') || ''
    envOptions.basename = mp.get_property('filename/no-ext') || ''
    envOptions.tracksList = JSON.parse(mp.get_property('track-list') || '')
    dump('userOption:', userOptions)
    dump('envOptions', envOptions)
  }
  function setStartTime() {
    envOptions.startTime = mp.get_property_number('time-pos', -1)
    mp.osd_message('GIF Start: ' + envOptions.startTime)
  }
  function setEndTime() {
    envOptions.endTime = mp.get_property_number('time-pos', -1)
    mp.osd_message('GIF End: ' + envOptions.endTime)
  }
  function pathCorrect(path) {
    return path.replace(/\\/g, '/')
  }
  function getCurrentSub() {
    for (var index in envOptions.tracksList) {
      var currentObj = envOptions.tracksList[index]
      if (currentObj['selected'] && currentObj['type'] === 'sub') {
        if (currentObj['external'] === true) {
          envOptions.currentSubFilter =
            "subtitles='" +
            pathCorrect(currentObj['external-filename']) +
            "':si=0"
        } else {
          envOptions.currentSubFilter =
            "subtitles='" + envOptions.filename + "'"
        }
      }
    }
  }
  function getAudioType() {
    for (var index in envOptions.tracksList) {
      var currentObj = envOptions.tracksList[index]
      if (
        currentObj['selected'] &&
        currentObj['type'] === 'audio' &&
        currentObj['external'] !== true
      ) {
        envOptions.audioCodec = currentObj['codec']
        return currentObj['codec']
      }
    }
    return ''
  }
  function geneRateAnimatedPic(picType, hasSubtitles) {
    if (!validateTime()) {
      return
    }
    mp.osd_message('Creating GIF.')
    getCurrentSub()
    var commands = []
    if (envOptions.currentSubFilter && hasSubtitles) {
      commands = [
        'ffmpeg',
        '-v',
        'warning',
        '-ss',
        '' + envOptions.startTime,
        '-copyts',
        '-i',
        '' + envOptions.filename,
        '-to',
        '' + envOptions.endTime,
        '-loop',
        '' + userOptions.loop,
        '-vf',
        'fps=' +
          userOptions.fps +
          ',scale=' +
          userOptions.frameSize +
          ',' +
          envOptions.currentSubFilter,
        '-ss',
        '' + envOptions.startTime,
        envOptions.basename +
          '[' +
          envOptions.startTime.toFixed() +
          '-' +
          envOptions.endTime.toFixed() +
          ']' +
          picType,
      ]
    } else {
      commands = [
        'ffmpeg',
        '-v',
        'warning',
        '-i',
        '' + envOptions.filename,
        '-ss',
        '' + envOptions.startTime,
        '-to',
        '' + envOptions.endTime,
        '-loop',
        '' + userOptions.loop,
        '-vf',
        'fps=' + userOptions.fps + ',scale=' + userOptions.frameSize,
        envOptions.basename +
          '[' +
          envOptions.startTime.toFixed() +
          '-' +
          envOptions.endTime.toFixed() +
          ']' +
          picType,
      ]
    }
    print(commands.join(' '))
    mp.command_native_async(
      {
        name: 'subprocess',
        playback_only: false,
        args: commands,
        capture_stdout: true,
      },
      function (success, result, err) {
        if (success) {
          mp.msg.info(
            'generate ' + picType + ':' + envOptions.filename + ' succeed'
          )
          mp.osd_message(
            'generate ' + picType + ':' + envOptions.filename + ' succeed'
          )
        } else {
          mp.msg.warn(
            'generate ' + picType + ':' + envOptions.filename + ' failed'
          )
          mp.osd_message(
            'generate ' + picType + ':' + envOptions.filename + ' failed'
          )
        }
      }
    )
    if (userOptions.audio) {
      cutAudio()
    }
  }
  function getExt(filename) {
    var splitIndex = filename.lastIndexOf('.')
    var res = filename.substring(splitIndex + 1)
    dump('res', res)
    return res
  }
  function cutAudio() {
    if (!validateTime()) {
      return
    }
    var AudioType = getAudioType()
    var commands
    commands = [
      'ffmpeg',
      '-v',
      'warning',
      '-accurate_seek',
      '-i',
      '' + envOptions.filename,
      '-ss',
      '' + envOptions.startTime,
      '-to',
      '' + envOptions.endTime,
      '-vn',
      '-acodec',
      'copy',
      envOptions.basename +
        '[' +
        envOptions.startTime.toFixed() +
        '-' +
        envOptions.endTime.toFixed() +
        '].mka',
    ]
    print(commands.join(' '))
    mp.command_native_async(
      {
        name: 'subprocess',
        playback_only: false,
        args: commands,
        capture_stdout: true,
      },
      function (success, result, err) {
        if (success) {
          mp.msg.info('cut audio succeed')
          mp.osd_message('Cut Audio Succeed.')
        } else {
          mp.msg.warn('cut audio failed')
          mp.osd_message('Cut Audio Failed.')
        }
      }
    )
  }
  function cutVideo() {
    if (!validateTime()) {
      return
    }
    var commands = [
      'ffmpeg',
      '-v',
      'warning',
      '-accurate_seek',
      '-i',
      '' + envOptions.filename,
      '-ss',
      '' + envOptions.startTime,
      '-to',
      '' + envOptions.endTime,
      '-c',
      'copy',
      envOptions.basename +
        '[' +
        envOptions.startTime.toFixed() +
        '-' +
        envOptions.endTime.toFixed() +
        '].' +
        getExt(envOptions.filename),
    ]
    print(commands.join(' '))
    mp.command_native_async(
      {
        name: 'subprocess',
        playback_only: false,
        args: commands,
        capture_stdout: true,
      },
      function (success, result, err) {
        if (success) {
          mp.msg.info('cut video succeed')
          mp.osd_message('Cut Video Succeed ')
        } else {
          mp.msg.warn('cut video failed')
          mp.osd_message('Cut Video failed ')
        }
      }
    )
  }
  function generateGif() {
    geneRateAnimatedPic(animatePicType.gif, false)
  }
  function generateGifWithSub() {
    geneRateAnimatedPic(animatePicType.gif, true)
  }
  function generateWebp() {
    geneRateAnimatedPic(animatePicType.webp, false)
  }
  function generateWebpWithSub() {
    geneRateAnimatedPic(animatePicType.webp, true)
  }
  mp.add_key_binding('g', 'setStartTime', setStartTime)
  mp.add_key_binding('G', 'setEndTime', setEndTime)
  mp.add_key_binding('Ctrl+g', 'generateGif', generateGif)
  mp.add_key_binding('Ctrl+G', 'generateGifWithSub', generateGifWithSub)
  mp.add_key_binding('Ctrl+w', 'generateWebp', generateWebp)
  mp.add_key_binding('Ctrl+W', 'generateWebpWithSub', generateWebpWithSub)
  mp.add_key_binding('Ctrl+a', 'cutAudio', cutAudio)
  mp.add_key_binding('Ctrl+v', 'cutVideo', cutVideo)
  mp.register_event('file-loaded', initEnvOptions)
})(mp)
