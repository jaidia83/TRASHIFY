let video;
let classifier;
let label = "";
let currentFacingMode = 'user'; // Start with front camera
let classificationInterval;


// Categories
const categories = {
  compost: ["organic waste", "wood"],
  fuel: ["textile", "trash", "e-waste", "wood", "paper", "cardboard", "carton"],
  recyclable: ["plastic", "textile", "metal", "cardboard", "glass", "aluminum", "carton", "wood", "paper", "e-waste"]
};


// Preparation tips
const preparationTips = {
  plastic: ["Rinse container", "Check for recycling number"],
  glass: ["Rinse thoroughly", "Remove lids", "Do not include broken glass"],
  paper: ["Keep dry", "Remove stains", "Flatten if possible"],
  cardboard: ["Flatten boxes", "Keep dry"],
  metal: ["Rinse clean", "Remove residue"],
  "organic waste": ["Remove packaging", "Place in compost bin"],
  "e-waste": ["Do NOT put in regular trash", "Take to certified e-waste facility", "Remove batteries if possible"],
  trash: ["Cannot be recycled", "Dispose in landfill bin"]
};


// Load model
function preload() {
  classifier = ml5.imageClassifier("https://teachablemachine.withgoogle.com/models/0QU9QYDPS/");
}


function setup() {
  let cnv = createCanvas(500, 320);
  cnv.parent("canvas-holder");
  startCamera();


  // Flip Camera Button
  document.getElementById('flip-btn').addEventListener('click', () => {
    currentFacingMode = (currentFacingMode === 'user') ? 'environment' : 'user';
    startCamera();
  });
}


function startCamera() {
  if (video) {
    video.stop();
    video.remove();
    clearTimeout(classificationInterval);
  }


  const constraints = { video: { facingMode: currentFacingMode }, audio: false };
  video = createCapture(constraints, () => console.log("Camera: " + currentFacingMode));
  video.size(500, 320);
  video.hide();


  const canvasElement = document.querySelector('#canvas-holder canvas');
  canvasElement.style.transform = (currentFacingMode === 'user') ? "scaleX(-1)" : "scaleX(1)";


  classifyVideo();
}


function classifyVideo() {
  classifier.classify(video, (results) => {
    gotResults(results);
    classificationInterval = setTimeout(classifyVideo, 1000);
  });
}


function draw() {
  image(video, 0, 0, width, height);
}


function gotResults(results) {
  if (results && results.length > 0) {
    label = results[0].label.toLowerCase();
    document.getElementById("label-box").innerText = getCustomLabel(label);
    updateUI(label);
    updateChecklist(label);
  }
}


function updateUI(detectedLabel) {
  document.querySelectorAll('.small-box').forEach(box => box.classList.remove('active'));


  if (categories.compost.includes(detectedLabel)) document.getElementById("box-compost").classList.add('active');
  if (categories.fuel.includes(detectedLabel)) document.getElementById("box-fuel").classList.add('active');
  if (categories.recyclable.includes(detectedLabel)) document.getElementById("box-recyclable").classList.add('active');
}


function getCustomLabel(label) {
  const labels = {
    plastic: "Plastic Detected",
    metal: "Metal Detected",
    paper: "Paper Detected",
    cardboard: "Cardboard Detected",
    glass: "Glass Detected",
    trash: "Trash Detected",
    aluminum: "Aluminum Detected",
    carton: "Carton Detected",
    "organic waste": "Organic Waste Detected",
    wood: "Wood Detected",
    textile: "Textile Detected",
    "e-waste": "E-Waste Detected"
  };
  return labels[label] || "Scanning...";
}


function updateChecklist(detectedLabel) {
  const checklist = document.getElementById("prep-checklist");
  checklist.innerHTML = "";


  const tips = preparationTips[detectedLabel];
  if (tips) {
    tips.forEach(tip => {
      const li = document.createElement("li");
      li.innerText = tip;
      checklist.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.innerText = "No preparation needed.";
    checklist.appendChild(li);
  }
}


function gotResults(results) {
  if (results && results.length > 0) {
    label = results[0].label.toLowerCase();
    document.getElementById("label-box").innerText = getCustomLabel(label);
    updateUI(label);
    updateChecklist(label);


    // NEW: Ask ChatGPT for recycling advice
    fetch("/recycle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item: label })
    })
    .then(res => res.json())
    .then(data => {
      const checklist = document.getElementById("prep-checklist");
      const li = document.createElement("li");
      li.innerText = "ChatGPT Advice: " + data.reply;
      checklist.appendChild(li);
    })
    .catch(err => console.error("Error fetching advice:", err));
  }
}
