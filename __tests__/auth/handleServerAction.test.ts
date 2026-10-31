import type { Role } from "@prisma/client";
import {
  adminReadAction,
  adminWriteAction,
  handleServerAction,
} from "@/utils/handleServerAction";
import { verifyToken } from "@/utils/auth";
import { errorMSG } from "@/utils/messages";

jest.mock("@/utils/auth", () => ({ verifyToken: jest.fn() }));

const mockVerify = verifyToken as jest.MockedFunction<typeof verifyToken>;

function signInAs(role: Role) {
  mockVerify.mockResolvedValue({
    success: true,
    message: "ok",
    person: { id: `id-${role}`, role } as never,
  });
}

describe("adminWriteAction", () => {
  it("runs for ADMIN", async () => {
    signInAs("ADMIN");
    const action = jest.fn().mockResolvedValue("done");
    const result = await adminWriteAction(action);
    expect(result).toMatchObject({ success: true, data: "done" });
    expect(action).toHaveBeenCalledTimes(1);
  });

  it.each<Role>(["MANAGER", "STAFF", "USER"])(
    "refuses %s without running the action",
    async (role) => {
      signInAs(role);
      const action = jest.fn();
      const result = await adminWriteAction(action);
      expect(result).toEqual({
        success: false,
        message: errorMSG.noPermission,
      });
      expect(action).not.toHaveBeenCalled();
    }
  );
});

describe("adminReadAction", () => {
  it.each<Role>(["ADMIN", "MANAGER"])("runs for %s", async (role) => {
    signInAs(role);
    const result = await adminReadAction(async () => "rows");
    expect(result).toMatchObject({ success: true, data: "rows" });
  });

  it.each<Role>(["STAFF", "USER"])("refuses %s", async (role) => {
    signInAs(role);
    const action = jest.fn();
    const result = await adminReadAction(action);
    expect(result.success).toBe(false);
    expect(action).not.toHaveBeenCalled();
  });
});

describe("handleServerAction", () => {
  it("refuses a visitor who is not signed in", async () => {
    mockVerify.mockResolvedValue({
      success: false,
      message: errorMSG.unauthorized,
    });
    const action = jest.fn();
    const result = await handleServerAction(action);
    expect(result).toEqual({
      success: false,
      message: errorMSG.unauthorized,
    });
    expect(action).not.toHaveBeenCalled();
  });

  it("leaves the decision to the action when no roles are given", async () => {
    signInAs("USER");
    const result = await handleServerAction(async (user) => user.role);
    expect(result).toMatchObject({ success: true, data: "USER" });
  });
});
