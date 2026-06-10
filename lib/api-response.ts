import { NextResponse } from "next/server";

export function notImplementedResponse(feature: string) {
  return NextResponse.json(
    {
      error: `${feature} is not implemented yet.`,
      code: "NOT_IMPLEMENTED",
    },
    { status: 501 },
  );
}

export function errorResponse(error: string, code: string, details?: unknown, status: number = 500) {
  return NextResponse.json(
    { error, code, details },
    { status },
  );
}

export function successResponse<T>(data: T) {
  return NextResponse.json(data);
}
