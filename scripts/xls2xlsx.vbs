Dim array1(100) '��100��ʾ���ļ��������ļ���������ļ�������100�������޸�
Dim source(100) '��100��ʾ���ļ��������ļ���������ļ�������100�������޸�
Set fs = CreateObject("Scripting.FileSystemObject")
Set f = fs.GetFolder(left(Wscript.ScriptFullName,len(Wscript.ScriptFullName)-len(Wscript.ScriptName))) '�ڴ˴���ʾxls���ڵ��ļ��У��������Ҫ�����޸�
Set fc = f.Files
i = 0
For Each f1 In fc
    array1(i) = f1.Name
    Ext = fs.GetExtensionName(array1(i))
    Ext = LCase(Ext)
    If Ext = "xls" Then '�۴˴���ʾת������
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