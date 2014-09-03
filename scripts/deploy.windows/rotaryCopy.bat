if not exist J: net use J: \\10.142.113.99\hrSysDataBackup woshinibaba2210726 /user:administrator
ping -n 5 localhost > nul
"C:\Program Files\nodejs\node.exe" D:\hrSys\hrSys.LanShan\rotaryCopy.js
:ping -n 600 localhost > nul
:net use J: /delete