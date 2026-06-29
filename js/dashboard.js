import { supabase } from "../database/supabase.js";

/* =====================================
   Authentication Check
===================================== */

const {
    data: { session }
} = await supabase.auth.getSession();

if (!session) {
    window.location.href = "../login.html";
}

/* =====================================
   Show Admin Name
===================================== */

document.getElementById("adminName").textContent =
    session.user.email;

/* =====================================
   Live Clock
===================================== */

function updateClock() {

    const now = new Date();

    document.getElementById("currentTime").textContent =
        now.toLocaleString();

}

updateClock();

setInterval(updateClock,1000);

/* =====================================
   Dashboard Counts
===================================== */

async function loadCounts(){

    const students =
        await supabase
        .from("students")
        .select("*",{count:"exact",head:true});

    const teachers =
        await supabase
        .from("teachers")
        .select("*",{count:"exact",head:true});

    const classes =
        await supabase
        .from("classes")
        .select("*",{count:"exact",head:true});

    const subjects =
        await supabase
        .from("subjects")
        .select("*",{count:"exact",head:true});

    document.getElementById("studentCount").textContent =
        students.count ?? 0;

    document.getElementById("teacherCount").textContent =
        teachers.count ?? 0;

    document.getElementById("classCount").textContent =
        classes.count ?? 0;

    document.getElementById("subjectCount").textContent =
        subjects.count ?? 0;

}

loadCounts();

/* =====================================
   Logout
===================================== */

document.getElementById("logoutBtn")
.addEventListener("click",async()=>{

    await supabase.auth.signOut();

    window.location.href="../login.html";

});
