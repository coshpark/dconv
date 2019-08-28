#NoEnv
#SingleInstance off

RetVal:=1

Arg=%1%

Convert(InputFile) 
{
	oPPT := ComObjCreate("PowerPoint.Application") 	
	SplitPath, InputFile,, OutDir,, OutName
	NewFile := OutDir . "\" . OutName . ".pdf"
	pptPresentation := oPPT.Presentations.Open(InputFile)
	pptPresentation.SaveAs(NewFile, ppSaveAsPDF := 32)
	oPPT.Quit()
	oPPT:= ""
}

try
	Convert(Arg)
catch e
{
	RetVal:=0
}

ExitApp %RetVal%
