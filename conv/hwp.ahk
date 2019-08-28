#NoEnv
#SingleInstance off

Gui, Add, Text,, HWP2PDF:
Gui Add, ActiveX, w500  h500 vHWPC, HWPCONTROL.HwpCtrlCtrl.1

Var := HWPC.RegisterModule("FilePathCheckDLL", "FilePathCheckerModule")
InputFile=%1%

SplitPath, InputFile,, OutDir,, OutName
NewFile := OutDir . "\" . OutName . ".pdf"
Var := HWPC.Open(InputFile, "HWP", "")
Var := HWPC.SaveAs(NewFile, "PDF", "")
Gui, Show, w640 h480, Window

RetVal:=1

; FIXME: 
; Couldn't return the right value. 
; I guess it's beacuse of the bug of hwp contorl.
ExitApp %RetVal%  

return 
