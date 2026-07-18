// ==========================================
// VEHICLE VALUES
// SCRIPT.JS
// FIXED COMPLETE VERSION
// PART 1 - FIREBASE + GLOBAL SYSTEM
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


    apiKey:
    "AIzaSyCzyyZcuQsR19fsHnffGV0L2LCQ-RRuaGw",


    authDomain:
    "admin-pannel-268a9.firebaseapp.com",


    projectId:
    "admin-pannel-268a9",


    storageBucket:
    "admin-pannel-268a9.firebasestorage.app",


    messagingSenderId:
    "619934011757",


    appId:
    "1:619934011757:web:8b4b98362df5f932fc0a64"


};






// ==========================================
// INITIALISE FIREBASE
// ==========================================


const app =
initializeApp(firebaseConfig);



const db =
getFirestore(app);



const auth =
getAuth(app);



console.log(
"Firebase Connected"
);







// ==========================================
// SETTINGS
// ==========================================


const ADMIN_EMAILS = [

    "theg95705@gmail.com"

];



const TOTAL_VEHICLES = 82;





let currentUser = null;


let isAdmin = false;


let selectedVehicle = null;


let vehicles = [];







// ==========================================
// HTML ELEMENTS
// ==========================================


const cardsContainer =
document.getElementById(
    "cardsContainer"
);



const template =
document.getElementById(
    "vehicleCardTemplate"
);



const loginOverlay =
document.getElementById(
    "loginOverlay"
);



const adminOverlay =
document.getElementById(
    "adminOverlay"
);



const loginEmail =
document.getElementById(
    "loginEmail"
);



const loginPassword =
document.getElementById(
    "loginPassword"
);



const loginBtn =
document.getElementById(
    "loginBtn"
);



const loginCancelBtn =
document.getElementById(
    "loginCancelBtn"
);



const logoutBtn =
document.getElementById(
    "logoutBtn"
);



const saveBtn =
document.getElementById(
    "saveBtn"
);



const cancelBtn =
document.getElementById(
    "cancelBtn"
);





console.log(
"HTML Loaded"
);







// ==========================================
// HIDE ADMIN WINDOWS ON START
// ==========================================


if(loginOverlay){

    loginOverlay.style.display =
    "none";

}



if(adminOverlay){

    adminOverlay.style.display =
    "none";

}



console.log(
"Vehicle Values System Ready"
);
// ==========================================
// PART 2 - VEHICLE CARD SYSTEM
// ==========================================





// ==========================================
// CREATE VEHICLE CARDS
// ==========================================


function createVehicleCards(){


    if(!cardsContainer){


        console.error(
            "cardsContainer missing"
        );


        return;


    }



    if(!template){


        console.error(
            "vehicleCardTemplate missing"
        );


        return;


    }



    cardsContainer.innerHTML = "";



    for(
        let i = 1;
        i <= TOTAL_VEHICLES;
        i++
    ){



        const clone =
        template.content.cloneNode(true);



        const card =
        clone.querySelector(
            ".card"
        );



        if(card){


            card.dataset.id =
            i;


        }



        cardsContainer.appendChild(
            clone
        );


    }



    console.log(
        TOTAL_VEHICLES +
        " cards created"
    );


}







// ==========================================
// LOAD VEHICLES FROM FIRESTORE
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



        vehicles = [];



        snapshot.forEach(
        item=>{


            vehicles.push({


                id:item.id,


                ...item.data()


            });



        });





        console.log(
            "Vehicles found:",
            vehicles.length
        );



        displayVehicles(
            vehicles
        );



    }



    catch(error){


        console.error(
            "Vehicle loading failed:",
            error
        );


    }


}









// ==========================================
// DISPLAY VEHICLES
// ==========================================


function displayVehicles(list){



    if(!cardsContainer)
        return;



    const cards =
    cardsContainer.querySelectorAll(
        ".card"
    );





    cards.forEach(card=>{



        const id =
        card.dataset.id;



        const vehicle =
        list.find(
            v =>
            String(v.id)
            ===
            String(id)
        );





        if(vehicle){


            updateCard(
                card,
                vehicle
            );


        }




        else{


            updateCard(
                card,
                {

                    name:
                    "Vehicle " + id,


                    value:0,


                    demand:0,


                    image:"",


                    limited:false


                }

            );


        }




        // ALWAYS SHOW CARDS

        card.style.display =
        "flex";



    });



}









