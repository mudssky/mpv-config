function _isPlaceholder(a) {
  return a != null && typeof a === 'object' && a['@@functional/placeholder'] === true;
}

/**
 * Optimized internal one-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */

function _curry1(fn) {
  return function f1(a) {
    if (arguments.length === 0 || _isPlaceholder(a)) {
      return f1;
    } else {
      return fn.apply(this, arguments);
    }
  };
}

/**
 * Optimized internal two-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */

function _curry2(fn) {
  return function f2(a, b) {
    switch (arguments.length) {
      case 0:
        return f2;

      case 1:
        return _isPlaceholder(a) ? f2 : _curry1(function (_b) {
          return fn(a, _b);
        });

      default:
        return _isPlaceholder(a) && _isPlaceholder(b) ? f2 : _isPlaceholder(a) ? _curry1(function (_a) {
          return fn(_a, b);
        }) : _isPlaceholder(b) ? _curry1(function (_b) {
          return fn(a, _b);
        }) : fn(a, b);
    }
  };
}

/**
 * Private `concat` function to merge two array-like objects.
 *
 * @private
 * @param {Array|Arguments} [set1=[]] An array-like object.
 * @param {Array|Arguments} [set2=[]] An array-like object.
 * @return {Array} A new, merged array.
 * @example
 *
 *      _concat([4, 5, 6], [1, 2, 3]); //=> [4, 5, 6, 1, 2, 3]
 */
function _concat(set1, set2) {
  set1 = set1 || [];
  set2 = set2 || [];
  var idx;
  var len1 = set1.length;
  var len2 = set2.length;
  var result = [];
  idx = 0;

  while (idx < len1) {
    result[result.length] = set1[idx];
    idx += 1;
  }

  idx = 0;

  while (idx < len2) {
    result[result.length] = set2[idx];
    idx += 1;
  }

  return result;
}

function _arity(n, fn) {
  /* eslint-disable no-unused-vars */
  switch (n) {
    case 0:
      return function () {
        return fn.apply(this, arguments);
      };

    case 1:
      return function (a0) {
        return fn.apply(this, arguments);
      };

    case 2:
      return function (a0, a1) {
        return fn.apply(this, arguments);
      };

    case 3:
      return function (a0, a1, a2) {
        return fn.apply(this, arguments);
      };

    case 4:
      return function (a0, a1, a2, a3) {
        return fn.apply(this, arguments);
      };

    case 5:
      return function (a0, a1, a2, a3, a4) {
        return fn.apply(this, arguments);
      };

    case 6:
      return function (a0, a1, a2, a3, a4, a5) {
        return fn.apply(this, arguments);
      };

    case 7:
      return function (a0, a1, a2, a3, a4, a5, a6) {
        return fn.apply(this, arguments);
      };

    case 8:
      return function (a0, a1, a2, a3, a4, a5, a6, a7) {
        return fn.apply(this, arguments);
      };

    case 9:
      return function (a0, a1, a2, a3, a4, a5, a6, a7, a8) {
        return fn.apply(this, arguments);
      };

    case 10:
      return function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
        return fn.apply(this, arguments);
      };

    default:
      throw new Error('First argument to _arity must be a non-negative integer no greater than ten');
  }
}

/**
 * Internal curryN function.
 *
 * @private
 * @category Function
 * @param {Number} length The arity of the curried function.
 * @param {Array} received An array of arguments received thus far.
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */

function _curryN(length, received, fn) {
  return function () {
    var combined = [];
    var argsIdx = 0;
    var left = length;
    var combinedIdx = 0;
    var hasPlaceholder = false;

    while (combinedIdx < received.length || argsIdx < arguments.length) {
      var result;

      if (combinedIdx < received.length && (!_isPlaceholder(received[combinedIdx]) || argsIdx >= arguments.length)) {
        result = received[combinedIdx];
      } else {
        result = arguments[argsIdx];
        argsIdx += 1;
      }

      combined[combinedIdx] = result;

      if (!_isPlaceholder(result)) {
        left -= 1;
      } else {
        hasPlaceholder = true;
      }

      combinedIdx += 1;
    }

    return !hasPlaceholder && left <= 0 ? fn.apply(this, combined) : _arity(Math.max(0, left), _curryN(length, combined, fn));
  };
}

