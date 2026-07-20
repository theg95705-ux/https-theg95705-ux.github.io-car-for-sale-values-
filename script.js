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


const ADMIN_EMAIL =
"theg95705@gmail.com";


const TOTAL_VEHICLES =
32;



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



const logoutBtn =
document.getElementById(
    "logoutBtn"
);



const saveBtn =
document.getElementById(
    "saveBtn"
);




console.log(
"HTML Loaded"
);




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


        card.dataset.id =
        i;



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
// LOAD VEHICLES
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



        displayVehicles(
            vehicles
        );



        console.log(
        "Vehicles loaded"
        );


    }


    catch(error){


        console.error(
        "Vehicle loading failed",
        error
        );


    }


}
// ==========================================
// PART 2 - VEHICLE DISPLAY SYSTEM
// ==========================================



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
            v => String(v.id) === String(id)
        );



        if(vehicle){


            updateCard(
                card,
                vehicle
            );


            card.style.display =
            "block";


        }


        else{


            card.style.display =
            "none";


        }


    });



}






// ==========================================
// UPDATE CARD DATA
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





    if(name)

        name.textContent =
        vehicle.name ||
        "Unnamed Vehicle";





    if(value)

        value.textContent =
        "$" +
        Number(
            vehicle.value || 0
        )
        .toLocaleString();





    if(demand)

        demand.textContent =
        Number(
            vehicle.demand || 0
        )
        +
        "/10";





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






    if(
        vehicle.limited === true
    ){


        card.classList.add(
            "limited"
        );


        if(badge)

            badge.style.display =
            "flex";


    }


    else{


        card.classList.remove(
            "limited"
        );


        if(badge)

            badge.style.display =
            "none";


    }



}







// ==========================================
// SEARCH SYSTEM
// ==========================================


const searchInput =
document.getElementById(
    "searchInput"
);



if(searchInput){


    searchInput.addEventListener(
    "input",
    ()=>{


        filterVehicles();


    });


}







// ==========================================
// FILTER SYSTEM
// ==========================================


const demandFilter =
document.getElementById(
    "demandFilter"
);



const limitedOnly =
document.getElementById(
    "limitedOnly"
);



if(demandFilter){


    demandFilter.addEventListener(
    "change",
    ()=>{


        filterVehicles();


    });


}




if(limitedOnly){


    limitedOnly.addEventListener(
    "change",
    ()=>{


        filterVehicles();


    });


}







// ==========================================
// SORT SYSTEM
// ==========================================


const sortFilter =
document.getElementById(
    "sortFilter"
);



if(sortFilter){


    sortFilter.addEventListener(
    "change",
    ()=>{


        filterVehicles();


    });


}








// ==========================================
// FILTER + SORT FUNCTION
// ==========================================


function filterVehicles(){



    let result =
    [...vehicles];





    // SEARCH


    const search =
    searchInput
    ?
    searchInput.value
    .toLowerCase()
    :
    "";




    if(search){


        result =
        result.filter(
        vehicle=>{


            return (
                vehicle.name &&
                vehicle.name
                .toLowerCase()
                .includes(search)
            );


        });


    }







    // DEMAND FILTER


    if(
        demandFilter &&
        demandFilter.value !== "all"
    ){


        result =
        result.filter(
        vehicle=>{


            return Number(
                vehicle.demand
            )
            ===
            Number(
                demandFilter.value
            );


        });


    }







    // LIMITED FILTER


    if(
        limitedOnly &&
        limitedOnly.checked
    ){


        result =
        result.filter(
        vehicle=>
            vehicle.limited === true
        );


    }








    // SORT


    if(sortFilter){



        switch(
            sortFilter.value
        ){



            case "valueHigh":


                result.sort(
                (a,b)=>
                b.value-a.value
                );


            break;






            case "valueLow":


                result.sort(
                (a,b)=>
                a.value-b.value
                );


            break;






            case "nameAZ":


                result.sort(
                (a,b)=>
                a.name
                .localeCompare(
                    b.name
                )
                );


            break;






            case "nameZA":


                result.sort(
                (a,b)=>
                b.name
                .localeCompare(
                    a.name
                )
                );


            break;






            case "demandHigh":


                result.sort(
                (a,b)=>
                b.demand-a.demand
                );


            break;






            case "demandLow":


                result.sort(
                (a,b)=>
                a.demand-b.demand
                );


            break;


        }


    }






    displayVehicles(
        result
    );



}