// ==========================================
// UPDATE CARD
// ==========================================


function updateCard(
    card,
    vehicle
){



    const name =
    card.querySelector(
        ".name-value"
    );



    const image =
    card.querySelector(
        "img"
    );



    const value =
    card.querySelector(
        ".value-text"
    );



    const demand =
    card.querySelector(
        ".demand-value"
    );



    const badge =
    card.querySelector(
        ".limited-badge"
    );






    if(name){


        name.textContent =
        vehicle.name ||
        "Unnamed Vehicle";


    }





    if(value){


        value.textContent =
        "$" +
        Number(
            vehicle.value || 0
        )
        .toLocaleString();


    }






    if(demand){


        demand.textContent =
        Number(
            vehicle.demand || 0
        )
        +
        "/10";


    }






    if(image){


        if(vehicle.image){


            image.src =
            vehicle.image;


            image.style.display =
            "block";


        }


        else{


            image.removeAttribute(
                "src"
            );


        }


    }







    if(vehicle.limited === true){


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
// CREATE CARDS FIRST
// ==========================================


createVehicleCards();
// ==========================================
// PART 3 - ADMIN AUTH SYSTEM
// ==========================================





// ==========================================
// AUTH STATE CHECK
// ==========================================


onAuthStateChanged(
auth,
(user)=>{


    currentUser =
    user;



    if(!user){


        isAdmin = false;



        if(logoutBtn){


            logoutBtn.style.display =
            "none";


        }



        console.log(
            "No user logged in"
        );


        return;


    }






    console.log(
        "Logged in:",
        user.email
    );







    if(
        user.email &&
        ADMIN_EMAILS.includes(
            user.email.toLowerCase()
        )
    ){


        isAdmin = true;



        if(logoutBtn){


            logoutBtn.style.display =
            "inline-flex";


        }



        console.log(
            "ADMIN ACCESS GRANTED"
        );



    }



    else{


        isAdmin = false;



        console.log(
            "Account is not admin"
        );



    }




});











// ==========================================
// OPEN LOGIN WITH SHORTCUT
// CTRL + ALT + RIGHT ARROW
// ==========================================


document.addEventListener(
"keydown",
(event)=>{


    if(

        event.ctrlKey &&
        event.altKey &&
        event.key === "ArrowRight"

    ){



        if(loginOverlay){


            loginOverlay.style.display =
            "flex";



            console.log(
                "Login opened"
            );


        }



    }



});












// ==========================================
// LOGIN BUTTON
// ==========================================


if(loginBtn){



loginBtn.addEventListener(
"click",
async()=>{



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


        alert(
            "Enter email and password"
        );


        return;


    }







    try{



        const result =
        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );



        console.log(
            "LOGIN SUCCESS:",
            result.user.email
        );



        if(
            ADMIN_EMAILS.includes(
                result.user.email.toLowerCase()
            )
        ){



            loginOverlay.style.display =
            "none";



            loginEmail.value =
            "";



            loginPassword.value =
            "";



        }



        else{


            alert(
                "This account is not an admin"
            );


            await signOut(auth);



        }




    }



    catch(error){



        console.error(
            "LOGIN ERROR:",
            error.code,
            error.message
        );



        alert(
            "Login failed: " +
            error.code
        );



    }




});


}









// ==========================================
// LOGIN CANCEL
// ==========================================


if(loginCancelBtn){



loginCancelBtn.addEventListener(
"click",
()=>{


    if(loginOverlay){


        loginOverlay.style.display =
        "none";


    }



    loginPassword.value =
    "";



});


}









// ==========================================
// LOGOUT
// ==========================================


if(logoutBtn){



logoutBtn.addEventListener(
"click",
async()=>{


    await signOut(auth);



    isAdmin =
    false;



    console.log(
        "Logged out"
    );



});


}
// ==========================================
// PART 4 - ADMIN EDITOR + DATABASE + START
// ==========================================







// ==========================================
// CARD CLICK OPEN EDITOR
// ==========================================


document
.querySelectorAll(".card")
.forEach(card=>{


    card.addEventListener(
    "click",
    ()=>{


        if(!isAdmin){


            console.log(
                "Admin access required"
            );


            return;


        }



        selectedVehicle =
        card;



        openEditor(
            card
        );



    });



});









// ==========================================
// OPEN ADMIN EDITOR
// ==========================================


