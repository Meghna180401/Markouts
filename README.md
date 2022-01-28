# Markouts : Map Your Workouts !
## -- Ongoing --

## Description
This is an interactive,dynamic map based web-application to note important details of one's outdoor workouts, using Geolocation API and Leaflet JS Library.

The primary features provided by this web-app :
- It loads the map at user's current location and uses system date for all workout entries.
- User can click on the destination location in the map to get details about distance,time and routes upto the destination location (Implemented using Leaflet Routing Machine).
- Each workout entry contains details of the type of workout,date,distance covered,time and speed/pace.
- The map also shows markers at the respective destination locations with specific workout details.
- The app also stores all the previous workout entries as a list,as well as on the map. (Thanks to Local Storage API.Though it is not a good idea for large amount of data, but dont you worry; I'll optimise it soon ;-))
- User can add,edit,delete a workout or even delete all workouts.
- User can click on a workout in the list and the map will move to that respective destination location automatically.

## Limitations
- The app currently allows to enter only two types of workouts : running and cycling.
- There is no facility to record or store the route traversed.

## Key Learnings
- Learnt (a lot) about dealing with third party APIs and library.
- Learnt to write object oriented and modular javascript code.
- Working with tools as npm,parcel,babel.
- Going through the documentation of APIs.
- Most importantly, learnt to debug and handle errors.

## Acknowledgements
I would like to thank [Prof. Jonas Schmedtmann](https://www.udemy.com/user/jonasschmedtmann/) for his highly extensive and methodical lectures on JavaScript. I still have a long way to go exploring JavaScript under his guidance.

I would also like to credit [Leaflet Library](https://leafletjs.com/reference.html) for the amazing documentation.

Finally, I would like to thank my best friend [Atrik Ray](https://github.com/AtrikGit6174) for being my biggest supporter at all times.
