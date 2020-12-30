/**
 * Copyright (c) 2014 The xterm.js authors. All rights reserved.
 * Copyright (c) 2012-2013, Christopher Jeffrey (MIT License)
 * @license MIT
 */
import type { IKeyboardEvent, IKeyboardResult } from 'teratermen';
const enum KeyboardResultType {
  SEND_KEY,
  SELECT_ALL,
  PAGE_UP,
  PAGE_DOWN
}
export namespace C0 {
  /** Null (Caret = ^@, C = \0) */
  export const NUL = '\x00';
  /** Start of Heading (Caret = ^A) */
  export const SOH = '\x01';
  /** Start of Text (Caret = ^B) */
  export const STX = '\x02';
  /** End of Text (Caret = ^C) */
  export const ETX = '\x03';
  /** End of Transmission (Caret = ^D) */
  export const EOT = '\x04';
  /** Enquiry (Caret = ^E) */
  export const ENQ = '\x05';
  /** Acknowledge (Caret = ^F) */
  export const ACK = '\x06';
  /** Bell (Caret = ^G, C = \a) */
  export const BEL = '\x07';
  /** Backspace (Caret = ^H, C = \b) */
  export const BS  = '\x08';
  /** Character Tabulation, Horizontal Tabulation (Caret = ^I, C = \t) */
  export const HT  = '\x09';
  /** Line Feed (Caret = ^J, C = \n) */
  export const LF  = '\x0a';
  /** Line Tabulation, Vertical Tabulation (Caret = ^K, C = \v) */
  export const VT  = '\x0b';
  /** Form Feed (Caret = ^L, C = \f) */
  export const FF  = '\x0c';
  /** Carriage Return (Caret = ^M, C = \r) */
  export const CR  = '\x0d';
  /** Shift Out (Caret = ^N) */
  export const SO  = '\x0e';
  /** Shift In (Caret = ^O) */
  export const SI  = '\x0f';
  /** Data Link Escape (Caret = ^P) */
  export const DLE = '\x10';
  /** Device Control One (XON) (Caret = ^Q) */
  export const DC1 = '\x11';
  /** Device Control Two (Caret = ^R) */
  export const DC2 = '\x12';
  /** Device Control Three (XOFF) (Caret = ^S) */
  export const DC3 = '\x13';
  /** Device Control Four (Caret = ^T) */
  export const DC4 = '\x14';
  /** Negative Acknowledge (Caret = ^U) */
  export const NAK = '\x15';
  /** Synchronous Idle (Caret = ^V) */
  export const SYN = '\x16';
  /** End of Transmission Block (Caret = ^W) */
  export const ETB = '\x17';
  /** Cancel (Caret = ^X) */
  export const CAN = '\x18';
  /** End of Medium (Caret = ^Y) */
  export const EM  = '\x19';
  /** Substitute (Caret = ^Z) */
  export const SUB = '\x1a';
  /** Escape (Caret = ^[, C = \e) */
  export const ESC = '\x1b';
  /** File Separator (Caret = ^\) */
  export const FS  = '\x1c';
  /** Group Separator (Caret = ^]) */
  export const GS  = '\x1d';
  /** Record Separator (Caret = ^^) */
  export const RS  = '\x1e';
  /** Unit Separator (Caret = ^_) */
  export const US  = '\x1f';
  /** Space */
  export const SP  = '\x20';
  /** Delete (Caret = ^?) */
  export const DEL = '\x7f';
}


// reg + shift key mappings for digits and special chars
const KEYCODE_KEY_MAPPINGS: { [key: number]: [string, string]} = {
  // digits 0-9
  48: ['0', ')'],
  49: ['1', '!'],
  50: ['2', '@'],
  51: ['3', '#'],
  52: ['4', '$'],
  53: ['5', '%'],
  54: ['6', '^'],
  55: ['7', '&'],
  56: ['8', '*'],
  57: ['9', '('],

  // special chars
  186: [';', ':'],
  187: ['=', '+'],
  188: [',', '<'],
  189: ['-', '_'],
  190: ['.', '>'],
  191: ['/', '?'],
  192: ['`', '~'],
  219: ['[', '{'],
  220: ['\\', '|'],
  221: [']', '}'],
  222: ['\'', '"']
};

