# vidSmooth
This is an Electron frontend for ffmpeg's vidStab library that takes an input video and outputs a stabilized version in mp4/h264 format.
## Features
- Any codec supported by ffmpeg will be supported as an input video
- Nearly all the settings vidStab takes an input are exposed to the user
- The user has the option to select a portion of the input video and create a stabilized sample before committing to the entire video

### Development Environment Setup
- you must first install Node 12
- `git clone https://github.com/uotw/vidSmooth.git`
- `cd vidSmooth`
- `npm install`
- install ffmpeg, ffprobe static binaries for your OS per [these instructions](https://stackoverflow.com/questions/33152533/bundling-precompiled-binary-into-electron-app/38373289#38373289)
- if on MacOS, install [appswitch](https://github.com/nriley/appswitch) binary per above instructions
npm start
