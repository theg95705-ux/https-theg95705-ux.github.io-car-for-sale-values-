// ==========================================
// VEHICLE VALUES
// SCRIPT.JS
// COMPLETE REBUILD
// PART 1A - FIREBASE + GLOBALS
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
// INITIALISE FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

console.log("Firebase Connected");

// ==========================================
// SETTINGS
// ==========================================

const ADMIN_EMAIL = "theg95705@gmail.com".toLowerCase();

// Change this number whenever you want more
// vehicle cards automatically.

const TOTAL_VEHICLES = 250;

let currentUser = null;
let isAdmin = false;
let selectedCard = null;

// ==========================================
// HTML ELEMENTS
// ==========================================

// LOGIN

const loginOverlay = document.getElementById("loginOverlay");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");
const loginCancelBtn = document.getElementById("loginCancelBtn");
const loginError = document.getElementById("loginError");

// ADMIN PANEL

const adminOverlay = document.getElementById("adminOverlay");
const vehicleName = document.getElementById("vehicleName");
const vehicleValue = document.getElementById("vehicleValue");
const vehicleDemand = document.getElementById("vehicleDemand");
const vehicleImage = document.getElementById("vehicleImage");
const vehicleLimited = document.getElementById("vehicleLimited");

// BUTTONS

const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const logoutBtn = document.getElementById("logoutBtn");

// GRID

const cardsContainer =
    document.getElementById("vehicleGrid");

// ==========================================
// CREATE CARDS AUTOMATICALLY
// ==========================================

function createVehicleCards() {

    if (!cardsContainer) {

        console.error("vehicleGrid not found.");
        return;

    }

    cardsContainer.innerHTML = "";

    for (let i = 1; i <= TOTAL_VEHICLES; i++) {

        const card = document.createElement("div");

        card.className = "card";

        card.dataset.id = i;

        card.innerHTML = `

            <div class="limited-badge" id="limitedBadge${i}">
                LIMITED
            </div>

            <div class="vehicle-image">
                <img id="image${i}" src="">
            </div>

            <div class="vehicle-name-box">

                <span class="name-title">
                    VEHICLE
                </span>

                <div class="name-value" id="name${i}">
                    Vehicle ${i}
                </div>

            </div>

            <div class="stat-box">

                <span class="stat-title">
                    VALUE
                </span>

                <div class="value-text" id="value${i}">
                    $0
                </div>

            </div>

            <div class="stat-box">

                <span class="stat-title">
                    DEMAND
                </span>

                <div class="demand-value" id="demand${i}">
                    0/10
                </div>

            </div>

        `;

        cardsContainer.appendChild(card);

    }

    console.log(
        `${TOTAL_VEHICLES} cards created.`
    );

}
// ==========================================
// PART 1B - AUTH SYSTEM
// ==========================================


// ==========================================
// AUTH STATE CHECK
// ==========================================

onAuthStateChanged(
    auth,
    async (user)=>{


        currentUser = user;


        // Everyone can view vehicles

        await loadVehicles();



        if(!user){


            isAdmin = false;


            if(logoutBtn)
                logoutBtn.style.display =
                "none";


            console.log(
                "No user logged in."
            );


            return;


        }



        console.log(
            "Logged in:",
            user.email
        );



        if(
            user.email &&
            user.email.toLowerCase()
            === ADMIN_EMAIL
        ){


            isAdmin = true;


            if(logoutBtn)
                logoutBtn.style.display =
                "inline-flex";



            console.log(
                "=============================="
            );

            console.log(
                "ADMIN ACCESS GRANTED"
            );

            console.log(
                "=============================="
            );


        }


        else{


            isAdmin = false;


            if(logoutBtn)
                logoutBtn.style.display =
                "none";



            console.log(
                "Normal user account."
            );


        }



    }
);




// ==========================================
// LOGIN SYSTEM
// ==========================================


if(loginBtn){


loginBtn.addEventListener(
"click",
async ()=>{


    if(loginError)
        loginError.style.display =
        "none";



    const email =
        loginEmail.value
        .trim()
        .toLowerCase();



    const password =
        loginPassword.value;



    if(
        !email ||
        !password
    ){


        loginError.textContent =
        "Enter email and password.";


        loginError.style.display =
        "block";


        return;


    }



    loginBtn.disabled = true;


    loginBtn.textContent =
    "Signing In...";



    try{


        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );



        loginEmail.value =
        "";

        loginPassword.value =
        "";



        console.log(
            "Login successful"
        );


    }


    catch(error){


        console.error(
            error
        );



        loginError.textContent =
        "Incorrect login details.";



        loginError.style.display =
        "block";


    }



    loginBtn.disabled =
    false;



    loginBtn.textContent =
    "Sign In";



});


}




// ==========================================
// LOGOUT SYSTEM
// ==========================================


