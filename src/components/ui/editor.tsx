"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const TAB_SPACES = "    ";
const NON_WHITESPACE_REGEX = /\S/;
const jetbrainsMono = JetBrains_Mono({
    weight: "300",
    subsets: ['latin']
});

const AUTO_CLOSE_PAIRS: Record<string, string> = {
    "(": ")",
    "[": "]",
    "{": "}",
    "\"": "\"",
    "'": "'",
    "`": "`"
};

export type EditorRef = {
    getCode: () => string,
    run: () => void
};

const Editor = forwardRef((props, ref) => {
    const [code, setCode] = useState("\n");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [code]);

    useImperativeHandle(ref, () => ({
        getCode: () => code,
        run: () => {
            document.dispatchEvent(new CustomEvent("clearOutput", {}));
            document.dispatchEvent(new CustomEvent("bufferOutput", {}));

            const log = console.log;
            const warn = console.warn;
            const error = console.error;
            
            console.log = (...args) => {
                log.apply(console, ["[RUNNER]:", ...args]);
                document.dispatchEvent(new CustomEvent("logEvent", {
                    detail: { message: [...args] }
                }));
            };

            console.warn = (...args) => {
                warn.apply(console, ["[RUNNER]:", ...args]);
                document.dispatchEvent(new CustomEvent("warnEvent", {
                    detail: { message: [...args] }
                }));
            };

            console.error = (...args) => {
                error.apply(console, ["[RUNNER]:", ...args]);
                document.dispatchEvent(new CustomEvent("errorEvent", {
                    detail: { message: [...args] }
                }));
            };

            try {
                new Function(code)();
            } catch (e: any) {
                console.error(e.toString());
            } finally {
                console.log = log;
                console.warn = warn;
                console.error = error;
            }
        }
    }));

    return (
        <div className="relative w-full bg-[#282c34] rounded-md px-3 pt-1 pb-2 font-mono">
            <div className="flex">
                <div
                    className="text-right pr-3 text-gray-500 text-sm select-none"
                    style={{
                        lineHeight: "1.5",
                        paddingTop: "8px",
                    }}
                >
                    {Array.from({ length: code.split("\n").length || 1 }, (_, i) => (
                        <div key={i} className="h-[21px] leading-[1.5]">
                            {i + 1}
                        </div>
                    ))}
                </div>

                <div className="relative w-full">
                    <pre
                        aria-hidden="true"
                        className={cn(
                            jetbrainsMono.className,
                            "absolute top-0 left-0 w-full overflow-hidden whitespace-pre-wrap text-sm leading-[1.5]"
                        )}
                        style={{
                            pointerEvents: "none",
                            padding: "8px 0",
                            margin: 0,
                        }}
                    >
                        <SyntaxHighlighter
                            language="javascript"
                            style={oneDark}
                            customStyle={{
                                background: "transparent",
                                fontSize: "14px",
                                lineHeight: "1.5",
                                padding: 0,
                                margin: 0,
                            }}
                        >
                            {code || " "}
                        </SyntaxHighlighter>
                    </pre>

                    <textarea
                        ref={textareaRef}
                        className={cn(
                            jetbrainsMono.className,
                            "absolute top-0 left-0 w-full h-full bg-transparent resize-none overflow-hidden focus:ring-0 focus:outline-none text-transparent caret-white text-sm leading-[1.5]"
                        )}
                        value={code}
                        onChange={(event) => setCode(event.target.value)}
                        rows={1}
                        spellCheck={false}
                        style={{
                            padding: "8px 0",
                            margin: 0,
                        }}
                        onKeyDown={(event) => {
                            const textarea = textareaRef.current;
                            if (!textarea) return;
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;

                            if (event.key in AUTO_CLOSE_PAIRS) {
                                event.preventDefault();
                                const closingChar = AUTO_CLOSE_PAIRS[event.key];
                                const insertText = event.key + closingChar;
                                document.execCommand("insertText", false, insertText);
                                const newPos = start + 1;
                                textarea.selectionStart = textarea.selectionEnd = newPos;
                                textarea.dispatchEvent(new Event("input", { bubbles: true }));
                                return;
                            }

                            if (event.key === "Tab") {
                                event.preventDefault();
                                if (start === end) {
                                    document.execCommand("insertText", false, TAB_SPACES);
                                    const newPos = start + TAB_SPACES.length;
                                    textarea.selectionStart = textarea.selectionEnd = newPos;
                                } else {
                                    const beforeSelection = code.slice(0, start);
                                    const firstLineStart = beforeSelection.lastIndexOf("\n") + 1;
                                    const afterSelection = code.slice(end);
                                    let lastLineEnd = end + afterSelection.indexOf("\n");
                                    if (lastLineEnd === -1) lastLineEnd = code.length;
                                    const selectedLines = code.slice(firstLineStart, lastLineEnd);
                                    let newSelectedLines;
                                    if (event.shiftKey) {
                                        newSelectedLines = selectedLines.replace(/^ {1,4}/gm, "");
                                    } else {
                                        newSelectedLines = selectedLines.replace(/^/gm, TAB_SPACES);
                                    }
                                    textarea.selectionStart = firstLineStart;
                                    textarea.selectionEnd = lastLineEnd;
                                    document.execCommand("insertText", false, newSelectedLines);
                                }
                                textarea.dispatchEvent(new Event("input", { bubbles: true }));
                                return;
                            }

                            if (event.key === "Enter" && start === end) {
                                event.preventDefault();
                                const beforeCursor = code.slice(0, start);
                                const lastNewlineIndex = beforeCursor.lastIndexOf("\n") + 1;
                                const currentLine = beforeCursor.slice(lastNewlineIndex);
                                const leadingWhitespace = currentLine.match(/^\s*/)?.[0] || "";
                                const trimmedLine = currentLine.trim();
                                const endsWithOpenBrace = trimmedLine.endsWith("{");
                                const afterCursor = code.slice(start);
                                const nextNonWhitespaceMatch = afterCursor.match(NON_WHITESPACE_REGEX);
                                const nextCharIsCloseBrace = nextNonWhitespaceMatch && nextNonWhitespaceMatch[0] === "}";
                                let insert;

                                if (endsWithOpenBrace && nextCharIsCloseBrace) {
                                    insert = `\n${leadingWhitespace}${TAB_SPACES}\n${leadingWhitespace}`;
                                    const newPos = start + leadingWhitespace.length + TAB_SPACES.length + 1;
                                    document.execCommand("insertText", false, insert);
                                    textarea.selectionStart = textarea.selectionEnd = newPos;
                                } else {
                                    const newIndent = endsWithOpenBrace ? leadingWhitespace + TAB_SPACES : leadingWhitespace;
                                    insert = `\n${newIndent}`;
                                    const newPos = start + insert.length;
                                    document.execCommand("insertText", false, insert);
                                    textarea.selectionStart = textarea.selectionEnd = newPos;
                                }
                                textarea.dispatchEvent(new Event("input", { bubbles: true }));
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
});

export default Editor;