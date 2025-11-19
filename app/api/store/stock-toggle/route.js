import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";

import { NextResponse } from "next/server";


//toggle stock of a product
export async function POST(request) {
    
    try {
        const {useId} = getAuth(request)
        const {productId} = await request.json()

        if(!productId){
            return NextResponse.json({error:"missing details: productId"},{ status: 400});
            
        }

        const storeId = await authSeller(useId)

        if(!storeId){
            return NextResponse.json({error: 'not authorized'}, {stauts:401})
        }

        //check if product exists
        const product = await prisma.product.findFirst({
            where:{ id: productId, storeId}
        })

        if(!product){
          return NextResponse.json({error: 'not product found'}, {stauts:404})

        }

        await prisma.product.update({
            where:{ id: productId},
            data:{ inStock: !product.inStock}
        })

        return NextResponse.json({message:"Product stock updated sucessfully"})

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message}, {status: 400})
        
    }
}