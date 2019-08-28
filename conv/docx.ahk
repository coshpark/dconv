#NoEnv
#SingleInstance off

RetVal:=1

Arg=%1%

Convert(InputFile) 
{
 	oWord := ComObjCreate("Word.Application") 	
	SplitPath, InputFile,, OutDir,, OutName
	NewFile := OutDir . "\" . OutName . ".pdf"
	oWord.Documents.Open(InputFile,,,,,,,,,,, 0) ;
	oWord.Documents(InputFile).Activate 
	oWord.ActiveDocument.ExportAsFixedFormat(NewFile, 17, 0, 0)
	oWord.ActiveDocument.Close(0)
	oWord.Quit(0)
	oWord:= ""
}

try
	Convert(Arg)
catch e
	RetVal:=0

ExitApp %RetVal%
