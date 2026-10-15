import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import UserService from "@/services/userService";

export async function PUT(req: Request) {
  try {
    // Only Admin can assign/reassign employees to managers
    await requireAuth(["admin"]);

    const body = await req.json();
    const { employeeId, employeeIds, managerId } = body;

    // Batch assignment
    if (Array.isArray(employeeIds) && managerId) {
      await UserService.assignEmployeesToManager(managerId, employeeIds);
      return NextResponse.json({
        success: true,
        message: `${employeeIds.length} employee(s) assigned to manager successfully`,
      });
    }

    if (!employeeId) {
      return NextResponse.json({ error: "employeeId or employeeIds is required" }, { status: 400 });
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
