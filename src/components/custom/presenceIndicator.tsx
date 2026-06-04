"use client"
import React from 'react'

type Props = {
    isOnline: boolean|undefined
}
function PresenceIndicator(  {isOnline} : Props) {
    return (
        <div className="flex items-center justify-center">
            <div className="relative flex items-center justify-center">
                <div className={`w-[14px] h-[14px] rounded-full ${isOnline ? "bg-green-500/25" : "bg-red-500/25"}`}></div>

                <div className={`absolute w-[10px] h-[10px] rounded-full bg-white`}></div>

                <div className={`absolute w-[7px] h-[7px] rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`}></div>
            </div>
        </div>
    )
}

export default PresenceIndicator