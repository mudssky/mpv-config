import { partialRight } from 'ramda'
const LogLevelDict = {
  fatal: 1,
  error: 2,
  warn: 3,
  info: 4,
  status: 5,
  debug: 6,
  trace: 7,
} as const

export type LogLevel = keyof typeof LogLevelDict

export function parseMsgLevel(msgLevel: string) {
  const res: { [key: string]: string } = {}
  msgLevel.split(',').forEach((item) => {
    const [module, level] = item.split('=')
    res[module] = level
  })
  return res
}

const msg_level = mp.get_property('msg-level')
const levelDict = parseMsgLevel(msg_level ?? '')
const DEFAULT_LEVEL: LogLevel = 'status'
/**
 * 获取log级别，是
 * @param moduleName
 * @returns
 */
export function getLogLevel(moduleName: string = 'all') {
  return (levelDict?.[moduleName] as LogLevel) ?? DEFAULT_LEVEL
}
/**
 * 解析传入的msg-level，来判断是否执行dump
 * @param msg
 * @param when
 */
export function dumpWhen(msg: any, when: LogLevel) {
  const script_name = mp.get_script_name()
  const levelName = getLogLevel(script_name)
  const currentLevel = LogLevelDict[levelName]
  const needLevel = LogLevelDict[when]
  if (currentLevel >= needLevel) {
    dump(msg)
  }
}

export const dumpWhenDebug = partialRight(dumpWhen, ['debug'])
