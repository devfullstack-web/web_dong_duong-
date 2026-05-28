import { db } from "@/db";
import { categoryTypes } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { apiResponse, apiError } from "@/utils/api-response";

// GET /api/category-types - List all category types, optionally filter by ?name=product
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const name = searchParams.get("name");

        let results;
        if (name) {
            results = await db.select().from(categoryTypes).where(eq(categoryTypes.name, name));
        } else {
            results = await db.select().from(categoryTypes);
        }

        return apiResponse(results);
    } catch (error) {
        console.error("Error fetching category types:", error);
        return apiError("Internal Server Error", 500);
    }
}
