@echo off
echo ============================================
echo  Building DigiPalika Mobile App - Debug APK
echo ============================================
set JAVA_HOME=C:\PROGRA~1\Android\ANDROI~1\jbr
set PATH=%JAVA_HOME%\bin;%PATH%
echo JAVA_HOME=%JAVA_HOME%
java -version
echo.
echo Starting Gradle build...
call gradlew.bat assembleDebug
echo.
if %ERRORLEVEL% EQU 0 (
    echo ============================================
    echo  BUILD SUCCESSFUL!
    echo  APK Location:
    echo  app\build\outputs\apk\debug\app-debug.apk
    echo ============================================
) else (
    echo ============================================
    echo  BUILD FAILED - Check errors above
    echo ============================================
)
