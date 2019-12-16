sudo rm -rf vidSmooth-darwin-x64/
electron-packager . "vidSmooth" --platform=darwin --arch=x64 --icon="/Users/ben/Desktop/stabApp/vidStab/icon.icns" --overwrite
#cp icon.icns SonoClipShare\ Uploader-darwin-x64/SonoClipShare\ Uploader.app/Contents/Resources/electron.icns
open vidSmooth-darwin-x64
