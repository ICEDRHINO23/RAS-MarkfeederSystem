import { supabase } from "../../database/supabase.js";

export async function calculateRanks(examId){

    const { data } = await supabase

        .from("results")

        .select("*")

        .eq("exam_id", examId)

        .order("percentage",{

            ascending:false

        });

    for(let i=0;i<data.length;i++){

        await supabase

            .from("results")

            .update({

                school_rank:i+1

            })

            .eq("id",data[i].id);

    }

}
