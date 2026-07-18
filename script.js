// ==========================================
// VEHICLE VALUES
// SCRIPT.JS
// UPDATED VERSION
// PART 1 - FIREBASE SETUP + AUTH SYSTEM
// ==========================================

console.clear();

console.log("=================================");
console.log("Vehicle Values Starting...");
console.log("=================================");


// ==========================================
// FIREBASE IMPORTS
// ==========================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";


import {
    getFirestore,
    collection,
    getDocs,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


// ==========================================
// FIREBASE CONFIG
// ==========================================

const firebaseConfig = {

    apiKey: "AIzaSyCzyyZcuQsR19fsHnffGV0L2LCQ-RRuaGw",

    authDomain: "admin-pannel-268a9.firebaseapp.com",

    projectId: "admin-pannel-268a9",

    storageBucket: "admin-pannel-268a9.firebasestorage.app",

    messagingSenderId: "619934011757",

    appId: "1:619934011757:web:8b4b98362df5f932fc0a64"

};


// ==========================================
// START FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);


console.log("Firebase Connected");


// ==========================================
// ADMIN SETTINGS
// ==========================================

const ADMIN_EMAIL =
    "theg95705@gmail.com".toLowerCase();


let currentUser = null;

let isAdmin = false;

let selectedCard = null;



// ==========================================
// HTML ELEMENTS
// ==========================================


// LOGIN

const loginOverlay =
    document.getElementById("loginOverlay");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const loginBtn =
    document.getElementById("loginBtn");

const loginCancelBtn =
    document.getElementById("loginCancelBtn");

const loginError =
    document.getElementById("loginError");



// ADMIN PANEL

const adminOverlay =
    document.getElementById("adminOverlay");


const vehicleName =
    document.getElementById("vehicleName");


const vehicleValue =
    document.getElementById("vehicleValue");


const vehicleDemand =
    document.getElementById("vehicleDemand");


const vehicleImage =
    document.getElementById("vehicleImage");


const vehicleLimited =
    document.getElementById("vehicleLimited");



// BUTTONS

const saveBtn =
    document.getElementById("saveBtn");


const cancelBtn =
    document.getElementById("cancelBtn");


const logoutBtn =
    document.getElementById("logoutBtn");



// ==========================================
// CARD CONTAINER
// ==========================================

const cardsContainer =
    document.querySelector(".cards");



// ==========================================
// STARTUP
// ==========================================

console.log("HTML Loaded");

console.log("Firebase Ready");

console.log("Waiting for Authentication...");



// ==========================================
// AUTH STATE SYSTEM
// ==========================================

onAuthStateChanged(auth, async (user) => {


    currentUser = user;



    // IMPORTANT FIX:
    // EVERYONE loads vehicles
    // not only admins

    await loadVehicles();



    if (!user) {


        isAdmin = false;


        logoutBtn.style.display = "none";


        console.log("No user logged in.");

        return;

    }



    console.log(
        "Logged in as:",
        user.email
    );



    if (
        user.email &&
        user.email.toLowerCase() === ADMIN_EMAIL
    ) {



        isAdmin = true;


        logoutBtn.style.display =
            "inline-flex";


        loginOverlay.style.display =
            "none";



        console.log("==============================");

        console.log("ADMIN ACCESS GRANTED");

        console.log("==============================");



    }


    else {



        isAdmin = false;


        logoutBtn.style.display =
            "none";



        console.log(
            "Normal user logged in."
        );


    }



});



// ==========================================
// LOGIN
// ==========================================

loginBtn.addEventListener(
"click",
async () => {


    loginError.style.display =
        "none";



    const email =
        loginEmail.value
        .trim()
        .toLowerCase();



    const password =
        loginPassword.value;



    if (!email || !password) {


        loginError.textContent =
        "Please enter your email and password.";


        loginError.style.display =
        "block";


        return;


    }



    loginBtn.disabled = true;


    loginBtn.textContent =
    "Signing In...";



    try {


        await signInWithEmailAndPassword(

            auth,

            email,

            password

        );



        loginEmail.value = "";

        loginPassword.value = "";



    }


    catch(error) {


        console.error(
            "Login Error:",
            error
        );



        loginError.textContent =
        "Incorrect email or password.";



        loginError.style.display =
        "block";


    }



    loginBtn.disabled = false;


    loginBtn.textContent =
    "Sign In";



});


// ==========================================
// LOGOUT
// ==========================================

logoutBtn.addEventListener(
"click",
async () => {


    const confirmLogout =
        confirm(
        "Are you sure you want to log out?"
        );


    if (!confirmLogout)
        return;



    await signOut(auth);



    adminOverlay.style.display =
        "none";


    selectedCard = null;


    isAdmin = false;


    currentUser = null;


    logoutBtn.style.display =
        "none";



    console.log(
        "Logged Out"
    );


});


// ==========================================
// PART 1 END
// ==========================================
// ==========================================
// PART 2 - VEHICLE LOADING SYSTEM
// ==========================================


// ==========================================
// LOAD VEHICLES FROM FIREBASE
// ==========================================

async function loadVehicles() {


    try {


        console.log(
            "Loading vehicles from Firebase..."
        );



        const snapshot =
            await getDocs(
                collection(
                    db,
                    "vehicles"
                )
            );



        if (snapshot.empty) {


            console.log(
                "No vehicles found in Firebase."
            );


            return;


        }



        snapshot.forEach(
        (vehicle) => {


            const id =
                vehicle.id;



            const data =
                vehicle.data();



            console.log(
                "Loading vehicle:",
                id,
                data
            );



            const card =
                document.querySelector(
                    `.card[data-id="${id}"]`
                );



            // If Firebase has a vehicle
            // without a HTML card

            if (!card) {


                console.warn(
                    "Missing HTML card for:",
                    id
                );


                return;


            }



            // ==========================
            // NAME
            // ==========================

            const name =
                document.getElementById(
                    `name${id}`
                );


            if (name) {


                name.textContent =
                    data.name ||
                    "Unknown Vehicle";


            }



            // ==========================
            // VALUE
            // ==========================

            const value =
                document.getElementById(
                    `value${id}`
                );


            if (value) {


                value.textContent =
                "$" +
                Number(
                    data.value || 0
                )
                .toLocaleString();


            }



            // ==========================
            // DEMAND
            // ==========================

            const demand =
                document.getElementById(
                    `demand${id}`
                );


            if (demand) {


                demand.textContent =
                (
                    data.demand || 0
                )
                + "/10";


            }



            // ==========================
            // IMAGE
            // ==========================

            const image =
                document.getElementById(
                    `image${id}`
                );



            if (image) {


                image.src =
                    data.image ||
                    "";


            }



            // ==========================
            // LIMITED VEHICLE
            // ==========================

            const badge =
                document.getElementById(
                    `limitedBadge${id}`
                );



            if (
                data.limited === true
            ) {



                card.classList.add(
                    "limited"
                );



                if (badge) {


                    badge.style.display =
                    "flex";


                }


            }


            else {



                card.classList.remove(
                    "limited"
                );



                if (badge) {


                    badge.style.display =
                    "none";


                }


            }



        });



        console.log(
            "Vehicles Loaded Successfully"
        );



    }


    catch(error) {



        console.error(
            "Vehicle Loading Error:"
        );



        console.error(
            error
        );



        alert(
            "Unable to load vehicles. Check Firebase rules."
        );


    }



}



// ==========================================
// MANUAL REFRESH FUNCTION
// ==========================================

window.refreshVehicles =
async function(){


    console.log(
        "Refreshing vehicles..."
    );


    await loadVehicles();


};
// ==========================================
// PART 3 - VEHICLE EDITOR SYSTEM
// ==========================================


// ==========================================
// OPEN VEHICLE EDITOR
// ==========================================

document
.querySelectorAll(".card")
.forEach((card) => {


    card.addEventListener(
    "click",
    () => {


        // Only admins can edit

        if (!isAdmin) {


            return;


        }



        selectedCard = card;



        const id =
            card.dataset.id;



        // ==========================
        // LOAD CURRENT VALUES
        // ==========================


        const name =
            document.getElementById(
                `name${id}`
            );


        const value =
            document.getElementById(
                `value${id}`
            );


        const demand =
            document.getElementById(
                `demand${id}`
            );


        const image =
            document.getElementById(
                `image${id}`
            );



        if(name)
            vehicleName.value =
            name.textContent;



        if(value)
            vehicleValue.value =
            value.textContent
            .replace("$","")
            .replace(/,/g,"");



        if(demand)
            vehicleDemand.value =
            demand.textContent
            .replace("/10","");



        if(image)
            vehicleImage.value =
            image.src;



        vehicleLimited.checked =
        card.classList.contains(
            "limited"
        );



        adminOverlay.style.display =
            "flex";



        console.log(
            "Editing vehicle:",
            id
        );


    });


});



// ==========================================
// CANCEL EDIT
// ==========================================

cancelBtn.addEventListener(
"click",
() => {


    adminOverlay.style.display =
        "none";


    selectedCard = null;



});



// ==========================================
// CLICK OUTSIDE ADMIN PANEL
// ==========================================

adminOverlay.addEventListener(
"click",
(event) => {


    if(
        event.target === adminOverlay
    ){


        adminOverlay.style.display =
            "none";


        selectedCard = null;


    }


});



// ==========================================
// CLOSE LOGIN PANEL
// ==========================================

loginCancelBtn.addEventListener(
"click",
() => {


    loginOverlay.style.display =
        "none";


    loginPassword.value =
        "";


    loginError.style.display =
        "none";


});



// ==========================================
// CLICK OUTSIDE LOGIN
// ==========================================

loginOverlay.addEventListener(
"click",
(event)=>{


    if(
        event.target === loginOverlay
    ){


        loginOverlay.style.display =
            "none";


    }


});



// ==========================================
// ADMIN SHORTCUT
// CTRL + ALT + RIGHT ARROW
// ==========================================


let ctrlPressed = false;

let altPressed = false;



document.addEventListener(
"keydown",
(event)=>{


    if(event.key === "Control")
        ctrlPressed = true;


    if(event.key === "Alt")
        altPressed = true;



    if(
        ctrlPressed &&
        altPressed &&
        event.key === "ArrowRight"
    ){


        loginOverlay.style.display =
            "flex";


        loginEmail.focus();



        console.log(
            "Admin login opened"
        );


    }


});



document.addEventListener(
"keyup",
(event)=>{


    if(event.key === "Control")
        ctrlPressed = false;


    if(event.key === "Alt")
        altPressed = false;


});



// ==========================================
// PART 3 END
// ==========================================
// ==========================================
// PART 4 - SAVE SYSTEM + STARTUP
// ==========================================


// ==========================================
// SAVE VEHICLE
// ==========================================

saveBtn.addEventListener(
"click",
async () => {


    if(!isAdmin){


        alert(
            "Admin access required."
        );


        return;


    }



    if(!selectedCard){


        alert(
            "No vehicle selected."
        );


        return;


    }



    saveBtn.disabled = true;


    saveBtn.textContent =
        "Saving...";



    try {


        const id =
            selectedCard.dataset.id;



        const vehicleData = {


            name:
                vehicleName.value.trim(),


            value:
                Number(
                    vehicleValue.value
                ),


            demand:
                Number(
                    vehicleDemand.value
                ),


            image:
                vehicleImage.value.trim(),


            limited:
                vehicleLimited.checked


        };



        console.log(
            "Saving vehicle:",
            id,
            vehicleData
        );



        // SAVE TO FIRESTORE

        await setDoc(

            doc(
                db,
                "vehicles",
                id
            ),

            vehicleData

        );



        // UPDATE DISPLAY

        document.getElementById(
            `name${id}`
        ).textContent =
            vehicleData.name;



        document.getElementById(
            `value${id}`
        ).textContent =
        "$" +
        vehicleData.value
        .toLocaleString();



        document.getElementById(
            `demand${id}`
        ).textContent =
        vehicleData.demand + "/10";



        document.getElementById(
            `image${id}`
        ).src =
            vehicleData.image;



        const badge =
            document.getElementById(
                `limitedBadge${id}`
            );



        if(
            vehicleData.limited
        ){


            selectedCard.classList.add(
                "limited"
            );


            if(badge)
                badge.style.display =
                "flex";


        }

        else {


            selectedCard.classList.remove(
                "limited"
            );


            if(badge)
                badge.style.display =
                "none";


        }



        adminOverlay.style.display =
            "none";



        selectedCard = null;



        console.log(
            "Vehicle saved successfully"
        );



        alert(
            "Vehicle saved successfully!"
        );


    }


    catch(error){



        console.error(
            "SAVE ERROR:",
            error
        );



        alert(
            error.message
        );


    }



    saveBtn.disabled = false;


    saveBtn.textContent =
        "Save";



});



// ==========================================
// GLOBAL ERROR HANDLING
// ==========================================

window.addEventListener(
"error",
(event)=>{


    console.error(
        "JavaScript Error:",
        event.message
    );


});



window.addEventListener(
"unhandledrejection",
(event)=>{


    console.error(
        "Promise Error:",
        event.reason
    );


});



// ==========================================
// PAGE STARTUP
// ==========================================


window.addEventListener(
"load",
()=>{


    console.log(
        "================================="
    );


    console.log(
        "Vehicle Values Loaded"
    );


    console.log(
        "Firebase Connected"
    );


    console.log(
        "Admin Shortcut:"
    );


    console.log(
        "CTRL + ALT + RIGHT ARROW"
    );


    console.log(
        "================================="
    );


});



// IMPORTANT:
// LOAD VEHICLES FOR EVERYONE

loadVehicles();



console.log(
    "System Ready"
);
