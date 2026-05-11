import {NextResponse} from "next/server";

export function badRequest(message: string) {
    return NextResponse.json({error: message}, {status: 400});
}

export function unauthorized() {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
}

export function forbidden() {
    return NextResponse.json({error: "Forbidden"}, {status: 403});
}

export function notFound() {
    return NextResponse.json({error: "Not found"}, {status: 404});
}
