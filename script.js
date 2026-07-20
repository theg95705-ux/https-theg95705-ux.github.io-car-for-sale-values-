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



const clearChangeBtn =
document.getElementById(
    "clearChangeBtn"
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
// FORMAT NUMBER AS COMPACT
// (100000 -> "100k", 1500000 -> "1.5M")
// ==========================================


function formatCompact(num){


    const abs =

    Math.abs(num);



    if(abs >= 1000000){


        const millions =

        num / 1000000;


        const isWhole =

        millions % 1 === 0;


        const rounded =

        millions.toFixed(

            isWhole ? 0 : 1

        );


        return rounded + "M";


    }



    if(abs >= 1000){


        const thousands =

        num / 1000;


        const isWhole =

        thousands % 1 === 0;


        const rounded =

        thousands.toFixed(

            isWhole ? 0 : 1

        );


        return rounded + "k";


    }



    return num.toString();


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





        filterVehicles();






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


        const newVal =

        Number(
            vehicle.value || 0
        );


        value.textContent =

        "$" +

        newVal.toLocaleString();




        // ==========================
        // VALUE CHANGE INDICATOR
        // ==========================


        const changeEl =

        card.querySelector(
            ".value-change"
        );



        if(changeEl){


            const prevVal =

            vehicle.previousValue;



            const hasPrev =

            prevVal !== undefined &&

            prevVal !== null &&

            Number(prevVal) !== newVal;



            if(hasPrev){


                const diff =

                newVal - Number(prevVal);


                const isUp =

                diff > 0;


                changeEl.textContent =

                (isUp ? "▲ " : "▼ ") +

                "$" +

                formatCompact(

                    Math.abs(diff)

                );


                changeEl.classList.toggle(
                    "positive",
                    isUp
                );


                changeEl.classList.toggle(
                    "negative",
                    !isUp
                );


            }



            else{


                changeEl.textContent = "";


                changeEl.classList.remove(
                    "positive"
                );


                changeEl.classList.remove(
                    "negative"
                );


            }


        }


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
// CUSTOM DROPDOWN WIRING
// (drives the real hidden <select> so the
// filter/sort logic below needs no changes)
// ==========================================


function initCustomSelect(

    wrapperId,

    nativeSelect

){


    const wrapper =

    document.getElementById(
        wrapperId
    );



    if(!wrapper || !nativeSelect)

        return;




    const trigger =

    wrapper.querySelector(
        ".custom-select-trigger"
    );



    const options =

    wrapper.querySelectorAll(
        ".custom-select-options li"
    );




    trigger.addEventListener(

    "click",

    ()=>{



        document

        .querySelectorAll(
            ".custom-select.open"
        )

        .forEach(el=>{

            if(el !== wrapper)

                el.classList.remove(
                    "open"
                );

        });




        wrapper.classList.toggle(
            "open"
        );



    });




    options.forEach(li=>{


        li.addEventListener(

        "click",

        ()=>{



            nativeSelect.value =

            li.dataset.value;




            nativeSelect.dispatchEvent(

                new Event("change")

            );




            trigger.textContent =

            li.textContent.trim();




            options.forEach(o=>

                o.classList.remove(
                    "selected"
                )

            );




            li.classList.add(
                "selected"
            );




            wrapper.classList.remove(
                "open"
            );



        });


    });


}




document.addEventListener(

"click",

(event)=>{


    document

    .querySelectorAll(
        ".custom-select.open"
    )

    .forEach(wrapper=>{


        if(

            !wrapper.contains(
                event.target
            )

        ){


            wrapper.classList.remove(
                "open"
            );


        }


    });


});




initCustomSelect(
    "demandFilterCustom",
    demandFilter
);



initCustomSelect(
    "sortFilterCustom",
    sortFilter
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





        const email =

        loginEmail.value.trim();





        const password =

        loginPassword.value;







        if(!email || !password){



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



        catch(error){



            console.error(

                "Login failed:",

                error

            );



            alert(
                "Incorrect email or password"
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








        // ==========================
        // GRAB THE VEHICLE'S CURRENT
        // (PRE-EDIT) VALUE SO WE CAN
        // STORE IT AS previousValue
        // ==========================


        const oldVehicle =

        vehicles.find(

            v => v.id === id

        );



        const oldValue =

        oldVehicle

        ? Number(oldVehicle.value || 0)

        : 0;









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
            .checked,






            previousValue:

            oldValue



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
// CLEAR PRICE CHANGE
// (removes previousValue from Firestore so
// the up/down change pill disappears -
// does NOT delete the vehicle)
// ==========================================


if(clearChangeBtn){



    clearChangeBtn.addEventListener(

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








        const currentVehicle =

        vehicles.find(

            v => v.id === id

        );



        if(!currentVehicle)

            return;








        try{



            await setDoc(

                doc(

                    db,

                    "vehicles",

                    id

                ),

                {

                    ...currentVehicle,

                    previousValue:

                    Number(

                        currentVehicle.value || 0

                    )

                }

            );







            console.log(
                "Price change cleared:",
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

                "Clear change error:",

                error

            );



            alert(
                "Failed to clear price change"
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