export function evaluateKeyboardEvent(
  ev: IKeyboardEvent,
  applicationCursorMode: boolean,
  isMac: boolean,
  macOptionIsMeta: boolean
): IKeyboardResult {
  const result: IKeyboardResult = {
    type: KeyboardResultType.SEND_KEY,
    // Whether to cancel event propagation (NOTE: this may not be needed since the event is
    // canceled at the end of keyDown
    cancel: false,
    // The new key even to emit
    key: undefined
  };
  const modifiers = (ev.shiftKey ? 1 : 0) | (ev.altKey ? 2 : 0) | (ev.ctrlKey ? 4 : 0) | (ev.metaKey ? 8 : 0);
  const keyResultMap = {
    UIKeyInputUpArrow:{
      applicationCursorMode:'OA',
      notApplicationCursorMode:'[A',
    },
    UIKeyInputLeftArrow:{
      applicationCursorMode:'OD',
      notApplicationCursorMode:'[D',
    },
    UIKeyInputRightArrow:{
      applicationCursorMode:'OC',
      notApplicationCursorMode:'[C',
    },
    UIKeyInputDownArrow:{
      applicationCursorMode:'OB',
      notApplicationCursorMode:'[B',
    },
  }
  type direction = "up" | "left" | "right" | "down"
  function resultArrowKey(result:IKeyboardResult, arrow:direction){
    const leftRightOrUpDown = (arrow === "left" || arrow === "right") ? "leftRight" : "upDown"
    const ABCD = 
      arrow === "up" ? "A" :
      arrow === "left" ? "D" :
      arrow === "right" ? "C" :
      arrow === "down" ? "B" : ""
    if (leftRightOrUpDown === "leftRight") {
      if (isMac) {
        result.key = C0.ESC + arrow === "left" ? 'b' : 'f';
      } else {
        result.key = C0.ESC + '[1;5' + ABCD;
      }
    } else if (leftRightOrUpDown === "upDown") {
      if (!isMac) {
        result.key = C0.ESC + '[1;5' + ABCD;
      }
    }
  }
  const functionKeyMap ={
    112:{
      leftValue  :'[1;' ,
      rightValue : 'P'  ,
      noModifiers:'OP'  ,
      },
      113:{
      leftValue  :'[1;' ,
      rightValue : 'Q'  ,
      noModifiers:'OQ'  ,
      },
      114:{
      leftValue  :'[1;' ,
      rightValue : 'R'  ,
      noModifiers:'OR'  ,
      },
      115:{
      leftValue  :'[1;' ,
      rightValue : 'S'  ,
      noModifiers:'OS'  ,
      },
      116:{
      leftValue  :'[15;', 
      rightValue : '~'  ,
      noModifiers:'[15~',
      },
      117:{
      leftValue  :'[17;', 
      rightValue : '~'  ,
      noModifiers:'[17~',
      },
      118:{
      leftValue  :'[18;', 
      rightValue : '~'  ,
      noModifiers:'[18~',
      },
      119:{
      leftValue  :'[19;', 
      rightValue : '~'  ,
      noModifiers:'[19~',
      },
      120:{
      leftValue  :'[20;', 
      rightValue : '~'  ,
      noModifiers:'[20~',
      },
      121:{
      leftValue  :'[21;', 
      rightValue : '~'  ,
      noModifiers:'[21~',
      },
      122:{
      leftValue  :'[23;', 
      rightValue : '~'  ,
      noModifiers:'[23~',
      },
      123:{
      leftValue  :'[24;', 
      rightValue : '~'  ,
      noModifiers:'[24~',
      },        
  }
function f1tof12(keyCode:number, modifiers:number){
    if(modifiers) return functionKeyMap["" + keyCode].leftValue + (modifiers + 1) + functionKeyMap[keyCode].rightValue
    else return functionKeyMap["" + keyCode].noModifiers
  }

  switch (ev.keyCode) {
    case 0:
      if (Object.keys(keyResultMap).includes(ev.key)) {
        result.key = C0.ESC + keyResultMap[ev.key][applicationCursorMode ? 'applicationCursorMode' : 'notApplicationCursorMode'];
      }
      break;
    case 8:
      // backspace
      if (ev.shiftKey) {
        result.key = C0.BS; // ^H
        break;
      } else if (ev.altKey) {
        result.key = C0.ESC + C0.DEL; // \e ^?
        break;
      }
      result.key = C0.DEL; // ^?
      break;
    case 9:
      // tab
      if (ev.shiftKey) {
        result.key = C0.ESC + '[Z';
        break;
      }
      result.key = C0.HT;
      result.cancel = true;
      break;
    case 13:
      // return/enter
      result.key = ev.altKey ? C0.ESC + C0.CR : C0.CR;
      result.cancel = true;
      break;
    case 27:
      // escape
      result.key = C0.ESC;
      if (ev.altKey) {
        result.key = C0.ESC + C0.ESC;
      }
      result.cancel = true;
      break;
    case 37:
      // left-arrow
    case 39:
      // right-arrow
    case 38:
      // up-arrow
    case 40:
      // down-arrow
      if (ev.metaKey) {
        break;
      }
      const ABCD = 'DACB'[ev.keyCode-37]
      if (modifiers) {
        result.key = C0.ESC + '[1;' + (modifiers + 1) + ABCD;
        // HACK: Make Alt + left-arrow behave like Ctrl + left-arrow: move one word backwards
        // HACK: Make Alt + right-arrow behave like Ctrl + right-arrow: move one word forward
        // HACK: Make Alt + up-arrow behave like Ctrl + up-arrow
        // HACK: Make Alt + down-arrow behave like Ctrl + down-arrow
        // http://unix.stackexchange.com/a/108106
        // macOS uses different escape sequences than linux
        if (result.key === C0.ESC + '[1;3' + ABCD) {
          const arrow =  
          ABCD  === "A" ? "up" :
          ABCD === "D" ? "left" :
          ABCD === "C" ? "right" :
          ABCD === "B" ? "down" : null
          resultArrowKey(result, arrow)
        }
      } else {
        const keyInput = {
          "A" : "UIKeyInputUpArrow",
          "B" : "UIKeyInputDownArrow",
          "C" : "UIKeyInputRightArrow",
          "D" : "UIKeyInputLeftArrow",
        }
        
        result.key = C0.ESC + keyResultMap[keyInput[ABCD]][applicationCursorMode ? 'applicationCursorMode' : 'notApplicationCursorMode'];
      }
      break;
    case 45:
      // insert
      if (!ev.shiftKey && !ev.ctrlKey) {
        // <Ctrl> or <Shift> + <Insert> are used to
        // copy-paste on some systems.
        result.key = C0.ESC + '[2~';
      }
      break;
    case 46:
      // delete
      if (modifiers) {
        result.key = C0.ESC + '[3;' + (modifiers + 1) + '~';
      } else {
        result.key = C0.ESC + '[3~';
      }
      break;
    case 36:
      // home
    case 35:
      // end
      const homeOrEnd= ev.keyCode === 36 ? 'home' : 'end'
      if (modifiers) {
        result.key = C0.ESC + '[1;' + (modifiers + 1) + (homeOrEnd==='home' ? 'H' : 'F');
      } else if (applicationCursorMode) {
        result.key = C0.ESC + (homeOrEnd==='home' ? 'OH' : 'OF');
      } else {
        result.key = C0.ESC + (homeOrEnd==='home' ? '[H' : '[F');
      }
      break;
    case 33:
      // page up
    case 34:
      // page down
      const upOrDown= ev.keyCode === 33 ? 'up' : 'down'
      if (ev.shiftKey) {
        result.type = upOrDown === 'up' ? KeyboardResultType.PAGE_UP : KeyboardResultType.PAGE_DOWN;
      } else {
        result.key = C0.ESC + (upOrDown === 'up' ? '[5~' : '[6~');
      }
      break;
    case 112:
    case 113:
    case 114:
    case 115:
    case 116:
    case 117:
    case 118:
    case 119:
    case 120:
    case 121:
    case 122:
    case 123:
      // F1-F12
      result.key = f1tof12(ev.keyCode, modifiers)
      break;
    default:
      // a-z and space
      if (ev.ctrlKey && !ev.shiftKey && !ev.altKey && !ev.metaKey) {
        if (ev.keyCode >= 65 && ev.keyCode <= 90) {
          result.key = String.fromCharCode(ev.keyCode - 64);
        } else if (ev.keyCode === 32) {
          result.key = C0.NUL;
        } else if (ev.keyCode >= 51 && ev.keyCode <= 55) {
          // escape, file sep, group sep, record sep, unit sep
          result.key = String.fromCharCode(ev.keyCode - 51 + 27);
        } else if (ev.keyCode === 56) {
          result.key = C0.DEL;
        } else if (ev.keyCode === 219) {
          result.key = C0.ESC;
        } else if (ev.keyCode === 220) {
          result.key = C0.FS;
        } else if (ev.keyCode === 221) {
          result.key = C0.GS;
        }
      } else if ((!isMac || macOptionIsMeta) && ev.altKey && !ev.metaKey) {
        // On macOS this is a third level shift when !macOptionIsMeta. Use <Esc> instead.
        const keyMapping = KEYCODE_KEY_MAPPINGS[ev.keyCode];
        const key = keyMapping && keyMapping[!ev.shiftKey ? 0 : 1];
        if (key) {
          result.key = C0.ESC + key;
        } else if (ev.keyCode >= 65 && ev.keyCode <= 90) {
          const keyCode = ev.ctrlKey ? ev.keyCode - 64 : ev.keyCode + 32;
          result.key = C0.ESC + String.fromCharCode(keyCode);
        }
      } else if (isMac && !ev.altKey && !ev.ctrlKey && ev.metaKey) {
        if (ev.keyCode === 65) { // cmd + a
          result.type = KeyboardResultType.SELECT_ALL;
        }
      } else if (ev.key && !ev.ctrlKey && !ev.altKey && !ev.metaKey && ev.keyCode >= 48 && ev.key.length === 1) {
        // Include only keys that that result in a _single_ character; don't include num lock, volume up, etc.
        result.key = ev.key;
      } else if (ev.key && ev.ctrlKey) {
        if (ev.key === '_') { // ^_
          result.key = C0.US;
        }
      }
      break;
  }

  return result;
}
