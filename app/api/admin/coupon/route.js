
import authAdmin from "@/middlewares/authAdmin"
import { NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { inngest } from "@/inngest/client"

//Add new coupon
export async function POST(request) {
    try {
        const {userId} = getAuth()
        const isAdmin = await authAdmin(userId)

        if(!isAdmin){
            return NextResponse.json({error:"not authorized"}, {status: 401})
        }
        
        const {cupon} = await request.json()
        coupon.code = coupon.code.toUpperCase()
        
        await prisma.coupon.create({data: coupon}).then(async(coupn)=>{
            //Run Inngest function to delete coupon on expiry
            await inngest.send({
                name: "app/coupon.expired",
                data: {
                    code: coupon.code,
                    expires_At: coupon.expiresAt,
                }
            })
        })

        return NextResponse.json({message: "Coupon added sucessfully"})
    } catch (error) {
        console.error(error)
        return NextResponse.json({error: error.code || error.message}, { status: 400})
        
    }
    
}


//Delete coupon /api/coupon?id=couponId
export async function DELETE(request) {
    try {
        const {userId} = getAuth()
        const isAdmin = await authAdmin(userId)

        if(!isAdmin){
            return NextResponse.json({error:"not authorized"}, {status: 401})
        }
        const {searchParams} = request.nextUrl;
        const code = searchParams.get('code')

        await prisma.coupon.delete({where: {code}})
        return NextResponse.json({message: "Coupon deleted sucessfully"})
    } catch (error) {
        console.error(error)
        return NextResponse.json({error: error.code || error.message}, { status: 400})
        
    }
    
}

//get all coupons

export async function get(request) {
    try {

        const {userId} = getAuth(request)
        const isAdmin = await authAdmin(userId)

        if(!isAdmin){
            return NextResponse.json({error:"not authorized"}, {status: 401})
        }

        const coupons = await prisma.coupon.findMany({})
        return NextResponse.json({coupons})
        
        
    } catch (error) {
         console.error(error)
        return NextResponse.json({error: error.code || error.message}, { status: 400})
        
    }
    
}