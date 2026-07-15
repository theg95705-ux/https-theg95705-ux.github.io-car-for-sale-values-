// ==========================================
// CAR VALUES
// SCRIPT.JS
// ==========================================

// ==========================================
// FIREBASE IMPORTS
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
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
// ADMIN EMAIL
// ==========================================

const ADMIN_EMAIL = "theg95705@gmail.com";

// ==========================================
// PAGE ELEMENTS
// ==========================================

const cards = document.querySelectorAll(".card");

const adminPanel = document.getElementById("adminPanel");

const vehicleName = document.getElementById("vehicleName");

const vehicleValue = document.getElementById("vehicleValue");

const vehicleDemand = document.getElementById("vehicleDemand");

const saveBtn = document.getElementById("saveBtn");

const cancelBtn = document.getElementById("cancelBtn");

// ==========================================
// VARIABLES
// ==========================================

let currentVehicle = null;

let isAdmin = false;

// ==========================================
// FIRESTORE
// ==========================================

const vehiclesRef = collection(db, "vehicles");

// ==========================================
// GOOGLE SIGN IN
// ==========================================

async function login() {

    try {

        await signInWithPopup(auth, provider);

    }

    catch (error) {

        console.error(error);

    }

}

// ==========================================
// CHECK LOGIN
// ==========================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        login();

        return;

    }

    console.log("Signed in:", user.email);

    isAdmin = user.email === ADMIN_EMAIL;

    if (isAdmin) {

        console.log("Admin Mode Enabled");

    } else {

        console.log("Viewer Mode");

    }

});
// ==========================================
// CREATE DEFAULT VEHICLES
// ==========================================

async function createDefaults() {

    const snapshot = await getDocs(vehiclesRef);

    if (!snapshot.empty) return;

    console.log("Creating default vehicles...");

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
// LIVE VEHICLE UPDATES
// ==========================================

onSnapshot(vehiclesRef, (snapshot) => {

    snapshot.forEach((vehicleDoc) => {

        const data = vehicleDoc.data();

        const card = document.querySelector(
            `.card[data-id="${vehicleDoc.id}"]`
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

console.log("Vehicle listener started.");
// ==========================================
// OPEN ADMIN PANEL
// ==========================================

cards.forEach((card) => {

    card.addEventListener("click", async () => {

        if (!isAdmin) {

            console.log("Viewer Mode - Editing Disabled");
            return;

        }

        currentVehicle = card.dataset.id;

        try {

            const vehicleRef = doc(db, "vehicles", currentVehicle);

            const snapshot = await getDoc(vehicleRef);

            if (!snapshot.exists()) {

                alert("Vehicle not found.");

                return;

            }

            const data = snapshot.data();

            vehicleName.value = data.name;
            vehicleValue.value = data.value;
            vehicleDemand.value = data.demand;

            adminPanel.style.display = "flex";

        }

        catch (error) {

            console.error(error);
            alert("Failed to load vehicle.");

        }

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

    try {

        await updateDoc(

            doc(db, "vehicles", currentVehicle),

            {

                name: name,

                value: value,

                demand: demand

            }

        );

        adminPanel.style.display = "none";

        console.log("Vehicle Updated");

    }

    catch (error) {

        console.error(error);

        alert("Unable to save changes.");

    }

});
// ==========================================
// CANCEL BUTTON
// ==========================================

cancelBtn.addEventListener("click", () => {

    adminPanel.style.display = "none";

});

// ==========================================
// CLOSE WHEN CLICKING OUTSIDE PANEL
// ==========================================

adminPanel.addEventListener("click", (event) => {

    if (event.target === adminPanel) {

        adminPanel.style.display = "none";

    }

});

// ==========================================
// ESC KEY CLOSES PANEL
// ==========================================

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        adminPanel.style.display = "none";

    }

});

// ==========================================
// ENTER KEY SAVES
// ==========================================

document.addEventListener("keydown", (event) => {

    if (
        event.key === "Enter" &&
        adminPanel.style.display === "flex"
    ) {

        saveBtn.click();

    }

});

// ==========================================
// STARTUP MESSAGE
// ==========================================

window.addEventListener("load", () => {

    console.log("==================================");
    console.log(" Car Values Loaded Successfully ");
    console.log(" Firebase Connected");
    console.log(" Waiting for Live Updates...");
    console.log("==================================");

});
