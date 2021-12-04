"use strict";

const newWorkoutBtn = document.querySelector(".new-workout");
const form = document.querySelector(".form");
const inputType = document.querySelector(".form-input-type");
const inputTime = document.querySelector(".form-input-time");
const inputRecTime = document.querySelector(".form-input-recovTime");
//const elevGain = document.querySelector(".form-input-elev");
const inputDist = document.querySelector(".form-input-dist");
const guidelines = document.querySelector(".guidelines");
const editBtn = document.querySelector(".edit-icon");
const deleteBtn = document.querySelector(".delete-icon");
const dist = 4;
let workoutType;
let map, mapEvent;
let routeDisplayed = 0;
let sourceCoords = []; //Source coordinates
let locCoords = []; //Location coordinates
let workouts = [];
let routingControl;

class Workout {
  date = new Date();
  id = (Date.now() + "").slice(-10);
  clicks = 0;

  constructor(coords, distance, totalTime, recovTime) {
    this.coords = coords; //[lat,lng]
    this.distance = distance; //in km
    this.totalTime = totalTime;
    this.recovTime = recovTime;
  }
  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
  click() {
    this.clicks++;
  }
}

class Running extends Workout {
  constructor(coords, distance, totalTime, recovTime) {
    super(coords, distance, totalTime, recovTime);
    this.type = "running";
    this.time = totalTime - recovTime;
    this._calcPace();
    this._setDescription();
  }
  _calcPace() {
    //in min/km
    this.pace = this.time / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  constructor(coords, distance, totalTime, recovTime) {
    super(coords, distance, totalTime, recovTime);
    this.type = "cycling";
    this.time = totalTime - recovTime;
    //this.elevGain = elevGain;
    this._calcSpeed();
    this._setDescription();
  }
  _calcSpeed() {
    //in km/hr
    this.speed = this.distance / (this.time / 60);
    return this.speed;
  }
}

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(loadMap.bind(this), function () {
    alert("Could not load your location");
  });
}

let srcIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function loadMap(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  locCoords = [latitude, longitude];
  sourceCoords = locCoords;
  //console.log(locCoords);
  map = L.map("map").setView(sourceCoords, 15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  // L.tileLayer(
  //   "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
  //   {
  //     attribution:
  //       '© <a href="https://stadiamaps.com/">Stadia Maps</a>, © <a href="https://openmaptiles.org/">OpenMapTiles</a> © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
  //   }
  // ).addTo(map);
  L.marker(sourceCoords, { icon: srcIcon }).addTo(map);

  getLocalStorage();

  //Handling clicks on map
  map.on("click", mapClicked.bind(this));

  // this.wokouts.forEach(workoutObj=>{
  //   this.renderWorkoutMarker(workoutObj);
  // })
}

function mapClicked(mapE) {
  if (form.classList.contains("hidden")) return;
  //Get coordinates of destination clicked
  mapEvent = mapE;
  const { lat, lng } = mapEvent.latlng;
  locCoords = [lat, lng];
  guidelines.classList.add("hidden");
  if (routeDisplayed == 0) addRouting();
  routeDisplayed++;
}

function showForm() {
  guidelines.classList.remove("hidden");
  form.classList.remove("hidden");
  //Clear input field values
  inputTime.value = inputRecTime.value = inputDist.value = "";
}
function hideForm() {
  form.classList.add("hidden");
}
function getWorkoutType(elementValue) {
  if (elementValue.value == 1) {
    workoutType = "running";
  }
  if (elementValue.value == 2) {
    workoutType = "cycling";
  }
}

//On submitting the workout form
function submitForm() {
  let workout;
  //Helper function to check the validity of inputs
  const validInputsCheck = (...inputs) =>
    inputs.every(inp => Number.isFinite(inp));
  const positiveInputsCheck = (...inputs) => inputs.every(inp => inp >= 0);

  //Get data from the form

  const totalTime = +inputTime.value;
  const recovTime = +inputRecTime.value;
  const dist = +inputDist.value;
  // console.log(workoutType);
  // console.log(locCoords);

  //Calculate distance from the destination location provided

  if (typeof workoutType == "undefined") {
    return alert("Please select a workout type");
  }
  //If workout is running,create running object
  if (workoutType === "running") {
    //Check if data is valid
    if (
      !validInputsCheck(dist, totalTime, recovTime) ||
      !positiveInputsCheck(dist, totalTime, recovTime)
    )
      return alert("Inputs have to be positive numbers");
    workout = new Running(locCoords, dist, totalTime, recovTime);
  }
  //If workout is cycling create cycling object
  if (workoutType === "cycling") {
    //const elev = +elevGain.value;
    //Check if data is valid
    if (
      !validInputsCheck(dist, totalTime, recovTime) ||
      !positiveInputsCheck(dist, totalTime, recovTime)
    )
      return alert("Inputs have to be positive numbers");
    workout = new Cycling(locCoords, dist, totalTime, recovTime);
  }

  workouts.push(workout);
  //Hide existing form
  hideForm();

  //Hide existing route
  removeRoutingControl();

  //Render workout on the map
  renderWorkoutMarker(workout);

  //Render workout in the list
  renderWorkoutList(workout);

  //Set the local storage
  setLocalStorage();
}

//Function to Render workout on the map
function renderWorkoutMarker(workoutObj) {
  L.marker(workoutObj.coords)
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: `${workoutObj.type}-popup`
      })
    )
    .setPopupContent(workoutObj.description)
    .openPopup();
}

