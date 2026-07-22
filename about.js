// ==========================================
// VEHICLE VALUES
// ABOUT.JS
// ==========================================


// ==========================================
// FOOTER YEAR
// (keeps the copyright line correct without
// needing to edit the HTML every year)
// ==========================================


const copyrightEl =

document.getElementById(
    "copyrightYear"
);


if(copyrightEl){


    const year =

    new Date().getFullYear();


    copyrightEl.textContent =

    `© ${year} Vehicle Values. All rights reserved.`;


}





// ==========================================
// SCROLL REVEAL
// (sections with the "reveal" class fade
// and rise into place the first time they
// enter the viewport. Falls back to just
// showing everything if IntersectionObserver
// isn't supported.)
// ==========================================


const revealEls =

document.querySelectorAll(
    ".reveal"
);


if(

    "IntersectionObserver" in window &&

    revealEls.length

){


    const observer =

    new IntersectionObserver(

    (entries)=>{


        entries.forEach(entry=>{


            if(entry.isIntersecting){


                entry.target.classList.add(
                    "in-view"
                );



                observer.unobserve(
                    entry.target
                );


            }


        });


    },

    {

        threshold:0.15

    }

    );




    revealEls.forEach(el=>{


        observer.observe(el);


    });


}


else{


    revealEls.forEach(el=>{


        el.classList.add(
            "in-view"
        );


    });


}
