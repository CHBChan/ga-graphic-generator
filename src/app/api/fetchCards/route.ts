import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest, res: NextResponse) {
    
    try {
        const response = await axios.get('https://api.gatcg.com/cards/search?type=CHAMPION');
        const data : any = response.data;

        let list : any = data['data'];
        let total_pages : number = data['total_pages'];

        // If more than 1 page
        if(total_pages > 1) {
            for(let i = 2; i <= total_pages; i++) {
                const pageResponse = await axios.get(`https://api.gatcg.com/cards/search?type=CHAMPION&page=${i}`);
                const pageData : any = pageResponse.data;

                // Concat additional cards to list
                list = list.concat(pageData['data']);
            }
        }
        
        return NextResponse.json({
            message: "Cards retrieved successfully",
            succes: true,
            data: list
        });
    } catch (error : any) {
        return NextResponse.json({error: error.message}, {status: 444});
    }
}