// your code goes // ==========================================
// FIREBASE IMPORTS
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
    getFirestore,
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

// ==========================================
// FIREBASE CONFIG
// ==========================================

const firebaseConfig = {

    apiKey: "AIzaSyDbGYeWHzi-ipdmR-AS3OKReM5E1v19DEs",

    authDomain: "car-value-list.firebaseapp.com",

    projectId: "car-value-list",

    storageBucket: "car-value-list.firebasestorage.app",

    messagingSenderId: "598825698394",

    appId: "1:598825698394:web:002a5e8936a062d6bb8463"

};

// ==========================================
// INITIALIZE FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

// ==========================================
// CHANGE THIS TO YOUR EMAIL
// ==========================================

const ADMIN_EMAIL = "theg95705@gmail.com";

// ==========================================
// VARIABLES
// ==========================================

let currentVehicle = null;

let isAdmin = false;

const cards = document.querySelectorAll(".card");

const adminPanel = document.getElementById("adminPanel");

const vehicleName = document.getElementById("vehicleName");

const vehicleValue = document.getElementById("vehicleValue");

const vehicleDemand = document.getElementById("vehicleDemand");

const saveBtn = document.getElementById("saveBtn");

const cancelBtn = document.getElementById("cancelBtn");

// ==========================================
// AUTH STATE
// ==========================================

onAuthStateChanged(auth, (user)=>{

    if(!user){

        isAdmin = false;

        return;

    }

    isAdmin = user.email === ADMIN_EMAIL;

    console.log("Signed in:", user.email);

});here
// ==========================================
// FIRESTORE COLLECTION
// ==========================================

const vehiclesRef = collection(db, "vehicles");

// ==========================================
// CREATE DEFAULT VEHICLES
// ==========================================

async function createDefaults() {

    const snapshot = await getDocs(vehiclesRef);

    if (!snapshot.empty) return;

    for (let i = 1; i <= 12; i++) {

        await setDoc(doc(db, "vehicles", String(i)), {

            name: "Vehicle " + i,

            value: 0,

            demand: "Medium"

        });

    }

    console.log("Default vehicles created.");

}

createDefaults();

// ==========================================
// LOAD VEHICLES LIVE
// ==========================================

onSnapshot(vehiclesRef, (snapshot) => {

    snapshot.forEach((vehicleDoc) => {

        const data = vehicleDoc.data();

        const id = vehicleDoc.id;

        const card = document.querySelector(
            `.card[data-id="${id}"]`
        );

        if (!card) return;

        card.innerHTML = `

            <div class="vehicle-content">

                <h2>${data.name}</h2>

                <div class="vehicle-value">

                    $${Number(data.value).toLocaleString()}

                </div>

                <div class="vehicle-demand">

                    ${data.demand}

                </div>

            </div>

        `;

    });

});

// ==========================================
// CARD CLICK
// ==========================================

cards.forEach((card) => {

    card.addEventListener("click", async () => {

        if (!isAdmin) return;

        currentVehicle = card.dataset.id;

        const snap = await getDoc(
            doc(db, "vehicles", currentVehicle)
        );

        const data = snap.data();

        vehicleName.value = data.name;

        vehicleValue.value = data.value;

        vehicleDemand.value = data.demand;

        adminPanel.classList.add("show");

    });

});
// ==========================================
// SAVE VEHICLE
// ==========================================

saveBtn.addEventListener("click", async () => {

    if (!currentVehicle) return;

    const name = vehicleName.value.trim();

    const value = Number(vehicleValue.value);

    const demand = vehicleDemand.value;

    if (name === "") {

        alert("Please enter a vehicle name.");

        return;

    }

    await updateDoc(doc(db, "vehicles", currentVehicle), {

        name: name,

        value: value,

        demand: demand

    });

    adminPanel.classList.remove("show");

});

// ==========================================
// CANCEL BUTTON
// ==========================================

cancelBtn.addEventListener("click", () => {

    adminPanel.classList.remove("show");

});

// ==========================================
// CLOSE PANEL WHEN CLICKING BACKGROUND
// ==========================================

adminPanel.addEventListener("click", (event) => {

    if (event.target === adminPanel) {

        adminPanel.classList.remove("show");

    }

});

// ==========================================
// ESC KEY CLOSES PANEL
// ==========================================

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        adminPanel.classList.remove("show");

    }

});

// ==========================================
// ENTER KEY SAVES
// ==========================================

document.addEventListener("keydown", (event) => {

    if (event.key === "Enter" && adminPanel.classList.contains("show")) {

        saveBtn.click();

    }

});
