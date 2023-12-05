import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest, res: NextResponse) {
    try {
        const response = await axios.get('https://api.gatcg.com/cards/search?type=CHAMPION');
        const data : any = response.data;
        
        return NextResponse.json({
            message: "Cards retrieved successfully",
            succes: true,
            data: data
        });
    } catch (error : any) {
        return NextResponse.json({error: error.message}, {status: 444});
    }
}