/**
 * Returns a curried equivalent of the provided function, with the specified
 * arity. The curried function has two unusual capabilities. First, its
 * arguments needn't be provided one at a time. If `g` is `R.curryN(3, f)`, the
 * following are equivalent:
 *
 *   - `g(1)(2)(3)`
 *   - `g(1)(2, 3)`
 *   - `g(1, 2)(3)`
 *   - `g(1, 2, 3)`
 *
 * Secondly, the special placeholder value [`R.__`](#__) may be used to specify
 * "gaps", allowing partial application of any combination of arguments,
 * regardless of their positions. If `g` is as above and `_` is [`R.__`](#__),
 * the following are equivalent:
 *
 *   - `g(1, 2, 3)`
 *   - `g(_, 2, 3)(1)`
 *   - `g(_, _, 3)(1)(2)`
 *   - `g(_, _, 3)(1, 2)`
 *   - `g(_, 2)(1)(3)`
 *   - `g(_, 2)(1, 3)`
 *   - `g(_, 2)(_, 3)(1)`
 *
 * @func
 * @memberOf R
 * @since v0.5.0
 * @category Function
 * @sig Number -> (* -> a) -> (* -> a)
 * @param {Number} length The arity for the returned function.
 * @param {Function} fn The function to curry.
 * @return {Function} A new, curried function.
 * @see R.curry
 * @example
 *
 *      const sumArgs = (...args) => R.sum(args);
 *
 *      const curriedAddFourNumbers = R.curryN(4, sumArgs);
 *      const f = curriedAddFourNumbers(1, 2);
 *      const g = f(3);
 *      g(4); //=> 10
 */

var curryN =
/*#__PURE__*/
_curry2(function curryN(length, fn) {
  if (length === 1) {
    return _curry1(fn);
  }

  return _arity(length, _curryN(length, [], fn));
});

var curryN$1 = curryN;

/**
 * Returns a new function much like the supplied one, except that the first two
 * arguments' order is reversed.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig ((a, b, c, ...) -> z) -> (b -> a -> c -> ... -> z)
 * @param {Function} fn The function to invoke with its first two parameters reversed.
 * @return {*} The result of invoking `fn` with its first two parameters' order reversed.
 * @example
 *
 *      const mergeThree = (a, b, c) => [].concat(a, b, c);
 *
 *      mergeThree(1, 2, 3); //=> [1, 2, 3]
 *
 *      R.flip(mergeThree)(1, 2, 3); //=> [2, 1, 3]
 * @symb R.flip(f)(a, b, c) = f(b, a, c)
 */

var flip =
/*#__PURE__*/
_curry1(function flip(fn) {
  return curryN$1(fn.length, function (a, b) {
    var args = Array.prototype.slice.call(arguments, 0);
    args[0] = b;
    args[1] = a;
    return fn.apply(this, args);
  });
});

function _createPartialApplicator(concat) {
  return _curry2(function (fn, args) {
    return _arity(Math.max(0, fn.length - args.length), function () {
      return fn.apply(this, concat(args, arguments));
    });
  });
}

/**
 * Takes a function `f` and a list of arguments, and returns a function `g`.
 * When applied, `g` returns the result of applying `f` to the arguments
 * provided to `g` followed by the arguments provided initially.
 *
 * @func
 * @memberOf R
 * @since v0.10.0
 * @category Function
 * @sig ((a, b, c, ..., n) -> x) -> [d, e, f, ..., n] -> ((a, b, c, ...) -> x)
 * @param {Function} f
 * @param {Array} args
 * @return {Function}
 * @see R.partial
 * @example
 *
 *      const greet = (salutation, title, firstName, lastName) =>
 *        salutation + ', ' + title + ' ' + firstName + ' ' + lastName + '!';
 *
 *      const greetMsJaneJones = R.partialRight(greet, ['Ms.', 'Jane', 'Jones']);
 *
 *      greetMsJaneJones('Hello'); //=> 'Hello, Ms. Jane Jones!'
 * @symb R.partialRight(f, [a, b])(c, d) = f(c, d, a, b)
 */

var partialRight =
/*#__PURE__*/
_createPartialApplicator(
/*#__PURE__*/
flip(_concat));

var LogLevelDict = {
    fatal: 1,
    error: 2,
    warn: 3,
    info: 4,
    status: 5,
    debug: 6,
    trace: 7,
};
function parseMsgLevel(msgLevel) {
    var res = {};
    msgLevel.split(',').forEach(function (item) {
        var _a = item.split('='), module = _a[0], level = _a[1];
        res[module] = level;
    });
    return res;
}
var msg_level = mp.get_property('msg-level');
var levelDict = parseMsgLevel(msg_level !== null && msg_level !== void 0 ? msg_level : '');
var DEFAULT_LEVEL = 'status';
/**
 * 获取log级别，是
 * @param moduleName
 * @returns
 */
function getLogLevel(moduleName) {
    var _a;
    if (moduleName === void 0) { moduleName = 'all'; }
    return (_a = levelDict === null || levelDict === void 0 ? void 0 : levelDict[moduleName]) !== null && _a !== void 0 ? _a : DEFAULT_LEVEL;
}
/**
 * 解析传入的msg-level，来判断是否执行dump
 * @param msg
 * @param when
 */