function openEditor(card){



    if(!adminOverlay)
        return;





    const name =
    card.querySelector(
        ".name-value"
    )?.textContent || "";



    const value =
    card.querySelector(
        ".value-text"
    )
    ?.textContent
    .replace("$","")
    .replace(/,/g,"")
    ||
    "0";



    const demand =
    card.querySelector(
        ".demand-value"
    )
    ?.textContent
    .replace("/10","")
    ||
    "0";



    const image =
    card.querySelector(
        "img"
    )
    ?.src || "";





    document.getElementById(
        "vehicleName"
    ).value =
    name;



    document.getElementById(
        "vehicleValue"
    ).value =
    value;



    document.getElementById(
        "vehicleDemand"
    ).value =
    demand;



    document.getElementById(
        "vehicleImage"
    ).value =
    image;



    document.getElementById(
        "vehicleLimited"
    ).checked =
    card.classList.contains(
        "limited"
    );





    adminOverlay.style.display =
    "flex";



}









// ==========================================
// CLOSE ADMIN EDITOR
// ==========================================


if(cancelBtn){



cancelBtn.addEventListener(
"click",
()=>{


    adminOverlay.style.display =
    "none";


    selectedVehicle =
    null;


});


}









// ==========================================
// SAVE VEHICLE
// ==========================================


if(saveBtn){



saveBtn.addEventListener(
"click",
async()=>{



    if(!isAdmin){


        alert(
            "Admin only"
        );


        return;


    }




    if(!selectedVehicle)
        return;






    const id =
    selectedVehicle.dataset.id;







    const vehicleData = {


        name:
        document.getElementById(
            "vehicleName"
        )
        .value
        .trim(),



        value:
        Number(
            document.getElementById(
                "vehicleValue"
            )
            .value
        ),



        demand:
        Number(
            document.getElementById(
                "vehicleDemand"
            )
            .value
        ),



        image:
        document.getElementById(
            "vehicleImage"
        )
        .value
        .trim(),



        limited:
        document.getElementById(
            "vehicleLimited"
        )
        .checked



    };






    try{



        await setDoc(

            doc(
                db,
                "vehicles",
                String(id)
            ),

            vehicleData

        );





        console.log(
            "Vehicle saved:",
            id
        );



        alert(
            "Vehicle saved"
        );



        await loadVehicles();





        adminOverlay.style.display =
        "none";



        selectedVehicle =
        null;




    }



    catch(error){



        console.error(
            "Save error:",
            error
        );



        alert(
            "Save failed"
        );



    }




});


}









// ==========================================
// CREATE DATABASE IF EMPTY
// ==========================================


async function createVehicleIfMissing(){


    try{


        const snapshot =
        await getDocs(
            collection(
                db,
                "vehicles"
            )
        );





        if(
            !snapshot.empty
        ){


            console.log(
                "Database exists"
            );


            return;


        }






        console.log(
            "Creating 82 vehicles..."
        );





        for(
            let i = 1;
            i <= TOTAL_VEHICLES;
            i++
        ){



            await setDoc(

                doc(
                    db,
                    "vehicles",
                    String(i)
                ),

                {


                    name:
                    "Vehicle " + i,


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





        console.log(
            "82 vehicles created"
        );



    }



    catch(error){


        console.error(
            "Database error:",
            error
        );


    }


}









// ==========================================
// CLOSE OVERLAYS OUTSIDE CLICK
// ==========================================


if(loginOverlay){


loginOverlay.addEventListener(
"click",
(e)=>{


    if(e.target === loginOverlay){


        loginOverlay.style.display =
        "none";


    }


});


}




if(adminOverlay){


adminOverlay.addEventListener(
"click",
(e)=>{


    if(e.target === adminOverlay){


        adminOverlay.style.display =
        "none";


        selectedVehicle =
        null;


    }


});


}









// ==========================================
// PAGE STARTUP
// ==========================================


window.addEventListener(
"load",
async()=>{



    console.log(
        "Vehicle Values Loading..."
    );



    await createVehicleIfMissing();



    await loadVehicles();



    console.log(
        "Vehicle Values Ready"
    );



});







// ==========================================
// IMAGE ERROR HANDLER
// ==========================================


document.addEventListener(
"error",
(event)=>{


    if(
        event.target.tagName === "IMG"
    ){


        event.target.style.display =
        "none";


    }


},
true
);







console.log(
"Vehicle Values System Loaded"
);
