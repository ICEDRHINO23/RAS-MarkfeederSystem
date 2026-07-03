export function calculateGrade(percentage){

    if(percentage>=91) return "A1";

    if(percentage>=81) return "A2";

    if(percentage>=71) return "B1";

    if(percentage>=61) return "B2";

    if(percentage>=51) return "C1";

    if(percentage>=41) return "C2";

    if(percentage>=33) return "D";

    return "E";

}