function dumpWhen(msg, when) {
    var script_name = mp.get_script_name();
    var levelName = getLogLevel(script_name);
    var currentLevel = LogLevelDict[levelName];
    var needLevel = LogLevelDict[when];
    if (currentLevel >= needLevel) {
        dump(msg);
    }
}
var dumpWhenDebug = partialRight(dumpWhen, ['debug']);

(function (mp) {
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
        dumpWhenDebug({ userOptions: userOptions, envOptions: envOptions });
    }
    function setStartTime() {
        // mp.get_property_number 用number类型返回参数，这里是失败时返回-1，也可以设置回调函数
        envOptions.startTime = mp.get_property_number('time-pos', -1);
        mp.osd_message("GIF Start: ".concat(envOptions.startTime));
    }
    function setEndTime() {
        envOptions.endTime = mp.get_property_number('time-pos', -1);
        mp.osd_message("GIF End: ".concat(envOptions.endTime));
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
                    envOptions.currentSubFilter = "subtitles='".concat(pathCorrect(currentObj['external-filename']), "':si=0");
                }
                else {
                    envOptions.currentSubFilter = "subtitles='".concat(envOptions.filename, "'");
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
                '-ss',
                "".concat(envOptions.startTime),
                // 拷贝时间戳，因为ffmpeg在seek之后会重置时间戳,也就是说后续的时间戳会从0开始
                '-copyts',
                '-i',
                "".concat(envOptions.filename),
                '-to',
                "".concat(envOptions.endTime),
                '-loop',
                "".concat(userOptions.loop),
                '-vf',
                "fps=".concat(userOptions.fps, ",scale=").concat(userOptions.frameSize, ",").concat(envOptions.currentSubFilter),
                // 重置字幕的时间戳，这样字幕会从截取视频的起始时间开始
                '-ss',
                "".concat(envOptions.startTime),
                "".concat(envOptions.basename, "[").concat(envOptions.startTime.toFixed(), "-").concat(envOptions.endTime.toFixed(), "]").concat(picType),
            ];
        }
        else {
            commands = [
                'ffmpeg',
                '-v',
                'warning',
                '-i',
                "".concat(envOptions.filename),
                '-ss',
                "".concat(envOptions.startTime),
                '-to',
                "".concat(envOptions.endTime),
                '-loop',
                "".concat(userOptions.loop),
                '-vf',
                "fps=".concat(userOptions.fps, ",scale=").concat(userOptions.frameSize),
                "".concat(envOptions.basename, "[").concat(envOptions.startTime.toFixed(), "-").concat(envOptions.endTime.toFixed(), "]").concat(picType),
            ];
        }
        // 对秒数执行四舍五入
        // const commands = `ffmpeg -v warning -i '${envOptions.filename}' -ss ${envOptions.startTime} -to ${envOptions.endTime} -vf "fps=${userOptions.fps},scale=${userOptions.frameSize}" '${envOptions.basename}${picType}' `
        // mp.msg.debug(commands)
        print(commands.join(' '));
        // dumpWhen(commands)
        mp.command_native_async({
            name: 'subprocess',
            // 视频回放进程结束后，不结束子进程
            playback_only: false,
            args: commands,
            // 捕获过程输出到stdout的所有数据，并在过程结束后将其返回
            capture_stdout: true,
        }, function (success, result, err) {
            if (success) {
                mp.msg.info("generate ".concat(picType, ":").concat(envOptions.filename, " succeed"));
                mp.osd_message("generate ".concat(picType, ":").concat(envOptions.filename, " succeed"));
            }
            else {
                mp.msg.warn("generate ".concat(picType, ":").concat(envOptions.filename, " failed"));
                mp.osd_message("generate ".concat(picType, ":").concat(envOptions.filename, " failed"));
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
        dumpWhenDebug(res);
        return res;
    }
    // 添加剪切音频功能
    function cutAudio() {
        // 检查时间是否有误
        if (!validateTime()) {
            return;
        }
        getAudioType();
        // 用mka这种比较通用的容器
        var commands;
        commands = [
            'ffmpeg',
            '-v',
            'warning',
            '-accurate_seek',
            '-i',
            "".concat(envOptions.filename),
            '-ss',
            "".concat(envOptions.startTime),
            '-to',
            "".concat(envOptions.endTime),
            '-vn',
            '-acodec',
            'copy',
            "".concat(envOptions.basename, "[").concat(envOptions.startTime.toFixed(), "-").concat(envOptions.endTime.toFixed(), "].mka"),
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
            '-accurate_seek',
            '-i',
            "".concat(envOptions.filename),
            '-ss',
            "".concat(envOptions.startTime),
            '-to',
            "".concat(envOptions.endTime),
            '-c',
            'copy',
            "".concat(envOptions.basename, "[").concat(envOptions.startTime.toFixed(), "-").concat(envOptions.endTime.toFixed(), "].").concat(getExt(envOptions.filename)),
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
})(mp);
