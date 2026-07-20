// ==========================================
// VEHICLE VALUES
// SCRIPT.JS
// UPDATED FIXED VERSION
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


const app = initializeApp(firebaseConfig);


const db = getFirestore(app);


const auth = getAuth(app);



console.log("Firebase Connected");





// ==========================================
// SETTINGS
// ==========================================


const ADMIN_EMAILS =
[
    "theg95705@gmail.com",
    "ellocosigma@gmail.com"
];


const CARDS_PER_PAGE =
16;


const MAX_VEHICLES =
32;






// ==========================================
// GLOBAL VARIABLES
// ==========================================


let currentUser = null;


let isAdmin = false;


let selectedVehicle = null;


let vehicles = [];


let filteredVehicles = [];


let currentPage = 1;







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





// Pagination


const prevPage =
document.getElementById(
    "prevPage"
);



const nextPage =
document.getElementById(
    "nextPage"
);



const pageNumber =
document.getElementById(
    "pageNumber"
);






// ==========================================
// HTML CHECK
// ==========================================


if(!cardsContainer){

    console.error(
        "ERROR: cardsContainer not found"
    );

}



if(!template){

    console.error(
        "ERROR: vehicleCardTemplate not found"
    );

}



console.log(
"HTML Loaded"
);



// ==========================================
// EXTRACT NUMBER FROM VEHICLE ID
// (sorting off the document ID, which never
// changes, instead of the editable name field
// - so renaming a vehicle can't reshuffle
// everyone else's position)
// ==========================================


function getVehicleNumber(id){


    const match =

    (id || "")

    .match(/\d+/);


    return match

    ? parseInt(match[0], 10)

    : Number.MAX_SAFE_INTEGER;


}


// ==========================================
// END PART 1
// ==========================================
// ==========================================
// PART 2 - VEHICLE DISPLAY + PAGINATION
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
        let i = 0;
        i < CARDS_PER_PAGE;
        i++
    ){



        const clone =

        template.content.cloneNode(true);




        const card =

        clone.querySelector(
            ".card"
        );




        if(card){

            card.dataset.id = "";

        }




        cardsContainer.appendChild(
            clone
        );


    }




    console.log(
        `${CARDS_PER_PAGE} vehicle cards created`
    );



}









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




        vehicles = [];





        snapshot.forEach(

        (item)=>{


            vehicles.push({

                id:item.id,

                ...item.data()

            });


        });




        // SORT NUMERICALLY BY DOCUMENT ID

        vehicles.sort(

        (a,b)=>


        getVehicleNumber(a.id)

        -

        getVehicleNumber(b.id)


        );




        // CAP TOTAL VEHICLES

        vehicles =

        vehicles.slice(

            0,

            MAX_VEHICLES

        );






        filteredVehicles =

        [

            ...vehicles

        ];







        currentPage = 1;





        displayVehicles();






        console.log(

            "Vehicles loaded:",

            vehicles.length

        );



    }



    catch(error){


        console.error(

            "Firebase vehicle loading error:",

            error

        );


    }



}











// ==========================================
// DISPLAY VEHICLES
// ==========================================


