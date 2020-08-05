# vidSmooth
This is an [Electron app](https://electronjs.org/) written as a frontend for [ffmpeg](https://www.ffmpeg.org/) using the new [vid.Stab](https://github.com/georgmartius/vid.stab) library. vidSmooth takes an input video and outputs a stabilized version in high quality mp4/h264 format.

## Install (0.0.0.2)
Download and install for your OS:
- [MacOS](https://www.sonoclipshare.com/vidSmooth/vidSmooth.v0.0.2.Installer.dmg) (dmg, 140MB)
- [Windows](https://www.sonoclipshare.com/vidSmooth/vidSmooth.v0.0.3.installer.exe) (exe, 96 MB)

## Features
- Any codec supported by ffmpeg will be supported as an input video (mp4, m4v, avi, wmv, mov, flv, mpg, mpeg, gif)
- Most settings vidStab uses as input are exposed to the user
     *   accuracy  
     *   shakiness  
     *   smoothing  
     *   maxshift  
     *   maxangle  
     *   crop method  
     *   camera path  
     *   tripod mode
- The user has the option to select a portion of the input video and create a stabilized sample before committing to the entire video

## Issues
- By nature of any smoothing algorithm, often the frame will have to zoomed / cropped to produce a consistently smoothed video. As this is the case, a higher resolution video will give a better result
- When creating a sample clip, the progress bar only updates on 33%, 66% and 100%. If a long clip is selected or the client machine is slow, the user might think nothing is happening when it actually is.
- Occasionally ffmpeg will choke on a video input type, but since there is no error control built into this app, it will just stop responding
- When the smoothing settings are too agressive, vid.Stab will 1) over-crop a large portion of the video an/or 2) introduce edge artifacts in an attempt to interpolate video data
- If tripod mode is set to on, but the input video pans away from a subject, the result is that the edge pixels get smeared across the video and no further useful video will be displayed 
- Dramtically shaking videos that are heavily smoothed can have a *jello effect*, depending on the type of sensor used in shooting the footage 

## Development Environment
- you must first [install Node 12](https://nodejs.org/en/download/)
- `git clone https://github.com/uotw/vidSmooth.git`
- `cd vidSmooth`
- `npm install`
- `npm start`
