// 避免全局变量污染

import { dumpWhen, dumpWhenDebug } from './utils'

// 虽然看文档mpv好像是能避免全局变量污染的
;(function (mp) {
  const userConfig = {}

  function onFileLoaded() {
    const envProperty = {
      currentFileFormat: mp.get_property('file-format'),
      filename: mp.get_property('filename'),
      dir: mp.get_property('working-directory'),
      logLevel: mp.get_property('msg-level'),
      loopFile: mp.get_property('loop-file'),
    }
    mp.osd_message('loop mode')
    mp.set_property('loop-file', 'inf')
    dumpWhenDebug({ envProperty })
  }

  mp.register_event('file-loaded', onFileLoaded)
  // mp.add_key_binding('Ctrl+v', 'cutVideo', cutVideo)
})(mp)
