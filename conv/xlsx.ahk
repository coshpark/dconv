#NoEnv
#SingleInstance off

RetVal:=1

Arg=%1%

Convert(InputFile) 
{
	oEX := ComObjCreate("Excel.Application") 	
	oEX.Application.DisplayAlerts:= false
	oEX.Visible := 0
	SplitPath, InputFile,, OutDir,, OutName
	NewFile := OutDir . "\" . OutName . ".pdf"
	oEX.Workbooks.Open(InputFile, true)
 	oEX.ActiveSheet.ExportAsFixedFormat(0, NewFile)
	oEX.Quit()
	oEX:= ""
}

try
	Convert(Arg)
catch e
{
	RetVal:=0
}

ExitApp %RetVal%
