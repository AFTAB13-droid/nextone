import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import UserService from "@/services/userService";

export async function PUT(req: Request) {
  try {
    // Only Admin can assign/reassign employees to managers
    await requireAuth(["admin"]);

    const { employeeId, managerId } = await req.json();

    if (!employeeId) {
      return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
    }

    const updatedEmployee = await UserService.assignEmployeeToManager(
      employeeId,
      managerId || null
    );

    return NextResponse.json({
      success: true,
      message: "Employee assignment updated successfully",
      user: updatedEmployee,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to assign manager";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
