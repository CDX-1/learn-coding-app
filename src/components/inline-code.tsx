"use client";

import { Highlight, themes } from "prism-react-renderer";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface InlineCodeProps {
    text: string;
    className?: string;
}

export default function InlineCode({ text, className }: InlineCodeProps) {
    const { resolvedTheme } = useTheme();
	const [color, setColor] = useState(themes.vsLight);
   
	useEffect(() => {
	  setColor(resolvedTheme === "dark" ? themes.vsDark : themes.vsLight);
	}, [resolvedTheme]);

    return (
        <Highlight code={text} language="tsx" theme={color}>
            {({ className: baseClass, style, tokens, getLineProps, getTokenProps }) => (
                <code className={cn(baseClass, "p-1 rounded-lg", className)} style={style}>
                    {tokens[0].map((token, key) => (
                        <span key={key} {...getTokenProps({ token, key })} />
                    ))}
                </code>
            )}
        </Highlight>
    );
}