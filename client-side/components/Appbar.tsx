import Link from "next/link";

export function Appbar() {

    return <div className="flex justify-between border-b border-gray-200 pb-2 pt-2">
        <Link href="/">
            <div className="text-2xl pl-4 flex justify-center pt-3">
                LebeliFy
            </div>
        </Link>
        <div className="text-xl pr-4 pb-2">
            connect wallet
        </div>
    </div>
}