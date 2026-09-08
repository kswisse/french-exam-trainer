import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    profile: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/supabase-server", () => ({
  createClient: vi.fn(),
}));

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase-server";

const mockFindUnique = vi.mocked(prisma.profile.findUnique);
const mockCreate = vi.mocked(prisma.profile.create);
const mockCreateClient = vi.mocked(createClient);

function mockSupabaseUser(
  user: { id: string; email: string | null; user_metadata?: Record<string, unknown> } | null
) {
  mockCreateClient.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: null,
      }),
    },
  } as never);
}

describe("getCurrentUser", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("returns null when Supabase user is null", async () => {
    mockSupabaseUser(null);
    const result = await getCurrentUser();
    expect(result).toBeNull();
    expect(mockFindUnique).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  test("returns null when user has no email", async () => {
    mockSupabaseUser({ id: "user-1", email: null });
    const result = await getCurrentUser();
    expect(result).toBeNull();
    expect(mockFindUnique).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  test("creates Profile when missing", async () => {
    mockSupabaseUser({
      id: "user-1",
      email: "test@example.com",
      user_metadata: { display_name: "Test User" },
    });
    const fakeProfile = {
      id: "user-1",
      email: "test@example.com",
      displayName: "Test User",
      role: "STUDENT",
    };
    mockFindUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(fakeProfile as never);
    mockCreate.mockResolvedValue(fakeProfile as never);

    const result = await getCurrentUser();

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: "user-1" } });
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        id: "user-1",
        email: "test@example.com",
        displayName: "Test User",
      },
    });
    expect(result).toEqual(fakeProfile);
  });

  test("returns existing Profile without overwriting data", async () => {
    mockSupabaseUser({
      id: "user-1",
      email: "test@example.com",
      user_metadata: { display_name: "New Name" },
    });
    const existingProfile = {
      id: "user-1",
      email: "test@example.com",
      displayName: "Original Name",
      role: "STUDENT",
    };
    mockFindUnique.mockResolvedValue(existingProfile as never);

    const result = await getCurrentUser();

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: "user-1" } });
    expect(mockCreate).not.toHaveBeenCalled();
    expect(result).toEqual(existingProfile);
  });

  test("sanitizes malicious displayName", async () => {
    mockSupabaseUser({
      id: "user-1",
      email: "test@example.com",
      user_metadata: { display_name: '<script>alert("xss")</script>John' },
    });
    mockFindUnique.mockResolvedValueOnce(null);
    mockCreate.mockResolvedValue({ id: "user-1" } as never);

    await getCurrentUser();

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          displayName: 'alert("xss")John',
        }),
      })
    );
  });

  test("truncates displayName to 100 characters", async () => {
    mockSupabaseUser({
      id: "user-1",
      email: "test@example.com",
      user_metadata: { display_name: "A".repeat(200) },
    });
    mockFindUnique.mockResolvedValueOnce(null);
    mockCreate.mockResolvedValue({ id: "user-1" } as never);

    await getCurrentUser();

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          displayName: "A".repeat(100),
        }),
      })
    );
  });

  test("returns null displayName for empty/whitespace-only metadata", async () => {
    mockSupabaseUser({
      id: "user-1",
      email: "test@example.com",
      user_metadata: { display_name: "   " },
    });
    mockFindUnique.mockResolvedValueOnce(null);
    mockCreate.mockResolvedValue({ id: "user-1" } as never);

    await getCurrentUser();

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          displayName: null,
        }),
      })
    );
  });

  test("falls back to user_metadata.name when display_name is absent", async () => {
    mockSupabaseUser({
      id: "user-1",
      email: "test@example.com",
      user_metadata: { name: "Fallback Name" },
    });
    mockFindUnique.mockResolvedValueOnce(null);
    mockCreate.mockResolvedValue({ id: "user-1" } as never);

    await getCurrentUser();

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          displayName: "Fallback Name",
        }),
      })
    );
  });

  test("handles non-string displayName metadata gracefully", async () => {
    mockSupabaseUser({
      id: "user-1",
      email: "test@example.com",
      user_metadata: { display_name: 12345 },
    });
    mockFindUnique.mockResolvedValueOnce(null);
    mockCreate.mockResolvedValue({ id: "user-1" } as never);

    await getCurrentUser();

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          displayName: null,
        }),
      })
    );
  });
});
