export function calculateTotals(subjects){

    let total=0;

    let max=0;

    subjects.forEach(subject=>{

        total += Number(subject.marks_obtained||0);

        max += Number(subject.max_marks||0);

    });

    return{

        total,

        max,

        percentage:

        max===0

        ?0

        :Number(

            (

                total/max*100

            ).toFixed(2)

        )

    };

}
