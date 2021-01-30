const fs = require('fs')
const path = require('path')
const { ipcRenderer } = require('electron')
window.require=require
window.ipcRenderer = ipcRenderer