function displayVehicles(){



    if(!cardsContainer)

        return;







    const totalPages =


    Math.max(

        1,

        Math.ceil(

            filteredVehicles.length

            /

            CARDS_PER_PAGE

        )

    );







    if(currentPage > totalPages){

        currentPage = totalPages;

    }







    const start =


    (currentPage - 1)

    *

    CARDS_PER_PAGE;







    const end =


    start

    +

    CARDS_PER_PAGE;







    const pageVehicles =


    filteredVehicles.slice(

        start,

        end

    );








    const cards =


    cardsContainer.querySelectorAll(

        ".card"

    );








    cards.forEach(

    (card,index)=>{





        const vehicle =

        pageVehicles[index];







        if(vehicle){





            card.dataset.id =

            vehicle.id;





            updateCard(

                card,

                vehicle

            );





            card.style.display =

            "flex";



        }



        else{



            card.style.display =

            "none";



        }



    });








    updatePagination(

        totalPages

    );



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


            image.style.display =

            "none";


        }


    }







    if(vehicle.limited === true){



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
// PAGINATION DISPLAY
// ==========================================


function updatePagination(totalPages){



    if(pageNumber){


        pageNumber.textContent =

        `Page ${currentPage} of ${totalPages}`;


    }





    if(prevPage){


        prevPage.disabled =

        currentPage === 1;


    }





    if(nextPage){


        nextPage.disabled =

        currentPage === totalPages;


    }



}











// ==========================================
// NEXT PAGE
// ==========================================


if(nextPage){


    nextPage.addEventListener(

    "click",

    ()=>{


        const totalPages =

        Math.ceil(

            filteredVehicles.length

            /

            CARDS_PER_PAGE

        );



        if(currentPage < totalPages){



            currentPage++;



            displayVehicles();



            window.scrollTo({

                top:0,

                behavior:"smooth"

            });



        }



    });


}









// ==========================================
// PREVIOUS PAGE
// ==========================================


if(prevPage){


    prevPage.addEventListener(

    "click",

    ()=>{


        if(currentPage > 1){



            currentPage--;



            displayVehicles();



            window.scrollTo({

                top:0,

                behavior:"smooth"

            });



        }



    });


}









// ==========================================
// CREATE EMPTY CARDS
// ==========================================


createVehicleCards();



// ==========================================
// END PART 2
// ==========================================
// ==========================================
// PART 3 - SEARCH + FILTER + SORT SYSTEM
// ==========================================




// ==========================================
// FILTER ELEMENTS
// ==========================================


const searchInput =

document.getElementById(
    "searchInput"
);



const demandFilter =

document.getElementById(
    "demandFilter"
);



const sortFilter =

document.getElementById(
    "sortFilter"
);



const limitedOnly =

document.getElementById(
    "limitedOnly"
);







// ==========================================
// SEARCH LISTENER
// ==========================================


if(searchInput){


    searchInput.addEventListener(

    "input",

    ()=>{


        filterVehicles();


    });


}









// ==========================================
// DEMAND FILTER
// ==========================================


if(demandFilter){


    demandFilter.addEventListener(

    "change",

    ()=>{


        filterVehicles();


    });


}









// ==========================================
// SORT FILTER
// ==========================================


if(sortFilter){


    sortFilter.addEventListener(

    "change",

    ()=>{


        filterVehicles();


    });


}









// ==========================================
// LIMITED FILTER
// ==========================================


if(limitedOnly){


    limitedOnly.addEventListener(

    "change",

    ()=>{


        filterVehicles();


    });


}









// ==========================================
// FILTER FUNCTION
// ==========================================


function filterVehicles(){



    let result =

    [

        ...vehicles

    ];








    // ==========================
    // SEARCH
    // ==========================


    const search =


    searchInput

    ?

    searchInput.value

    .toLowerCase()

    .trim()

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









    // ==========================
    // DEMAND
    // ==========================


    if(

        demandFilter &&

        demandFilter.value !== "all"

    ){



        result =


        result.filter(

        vehicle=>{


            return Number(

                vehicle.demand || 0

            )

            ===

            Number(

                demandFilter.value

            );


        });


    }









    // ==========================
    // LIMITED ONLY
    // ==========================


    if(

        limitedOnly &&

        limitedOnly.checked

    ){



        result =


        result.filter(

        vehicle=>{


            return vehicle.limited === true;


        });


    }









    // ==========================
    // SORTING
    // ==========================


    if(sortFilter){



        switch(

            sortFilter.value

        ){



            case "valueHigh":



                result.sort(

                (a,b)=>


                Number(

                    b.value || 0

                )

                -

                Number(

                    a.value || 0

                )


                );


            break;








            case "valueLow":



                result.sort(

                (a,b)=>


                Number(

                    a.value || 0

                )

                -

                Number(

                    b.value || 0

                )


                );


            break;








            case "nameAZ":



                result.sort(

                (a,b)=>


                (

                    a.name || ""

                )

                .localeCompare(

                    b.name || ""

                )


                );


            break;








            case "nameZA":



                result.sort(

                (a,b)=>


                (

                    b.name || ""

                )

                .localeCompare(

                    a.name || ""

                )


                );


            break;








            case "demandHigh":



                result.sort(

                (a,b)=>


                Number(

                    b.demand || 0

                )

                -

                Number(

                    a.demand || 0

                )


                );


            break;








            case "demandLow":



                result.sort(

                (a,b)=>


                Number(

                    a.demand || 0

                )

                -

                Number(

                    b.demand || 0

                )


                );


            break;



        }



    }









    // UPDATE RESULTS


    filteredVehicles =

    result;







    // RESET PAGE


    currentPage = 1;







    // REDRAW CARDS


    displayVehicles();



}






// ==========================================
// END PART 3
// ==========================================
// ==========================================
// PART 4 - ADMIN AUTH SYSTEM
// ==========================================




// ==========================================
// CHECK AUTH STATE
// ==========================================


onAuthStateChanged(

auth,

(user)=>{



    currentUser = user;





    if(!user){


        isAdmin = false;



        if(logoutBtn){


            logoutBtn.style.display =

            "none";


        }



        console.log(
            "No admin logged in"
        );



        return;


    }







    if(

        user.email &&

        ADMIN_EMAILS

        .map(e=>e.toLowerCase())

        .includes(

            user.email.toLowerCase()

        )

    ){



        isAdmin = true;




        if(logoutBtn){


            logoutBtn.style.display =

            "inline-flex";


        }



        console.log(
            "Admin logged in"
        );



    }



    else{



        isAdmin = false;



        console.log(
            "User logged in but not admin"
        );



    }



});









// ==========================================
// LOGIN BUTTON
// ==========================================


if(loginBtn){



    loginBtn.addEventListener(

    "click",

    async()=>{





        const password =

        loginPassword.value;







        if(!password){



            alert(
                "Enter password"
            );


            return;


        }







        let loggedIn = false;




        for(

            const email of ADMIN_EMAILS

        ){



            try{



                await signInWithEmailAndPassword(

                    auth,

                    email,

                    password

                );



                loggedIn = true;



                break;



            }



            catch(error){



                // wrong match for this

                // admin email, try next


            }



        }







        if(loggedIn){



            if(loginOverlay){


                loginOverlay.style.display =

                "none";


            }



            loginEmail.value = "";

            loginPassword.value = "";



            console.log(
                "Login successful"
            );



        }



        else{



            console.error(

                "Login failed: no admin matched this password"

            );



            alert(
                "Incorrect password"
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



        try{



            await signOut(auth);



            isAdmin = false;



            console.log(
                "Logged out"
            );



        }



        catch(error){



            console.error(
                "Logout error:",
                error
            );



        }



    });


}









// ==========================================
// OPEN LOGIN PANEL
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
                "Admin login opened"
            );



        }




    }



});









