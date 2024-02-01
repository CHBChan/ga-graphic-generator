import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET(req: NextRequest, res: NextResponse) {
    
    try {
        const response = await axios.get('https://api.gatcg.com/cards/search?type=CHAMPION');
        const data : any = response.data;
        
        return NextResponse.json({
            message: "Cards retrieved successfully",
            succes: true,
            data: data
        },{
            headers: corsHeaders,
        });
    } catch (error : any) {
        return NextResponse.json({error: error.message}, {status: 444});
    }
}