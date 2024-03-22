// 避免全局变量污染

import { dumpWhenDebug } from './utils'

// 虽然看文档mpv好像是能避免全局变量污染的
;(function (mp) {
  const userConfig = {
    durationLimit: 60 * 6, //这里我们把小于6分钟当作音乐和短视频，默认循环播放
  }

  function onFileLoaded() {
    const envProperty = {
      currentFileFormat: mp.get_property('file-format'),
      filename: mp.get_property('filename'),
      duration: mp.get_property('duration') ?? '1000000', //不知道长度就设置一个比较大的值
    }

    if (parseFloat(envProperty.duration) < userConfig.durationLimit) {
      mp.msg.debug('时长小于6分钟，单文件循环播放')
      dumpWhenDebug({ envProperty })
      mp.set_property('loop-file', 'inf')
    }
  }

  mp.register_event('file-loaded', onFileLoaded)
})(mp)
