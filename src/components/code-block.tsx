"use client";

import { Highlight, themes } from "prism-react-renderer";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface CodeBlockProps {
    text: string;
    className?: string;
}

export default function CodeBlock({ text, className }: CodeBlockProps) {
    const { resolvedTheme } = useTheme();
	const [color, setColor] = useState(themes.vsLight);
   
	useEffect(() => {
	  setColor(resolvedTheme === "dark" ? themes.vsDark : themes.vsLight);
	}, [resolvedTheme]);

    return (
        <Highlight code={text} language="tsx" theme={color}>
            {({ className: baseClass, style, tokens, getLineProps, getTokenProps }) => (
                <pre className={cn(baseClass, "p-1 rounded-lg", className)} style={style}>
                    {tokens.map((line, i) => (
                        <div key={i} {...getLineProps({ line, key: i })}>
                            {line.map((token, key) => (
                                <span key={key} {...getTokenProps({ token, key })} />
                            ))}
                        </div>
                    ))}
                </pre>
            )}
        </Highlight>
    );
}