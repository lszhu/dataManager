Dim array1(100) '①100表示该文件夹最多的文件数，如果文件数大于100请自行修改
Dim source(100) '①100表示该文件夹最多的文件数，如果文件数大于100请自行修改
Set fs = CreateObject("Scripting.FileSystemObject")
Set f = fs.GetFolder(left(Wscript.ScriptFullName,len(Wscript.ScriptFullName)-len(Wscript.ScriptName))) '②此处表示xls所在的文件夹，请根据需要自行修改
Set fc = f.Files
i = 0
For Each f1 In fc
    array1(i) = f1.Name
    Ext = fs.GetExtensionName(array1(i))
    Ext = LCase(Ext)
    If Ext = "xls" Then '③此处表示转换类型
        source(i) = f & "\" & array1(i)
        Set ExcelApp = CreateObject("Excel.Application")
        Set ExcelXls = ExcelApp.Workbooks.Open(source(i))
        ExcelXls.SaveAs source(i) & "x",51
        ExcelXls.Close
        Set ExcelXls = Nothing
        ExcelApp.Quit
        Set ExcelApp = Nothing
    End If
    i = i + 1
Next