// ==========================================
// CANCEL LOGIN
// ==========================================


if(loginCancelBtn){



    loginCancelBtn.addEventListener(

    "click",

    ()=>{





        if(loginOverlay){


            loginOverlay.style.display =

            "none";


        }





        if(loginPassword){


            loginPassword.value = "";


        }





    });


}






// ==========================================
// END PART 4
// ==========================================
// ==========================================
// PART 5 - ADMIN VEHICLE EDITOR + STARTUP
// ==========================================





// ==========================================
// CARD EDITING
// ==========================================


function setupCardEditing(){


    const cards =

    document.querySelectorAll(
        ".card"
    );



    cards.forEach(card=>{


        card.addEventListener(

        "click",

        ()=>{



            if(!isAdmin)

                return;





            selectedVehicle = card;



            openEditor(card);



        });



    });



}









// ==========================================
// OPEN EDITOR
// ==========================================


function openEditor(card){



    const name =

    card.querySelector(
        ".name-value"
    );



    const value =

    card.querySelector(
        ".value-text"
    );



    const demand =

    card.querySelector(
        ".demand-value"
    );



    const image =

    card.querySelector(
        "img"
    );



    const vehicleName =

    document.getElementById(
        "vehicleName"
    );



    const vehicleValue =

    document.getElementById(
        "vehicleValue"
    );



    const vehicleDemand =

    document.getElementById(
        "vehicleDemand"
    );



    const vehicleImage =

    document.getElementById(
        "vehicleImage"
    );



    const vehicleLimited =

    document.getElementById(
        "vehicleLimited"
    );







    if(vehicleName)

        vehicleName.value =

        name

        ? name.textContent

        : "";







    if(vehicleValue)

        vehicleValue.value =

        value

        ? value.textContent

        .replace("$","")

        .replace(/,/g,"")

        : 0;








    if(vehicleDemand)

        vehicleDemand.value =

        demand

        ? demand.textContent

        .replace("/10","")

        : 0;








    if(vehicleImage)

        vehicleImage.value =

        image

        ? image.src

        : "";








    if(vehicleLimited)

        vehicleLimited.checked =

        card.classList.contains(
            "limited"
        );








    if(adminOverlay)

        adminOverlay.style.display =

        "flex";



}









// ==========================================
// CANCEL EDIT
// ==========================================


if(cancelBtn){


    cancelBtn.addEventListener(

    "click",

    ()=>{


        if(adminOverlay)

            adminOverlay.style.display =

            "none";



        selectedVehicle = null;



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








        if(!id){


            alert(
                "Vehicle ID missing"
            );


            return;


        }









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

                    id

                ),

                vehicleData

            );







            console.log(
                "Vehicle saved:",
                id
            );







            if(adminOverlay)

                adminOverlay.style.display =

                "none";






            selectedVehicle = null;






            await loadVehicles();





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
// CLOSE OVERLAYS
// ==========================================


if(loginOverlay){


    loginOverlay.addEventListener(

    "click",

    (event)=>{


        if(event.target === loginOverlay){


            loginOverlay.style.display =

            "none";


        }


    });



}








if(adminOverlay){


    adminOverlay.addEventListener(

    "click",

    (event)=>{


        if(event.target === adminOverlay){


            adminOverlay.style.display =

            "none";



            selectedVehicle = null;


        }


    });



}









// ==========================================
// START WEBSITE
// ==========================================


setupCardEditing();


loadVehicles();



console.log(
    "Vehicle system ready"
);



// ==========================================
// END PART 5
// ==========================================
