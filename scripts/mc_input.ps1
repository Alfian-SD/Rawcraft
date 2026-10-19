param(
    [string]$Action = "f3",
    [string]$ActionText = "",
    [int]$Dx = 0,
    [int]$Dy = 0,
    [int]$HoldMs = 100
)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

public class MCInput {
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern uint SendInput(uint nInputs, [MarshalAs(UnmanagedType.LPArray), In] INPUT[] pInputs, int cbSize);

    [StructLayout(LayoutKind.Sequential)]
    public struct INPUT {
        public uint type;
        public MOUSEKEYBDHARDWAREINPUT mkhi;
    }

    [StructLayout(LayoutKind.Explicit)]
    public struct MOUSEKEYBDHARDWAREINPUT {
        [FieldOffset(0)]
        public MOUSEINPUT mi;
        [FieldOffset(0)]
        public KEYBDINPUT ki;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct MOUSEINPUT {
        public int dx;
        public int dy;
        public uint mouseData;
        public uint dwFlags;
        public uint time;
        public IntPtr dwExtraInfo;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct KEYBDINPUT {
        public ushort wVk;
        public ushort wScan;
        public uint dwFlags;
        public uint time;
        public IntPtr dwExtraInfo;
    }

    public const uint INPUT_MOUSE = 0;
    public const uint INPUT_KEYBOARD = 1;
    public const uint KEYEVENTF_SCANCODE = 0x0008;
    public const uint KEYEVENTF_KEYUP = 0x0002;
    public const uint MOUSEEVENTF_MOVE = 0x0001;
    public const uint MOUSEEVENTF_LEFTDOWN = 0x0002;
    public const uint MOUSEEVENTF_LEFTUP = 0x0004;

    public static void SendKeyScan(ushort scanCode, bool keyUp) {
        INPUT[] inputs = new INPUT[1];
        inputs[0].type = INPUT_KEYBOARD;
        inputs[0].mkhi.ki.wVk = 0;
        inputs[0].mkhi.ki.wScan = scanCode;
        inputs[0].mkhi.ki.dwFlags = KEYEVENTF_SCANCODE | (keyUp ? KEYEVENTF_KEYUP : 0);
        inputs[0].mkhi.ki.time = 0;
        inputs[0].mkhi.ki.dwExtraInfo = IntPtr.Zero;
        SendInput(1, inputs, Marshal.SizeOf(typeof(INPUT)));
    }

    public static void MouseMove(int dx, int dy) {
        INPUT[] inputs = new INPUT[1];
        inputs[0].type = INPUT_MOUSE;
        inputs[0].mkhi.mi.dx = dx;
        inputs[0].mkhi.mi.dy = dy;
        inputs[0].mkhi.mi.dwFlags = MOUSEEVENTF_MOVE;
        inputs[0].mkhi.mi.time = 0;
        inputs[0].mkhi.mi.dwExtraInfo = IntPtr.Zero;
        SendInput(1, inputs, Marshal.SizeOf(typeof(INPUT)));
    }

    public static void MouseClick(bool isDown) {
        INPUT[] inputs = new INPUT[1];
        inputs[0].type = INPUT_MOUSE;
        inputs[0].mkhi.mi.dx = 0;
        inputs[0].mkhi.mi.dy = 0;
        inputs[0].mkhi.mi.dwFlags = isDown ? MOUSEEVENTF_LEFTDOWN : MOUSEEVENTF_LEFTUP;
        inputs[0].mkhi.mi.time = 0;
        inputs[0].mkhi.mi.dwExtraInfo = IntPtr.Zero;
        SendInput(1, inputs, Marshal.SizeOf(typeof(INPUT)));
    }

    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
    [DllImport("user32.dll")]
    public static extern bool EnumWindows(EnumWindowsProc enumProc, IntPtr lParam);
    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    public static extern int GetWindowText(IntPtr hWnd, System.Text.StringBuilder lpString, int nMaxCount);
    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr hWnd);

    public static IntPtr FindMinecraftWindow() {
        IntPtr found = IntPtr.Zero;
        EnumWindows((hWnd, lParam) => {
            if (!IsWindowVisible(hWnd)) return true;
            System.Text.StringBuilder sb = new System.Text.StringBuilder(256);
            GetWindowText(hWnd, sb, 256);
            string title = sb.ToString();
            if (title.StartsWith("Minecraft")) {
                found = hWnd;
                return false;
            }
            return true;
        }, IntPtr.Zero);
        return found;
    }
}
'@

$hwnd = [MCInput]::FindMinecraftWindow()
if ($hwnd -eq [IntPtr]::Zero) {
    $proc = Get-Process -Name java -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($proc) {
        $hwnd = $proc.MainWindowHandle
    }
}

if ($hwnd -ne [IntPtr]::Zero) {
    [MCInput]::SetForegroundWindow($hwnd) | Out-Null
    Write-Output "Focused window HWND: $hwnd"
} else {
    Write-Warning "No Minecraft window found to focus"
}
Start-Sleep -Milliseconds 100

switch ($Action.ToLower()) {
    "f3" {
        # Scan code for F3 is 0x3D
        [MCInput]::SendKeyScan(0x3D, $false)
        Start-Sleep -Milliseconds 50
        [MCInput]::SendKeyScan(0x3D, $true)
        Write-Output "Toggled F3"
    }
    "screenshot" {
        # Scan code for F2 is 0x3C
        [MCInput]::SendKeyScan(0x3C, $false)
        Start-Sleep -Milliseconds 50
        [MCInput]::SendKeyScan(0x3C, $true)
        Write-Output "Took in-game screenshot (F2)"
    }
    "rightshift" {
        # Scan code for Right Shift is 0x36
        [MCInput]::SendKeyScan(0x36, $false)
        Start-Sleep -Milliseconds 50
        [MCInput]::SendKeyScan(0x36, $true)
        Write-Output "Pressed Right Shift"
    }
    "esc" {
        # Scan code for Escape is 0x01
        [MCInput]::SendKeyScan(0x01, $false)
        Start-Sleep -Milliseconds 50
        [MCInput]::SendKeyScan(0x01, $true)
        Write-Output "Pressed ESC"
    }
    "look" {
        [MCInput]::MouseMove($Dx, $Dy)
        Write-Output "Mouse look: dx=$Dx, dy=$Dy"
    }
    "forward" {
        # Scan code for W is 0x11
        [MCInput]::SendKeyScan(0x11, $false)
        Start-Sleep -Milliseconds $HoldMs
        [MCInput]::SendKeyScan(0x11, $true)
        Write-Output "Walked forward for $HoldMs ms"
    }
    "jump" {
        # Scan code for Space is 0x39
        [MCInput]::SendKeyScan(0x39, $false)
        Start-Sleep -Milliseconds 150
        [MCInput]::SendKeyScan(0x39, $true)
        Write-Output "Jumped"
    }
    "break" {
        # Hold left click
        [MCInput]::MouseClick($true)
        Start-Sleep -Milliseconds $HoldMs
        [MCInput]::MouseClick($false)
        Write-Output "Held left click for $HoldMs ms"
    }
    "chat" {
        # Scan code for T is 0x14, Slash is 0x35, Return is 0x1C
        [MCInput]::SendKeyScan(0x35, $false) # /
        Start-Sleep -Milliseconds 50
        [MCInput]::SendKeyScan(0x35, $true)
        Start-Sleep -Milliseconds 150

        # Type command text
        [System.Windows.Forms.SendKeys]::SendWait("$ActionText{ENTER}")
        Write-Output "Sent chat command: $ActionText"
    }
    default {
        Write-Output "Unknown action: $Action"
    }
}