function removeWorkoutMarker(workoutObj) {}

//Function to render workout in the list
function renderWorkoutList(workoutObj) {
  let html = `
  <li class="workout workout--${workoutObj.type}" data-id="${workoutObj.id}">
    <h2 class="workout__title">${workoutObj.description}</h2>
    <div class="icons">
      <img src="assets/icons8-edit-24.png" class="edit-icon" onclick="editWorkout(${
        workoutObj.id
      })"/>
      <img src="assets/icons8-delete-24.png" class="delete-icon" onclick="deleteWorkout(${
        workoutObj.id
      })"/>
    </div>
  <div class="workout__details">
    <span class="workout__icon">${
      workoutObj.type === "running" ? "🏃‍♂️" : "🚴‍♀️"
    }</span>
    <span class="workout__value">${workoutObj.distance.toFixed(1)}</span>
    <span class="workout__unit">km</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">⏱</span>
    <span class="workout__value">${workoutObj.time}</span>
    <span class="workout__unit">min</span>
  </div>
    `;
  if (workoutObj.type === "running") {
    html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workoutObj.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
      </div>
    `;
  }
  if (workoutObj.type === "cycling") {
    //Add elevation gain in the second div when u do that
    html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workoutObj.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
      </div>
    `;
  }
  form.insertAdjacentHTML("afterend", html);
}

function setLocalStorage() {
  localStorage.setItem("workouts", JSON.stringify(workouts));
}

/* Dont use this Local storage API for large amounts of data because it slows down*/
function getLocalStorage() {
  let data = JSON.parse(localStorage.getItem("workouts"));
  console.log(data);
  if (!data) return;
  workouts = data;
  workouts.forEach(work => {
    renderWorkoutList(work);
    renderWorkoutMarker(work);
  });
}

// function toggleTypes(elementValue) {
//   if (elementValue.value == 1) {
//     elevGain.classList.add("hidden");
//     getWorkoutType("running");
//   }
//   if (elementValue.value == 2) {
//     elevGain.classList.remove("hidden");
//     getWorkoutType("cycling");
//   }
// }

function addRouting() {
  routeDisplayed = true;
  routingControl = L.Routing.control({
    waypoints: [sourceCoords, locCoords],
    collapsible: true,
    createMarker: function () {
      return null;
    },
    geocoder: L.Control.Geocoder.nominatim()
  }).addTo(map);
}

function removeRoutingControl() {
  if (routingControl != null) {
    map.removeControl(routingControl);
    routingControl = null;
  }
}

function editWorkout(id) {
  console.log(id);
  let reqdWorkout = workouts.find(function (obj) {
    return obj.id == id;
  });
  console.log(reqdWorkout);
  // removeWorkoutMarker();
  // showForm();
}

function deleteWorkout(id) {
  console.log(id);
}

function reset() {
  localStorage.removeItem("workouts");
  location.reload();
}
