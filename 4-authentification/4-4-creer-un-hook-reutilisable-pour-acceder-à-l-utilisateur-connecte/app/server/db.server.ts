import { PrismaClient } from "@prisma/client";

declare global {
	// avoid multiple instances when hot-reloading
	var prismaClient: PrismaClient;
}

globalThis.prismaClient ??= new PrismaClient();

export const prisma = globalThis.prismaClient;
