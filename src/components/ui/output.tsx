"use client";

import React, { forwardRef, useEffect, useImperativeHandle } from "react"
import { Throbber } from "./throbber";

export type OutputRef = {
    getOutput: () => any[]
};

const Output = forwardRef((props, ref) => {
    const [output, setOutput] = React.useState<String[]>([]);
    const [buffered, setBuffered] = React.useState(false);
    
    const handleLogEvent = (e: CustomEvent) => {
        setOutput(prevOutput => [...prevOutput, ...e.detail.message]);
    };

    const clearOutput = (_: CustomEvent) => {
        setOutput([]);
    };

    const bufferOutput = (_: CustomEvent) => {
        setBuffered(true);
        setTimeout(() => {
            setBuffered(false);
        }, 250);
    };

    useEffect(() => {
        document.addEventListener("logEvent", handleLogEvent as EventListener);
        document.addEventListener("warnEvent", handleLogEvent as EventListener);
        document.addEventListener("errorEvent", handleLogEvent as EventListener);
        document.addEventListener("clearOutput", clearOutput as EventListener);
        document.addEventListener("bufferOutput", bufferOutput as EventListener);

        return () => {
            document.removeEventListener("logEvent", handleLogEvent as EventListener);
            document.removeEventListener("warnEvent", handleLogEvent as EventListener);
            document.removeEventListener("errorEvent", handleLogEvent as EventListener);
            document.removeEventListener("clearOutput", clearOutput as EventListener);
            document.removeEventListener("bufferOutput", clearOutput as EventListener);
        };
    });

    useImperativeHandle(ref, () => ({
        getOutput: () => output
    }));

    const lineStyle = {
        height: "21px",
        lineHeight: "21px"
    };

    return (
        !buffered ? (
            <div className="relative w-full bg-[#282c34] rounded-md p-3 font-mono">
                <div className="flex">
                    <div
                        className="text-right pr-3 text-gray-500 text-sm select-none"
                        style={lineStyle}
                    >
                        {Array.from({ length: output.length || 1 }, (_, i) => (
                            <div key={i} style={lineStyle}>
                                {i + 1}
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col">
                        {output.map((msg, i) => (
                            <div key={`msg-${i}`} className="whitespace-pre-wrap" style={lineStyle}>
                                {msg}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ) : (
            <div className="relative w-full bg-[#282c34] rounded-md p-3 font-mono">
                <Throbber />
            </div>
        )
    )
});

export default Output;