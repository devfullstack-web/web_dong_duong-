import { db } from "@/db";
import { contacts } from "@/db/schemas";
import { apiResponse, apiError } from "@/utils/api-response";
import { eq } from "drizzle-orm";
import { withAuth } from "@/middlewares/middleware";
import { PERMISSIONS } from "@/constants/rbac";
import { NextRequest } from "next/server";
import { CONTACT_STATUS_VALUES, isConstantValue } from "@/constants/content";

// PATCH /api/contacts/[id] - Update a contact submission
export const PATCH = withAuth(async (request: NextRequest, session, { params }) => {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!isConstantValue(CONTACT_STATUS_VALUES, status)) {
      return apiError("Status is invalid", 400);
    }

    const [updatedContact] = await db
      .update(contacts)
      .set({ 
        status,
        updated_at: new Date()
      })
      .where(eq(contacts.id, id))
      .returning();

    if (!updatedContact) {
      return apiError("Contact not found", 404);
    }

    return apiResponse(updatedContact);
  } catch (error) {
    console.error("Error updating contact:", error);
    return apiError("Internal Server Error", 500);
  }
}, { requiredPermissions: [PERMISSIONS.CONTACTS_UPDATE] });

// DELETE /api/contacts/[id] - Delete a contact submission
export const DELETE = withAuth(async (request: NextRequest, session, { params }) => {
  try {
    const { id } = await params;

    const [deletedContact] = await db
      .delete(contacts)
      .where(eq(contacts.id, id))
      .returning();

    if (!deletedContact) {
      return apiError("Contact not found", 404);
    }

    return apiResponse({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return apiError("Internal Server Error", 500);
  }
}, { requiredPermissions: [PERMISSIONS.CONTACTS_DELETE] });
