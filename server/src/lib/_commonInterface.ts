// pathから拝借
import * as fs from 'fs'

interface ParsedPath {
    /**
     * The root of the path such as '/' or 'c:\'
     */
    root: string;
    /**
     * The full directory path such as '/home/user/dir' or 'c:\path\dir'
     */
    dir: string;
    /**
     * The file name including extension (if any) such as 'index.html'
     */
    base: string;
    /**
     * The file extension (if any) such as '.html'
     */
    ext: string;
    /**
     * The file name without extension (if any) such as 'index'
     */
    name: string;
}

type LogOption= Log | logOptionTier1

interface Logger{
//    disable
    path:string
    encording:string
    client:logOptionTier2
    host:logOptionTier2
}

interface LoggerDevice{
    path:string
    encording:string
    binary:logOptionTier3
    text:logOptionTier3
}

type LoggerDeviceMode=logOptionTier4

interface LoggerDeviceModeFullpath{
    encording:string
    fullpath:string
}
interface LoggerDeviceModeFile{
    encording:string
    dir:string
    name:string
}
interface LoggerDeviceModeFileWithExtension{
    encording:string
    dir:string
    base:string
    extenstion:string
}

export interface Log{
    bin:fs.WriteStream|null
    txt:fs.WriteStream|null
}

interface LogType{
    binary:boolean
    text:boolean
}

interface logIsEnable {
    client:boolean|LogType
    host:boolean|LogType
}

type logOptionTier1=IsLoggerEnable | Logger
type logOptionTier2=IsLoggerDeviceEnable | LoggerDevice
type logOptionTier3=IsLoggerDeviceModeEnable | LoggerDeviceMode
type logOptionTier4=LoggerDeviceModeFullpath |LoggerDeviceModeFile | LoggerDeviceModeFileWithExtension
type IsLoggerEnable=boolean
type IsLoggerDeviceEnable=boolean
type IsLoggerDeviceModeEnable=boolean

interface config{
    host:string
    username:string
    password:string
    timeout: Number
    ondata():void
}

export interface ConfigOption {
  host: string
  hostname?:string
  port?: string
  username?: string
  password?: string
  ondata():void
}

export interface ConnectOption extends ConfigOption{
  protocol:string
}
