$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$artDir = "C:\Users\Dell\.gemini\antigravity-ide\brain\003f00d0-7676-492b-bdc7-b42b82deb4f5"

# 1. School 37
$p1 = "$env:TEMP\edge_p1"
& $edge --headless --disable-gpu --user-data-dir="$p1" --window-size=1280,1100 --screenshot="$artDir\school_37_detail_page.png" "http://localhost:8080/schools/37"
Start-Sleep -Seconds 1

# 2. Health Facility H_01
$p2 = "$env:TEMP\edge_p2"
& $edge --headless --disable-gpu --user-data-dir="$p2" --window-size=1280,1100 --screenshot="$artDir\health_h01_detail_page.png" "http://localhost:8080/facilities/h_01"
Start-Sleep -Seconds 1

# 3. Ward Office W_04
$p3 = "$env:TEMP\edge_p3"
& $edge --headless --disable-gpu --user-data-dir="$p3" --window-size=1280,1100 --screenshot="$artDir\ward_w04_detail_page.png" "http://localhost:8080/facilities/w_04"
Start-Sleep -Seconds 1

# 4. Tourism Landmark T_01
$p4 = "$env:TEMP\edge_p4"
& $edge --headless --disable-gpu --user-data-dir="$p4" --window-size=1280,1100 --screenshot="$artDir\tourism_t01_detail_page.png" "http://localhost:8080/facilities/t_01"
Start-Sleep -Seconds 1

Get-ChildItem "$artDir\*detail_page.png" | Select-Object Name, Length, LastWriteTime