if(logoutBtn){


logoutBtn.addEventListener(
"click",
async ()=>{


    const confirmLogout =
    confirm(
        "Logout from admin?"
    );



    if(!confirmLogout)
        return;



    await signOut(auth);



    isAdmin = false;


    currentUser = null;


    selectedCard = null;



    if(adminOverlay)
        adminOverlay.style.display =
        "none";



    logoutBtn.style.display =
    "none";



    console.log(
        "Logged out."
    );



});


}




// ==========================================
// ADMIN LOGIN SHORTCUT
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


        if(loginOverlay)
        {


            loginOverlay.style.display =
            "flex";


            if(loginEmail)
                loginEmail.focus();


        }



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
// PART 1B END
// ==========================================
// ==========================================
// PART 2 - FIREBASE VEHICLE SYSTEM
// ==========================================


// ==========================================
// LOAD VEHICLES FROM FIREBASE
// ==========================================

async function loadVehicles(){


    try{


        console.log(
            "Loading vehicles..."
        );



        const snapshot =
        await getDocs(
            collection(
                db,
                "vehicles"
            )
        );



        if(snapshot.empty){


            console.log(
                "No vehicles in database."
            );


            return;


        }



        snapshot.forEach(
        (vehicle)=>{


            const id =
            vehicle.id;



            const data =
            vehicle.data();



            updateVehicleCard(
                id,
                data
            );



        });



        console.log(
            "Vehicles loaded successfully."
        );



    }


    catch(error){


        console.error(
            "Firebase loading error:",
            error
        );


    }



}




// ==========================================
// UPDATE VEHICLE CARD
// ==========================================


function updateVehicleCard(
    id,
    data
){



    const card =
    document.querySelector(
        `.card[data-id="${id}"]`
    );



    if(!card){


        console.warn(
            "Missing card:",
            id
        );


        return;


    }



    // ===============================
    // NAME
    // ===============================


    const name =
    document.getElementById(
        `name${id}`
    );



    if(name){


        name.textContent =
        data.name ||
        `Vehicle ${id}`;


    }





    // ===============================
    // VALUE
    // ===============================


    const value =
    document.getElementById(
        `value${id}`
    );



    if(value){


        value.textContent =
        "$" +
        Number(
            data.value || 0
        )
        .toLocaleString();


    }




    // ===============================
    // DEMAND
    // ===============================


    const demand =
    document.getElementById(
        `demand${id}`
    );



    if(demand){


        demand.textContent =
        Number(
            data.demand || 0
        )
        +
        "/10";


    }





    // ===============================
    // IMAGE
    // ===============================


    const image =
    document.getElementById(
        `image${id}`
    );



    if(image){


        if(data.image){


            image.src =
            data.image;


        }
        else{


            image.removeAttribute(
                "src"
            );


        }



    }





    // ===============================
    // LIMITED VEHICLE
    // ===============================


    const badge =
    document.getElementById(
        `limitedBadge${id}`
    );



    if(data.limited === true){



        card.classList.add(
            "limited"
        );



        if(badge){


            badge.style.display =
            "flex";


        }



    }


    else{



        card.classList.remove(
            "limited"
        );



        if(badge){


            badge.style.display =
            "none";


        }



    }



}





// ==========================================
// REFRESH BUTTON SUPPORT
// ==========================================


window.refreshVehicles =
async function(){


    console.log(
        "Refreshing vehicles..."
    );


    await loadVehicles();


};





// ==========================================
// CREATE CARDS + LOAD DATA
// ==========================================


createVehicleCards();


loadVehicles();



// ==========================================
// PART 2 END
// ==========================================
// ==========================================
// PART 3 - ADMIN VEHICLE EDITOR
// ==========================================


// ==========================================
// CARD CLICK EDIT SYSTEM
// ==========================================


function setupCardEditing(){


    document
    .querySelectorAll(".card")
    .forEach(
    (card)=>{


        card.addEventListener(
        "click",
        ()=>{


            // Only admin can edit

            if(!isAdmin){


                return;


            }



            selectedCard =
            card;



            const id =
            card.dataset.id;



            loadEditorData(id);



        });


    });


}




// ==========================================
// LOAD CARD DATA INTO EDITOR
// ==========================================


function loadEditorData(id){



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



    if(vehicleName && name)

        vehicleName.value =
        name.textContent;



    if(vehicleValue && value)

        vehicleValue.value =
        value.textContent
        .replace(
            "$",
            ""
        )
        .replace(
            /,/g,
            ""
        );



    if(vehicleDemand && demand)

        vehicleDemand.value =
        demand.textContent
        .replace(
            "/10",
            ""
        );



    if(vehicleImage && image)

        vehicleImage.value =
        image.src || "";



    if(vehicleLimited)

        vehicleLimited.checked =
        selectedCard.classList
        .contains(
            "limited"
        );



    if(adminOverlay)

        adminOverlay.style.display =
        "flex";



    console.log(
        "Editing:",
        id
    );



}




