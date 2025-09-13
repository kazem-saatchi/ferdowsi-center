import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {

    // update all charges date
    // await prisma.charge.updateMany({
    //     where:{title:"بدهی قبلی شارژ ماهانه"},
    //     data:{date:new Date("2025-04-09")}
    // });

    return NextResponse.json({message:"This is a test"});

}