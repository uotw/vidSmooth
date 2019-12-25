# vidSmooth
This is an Electron frontend for ffmpeg's vidStab library that takes an input video and outputs a stabilized version in mp4/h264 format.
## Features
- Any codec supported by ffmpeg will be supported as an input video
- Nearly all the settings vidStab takes an input are exposed to the user
     *   accuracy  
     *   shakiness  
     *   smoothing  
     *   maxshift  
     *   maxangle  
     *   crop method  
     *   camera path  
     *   tripod mode
- The user has the option to select a portion of the input video and create a stabilized sample before committing to the entire video

### Development Environment Setup
- you must first [install Node 12](https://nodejs.org/en/download/)
- `git clone https://github.com/uotw/vidSmooth.git`
- `cd vidSmooth`
- `npm install`
- install ffmpeg, ffprobe static binaries for your OS ([[MacOS](https://evermeet.cx/ffmpeg/)][[Windows](https://ffbinaries.com/downloads)]) per [these instructions](https://stackoverflow.com/questions/33152533/bundling-precompiled-binary-into-electron-app/38373289#38373289)  - make sure they are compiled with at least h264 and vidStab
- if on MacOS, install [appswitch](https://github.com/nriley/appswitch) binary per above instructions
- `npm start`