// ==========================================
// CLOSE ADMIN PANEL
// ==========================================


function closeAdmin(){



    if(adminOverlay)

        adminOverlay.style.display =
        "none";



    selectedCard =
    null;



}




// CANCEL BUTTON


if(cancelBtn){


cancelBtn.addEventListener(
"click",
()=>{


    closeAdmin();


});


}




// CLICK OUTSIDE PANEL


if(adminOverlay){


adminOverlay.addEventListener(
"click",
(event)=>{


    if(
        event.target === adminOverlay
    ){


        closeAdmin();


    }


});


}





// ==========================================
// SAVE VEHICLE
// ==========================================


if(saveBtn){


saveBtn.addEventListener(
"click",
async ()=>{



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



    const id =
    selectedCard.dataset.id;




    const vehicleData = {


        name:
        vehicleName.value.trim()
        ||
        "Unnamed Vehicle",



        value:
        Number(
            vehicleValue.value
        )
        ||
        0,



        demand:
        Number(
            vehicleDemand.value
        )
        ||
        0,



        image:
        vehicleImage.value.trim()
        ||
        "",



        limited:
        vehicleLimited.checked



    };




    saveBtn.disabled =
    true;



    saveBtn.textContent =
    "Saving...";



    try{



        await setDoc(

            doc(
                db,
                "vehicles",
                id
            ),

            vehicleData

        );



        updateVehicleCard(
            id,
            vehicleData
        );



        closeAdmin();



        alert(
            "Vehicle saved!"
        );



        console.log(
            "Saved:",
            vehicleData
        );



    }


    catch(error){



        console.error(
            "Save error:",
            error
        );



        alert(
            error.message
        );


    }



    saveBtn.disabled =
    false;



    saveBtn.textContent =
    "Save";



});


}





// ==========================================
// LOGIN PANEL CLOSE
// ==========================================


if(loginCancelBtn){


loginCancelBtn.addEventListener(
"click",
()=>{


    if(loginOverlay)

        loginOverlay.style.display =
        "none";



    if(loginPassword)

        loginPassword.value =
        "";



    if(loginError)

        loginError.style.display =
        "none";


});


}






// ==========================================
// START CARD EDIT EVENTS
// ==========================================


setupCardEditing();



// ==========================================
// PART 3 END
// ==========================================
// ==========================================
// PART 4 - FINAL SYSTEM + STARTUP FIXES
// ==========================================


// ==========================================
// CREATE DEFAULT VEHICLE DATABASE ENTRIES
// ==========================================

async function createMissingVehicles(){


    try{


        const snapshot =
        await getDocs(
            collection(
                db,
                "vehicles"
            )
        );



        const existing =
        new Set();



        snapshot.forEach(
        (vehicle)=>{


            existing.add(
                vehicle.id
            );


        });



        for(
            let i = 1;
            i <= TOTAL_VEHICLES;
            i++
        ){


            if(
                !existing.has(
                    String(i)
                )
            ){


                await setDoc(

                    doc(
                        db,
                        "vehicles",
                        String(i)
                    ),

                    {


                        name:
                        `Vehicle ${i}`,



                        value:
                        0,



                        demand:
                        0,



                        image:
                        "",



                        limited:
                        false



                    }


                );



            }



        }



        console.log(
            "Database check complete."
        );



    }


    catch(error){


        console.error(
            "Database setup error:",
            error
        );


    }


}






// ==========================================
// IMAGE ERROR FIX
// ==========================================


document.addEventListener(
"error",
(event)=>{


    if(
        event.target.tagName === "IMG"
    ){


        event.target.style.display =
        "none";



        console.warn(
            "Image failed:",
            event.target.src
        );


    }


},
true
);






// ==========================================
// GLOBAL ERROR HANDLING
// ==========================================


window.addEventListener(
"error",
(event)=>{


    console.error(
        "Javascript Error:",
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
// LOADING SCREEN SUPPORT
// ==========================================


function removeLoading(){



    const loader =
    document.getElementById(
        "loadingScreen"
    );



    if(loader){


        loader.style.opacity =
        "0";



        setTimeout(
        ()=>{


            loader.style.display =
            "none";


        },
        300
        );


    }


}







// ==========================================
// FINAL STARTUP
// ==========================================


window.addEventListener(
"load",
async ()=>{


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
        "Cards:",
        TOTAL_VEHICLES
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



    await createMissingVehicles();



    await loadVehicles();



    removeLoading();



});







// ==========================================
// SYSTEM READY
// ==========================================


console.log(
    "Vehicle Values System Ready"
);



// ==========================================
// PART 4 END
// ==========================================