// ==========================================
// START CARDS
// ==========================================


createVehicleCards();


loadVehicles();
// ==========================================
// PART 3 - ADMIN SYSTEM
// ==========================================



// ==========================================
// AUTH STATE
// ==========================================


onAuthStateChanged(
auth,
(user)=>{


    currentUser =
    user;



    if(!user){


        isAdmin =
        false;



        if(logoutBtn)

            logoutBtn.style.display =
            "none";



        return;


    }






    if(
        user.email &&
        user.email.toLowerCase()
        ===
        ADMIN_EMAIL.toLowerCase()
    ){


        isAdmin =
        true;



        if(logoutBtn)

            logoutBtn.style.display =
            "inline-flex";



        console.log(
        "Admin logged in"
        );


    }



    else{


        isAdmin =
        false;


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
    .trim();



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


        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );



        loginOverlay.style.display =
        "none";



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


        alert(
        "Login failed"
        );


    }




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



    alert(
    "Logged out"
    );


});


}








// ==========================================
// OPEN ADMIN LOGIN
// CTRL + ALT + RIGHT ARROW
// ==========================================


document.addEventListener(
"keydown",
event=>{


    if(
        event.ctrlKey &&
        event.altKey &&
        event.key === "ArrowRight"
    ){


        if(loginOverlay)

            loginOverlay.style.display =
            "flex";


    }



});








// ==========================================
// CARD EDIT CLICK
// ==========================================


document
.querySelectorAll(".card")
.forEach(card=>{


    card.addEventListener(
    "click",
    ()=>{


        if(!isAdmin)

            return;



        selectedVehicle =
        card;



        openEditor(
            card
        );


    });



});









// ==========================================
// OPEN EDITOR
// ==========================================


function openEditor(card){



    const name =
    card.querySelector(
        ".name-value"
    )
    .textContent;



    const value =
    card.querySelector(
        ".value-text"
    )
    .textContent
    .replace(
        "$",
        ""
    )
    .replace(
        /,/g,
        ""
    );



    const demand =
    card.querySelector(
        ".demand-value"
    )
    .textContent
    .replace(
        "/10",
        ""
    );



    const image =
    card.querySelector(
        "img"
    )
    .src;




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
    image || "";



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
// CLOSE EDITOR
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





    const data = {


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
                id
            ),
            data
        );



        alert(
        "Vehicle saved"
        );



        await loadVehicles();



        adminOverlay.style.display =
        "none";



    }



    catch(error){


        console.error(
        error
        );


        alert(
        "Save failed"
        );


    }



});


}
// ==========================================
// PART 4 - FINAL SYSTEM FIXES
// ==========================================





// ==========================================
// CLOSE OVERLAYS WHEN CLICKING OUTSIDE
// ==========================================


if(loginOverlay){


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


}







if(adminOverlay){


adminOverlay.addEventListener(
"click",
(event)=>{


    if(
        event.target === adminOverlay
    ){


        adminOverlay.style.display =
        "none";


        selectedVehicle =
        null;


    }


});


}







// ==========================================
// LOGIN CANCEL BUTTON
// ==========================================


if(loginCancelBtn){


loginCancelBtn.addEventListener(
"click",
()=>{


    loginOverlay.style.display =
    "none";



    loginPassword.value =
    "";



});


}







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








// ==========================================
// REFRESH FUNCTION
// ==========================================


window.refreshVehicles =
async function(){


    await loadVehicles();


    console.log(
    "Vehicles refreshed"
    );


};








// ==========================================
// CREATE VEHICLE DATABASE WHEN NEEDED
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
            "Database already exists"
            );


            return;


        }







        console.log(
        "Creating starter vehicles..."
        );






        for(
            let i = 1;
            i <= 10;
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



        console.log(
        "Starter vehicles created"
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
// PAGE STARTUP
// ==========================================


window.addEventListener(
"load",
async()=>{


    console.log(
    "================================="
    );


    console.log(
    "Vehicle Values Ready"
    );


    console.log(
    "Cards:",
    TOTAL_VEHICLES
    );


    console.log(
    "Admin shortcut:"
    );


    console.log(
    "CTRL + ALT + RIGHT ARROW"
    );


    console.log(
    "================================="
    );



    await createVehicleIfMissing();



    await loadVehicles();



});







console.log(
"Vehicle Values System Loaded"
);
